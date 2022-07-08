import {RouteShorthandOptions} from 'fastify';

const contestTypeObject = {
  type: 'object',
  properties: {
    _id: {type: 'string'},
    title: {type: 'string'},
    category: {type: 'string'},
    movieId: {type: 'string', nullable: true},
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
  Headers: {
    authorization: string;
  };
  Querystring: {
    _id?: string;
    movieId?: string;
    pageSize?: number;
    pageNo?: number;
  };
}

export const GetContestRequestOpts: RouteShorthandOptions = {
  schema: {
    headers: {
      type: 'object',
      properties: {
        authorization: {type: 'string'},
      },
    },
    querystring: {
      type: 'object',
      properties: {
        _id: {type: 'string', minLength: 24, maxLength: 24},
        movieId: {type: 'string', minLength: 24, maxLength: 24},
        pageSize: {type: 'number'},
        pageNo: {type: 'number'},
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
    category: string;
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
    headers: {
      type: 'object',
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
        entryFee: {type: 'number', minimum: 1},
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
