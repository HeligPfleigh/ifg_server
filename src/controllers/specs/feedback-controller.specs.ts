// Copyright IBM Corp. 2019. All Rights Reserved.
// This file is licensed under the MIT License.
// License text available at https://opensource.org/licenses/MIT

export const FeedbackSchema = {
  type: 'object',
  required: ['message', 'subject'],
  properties: {
    message: {type: 'string'},
    subject: {type: 'string'},
    password: {type: 'string'},
  },
};
