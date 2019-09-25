export interface CreateNotificationSchema {
  title: string;
  content: string;
  sendTime?: number;
  status?: string;
  language?: string;
};

export const CreateNotificationRequestBody = {
  description: 'The input of creating notification',
  required: true,
  content: {
    'application/json': {
      schema: {
        type: 'object',
        required: ['title', 'content',],
        properties: {
          title: { type: 'string' },
          content: { type: 'string' },
          sendTime: { type: 'number' },
          status: { type: 'string' },
          language: { type: 'string' },
        },
      }
    },
  },
};

export interface UpdateNotificationSchema {
  title: string;
  content: string;
  language: string;
  status: string;
  sendTime?: number;
}

export const UpdateNotificationRequestBody = {
  description: 'The input of updating notification',
  required: true,
  content: {
    'application/json': {
      schema: {
        type: 'object',
        required: ['title', 'content', 'sendTime', 'language'],
        properties: {
          title: { type: 'string' },
          content: { type: 'string' },
          sendTime: { type: 'number' },
          language: { type: 'string' },
        },
      }
    },
  },
}
