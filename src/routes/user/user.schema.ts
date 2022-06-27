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
  id?: number;
  name: string;
  email: string;
  phone: string;
}

export const CreateUserOpts: RouteShorthandOptions = {
  schema: {
    body: {
      type: 'object',
      required: ['name', 'email', 'phone'],
      properties: {
        id: {type: 'number'},
        name: {type: 'string'},
        email: {type: 'string'},
        phone: {type: 'string'},
      },
    },
    response: {
      201: {
        type: 'object',
        properties: {
          success: {type: 'boolean'},
          data: userTypeObject,
          token: {type: 'string'},
        },
      },
    },
  },
};

export type CreateUserRequest = {
  Body: CreateUserSchema;
};
