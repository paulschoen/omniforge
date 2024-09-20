import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { ApiKeySchema, ApiKeys } from './api-keys.schema';
import { ApiKeysService } from './api-keys.service';

@Module({
  imports: [
    MongooseModule.forFeature([{ name: ApiKeys.name, schema: ApiKeySchema }]),
  ],
  providers: [ApiKeysService],
  exports: [ApiKeysService],
})
export class ApiKeysModule {}
