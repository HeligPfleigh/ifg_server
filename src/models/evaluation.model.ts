import { Entity, model, property, belongsTo } from '@loopback/repository';
import { User } from './user.model';

@model({ settings: {} })
export class Evaluation extends Entity {
  @property({
    type: 'string',
    id: true,
    required: true,
  })
  id: string;

  @property({
    type: 'string',
    required: true,
  })
  type: string;

  @property({
    type: 'string',
  })
  influent_person?: string;

  @property({
    type: 'string',
  })
  label_tag?: string;

  @property({
    type: 'number',
    required: true,
  })
  score: number;

  @property({
    type: 'string',
  })
  image?: string;

  @belongsTo(() => User)
  userId: string;

  constructor(data?: Partial<Evaluation>) {
    super(data);
  }
}

export interface EvaluationRelations {
  // describe navigational properties here
}

export type EvaluationWithRelations = Evaluation & EvaluationRelations;
