import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { ApiKeysModule } from '../api-keys/api-keys.module';
import { DatasheetsResolver } from './datasheet.resolver';
import { DatasheetsService } from './datasheet.service';
import { Datasheet, DatasheetSchema } from './schema/datasheet.schema';

@Module({
  imports: [
    ApiKeysModule,
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
