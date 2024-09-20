import { ObjectType, Field, ID } from '@nestjs/graphql';

@ObjectType()
export class ModelType {
  @Field(() => ID)
  _id: string;

  @Field({ nullable: true })
  name: string;

  @Field({ nullable: true })
  line: string;

  @Field({ nullable: true })
  M: string;

  @Field({ nullable: true })
  T: number;

  @Field({ nullable: true })
  Sv: string;

  @Field({ nullable: true })
  inv_sv: number;

  @Field({ nullable: true })
  W: number;

  @Field({ nullable: true })
  Ld: string;
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
  _id: string;

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
}
