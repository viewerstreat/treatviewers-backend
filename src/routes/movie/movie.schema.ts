import {RouteShorthandOptions} from 'fastify';

const movieTypeObject = {
  type: 'object',
  properties: {
    _id: {type: 'string'},
    name: {type: 'string'},
    description: {type: 'string'},
    tags: {
      type: 'array',
      nullable: true,
      items: {type: 'string'},
    },
    bannerImageUrl: {type: 'string'},
    videoUrl: {type: 'string'},
    viewCount: {type: 'number'},
    likeCount: {type: 'number'},
    sponsoredBy: {type: 'string'},
    sponsoredByLogo: {type: 'string', nullable: true},
    releaseDate: {type: 'number'},
    releaseOutlets: {
      type: 'array',
      nullable: true,
      items: {type: 'string'},
    },
    moviePromotionExpiry: {type: 'number'},
    isActive: {type: 'boolean'},
  },
};

export interface GetMoviesRequest {
  Headers: {
    authorization: string;
  };
  Querystring: {
    _id?: string;
    pageSize?: number;
    pageNo?: number;
  };
}

export const GetMoviesRequestOpts: RouteShorthandOptions = {
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
            items: movieTypeObject,
          },
        },
      },
    },
  },
};

export interface CreateMovieRequest {
  Headers: {
    authorization: string;
  };
  Body: {
    name: string;
    description: string;
    tags?: string[];
    bannerImageUrl: string;
    videoUrl: string;
    sponsoredBy: string;
    sponsoredByLogo?: string;
    releaseDate?: number;
    releaseOutlets?: string[];
    moviePromotionExpiry?: number;
  };
}

export const CreateMovieRequestOpts: RouteShorthandOptions = {
  schema: {
    headers: {
      type: 'object',
      properties: {
        authorization: {type: 'string'},
      },
    },
    body: {
      type: 'object',
      required: ['name', 'description', 'bannerImageUrl', 'videoUrl', 'sponsoredBy', 'releaseDate'],
      properties: {
        name: {type: 'string'},
        description: {type: 'string'},
        tags: {
          type: 'array',
          items: {type: 'string'},
        },
        bannerImageUrl: {type: 'string'},
        videoUrl: {type: 'string'},
        sponsoredBy: {type: 'string'},
        sponsoredByLogo: {type: 'string'},
        releaseDate: {type: 'number'},
        releaseOutlets: {
          type: 'array',
          items: {type: 'string'},
        },
        moviePromotionExpiry: {type: 'number'},
      },
    },
    response: {
      200: {
        type: 'object',
        properties: {
          success: {type: 'boolean'},
          data: movieTypeObject,
        },
      },
    },
  },
};
