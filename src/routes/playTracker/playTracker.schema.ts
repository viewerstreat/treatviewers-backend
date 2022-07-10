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
    currQuestionNo: {type: 'number'},
    totalQuestions: {type: 'number'},
  },
};

export interface PlayTrackerInitReq {
  Headers: {
    authorization: string;
  };
  Querystring: {
    contestId: string;
  };
}

export const PlayTrackerOpts: RouteShorthandOptions = {
  schema: {
    description: 'Play Tracker initialize or resume the existing play tracker',
    headers: {
      type: 'object',
      required: ['authorization'],
      properties: {
        authorization: {type: 'string'},
      },
    },
    querystring: {
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
