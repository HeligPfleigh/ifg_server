import {
  repository,
} from '@loopback/repository';
import {
  post,
  param,
  getModelSchemaRef,
  patch,
  requestBody,
} from '@loopback/rest';
import { Firebase } from '../models';
import { FirebaseRepository } from '../repositories';
import { CreateFirebaseTokenRequestBody } from "./specs/firebase-controller.specs";

export class FirebaseController {
  constructor(
    @repository(FirebaseRepository)
    public firebaseRepository: FirebaseRepository,
  ) { }

  @post('/firebases', {
    responses: {
      '204': {
        description: 'Add firebase token',
      },
    },
  })
  async create(
    @requestBody(CreateFirebaseTokenRequestBody)
    firebase: { firebaseToken: string; },
  ): Promise<void> {
    const { firebaseToken } = firebase;
    const existedToken = await this.firebaseRepository.findOne({ where: { firebaseToken } });
    if (!existedToken)
      await this.firebaseRepository.create(firebase);
  }

  @patch('/firebases/{id}', {
    responses: {
      '204': {
        description: 'Firebase PATCH success',
      },
    },
  })
  async updateById(
    @param.path.string('id') id: string,
    @requestBody({
      content: {
        'application/json': {
          schema: getModelSchemaRef(Firebase, { partial: true }),
        },
      },
    })
    firebase: Firebase,
  ): Promise<void> {
    await this.firebaseRepository.updateById(id, firebase);
  }
}
