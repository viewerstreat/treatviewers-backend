import {RouteShorthandOptions} from 'fastify';

const playTrackerObject = {
  type: 'object',
  properties: {
    userId: {type: 'number'},
    contestId: {type: 'string'},
    status: {type: 'string'},
    walletTransactionId: {type: 'string'},
    initTs: {type: 'number'},
    paidTs: {type: 'number'},
    startTs: {type: 'number'},
  },
};

export interface PlayTrackerInitReq {
  Headers: {
    authorization: string;
  };
  Body: {
    contestId: string;
  };
}

export const PlayTrackerInitOpts: RouteShorthandOptions = {
  schema: {
    description: 'Play Tracker initialize or resume the existing play tracker',
    headers: {
      type: 'object',
      required: ['authorization'],
      properties: {
        authorization: {type: 'string'},
      },
    },
    body: {
      type: 'object',
      required: ['contestId'],
      properties: {
        contestId: {type: 'string', minLength: 24, maxLength: 24},
      },
    },
    response: {
      200: {
        properties: {
          success: {type: 'boolean'},
          data: playTrackerObject,
        },
      },
      404: {
        properties: {
          success: {type: 'boolean'},
          message: {type: 'string'},
        },
      },
      409: {
        properties: {
          success: {type: 'boolean'},
          message: {type: 'string'},
        },
      },
    },
  },
};
