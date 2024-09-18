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

  async findByName(name: string): Promise<Datasheet[]> {
    this.logger.log(`Finding datasheets by name: ${name}`);
    return this.datasheetModel
      .find({ name: { $regex: name, $options: 'i' } })
      .lean();
  }
}
