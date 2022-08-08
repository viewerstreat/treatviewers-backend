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
    isLikedByMe: {type: 'boolean'},
    isActive: {type: 'boolean'},
  },
};

export interface GetClipRequest {
  Querystring: {
    _id?: string;
    pageSize?: number;
    pageIndex?: number;
  };
}

export const GetClipRequestOpts: RouteShorthandOptions = {
  schema: {
    description: 'get clip list. filter can be applied by `_id`.',
    querystring: {
      type: 'object',
      properties: {
        _id: {type: 'string', minLength: 24, maxLength: 24},
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
    description:
      'Create new clip. `name`, `description`, `bannerImageUrl`, `videoUrl` are mandatory parameters. Authorization required.',
    headers: {
      type: 'object',
      required: ['authorization'],
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

export interface AddViewRequest {
  Headers: {
    authorization: string;
  };
  Body: {
    clipId: string;
  };
}

export const AddViewReqOpts: RouteShorthandOptions = {
  schema: {
    description: 'Add View Count for clip. Authorization is required.',
    headers: {
      type: 'object',
      required: ['authorization'],
      properties: {
        authorization: {type: 'string'},
      },
    },
    body: {
      type: 'object',
      required: ['clipId'],
      properties: {
        clipId: {type: 'string', minLength: 24, maxLength: 24},
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
