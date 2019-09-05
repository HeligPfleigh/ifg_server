import { Entity, model, property, belongsTo } from '@loopback/repository';
import { User } from './user.model';

@model({ settings: {} })
export class Action extends Entity {
  @property({
    type: 'string',
    required: true,
  })
  action: string;

  @property({
    type: 'string',
    id: true,
    required: true,
  })
  id: string;

  @property({
    type: 'string',
  })
  reason?: string;

  @property({
    type: 'string',
    required: true,
  })
  status: string;

  @belongsTo(() => User)
  userId: string;

  constructor(data?: Partial<Action>) {
    super(data);
  }
}

export interface ActionRelations {
  // describe navigational properties here
}

export type ActionWithRelations = Action & ActionRelations;
