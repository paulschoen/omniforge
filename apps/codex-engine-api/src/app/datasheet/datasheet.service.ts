import { Injectable, Logger } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Datasheet } from './schema/datasheet.schema';

@Injectable()
export class DatasheetsService {
  private readonly logger = new Logger(DatasheetsService.name);
  constructor(
    @InjectModel(Datasheet.name) private datasheetModel: Model<Datasheet>
  ) {}

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
}
