import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { ApiKeys } from './api-keys.schema';

@Injectable()
export class ApiKeysService {
  constructor(@InjectModel(ApiKeys.name) private apiKeyModel: Model<ApiKeys>) {}

  async createApiKey(apiKey: string): Promise<ApiKeys> {
    const newKey = new this.apiKeyModel({ key: apiKey });
    return newKey.save();
  }

  async validateApiKey(apiKey: string): Promise<boolean> {
    const key = await this.apiKeyModel.findOne({ key: apiKey });
    return !!key;
  }
}
