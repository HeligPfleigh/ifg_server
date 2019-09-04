import { Entity, model, property, belongsTo } from '@loopback/repository';
import { User } from './user.model';

@model({ settings: {} })
export class ActionList extends Entity {
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

  constructor(data?: Partial<ActionList>) {
    super(data);
  }
}

export interface ActionListRelations {
  // describe navigational properties here
}

export type ActionListWithRelations = ActionList & ActionListRelations;
