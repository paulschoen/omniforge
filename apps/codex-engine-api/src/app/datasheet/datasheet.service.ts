import { Injectable, Logger } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { FileUpload } from 'graphql-upload-ts';
import { Model, RootFilterQuery, Types } from 'mongoose';
import { GridFSService } from '../grid-fs/grid-fs.service';
import { Datasheet } from './schema/datasheet.schema';

@Injectable()
export class DatasheetService {
  private readonly logger = new Logger(DatasheetService.name);
  private readonly gridFSService = new GridFSService();

  constructor(
    @InjectModel(Datasheet.name) private DatasheetModel: Model<Datasheet>,
  ) {}

  async findAll(): Promise<Datasheet[]> {
    this.logger.log('Fetching all datasheets');
    return this.DatasheetModel.find().lean();
  }

  async findById(id: string): Promise<Datasheet | null> {
    this.logger.log(`Fetching datasheet by ID: ${id}`);
    return this.DatasheetModel.findById(id).lean();
  }

  async findByName(name: string): Promise<Datasheet[]> {
    this.logger.log(`Fetching datasheets by name: ${name}`);
    return this.DatasheetModel.find({
      name: { $regex: name, $options: 'i' },
    }).lean();
  }

  async searchByName(name: string): Promise<Datasheet[]> {
    this.logger.log(
      `Searching datasheets using autocomplete for name: ${name}`,
    );
    return this.DatasheetModel.aggregate<Datasheet>([
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
  }

  async findDatasheetById(datasheetId: string): Promise<Datasheet | null> {
    this.logger.log(`Finding datasheet by ID: ${datasheetId}`);
    const id = parseInt(datasheetId);
    return this.DatasheetModel.findOne({ id }).lean();
  }

  async updateDatasheet(
    objectId: RootFilterQuery<Datasheet> | undefined,
    uploadStreamId: string,
  ): Promise<Datasheet | null> {
    this.logger.log(`Updating datasheet with image ID: ${uploadStreamId}`);
    return this.DatasheetModel.findOneAndUpdate(
      objectId,
      { $set: { image: { id: uploadStreamId } } },
      { new: true },
    ).lean();
  }

  async getImageIdFromDatasheet(datasheetId: string): Promise<Types.ObjectId> {
    this.logger.log(`Fetching image ID from datasheet ID: ${datasheetId}`);
    const datasheet = await this.DatasheetModel.findOne({
      id: parseInt(datasheetId),
    }).lean();

    if (!datasheet || !datasheet.image?.id) {
      this.logger.error(`No image found for datasheet ID: ${datasheetId}`);
      throw new Error(`No image for datasheet ID: ${datasheetId}`);
    }

    return datasheet.image.id;
  }

  async uploadImage(file: FileUpload, datasheetId: string): Promise<string> {
    // eslint-disable-next-line @typescript-eslint/unbound-method -- Disabling unbound-method rule because createReadStream is destructured from the file object
    const { createReadStream, filename } = file;

    this.logger.log(
      `Attempting to upload image for datasheet ID: ${datasheetId}`,
    );

    const datasheet = await this.findDatasheetById(datasheetId);
    if (!datasheet) {
      this.logger.error(`Datasheet not found with ID: ${datasheetId}`);
      throw new Error(`Datasheet not found: ${datasheetId}`);
    }

    const objectId = datasheet._id;
    const uploadStreamId = await this.gridFSService.uploadFile(
      createReadStream,
      filename,
    );

    this.logger.log(
      `Image uploaded, updating datasheet with new image ID: ${uploadStreamId}`,
    );
    await this.updateDatasheet(objectId, uploadStreamId);

    return uploadStreamId;
  }

  async downloadImage(id: string): Promise<string> {
    this.logger.log(`Downloading image for datasheet ID: ${id}`);
    const imageId = await this.getImageIdFromDatasheet(id);
    return this.gridFSService.downloadImageAsBase64(imageId.toString());
  }
}
