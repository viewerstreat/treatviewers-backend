import {RouteShorthandOptions} from 'fastify';

export interface UserSchema {
  id: number;
  name: string;
  email: string;
  phone: string;
  isActive: boolean;
  hasUsedReferralCode?: boolean;
  referralCode?: string;
  referredBy?: string;
}

export const GetAllUsersOpts: RouteShorthandOptions = {
  schema: {
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
                id: {type: 'number'},
                name: {type: 'string'},
                email: {type: 'string'},
                phone: {type: 'string'},
                isActive: {type: 'boolean'},
                hasUsedReferralCode: {type: 'boolean'},
                referralCode: {type: 'string'},
                referredBy: {type: 'string'},
              },
            },
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
          data: {
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
          },
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
          success: {type: 'string'},
          data: {
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
          },
          token: {type: 'string'},
        },
      },
    },
  },
};

export type CreateUserRequest = {
  Body: CreateUserSchema;
};
