export const CreateFirebaseTokenSchema = {
  type: 'object',
  required: ['firebaseToken'],
  properties: {
    firebaseToken: { type: 'string' },
  },
};

export const CreateFirebaseTokenRequestBody = {
  description: 'The input of saving evaluation',
  required: true,
  content: {
    'application/json': { schema: CreateFirebaseTokenSchema },
  },
};
