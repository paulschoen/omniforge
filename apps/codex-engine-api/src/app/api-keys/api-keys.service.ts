import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { ApiKeys } from './api-keys.schema';

@Injectable()
export class ApiKeysService {
  constructor(@InjectModel(ApiKeys.name) private ApiKeyModel: Model<ApiKeys>) {}

  async createApiKey(apiKey: string): Promise<ApiKeys> {
    const newKey = new this.ApiKeyModel({ key: apiKey });
    return newKey.save();
  }

  async validateApiKey(apiKey: string): Promise<boolean> {
    const key = await this.ApiKeyModel.findOne({ key: apiKey });
    return Boolean(key);
  }
}
