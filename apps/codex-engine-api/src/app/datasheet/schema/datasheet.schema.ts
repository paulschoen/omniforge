import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Types } from 'mongoose';

@Schema({ collection: 'datasheets' })
export class Datasheet extends Document {
  @Prop({ type: Types.ObjectId, required: true, auto: true })
  _id: Types.ObjectId;

  @Prop({ type: String, required: true })
  name: string;

  @Prop({ type: String, required: true })
  faction_id: string;

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
}

export const DatasheetSchema = SchemaFactory.createForClass(Datasheet);
