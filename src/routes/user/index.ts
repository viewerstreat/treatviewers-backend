import {FastifyPluginAsync} from 'fastify';
import {
  checkOtpHandler,
  createUserHandler,
  loginHandler,
  renewTokenHandler,
  updateUserHandler,
  verifyUserHandler,
} from './user.handlers';
import {
  CheckOtpReqOpts,
  CheckOtpRequest,
  CreateUserOpts,
  CreateUserRequest,
  LoginReqOpts,
  LoginRequest,
  RenewTokenReqOpts,
  RenewTokenRequest,
  UpdateUserOpts,
  UpdateUserRequest,
  VerifyUserRequest,
  VerifyUserRequestOpts,
} from './user.schema';

const userRoute: FastifyPluginAsync = async (fastify, opts): Promise<void> => {
  // verify user
  fastify.get<VerifyUserRequest>('/verify', VerifyUserRequestOpts, verifyUserHandler);

  // verify otp
  fastify.get<CheckOtpRequest>('/checkOtp', CheckOtpReqOpts, checkOtpHandler);

  // renew token
  fastify.post<RenewTokenRequest>('/renewToken', RenewTokenReqOpts, renewTokenHandler);

  // create user
  fastify.post<CreateUserRequest>('/create', CreateUserOpts, createUserHandler);

  // update user
  fastify.post<UpdateUserRequest>('/update', UpdateUserOpts, updateUserHandler);

  // login user
  fastify.post<LoginRequest>('/login', LoginReqOpts, loginHandler);
};

export default userRoute;
