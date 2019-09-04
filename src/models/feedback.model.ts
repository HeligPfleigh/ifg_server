import { Entity, model, property, belongsTo } from '@loopback/repository';
import { User, UserWithRelations } from './user.model';

@model({ settings: {} })
export class Feedback extends Entity {
  @property({
    type: 'string',
    id: true,
  })
  id?: string;

  @property({
    type: 'string',
    required: true,
  })
  message: string;

  @belongsTo(() => User)
  userId: string;


  constructor(data?: Partial<Feedback>) {
    super(data);
  }
}

export interface FeedbackRelations {
  // describe navigational properties here
  user?: UserWithRelations
}

export type FeedbackWithRelations = Feedback & FeedbackRelations;
