import {RouteShorthandOptions} from 'fastify';
import {CONTEST_CATEGORY, PRIZE_SELECTION} from '../../models/contest';

const contestTypeObject = {
  type: 'object',
  properties: {
    _id: {type: 'string'},
    title: {type: 'string'},
    category: {type: 'string'},
    movieId: {type: 'string', nullable: true, minLength: 24, maxLength: 24},
    sponsoredBy: {type: 'string'},
    sponsoredByLogo: {type: 'string', nullable: true},
    bannerImageUrl: {type: 'string', nullable: true},
    videoUrl: {type: 'string', nullable: true},
    entryFee: {type: 'number'},
    viewCount: {type: 'number'},
    likeCount: {type: 'number'},
    prizeSelection: {enum: ['TOP_WINNERS', 'RATIO_BASED']},
    topWinnersCount: {type: 'number', minimum: 1, nullable: true},
    prizeRatioNumerator: {type: 'number', minimum: 1, nullable: true},
    prizeRatioDenominator: {type: 'number', minimum: 1, nullable: true},
    prizeValue: {type: 'number', minimum: 1, nullable: true},
    startTime: {type: 'number'},
    endTime: {type: 'number'},
    questionCount: {type: 'number', nullable: true},
    status: {type: 'string'},
  },
};

export interface GetContestRequest {
  Querystring: {
    _id?: string;
    movieId?: string;
    category?: CONTEST_CATEGORY;
    pageSize?: number;
    pageIndex?: number;
  };
}

export const GetContestRequestOpts: RouteShorthandOptions = {
  schema: {
    description: 'get the contest list. filter can be applied by `_id`,`movieId` & `category`. ',
    querystring: {
      type: 'object',
      properties: {
        _id: {type: 'string', minLength: 24, maxLength: 24},
        movieId: {type: 'string', minLength: 24, maxLength: 24},
        category: {enum: ['movie', 'others']},
        pageSize: {type: 'number'},
        pageIndex: {type: 'number'},
      },
    },
    response: {
      200: {
        type: 'object',
        properties: {
          success: {type: 'boolean'},
          data: {
            type: 'array',
            items: contestTypeObject,
          },
        },
      },
    },
  },
};

export interface CreateContestRequest {
  Headers: {
    authorization: string;
  };
  Body: {
    title: string;
    category: CONTEST_CATEGORY;
    movieId?: string;
    sponsoredBy: string;
    sponsoredByLogo?: string;
    bannerImageUrl?: string;
    videoUrl?: string;
    entryFee: number;
    prizeSelection: PRIZE_SELECTION;
    topWinnersCount?: number;
    prizeRatioNumerator?: number;
    prizeRatioDenominator?: number;
    prizeValue?: number;
    startTime: number;
    endTime: number;
  };
}

export const CreateContestRequestOpts: RouteShorthandOptions = {
  schema: {
    description: 'Create a new contest',
    headers: {
      type: 'object',
      required: ['authorization'],
      properties: {
        authorization: {type: 'string'},
      },
    },
    body: {
      type: 'object',
      required: [
        'title',
        'category',
        'sponsoredBy',
        'bannerImageUrl',
        'videoUrl',
        'entryFee',
        'prizeSelection',
        'prizeValue',
        'startTime',
        'endTime',
      ],
      properties: {
        title: {type: 'string', minLength: 1, maxLength: 100},
        category: {enum: ['movie', 'others']},
        movieId: {
          anyOf: [{type: 'string', minLength: 24, maxLength: 24, nullable: true}, {const: ''}],
        },
        sponsoredBy: {type: 'string', minLength: 1},
        sponsoredByLogo: {anyOf: [{type: 'string', format: 'uri', nullable: true}, {const: ''}]},
        bannerImageUrl: {type: 'string', format: 'uri'},
        videoUrl: {type: 'string', format: 'uri'},
        entryFee: {type: 'number', minimum: 0},
        prizeSelection: {enum: ['TOP_WINNERS', 'RATIO_BASED']},
        topWinnersCount: {type: 'number', minimum: 1, nullable: true},
        prizeRatioNumerator: {type: 'number', minimum: 1, nullable: true},
        prizeRatioDenominator: {type: 'number', minimum: 1, nullable: true},
        prizeValue: {type: 'number', minimum: 1},
        startTime: {type: 'number', minimum: 1},
        endTime: {type: 'number', minimum: 1},
      },
    },
    response: {
      200: {
        type: 'object',
        properties: {
          success: {type: 'boolean'},
          data: contestTypeObject,
        },
      },
    },
  },
};

export interface ActivateRequest {
  Headers: {
    authorization: string;
  };
  Body: {
    contestId: string;
  };
}

export const ActivateReqOpts: RouteShorthandOptions = {
  schema: {
    description: 'API to activate contest',
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
          message: {type: 'string'},
        },
      },
    },
  },
};

export const ContestWiseResultOpts: RouteShorthandOptions = {
  schema: {
    description: 'Get Contestwise result for an user',
    response: {
      200: {
        type: 'object',
        properties: {
          success: {type: 'boolean'},
          data: {
            type: 'array',
            items: {
              type: 'object',
              properties: {
                _id: {type: 'string'},
                title: {type: 'string'},
                rank: {type: 'number'},
                timeTaken: {type: 'number'},
                correctAns: {type: 'number'},
                totalQues: {type: 'number'},
                earning: {type: 'number'},
                badgesWon: {type: 'boolean'},
              },
            },
          },
        },
      },
    },
  },
};
