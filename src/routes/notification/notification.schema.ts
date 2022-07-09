import {RouteShorthandOptions} from 'fastify';

const notiTypeObject = {
  type: 'object',
  properties: {
    _id: {type: 'string'},
    eventType: {type: 'string'},
    notificationType: {type: 'string'},
    userId: {type: 'number'},
    message: {type: 'string'},
    isRead: {type: 'boolean'},
  },
};

export interface GetNotiRequest {
  Headers: {
    authorization: string;
  };
  Querystring: {
    pageSize?: number;
    pageIndex?: number;
  };
}

export const GetNotiReqOpts: RouteShorthandOptions = {
  schema: {
    description: 'Get all notifications',
    headers: {
      type: 'object',
      required: ['authorization'],
      properties: {
        authorization: {type: 'string'},
      },
    },
    querystring: {
      type: 'object',
      properties: {
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
            items: notiTypeObject,
          },
        },
      },
    },
  },
};

export const ClearAllNotiReqOpts: RouteShorthandOptions = {
  schema: {
    description: 'Clear all notifications',
    headers: {
      type: 'object',
      required: ['authorization'],
      properties: {
        authorization: {type: 'string'},
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

export interface ClearNotiRequest {
  Headers: {
    authorization: string;
  };
  Body: {
    _id: string;
  };
}

export const ClearNotiReqOpts: RouteShorthandOptions = {
  schema: {
    description: 'Clear a notification.',
    headers: {
      type: 'object',
      required: ['authorization'],
      properties: {
        authorization: {type: 'string'},
      },
    },
    body: {
      type: 'object',
      required: ['_id'],
      properties: {
        _id: {type: 'string', minLength: 24, maxLength: 24},
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

export interface MarkNotiReadRequest {
  Headers: {
    authorization: string;
  };
  Body: {
    _id: string;
  };
}

export const MarkNotiReadReqOpts: RouteShorthandOptions = {
  schema: {
    description: 'Mark a notification as read',
    headers: {
      type: 'object',
      required: ['authorization'],
      properties: {
        authorization: {type: 'string'},
      },
    },
    body: {
      type: 'object',
      required: ['_id'],
      properties: {
        _id: {type: 'string', minLength: 24, maxLength: 24},
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

export const MarkAllNotiReadReqOpts: RouteShorthandOptions = {
  schema: {
    description: 'Mark All notification as read',
    headers: {
      type: 'object',
      required: ['authorization'],
      properties: {
        authorization: {type: 'string'},
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
