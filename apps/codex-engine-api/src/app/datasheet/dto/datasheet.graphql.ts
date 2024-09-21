import { ObjectType, Field, ID } from '@nestjs/graphql';
import { Types } from 'mongoose';

@ObjectType()
export class DatasheetImage {
  @Field(() => ID)
  id: Types.ObjectId;
}

@ObjectType()
export class OptionType {
  @Field(() => ID)
  _id: string;

  @Field({ nullable: true })
  datasheet_id: number;

  @Field({ nullable: true })
  line: number;

  @Field({ nullable: true })
  button: string;

  @Field({ nullable: true })
  description: string;
}

@ObjectType()
export class Wargear {
  @Field(() => ID)
  _id: string;

  @Field({ nullable: true })
  datasheet_id: number;

  @Field({ nullable: true })
  line: number;

  @Field({ nullable: true })
  line_in_wargear: number;

  @Field({ nullable: true })
  name: string;

  @Field({ nullable: true })
  description: string;

  @Field({ nullable: true })
  range: string;

  @Field({ nullable: true })
  type: string;

  @Field({ nullable: true })
  A: string;

  @Field({ nullable: true })
  BS_WS: string;

  @Field({ nullable: true })
  S: string;

  @Field({ nullable: true })
  AP: string;

  @Field({ nullable: true })
  D: string;
}

@ObjectType()
export class DetachmentAbility {
  @Field(() => ID)
  _id: string;

  @Field({ nullable: true })
  id: string;

  @Field({ nullable: true })
  name: string;

  @Field({ nullable: true })
  legend: string;

  @Field({ nullable: true })
  faction_id: string;

  @Field({ nullable: true })
  description: string;

  @Field({ nullable: true })
  detachment: string;
}

@ObjectType()
export class Ability {
  @Field(() => ID)
  _id: string;

  @Field({ nullable: true })
  id: string;

  @Field({ nullable: true })
  name: string;

  @Field({ nullable: true })
  legend: string;

  @Field({ nullable: true })
  faction_id: string;

  @Field({ nullable: true })
  description: string;
}

@ObjectType()
export class Stratagem {
  @Field(() => ID)
  _id: string;

  @Field({ nullable: true })
  id: string;

  @Field({ nullable: true })
  name: string;

  @Field({ nullable: true })
  type: string;

  @Field({ nullable: true })
  cp_cost: number;

  @Field({ nullable: true })
  legend: string;

  @Field({ nullable: true })
  turn: string;

  @Field({ nullable: true })
  phase: string;

  @Field({ nullable: true })
  description: string;

  @Field({ nullable: true })
  version: number;
}

@ObjectType()
export class Source {
  @Field(() => ID)
  _id: string;

  @Field({ nullable: true })
  id: string;

  @Field({ nullable: true })
  name: string;

  @Field({ nullable: true })
  type: string;

  @Field({ nullable: true })
  edition: number;

  @Field({ nullable: true })
  version: string;

  @Field({ nullable: true })
  errata_date: string;

  @Field({ nullable: true })
  errata_link: string;
}

@ObjectType()
export class Enhancement {
  @Field({ nullable: true })
  _id: string;

  @Field({ nullable: true })
  id: string;

  @Field({ nullable: true })
  faction_id: string;

  @Field({ nullable: true })
  name: string;

  @Field({ nullable: true })
  legend: string;

  @Field({ nullable: true })
  description: string;

  @Field({ nullable: true })
  cost: number;

  @Field({ nullable: true })
  detachment: string;
}

@ObjectType()
export class ModelCost {
  @Field({ nullable: true })
  description: string;

  @Field({ nullable: true })
  cost: number;
}

@ObjectType()
export class Model {
  @Field(() => ID)
  _id: string;

  @Field({ nullable: true })
  name: string;

  @Field({ nullable: true })
  line: string;

  @Field({ nullable: true })
  M: string;

  @Field({ nullable: true })
  T: string;

  @Field({ nullable: true })
  Sv: string;

  @Field({ nullable: true })
  inv_sv: string;

  @Field({ nullable: true })
  W: string;

  @Field({ nullable: true })
  Ld: string;

  @Field({ nullable: true })
  OC: string;

  @Field({ nullable: true })
  base_size: string;
}
@ObjectType()
export class KeywordType {
  @Field(() => ID)
  _id: string;

  @Field({ nullable: true })
  keyword: string;

  @Field({ nullable: true })
  is_faction_keyword: boolean;
}

@ObjectType()
export class FactionType {
  @Field(() => ID)
  _id: string;

  @Field({ nullable: true })
  id: string;

  @Field({ nullable: true })
  name: string;

  @Field({ nullable: true })
  link: string;
}

@ObjectType()
export class DatasheetType {
  @Field(() => ID)
  _id: Types.ObjectId;

  @Field({ nullable: true })
  id: number;

  @Field({ nullable: true })
  name: string;

  @Field({ nullable: true })
  source_id: number;

  @Field({ nullable: true })
  legend: string;

  @Field({ nullable: true })
  role: string;

  @Field({ nullable: true })
  loadout: string;

  @Field({ nullable: true })
  virtual: boolean;

  @Field({ nullable: true })
  link: string;

  @Field(() => [KeywordType], { nullable: true })
  keywords: KeywordType[];

  @Field(() => FactionType, { nullable: true })
  faction: FactionType;

  @Field(() => [ModelCost], { nullable: true })
  models_cost: ModelCost[];

  @Field(() => [Model], { nullable: true })
  models: Model[];

  @Field(() => [Enhancement], { nullable: true })
  enhancements: Enhancement[];

  @Field(() => Source, { nullable: true })
  source: Source;

  @Field(() => [Stratagem], { nullable: true })
  stratagems: Stratagem[];

  @Field(() => [Ability], { nullable: true })
  abilities: Ability[];

  @Field(() => [DetachmentAbility], { nullable: true })
  detachment_abilities: DetachmentAbility[];

  @Field(() => [Wargear], { nullable: true })
  wargear: Wargear[];

  @Field(() => [OptionType], { nullable: true })
  options: OptionType[];

  @Field(() => DatasheetImage, { nullable: true })
  image: DatasheetImage;
}
