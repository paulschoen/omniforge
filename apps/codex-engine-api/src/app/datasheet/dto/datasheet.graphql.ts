import { ObjectType, Field, ID } from '@nestjs/graphql';

@ObjectType()
export class ModelType {
  @Field(() => ID)
  _id: string;

  @Field({ nullable: false })
  name: string;

  @Field({ nullable: false })
  line: string;

  @Field({ nullable: false })
  M: string;

  @Field({ nullable: false })
  T: number;

  @Field({ nullable: false })
  Sv: string;

  @Field({ nullable: false })
  inv_sv: number;

  @Field({ nullable: false })
  W: number;

  @Field({ nullable: false })
  Ld: string;
}
@ObjectType()
export class KeywordType {
  @Field(() => ID)
  _id: string;

  @Field({ nullable: false })
  keyword: string;

  @Field({ nullable: false })
  is_faction_keyword: boolean;
}

@ObjectType()
export class FactionType {
  @Field(() => ID)
  _id: string;

  @Field({ nullable: false })
  id: string;

  @Field({ nullable: false })
  name: string;

  @Field({ nullable: false })
  link: string;
}

@ObjectType()
export class DatasheetType {
  @Field(() => ID)
  _id: string;

  @Field({ nullable: false })
  name: string;

  @Field({ nullable: false })
  source_id: number;

  @Field({ nullable: false })
  legend: string;

  @Field({ nullable: false })
  role: string;

  @Field({ nullable: false })
  loadout: string;

  @Field({ nullable: false })
  virtual: boolean;

  @Field({ nullable: false })
  link: string;

  @Field(() => [KeywordType], { nullable: false })
  keywords: KeywordType[];

  @Field(() => FactionType, { nullable: false })
  faction: FactionType;
}
