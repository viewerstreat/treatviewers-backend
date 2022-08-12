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
    viewCount: {type: 'number', nullable: true},
    likeCount: {type: 'number', nullable: true},
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
  Querystring: {
    _id?: string;
    pageSize?: number;
    pageNo?: number;
  };
}

export const GetMoviesRequestOpts: RouteShorthandOptions = {
  schema: {
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
    description: 'Create movie API.',
    headers: {
      type: 'object',
      required: ['authorization'],
      properties: {
        authorization: {type: 'string'},
      },
    },
    body: {
      type: 'object',
      required: ['name', 'description', 'bannerImageUrl', 'videoUrl', 'sponsoredBy', 'releaseDate'],
      properties: {
        name: {type: 'string', minLength: 1, maxLength: 100},
        description: {type: 'string', minLength: 1},
        tags: {
          type: 'array',
          nullable: true,
          items: {type: 'string', minLength: 1, maxLength: 50},
        },
        bannerImageUrl: {type: 'string', format: 'uri'},
        videoUrl: {type: 'string', format: 'uri'},
        sponsoredBy: {type: 'string', minLength: 1},
        sponsoredByLogo: {type: 'string', format: 'uri'},
        releaseDate: {type: 'number'},
        releaseOutlets: {
          type: 'array',
          nullable: true,
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

export interface GetMovieDetailRequest {
  Querystring: {
    movieId: string;
  };
}

export const GetMovieDetailReqOpts: RouteShorthandOptions = {
  schema: {
    description: 'Get the details of movie of a particular movie. `movieId` is required parameter.',
    querystring: {
      type: 'object',
      required: ['movieId'],
      properties: {
        movieId: {type: 'string', minLength: 24, maxLength: 24},
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

export interface AddViewRequest {
  Headers: {
    authorization: string;
  };
  Body: {
    movieId: string;
  };
}

export const AddViewReqOpts: RouteShorthandOptions = {
  schema: {
    description: 'Add View Count for movie. Authorization is required.',
    headers: {
      type: 'object',
      required: ['authorization'],
      properties: {
        authorization: {type: 'string'},
      },
    },
    body: {
      type: 'object',
      required: ['movieId'],
      properties: {
        movieId: {type: 'string', minLength: 24, maxLength: 24},
      },
    },
    response: {
      200: {
        type: 'object',
        properties: {
          success: {type: 'boolean'},
          message: {type: 'string'},
          viewCount: {type: 'number'},
        },
      },
    },
  },
};

export interface IsLikeByMeRequest {
  Querystring: {
    movieId: string;
  };
}

export const IsLikeByMeReqOpts: RouteShorthandOptions = {
  schema: {
    description: 'is the movie liked by me. `authorization` header is required.',
    headers: {
      type: 'object',
      required: ['authorization'],
      properties: {
        authorization: {type: 'string'},
      },
    },
    querystring: {
      type: 'object',
      required: ['movieId'],
      properties: {
        movieId: {type: 'string', minLength: 24, maxLength: 24},
      },
    },
    response: {
      200: {
        type: 'object',
        properties: {
          success: {type: 'boolean'},
          isLikedByMe: {type: 'boolean'},
        },
      },
    },
  },
};
