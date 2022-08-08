import {RouteShorthandOptions} from 'fastify';
import {MEDIA_TYPE} from '../../models/movie';

export interface UpdateFavouriteRequest {
  Body: {
    mediaType: MEDIA_TYPE;
    mediaId: string;
    mediaName: string;
    bannerImageUrl: string;
  };
}

export const UpdateFavouriteReqOpts: RouteShorthandOptions = {
  schema: {
    description: 'Toggle favourite for movie and clip. authorization is required.',
    headers: {
      type: 'object',
      required: ['authorization'],
      properties: {
        authorization: {type: 'string'},
      },
    },
    body: {
      type: 'object',
      required: ['mediaType', 'mediaId', 'mediaName', 'bannerImageUrl'],
      properties: {
        mediaType: {enum: ['movie', 'clip']},
        mediaId: {type: 'string', minLength: 24, maxLength: 24},
        mediaName: {type: 'string', minLength: 1},
        bannerImageUrl: {type: 'string', format: 'uri'},
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

export interface GetFavouriteRequest {
  Querystring: {
    mediaType: MEDIA_TYPE;
    pageIndex: number;
    pageSize: number;
  };
}

export const GetFavouriteReqOpts: RouteShorthandOptions = {
  schema: {
    description: 'get list of favourite movie or clip. authorization is required.',
    headers: {
      type: 'object',
      required: ['authorization'],
      properties: {
        authorization: {type: 'string'},
      },
    },
    querystring: {
      type: 'object',
      required: ['mediaType'],
      properties: {
        mediaType: {enum: ['movie', 'clip']},
        pageIndex: {type: 'number', minimum: 0},
        pageSize: {type: 'number', minimum: 1},
      },
    },
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
                mediaType: {enum: ['movie', 'clip']},
                userId: {type: 'number'},
                mediaId: {type: 'string'},
                mediaName: {type: 'string'},
                bannerImageUrl: {type: 'string'},
              },
            },
          },
        },
      },
    },
  },
};
