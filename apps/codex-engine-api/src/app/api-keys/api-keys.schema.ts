import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Types } from 'mongoose';

@Schema({ collection: 'api-keys' })
export class ApiKeys extends Document {
  @Prop({ type: Types.ObjectId, required: true, auto: true })
  _id!: Types.ObjectId;

  @Prop({ type: String, required: true })
  key!: string;

  @Prop({ type: String, required: true })
  name!: string;

  @Prop({ type: Number, required: true })
  createdAt!: number;
}

export const ApiKeySchema = SchemaFactory.createForClass(ApiKeys);
