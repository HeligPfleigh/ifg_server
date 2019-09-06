// Copyright IBM Corp. 2019. All Rights Reserved.
// This file is licensed under the MIT License.
// License text available at https://opensource.org/licenses/MIT

export const ActionSchema = {
  type: 'object',
  required: ['action'],
  properties: {
    action: { type: 'string' },
    reason: { type: 'string' },
  },
};

export const ActionRequestBody = {
  description: 'The input of saving action',
  required: true,
  content: {
    'application/json': { schema: ActionSchema },
  },
};
