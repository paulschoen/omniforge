import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { Datasheet, DatasheetSchema } from './schema/datasheet.schema';
import { DatasheetsService } from './datasheet.service';
import { DatasheetsResolver } from './datasheet.resolver';

@Module({
  imports: [
    MongooseModule.forFeature([
      {
        name: Datasheet.name,
        schema: DatasheetSchema,
      },
    ]),
  ],
  providers: [DatasheetsService, DatasheetsResolver],
})
export class DatasheetsModule {}
