import { Field, ObjectType, Int } from '@nestjs/graphql';

@ObjectType()
export class ModelDTO {
  @Field(() => Int)
  datasheet_id: number;

  @Field(() => Int)
  line: number;

  @Field()
  name: string;

  @Field()
  M: string; // Movement

  @Field(() => Int)
  T: number; // Toughness

  @Field()
  Sv: string; // Save

  @Field(() => Int)
  inv_sv: number; // Invulnerable Save

  @Field(() => Int)
  W: number; // Wounds

  @Field()
  Ld: string; // Leadership

  @Field(() => Int)
  OC: number; // Opportunity Cost?

  @Field()
  base_size: string; // Base size
}
