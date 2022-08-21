import {RouteShorthandOptions} from 'fastify';
import {LOGIN_SCHEME} from '../../models/user';

const userTypeObject = {
  type: 'object',
  properties: {
    id: {type: 'number'},
    name: {type: 'string'},
    email: {type: 'string'},
    phone: {type: 'string'},
    profilePic: {type: 'string'},
    loginScheme: {type: 'string'},
    isActive: {type: 'boolean'},
  },
};

interface CreateUserSchema {
  name: string;
  phone: string;
  email?: string;
  profilePic?: string;
}

export const CreateUserOpts: RouteShorthandOptions = {
  schema: {
    description: 'Create User POST request API endpoint',
    body: {
      type: 'object',
      required: ['name', 'phone'],
      properties: {
        name: {type: 'string', minLength: 1, maxLength: 50},
        email: {anyOf: [{type: 'string', format: 'email'}, {const: ''}]},
        phone: {type: 'string', minLength: 10, maxLength: 10, pattern: '^[0-9]{10}$'},
        profilePic: {type: 'string', format: 'uri'},
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

export type CreateUserRequest = {
  Body: CreateUserSchema;
};

export interface UpdateUserRequest {
  Body: {
    name?: string;
    profilePic?: string;
    phone?: string;
    email?: string;
  };
}

export const UpdateUserOpts: RouteShorthandOptions = {
  schema: {
    description: 'Update user API',
    headers: {
      type: 'object',
      required: ['authorization'],
      properties: {
        authorization: {type: 'string', minLength: 1},
      },
    },
    body: {
      type: 'object',
      properties: {
        name: {type: 'string', minLength: 1, maxLength: 50},
        profilePic: {type: 'string', format: 'uri'},
        email: {type: 'string', format: 'email', maxLength: 100},
        phone: {type: 'string', minLength: 10, maxLength: 10, pattern: '^[0-9]{10}$'},
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

export interface VerifyUserRequest {
  Querystring: {
    phone: string;
  };
}

export const VerifyUserRequestOpts: RouteShorthandOptions = {
  schema: {
    description: 'Verify whether a valid user by phone no',
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
    description: 'verify otp',
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
          refreshToken: {type: 'string'},
        },
      },
    },
  },
};

export interface RenewTokenRequest {
  Body: {
    loginScheme: LOGIN_SCHEME;
    idToken: string | undefined;
    fbToken: string | undefined;
    refreshToken: string | undefined;
  };
}

export const RenewTokenReqOpts: RouteShorthandOptions = {
  schema: {
    description: 'renew token validating the previous token.',
    body: {
      type: 'object',
      required: ['loginScheme'],
      properties: {
        loginScheme: {enum: ['GOOGLE', 'FACEBOOK', 'OTP_BASED']},
        idToken: {type: 'string'},
        fbToken: {type: 'string'},
        refreshToken: {type: 'string'},
      },
    },
    response: {
      200: {
        type: 'object',
        properties: {
          success: {type: 'boolean'},
          data: userTypeObject,
          token: {type: 'string'},
          refreshToken: {type: 'string'},
        },
      },
    },
  },
};

export interface LoginRequest {
  Body: {
    loginScheme: LOGIN_SCHEME;
    name: string;
    email: string;
    profilePic: string;
    idToken?: string;
    fbToken?: string;
  };
}

export const LoginReqOpts: RouteShorthandOptions = {
  schema: {
    description: 'API for login user',
    body: {
      type: 'object',
      required: ['loginScheme'],
      properties: {
        loginScheme: {enum: ['GOOGLE', 'FACEBOOK']},
        name: {type: 'string'},
        email: {type: 'string'},
        profilePic: {type: 'string'},
        idToken: {type: 'string'},
        fbToken: {type: 'string'},
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
    },
  },
};

export interface UpdateFCMTokenReq {
  Body: {
    token: string;
  };
}

export const UpdateFCMTokenReqOpts: RouteShorthandOptions = {
  schema: {
    description: 'API to update FCM token for the user in the database',
    headers: {
      type: 'object',
      required: ['authorization'],
      properties: {
        authorization: {type: 'string', minLength: 1},
      },
    },
    body: {
      type: 'object',
      properties: {
        name: {token: 'string', minLength: 1},
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
