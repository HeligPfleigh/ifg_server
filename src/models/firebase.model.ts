import { Entity, model, property } from '@loopback/repository';

@model({ settings: {} })
export class Firebase extends Entity {
  @property({
    type: 'string',
    required: true,
  })
  firebaseToken: string;

  @property({
    type: 'string',
    id: true,
  })
  id?: string;

  @property({
    type: 'string',
  })
  userId?: string;

  @property({
    type: 'string',
    default: 'en',
  })
  language?: string;

  @property({
    type: 'boolean',
    default: true,
  })
  isReceiveNotification?: boolean;


  constructor(data?: Partial<Firebase>) {
    super(data);
  }
}

export interface FirebaseRelations {
  // describe navigational properties here
}

export type FirebaseWithRelations = Firebase & FirebaseRelations;
