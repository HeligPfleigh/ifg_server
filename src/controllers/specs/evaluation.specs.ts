// Copyright IBM Corp. 2019. All Rights Reserved.
// This file is licensed under the MIT License.
// License text available at https://opensource.org/licenses/MIT

import {UserNamespace} from './user-controller.specs';

export const EvaluationSchema = {
  type: 'object',
  required: ['evaluationType', 'influentFactor', 'score'],
  properties: {
    evaluationType: {type: 'string'},
    influentFactor: {type: 'string'},
    score: {type: 'number'},
    labelTag: {type: 'string'},
    image: {type: 'string'},
    impactType: {type: 'string'},
    description: {type: 'string'},
  },
};

export const EvaluationRequestBody = {
  description: 'The input of saving evaluation',
  required: true,
  content: {
    'application/json': {schema: EvaluationSchema},
  },
};

export const DetailStatisticSchema = {
  type: 'object',
  properties: {
    score: 'number',
    affections: 'array',
  },
};

interface Affection {
  factors?: string;
  tags?: string;
  score: number;
}

export type DetailEvaluationStatisticResponse = {
  score?: number;
  affections?: Affection[];
};

export const OverallStatisticSchema = {
  type: 'object',
  properties: {
    relationships: 'number',
    activities: 'number',
    intakes: 'number',
    other: 'number',
    overall: 'number',
  },
};

export type OverallStatisticResponse = {
  user: UserNamespace.UserProfile;
  score: {
    relationships?: number;
    activities?: number;
    intakes?: number;
    other?: number;
    overall?: number;
  };
};
