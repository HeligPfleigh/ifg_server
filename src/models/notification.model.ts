import { Entity, model, property } from '@loopback/repository';

@model({ settings: {} })
export class Notification extends Entity {
  @property({
    type: 'string',
    id: true,
  })
  id: string;

  @property({
    type: 'string',
    required: true,
  })
  title: string;

  @property({
    type: 'string',
    required: true,
  })
  content: string;

  @property({
    type: 'date',
  })
  sendTime?: string;

  @property({
    type: 'string',
    default: 'sent',
  })
  status?: string;

  @property({
    type: 'string',
  })
  language?: string;

  @property({
    type: 'string',
  })
  userId?: string;

  constructor(data?: Partial<Notification>) {
    super(data);
  }
}

export interface NotificationRelations {
  // describe navigational properties here
}

export type NotificationWithRelations = Notification & NotificationRelations;
