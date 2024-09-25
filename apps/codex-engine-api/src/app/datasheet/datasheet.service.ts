import { Injectable, Logger } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { FileUpload } from 'graphql-upload-ts';
import { GridFSBucket, MongoClient } from 'mongodb';
import { Model, Types } from 'mongoose';
import { Datasheet } from './schema/datasheet.schema';

@Injectable()
export class DatasheetsService {
  private readonly logger = new Logger(DatasheetsService.name);
  private bucket!: GridFSBucket;

  constructor(
    @InjectModel(Datasheet.name) private DatasheetModel: Model<Datasheet>,
  ) {
    this.initializeGridFS().catch((error: unknown) => {
      this.logger.error('Error initializing GridFS:', error);
      throw error;
    });
  }

  private async initializeGridFS(): Promise<void> {
    const connectionString = process.env.MONGODB_CONNECTION_STRING;
    if (!connectionString) {
      throw new Error('MONGODB_CONNECTION_STRING is not defined');
    }
    const client = new MongoClient(connectionString);
    await client.connect();
    const db = client.db('codex-engine');
    this.bucket = new GridFSBucket(db);
  }

  async findAll(): Promise<Datasheet[]> {
    this.logger.log('Finding all datasheets');
    return this.DatasheetModel.find().lean();
  }

  async findById(id: string): Promise<Datasheet | null> {
    this.logger.log(`Finding datasheet by id: ${id}`);
    return this.DatasheetModel.findById(id);
  }

  async findByName(name: string): Promise<Datasheet[]> {
    this.logger.log(`Finding datasheets by name: ${name}`);
    return this.DatasheetModel.find({
      name: { $regex: name, $options: 'i' },
    }).lean();
  }

  async searchByName(name: string): Promise<Datasheet[]> {
    this.logger.log(`Searching datasheets by name: ${name}`);
    const request = this.DatasheetModel.aggregate<Datasheet>([
      {
        $search: {
          index: 'name',
          autocomplete: {
            path: 'name',
            query: name,
          },
        },
      },
    ]).exec();
    return request;
  }

  async uploadImage(file: FileUpload, datasheetId: string): Promise<string> {
    const { createReadStream, filename } = file;
    const uploadStream = this.bucket.openUploadStream(filename);

    this.logger.log(`Attempting to find datasheet with ID: ${datasheetId}`);

    let datasheet;
    let objectId;

    try {
      datasheet = await this.DatasheetModel.findOne({
        id: parseInt(datasheetId),
      }).lean();

      if (!datasheet) {
        this.logger.error(`Datasheet not found for ID: ${datasheetId}`);
        throw new Error(`Datasheet not found for ID: ${datasheetId}`);
      }

      objectId = datasheet._id;
      this.logger.log(`Datasheet found: ${JSON.stringify(datasheet)}`);
    } catch (error) {
      this.logger.error('Error finding datasheet:', error);
      throw error;
    }

    return new Promise((resolve, reject) => {
      createReadStream()
        .pipe(uploadStream)
        .on('finish', () => {
          this.logger.log('Image uploaded successfully, updating datasheet');
          this.DatasheetModel.findOneAndUpdate(objectId, {
            $set: {
              image: {
                id: uploadStream.id.toString(),
              },
            },
          })
            .lean()
            .then(() => {
              this.logger.log(
                `Datasheet updated with image: ${JSON.stringify(datasheet)}`,
              );
              resolve(uploadStream.id.toString());
            })
            .catch((error: unknown) => {
              this.logger.error('Error updating datasheet:', error);
              reject(
                new Error(
                  error instanceof Error ? error.message : String(error),
                ),
              );
            });
        })
        .on('error', (error) => {
          this.logger.error('Error uploading image:', error);
          reject(error);
        });
    });
  }

  async getImageAsBase64(imageId: string): Promise<string> {
    const stream = this.bucket.openDownloadStream(new Types.ObjectId(imageId));
    const chunks: Buffer[] = [];

    return new Promise((resolve, reject) => {
      stream.on('data', (chunk: Buffer) => chunks.push(chunk));
      stream.on('end', () => {
        const buffer = Buffer.concat(chunks);
        resolve(buffer.toString('base64'));
      });
      stream.on('error', (err) => {
        reject(err);
      });
    });
  }

  async getImageIdFromDatasheet(datasheetId: string): Promise<Types.ObjectId> {
    const datasheet = await this.DatasheetModel.findOne({
      id: parseInt(datasheetId),
    }).lean();

    if (!datasheet || !datasheet.image?.id) {
      throw new Error(`Image not found for datasheet ID: ${datasheetId}`);
    }

    return datasheet.image.id;
  }

  async downloadImage(id: string): Promise<string> {
    const imageId = await this.getImageIdFromDatasheet(id);
    return this.getImageAsBase64(imageId.toString());
  }
}
