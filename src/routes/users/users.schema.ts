import {Static, Type} from '@sinclair/typebox';
import {RouteShorthandOptions} from 'fastify';

export const UserSchema = Type.Object({
  id: Type.Number(),
  name: Type.String(),
  email: Type.String({format: 'email'}),
  phone: Type.String({maxLength: 15, minLength: 10}),
  isActive: Type.Boolean(),
  hasUsedReferralCode: Type.Optional(Type.Boolean()),
  referralCode: Type.Optional(Type.String()),
  referredBy: Type.Optional(Type.String()),
});

export const GetAllUsersResponseSchema = Type.Object({
  success: Type.Boolean(),
  data: Type.Array(UserSchema),
});

export const GetAllUsersOpts: RouteShorthandOptions = {
  schema: {
    response: {
      200: GetAllUsersResponseSchema,
    },
  },
};

export const FindUserReqParams = Type.Object({
  id: Type.Number(),
});

export type FindUserRequest = {
  Params: Static<typeof FindUserReqParams>;
};
export const FindUserResponse = Type.Object({
  success: Type.Boolean(),
  data: UserSchema,
});

export const FindUserOpts: RouteShorthandOptions = {
  schema: {
    params: {
      type: 'object',
      properties: {
        id: {type: 'string'},
      },
    },
    response: {
      200: FindUserResponse,
    },
  },
};
