import {RouteShorthandOptions} from 'fastify';
import {Option} from '../../models/question';

const optionTypeObject = {
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
    _id: {type: 'string', minLength: 1},
    contestId: {type: 'string', minLength: 1},
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
        contestId: {type: 'string', minLength: 1},
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
          data: questionTypeObject,
        },
      },
      400: {
        type: 'object',
        properties: {
          success: {type: 'boolean'},
          message: {type: 'string'},
        },
      },
    },
  },
};
