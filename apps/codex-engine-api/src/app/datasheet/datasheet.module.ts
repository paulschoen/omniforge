import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { ApiKeysModule } from '../api-keys/api-keys.module';
import { GridFSService } from '../grid-fs/grid-fs.service';
import { DatasheetsResolver } from './datasheet.resolver';
import { DatasheetService } from './datasheet.service';
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
    GridFSService,
  ],
  providers: [DatasheetService, DatasheetsResolver],
})
export class DatasheetsModule {}
