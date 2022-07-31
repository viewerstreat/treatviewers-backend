import {RouteShorthandOptions} from 'fastify';
import {Option} from '../../models/question';

export const optionTypeObject = {
  type: 'object',
  required: ['optionId', 'optionText', 'isCorrect'],
  properties: {
    optionId: {enum: [1, 2, 3, 4]},
    optionText: {type: 'string', minLength: 1},
    isCorrect: {type: 'boolean'},
  },
};

const questionTypeObject = {
  type: 'object',
  required: ['contestId', 'questionNo', 'questionText', 'options'],
  properties: {
    contestId: {type: 'string', minLength: 24, maxLength: 24},
    questionNo: {type: 'number', minimum: 1},
    questionText: {type: 'string', minLength: 1},
    options: {
      type: 'array',
      minItems: 4,
      maxItems: 4,
      items: optionTypeObject,
    },
    isActive: {type: 'boolean'},
  },
};

export const quesResObject = {
  type: 'object',
  properties: {
    contestId: {type: 'string'},
    questionNo: {type: 'number'},
    questionText: {type: 'string'},
    options: {
      type: 'array',
      items: {
        type: 'object',
        properties: {
          optionId: {type: 'number'},
          optionText: {type: 'string'},
        },
      },
    },
  },
};

export interface GetQuestionRequest {
  Headers: {
    authorization: string;
  };
  Querystring: {
    contestId: string;
    questionNo: number;
  };
}

export const GetQuestionRequestOpts: RouteShorthandOptions = {
  schema: {
    description: 'Get a question details',
    headers: {
      type: 'object',
      required: ['authorization'],
      properties: {
        authorization: {type: 'string'},
      },
    },
    querystring: {
      type: 'object',
      required: ['contestId', 'questionNo'],
      properties: {
        contestId: {type: 'string', minLength: 24, maxLength: 24},
        questionNo: {type: 'number', minimum: 1},
      },
    },
    response: {
      200: {
        type: 'object',
        properties: {
          success: {type: 'boolean'},
          data: questionTypeObject,
        },
      },
    },
  },
};

export interface GetNxtQuesReq {
  Headers: {
    authorization: string;
  };
  Querystring: {
    contestId: string;
  };
}

export const GetNxtQuesReqOpts: RouteShorthandOptions = {
  schema: {
    description: 'Get next question for a contest',
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
        type: 'object',
        properties: {
          success: {type: 'boolean'},
          data: quesResObject,
        },
      },
    },
  },
};

export interface CreateQuestionRequest {
  Headers: {
    authorization: string;
  };
  Body: {
    contestId: string;
    questionNo: number;
    questionText: string;
    options: Option[];
  };
}

export const CreateQuestionRequestOpts: RouteShorthandOptions = {
  schema: {
    description: 'Create a question',
    headers: {
      type: 'object',
      required: ['authorization'],
      properties: {
        authorization: {type: 'string', minLength: 1},
      },
    },
    body: questionTypeObject,
    response: {
      200: {
        type: 'object',
        properties: {
          success: {type: 'boolean'},
          message: {type: 'string'},
        },
      },
    },
  },
};
