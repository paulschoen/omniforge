import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Types } from 'mongoose';
import {
  Ability,
  DatasheetImage,
  DetachmentAbility,
  Enhancement,
  FactionType,
  KeywordType,
  Model,
  ModelCost,
  OptionType,
  Source,
  Stratagem,
  Wargear,
} from '../dto/datasheet.graphql';

@Schema({ collection: 'datasheets' })
export class Datasheet extends Document {
  @Prop({ type: Types.ObjectId, required: true, auto: true })
  _id: Types.ObjectId;

  @Prop({ type: Number, required: true })
  id: number;

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

  @Prop({ type: [ModelCost], required: true })
  models_cost: ModelCost[];

  @Prop({ type: [Model], required: true })
  models: Model[];

  @Prop({ type: [Enhancement], required: true })
  enhancements: Enhancement[];

  @Prop({ type: Source, required: true })
  source: Source;

  @Prop({ type: [Stratagem], required: true })
  stratagems: Stratagem[];

  @Prop({ type: [Ability], required: true })
  abilities: Ability[];

  @Prop({ type: [DetachmentAbility], required: true })
  detachment_abilities: DetachmentAbility[];

  @Prop({ type: [Wargear], required: true })
  wargear: Wargear[];

  @Prop({ type: [OptionType], required: true })
  options: OptionType[];

  @Prop({ type: DatasheetImage })
  image: DatasheetImage;
}

export const DatasheetSchema = SchemaFactory.createForClass(Datasheet);
