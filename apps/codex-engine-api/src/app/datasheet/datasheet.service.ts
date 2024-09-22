import { Injectable, Logger } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import { MongoClient, GridFSBucket } from 'mongodb';
import { Datasheet } from './schema/datasheet.schema';
import { FileUpload } from 'graphql-upload-ts';

@Injectable()
export class DatasheetsService {
  private readonly logger = new Logger(DatasheetsService.name);
  private bucket: GridFSBucket;

  constructor(
    @InjectModel(Datasheet.name) private datasheetModel: Model<Datasheet>
  ) {
    this.initializeGridFS();
  }

  private async initializeGridFS() {
    const client = new MongoClient(process.env.MONGODB_CONNECTION_STRING);
    await client.connect();
    const db = client.db('codex-engine');
    this.bucket = new GridFSBucket(db);
  }

  async findAll(): Promise<Datasheet[]> {
    this.logger.log('Finding all datasheets');
    return this.datasheetModel.find().lean();
  }

  async findById(id: string): Promise<Datasheet> {
    this.logger.log(`Finding datasheet by id: ${id}`);
    return this.datasheetModel.findById(id);
  }

  async findByName(name: string): Promise<Datasheet[]> {
    this.logger.log(`Finding datasheets by name: ${name}`);
    return this.datasheetModel
      .find({ name: { $regex: name, $options: 'i' } })
      .lean();
  }

  async searchByName(name: string): Promise<Datasheet[]> {
    this.logger.log(`Searching datasheets by name: ${name}`);
    const request = this.datasheetModel
      .aggregate([
        {
          $search: {
            index: 'name',
            autocomplete: {
              path: 'name',
              query: name,
            },
          },
        },
      ])
      .exec();
    return request;
  }

  async uploadImage(file: FileUpload, datasheetId: string): Promise<string> {
    const { createReadStream, filename } = file;
    const uploadStream = this.bucket.openUploadStream(filename);

    this.logger.log(`Attempting to find datasheet with ID: ${datasheetId}`);

    let datasheet;
    let objectId;

    try {
      datasheet = await this.datasheetModel
        .findOne({ id: parseInt(datasheetId) })
        .lean();

      if (!datasheet) {
        this.logger.error(`Datasheet not found for ID: ${datasheetId}`);
        throw new Error(`Datasheet not found for ID: ${datasheetId}`);
      }

      objectId = datasheet._id;
      this.logger.log(`Datasheet found: ${datasheet}`);
    } catch (error) {
      this.logger.error('Error finding datasheet:', error);
      throw error;
    }

    return new Promise((resolve, reject) => {
      createReadStream()
        .pipe(uploadStream)
        .on('finish', async () => {
          this.logger.log('Image uploaded successfully, updating datasheet');
          try {
            await this.datasheetModel
              .findOneAndUpdate(objectId, {
                $set: {
                  image: {
                    id: uploadStream.id.toString(),
                  },
                },
              })
              .lean();

            this.logger.log(`Datasheet updated with image: ${uploadStream}`);
          } catch (error) {
            this.logger.error('Error updating datasheet:', error);
            reject(error);
          }

          resolve(uploadStream.id.toString());
        })
        .on('error', (error) => {
          this.logger.error('Error uploading image:', error);
          reject(error);
        });
    });
  }

  async getImageAsBase64(imageId: string): Promise<string> {
    const stream = this.bucket.openDownloadStream(new Types.ObjectId(imageId));
    const chunks = [];

    return new Promise((resolve, reject) => {
      stream.on('data', (chunk) => chunks.push(chunk));
      stream.on('end', () => {
        const buffer = Buffer.concat(chunks);
        resolve(buffer.toString('base64'));
      });
      stream.on('error', (err) => reject(err));
    });
  }

  async getImageIdFromDatasheet(datasheetId: string): Promise<Types.ObjectId> {
    const datasheet = await this.datasheetModel
      .findOne({ id: parseInt(datasheetId) })
      .lean();

    if (!datasheet || !datasheet.image || !datasheet.image.id) {
      throw new Error(`Image not found for datasheet ID: ${datasheetId}`);
    }

    return datasheet.image.id;
  }

  async downloadImage(id: string): Promise<string> {
    const imageId = await this.getImageIdFromDatasheet(id);
    return this.getImageAsBase64(imageId.toString());
  }
}
