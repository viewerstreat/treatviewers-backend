import {RouteShorthandOptions} from 'fastify';

const clipTypeObject = {
  type: 'object',
  properties: {
    _id: {type: 'string'},
    name: {type: 'string'},
    description: {type: 'string'},
    videoUrl: {type: 'string'},
    bannerImageUrl: {type: 'string'},
    viewCount: {type: 'number'},
    likeCount: {type: 'number'},
    isActive: {type: 'boolean'},
  },
};

export interface GetClipRequest {
  Headers: {
    authorization: string;
  };
  Querystring: {
    _id?: string;
    pageSize?: number;
    pageNo?: number;
  };
}

export const GetClipRequestOpts: RouteShorthandOptions = {
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
        _id: {type: 'string'},
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
            items: clipTypeObject,
          },
        },
      },
    },
  },
};

export interface CreateClipRequest {
  Headers: {
    authorization: string;
  };
  Body: {
    name: string;
    description: string;
    bannerImageUrl: string;
    videoUrl: string;
  };
}

export const CreateClipRequestOpts: RouteShorthandOptions = {
  schema: {
    headers: {
      type: 'object',
      properties: {
        authorization: {type: 'string'},
      },
    },
    body: {
      type: 'object',
      required: ['name', 'description', 'bannerImageUrl', 'videoUrl'],
      properties: {
        name: {type: 'string', minLength: 1, maxLength: 100},
        description: {type: 'string', minLength: 1},
        bannerImageUrl: {type: 'string', format: 'uri'},
        videoUrl: {type: 'string', format: 'uri'},
      },
    },
    response: {
      200: {
        type: 'object',
        properties: {
          success: {type: 'boolean'},
          data: clipTypeObject,
        },
      },
    },
  },
};
