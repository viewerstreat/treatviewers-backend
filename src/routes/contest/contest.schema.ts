import {RouteShorthandOptions} from 'fastify';
import {CONTEST_CATEGORY} from '../../models/contest';

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
    topPrize: {type: 'string', nullable: true},
    prizeRatio: {type: 'string', nullable: true},
    topWinners: {type: 'string', nullable: true},
    startTime: {type: 'number'},
    endTime: {type: 'number'},
    questionCount: {type: 'number', nullable: true},
    isActive: {type: 'boolean'},
  },
};

export interface GetContestRequest {
  Querystring: {
    _id?: string;
    movieId?: string;
    pageSize?: number;
    pageIndex?: number;
  };
}

export const GetContestRequestOpts: RouteShorthandOptions = {
  schema: {
    description: 'get the contest list. filter can be applied by `_id` and `movieId`. ',
    querystring: {
      type: 'object',
      properties: {
        _id: {type: 'string', minLength: 24, maxLength: 24},
        movieId: {type: 'string', minLength: 24, maxLength: 24},
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
    topPrize?: string;
    prizeRatio?: string;
    topWinners?: string;
    startTime?: number;
    endTime?: number;
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
      required: ['title', 'category', 'sponsoredBy', 'entryFee', 'startTime', 'endTime'],
      properties: {
        title: {type: 'string', minLength: 1, maxLength: 100},
        category: {type: 'string', minLength: 1},
        movieId: {type: 'string', nullable: true},
        sponsoredBy: {type: 'string', minLength: 1},
        sponsoredByLogo: {type: 'string'},
        bannerImageUrl: {type: 'string', format: 'uri'},
        videoUrl: {type: 'string', format: 'uri'},
        entryFee: {type: 'number', minimum: 0},
        topPrize: {type: 'string'},
        prizeRatio: {type: 'string'},
        topWinners: {type: 'string'},
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
