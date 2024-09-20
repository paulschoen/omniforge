import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Types } from 'mongoose';
import { FactionType, KeywordType } from '../dto/datasheet.graphql';

@Schema({ collection: 'datasheets' })
export class Datasheet extends Document {
  @Prop({ type: Types.ObjectId, required: true, auto: true })
  _id: Types.ObjectId;

  @Prop({ type: String, required: true })
  name: string;

  @Prop({ type: Number, required: true })
  source_id: number;

  @Prop({ type: String, required: true })
  legend: string;

  @Prop({ type: String, required: true })
  role: string;

  @Prop({ type: String, required: true })
  loadout: string;

  @Prop({ type: Boolean, default: false })
  virtual: boolean;

  @Prop({ type: String, required: true })
  link: string;

  @Prop({ type: [KeywordType], required: true })
  keywords: KeywordType[];

  @Prop({ type: FactionType, required: true })
  faction: FactionType;
}

export const DatasheetSchema = SchemaFactory.createForClass(Datasheet);
