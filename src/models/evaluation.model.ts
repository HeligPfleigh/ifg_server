import { Entity, model, property, belongsTo } from '@loopback/repository';
import { User } from './user.model';

@model({ settings: {} })
export class Evaluation extends Entity {
  @property({
    type: 'string',
    id: true,
  })
  id: string;

  @property({
    type: 'string',
    required: true,
  })
  evaluationType: string;

  @property({
    type: 'string',
  })
  influentFactor?: string;

  @property({
    type: 'string',
  })
  labelTag?: string;

  @property({
    type: 'number',
    required: true,
  })
  score: number;

  @property({
    type: 'string',
  })
  image?: string;

  @property({
    type: 'string',
  })
  impactType?: string;

  @property({
    type: 'string',
  })
  description?: string;

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
