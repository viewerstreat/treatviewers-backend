import {RouteShorthandOptions} from 'fastify';

const userTypeObject = {
  type: 'object',
  properties: {
    id: {type: 'number'},
    name: {type: 'string'},
    email: {type: 'string'},
    phone: {type: 'string'},
    isActive: {type: 'boolean'},
    hasUsedReferralCode: {type: 'boolean'},
    referralCode: {type: 'string'},
    referredBy: {type: 'string'},
  },
};

export const GetAllUsersOpts: RouteShorthandOptions = {
  schema: {
    response: {
      200: {
        type: 'object',
        properties: {
          success: {type: 'boolean'},
          data: {
            type: 'array',
            items: userTypeObject,
          },
        },
      },
    },
  },
};

interface FindUserReqParams {
  id: number;
}

export type FindUserRequest = {
  Params: FindUserReqParams;
};

export const FindUserOpts: RouteShorthandOptions = {
  schema: {
    params: {
      type: 'object',
      properties: {
        id: {type: 'string'},
      },
    },
    response: {
      200: {
        type: 'object',
        properties: {
          success: {type: 'boolean'},
          data: userTypeObject,
        },
      },
    },
  },
};

interface CreateUserSchema {
  name: string;
  phone: string;
  email?: string;
}

export const CreateUserOpts: RouteShorthandOptions = {
  schema: {
    body: {
      title: 'Create User',
      description: 'Create User POST request API endpoint',
      type: 'object',
      required: ['name', 'phone'],
      properties: {
        name: {type: 'string', minLength: 1, maxLength: 50},
        email: {type: 'string', format: 'email', maxLength: 100},
        phone: {type: 'string', minLength: 10, maxLength: 10, pattern: '^[0-9]{10}$'},
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

export type CreateUserRequest = {
  Body: CreateUserSchema;
};

export interface VerifyUserRequest {
  Querystring: {
    phone: string;
  };
}

export const VerifyUserRequestOpts: RouteShorthandOptions = {
  schema: {
    querystring: {
      type: 'object',
      required: ['phone'],
      properties: {
        phone: {type: 'string', minLength: 10, maxLength: 10, pattern: '^[0-9]{10}$'},
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
      404: {
        type: 'object',
        properties: {
          success: {type: 'boolean'},
          message: {type: 'string'},
        },
      },
    },
  },
};

export interface CheckOtpRequest {
  Querystring: {
    phone: string;
    otp: string;
  };
}

export const CheckOtpReqOpts: RouteShorthandOptions = {
  schema: {
    querystring: {
      type: 'object',
      required: ['phone', 'otp'],
      properties: {
        phone: {type: 'string', minLength: 10, maxLength: 10, pattern: '^[0-9]{10}$'},
        otp: {type: 'string', minLength: 6, maxLength: 6, pattern: '^[0-9]{6}$'},
      },
    },
    response: {
      200: {
        type: 'object',
        properties: {
          success: {type: 'boolean'},
          data: userTypeObject,
          token: {type: 'string'},
        },
      },
      404: {
        type: 'object',
        properties: {
          success: {type: 'boolean'},
          message: {type: 'string'},
        },
      },
    },
  },
};
