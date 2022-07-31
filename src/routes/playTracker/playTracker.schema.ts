import {RouteShorthandOptions} from 'fastify';
import {quesResObject} from '../question/question.schema';

export const playTrackerObject = {
  type: 'object',
  properties: {
    userId: {type: 'number'},
    contestId: {type: 'string'},
    status: {type: 'string'},
    startTs: {type: 'number'},
    currQuestionNo: {type: 'number'},
    totalQuestions: {type: 'number'},
    totalAnswered: {type: 'number'},
    score: {type: 'number'},
  },
};

export interface PlayTrackerGetReq {
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
    },
  },
};

export interface PlayStartReq {
  Body: {
    contestId: string;
  };
}

export const PlayStartReqOpts: RouteShorthandOptions = {
  schema: {
    description: 'API to start/resume play',
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
        type: 'object',
        properties: {
          success: {type: 'boolean'},
          data: playTrackerObject,
          question: quesResObject,
        },
      },
    },
  },
};

export interface AnswerRequest {
  Headers: {
    authorization: string;
  };
  Body: {
    contestId: string;
    questionNo: number;
    options: {
      optionId: number;
      optionText: string;
    }[];
    selectedOptionId: number;
  };
}

export const AnswerReqOpts: RouteShorthandOptions = {
  schema: {
    description: 'API for answer in quiz',
    body: {
      type: 'object',
      required: ['contestId', 'questionNo', 'selectedOptionId'],
      properties: {
        contestId: {type: 'string', minLength: 24, maxLength: 24},
        questionNo: {type: 'number', minimum: 1},
        selectedOptionId: {type: 'number', minimum: 1, maximum: 4},
      },
    },
    response: {
      200: {
        type: 'object',
        properties: {
          success: {type: 'boolean'},
          data: playTrackerObject,
          question: quesResObject,
        },
      },
    },
  },
};

export interface FinishRequest {
  Headers: {
    authorization: string;
  };
  Body: {
    contestId: string;
  };
}

export const FinishReqOpts: RouteShorthandOptions = {
  schema: {
    description: 'API to finish the quiz',
    body: {
      type: 'object',
      required: ['contestId'],
      properties: {
        contestId: {type: 'string', minLength: 24, maxLength: 24},
      },
    },
    response: {
      200: {
        type: 'object',
        properties: {
          success: {type: 'boolean'},
          data: playTrackerObject,
        },
      },
    },
  },
};
