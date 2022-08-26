import {FastifyPluginAsync} from 'fastify';
import {
  checkOtpHandler,
  createUserHandler,
  getLeaderboardHandler,
  loginHandler,
  renewTokenHandler,
  updateFcmTokenHandler,
  updateUserHandler,
  verifyUserHandler,
} from './user.handlers';
import {
  CheckOtpReqOpts,
  CheckOtpRequest,
  CreateUserOpts,
  CreateUserRequest,
  GetLeaderboardOpts,
  LoginReqOpts,
  LoginRequest,
  RenewTokenReqOpts,
  RenewTokenRequest,
  UpdateFCMTokenReq,
  UpdateFCMTokenReqOpts,
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

  // update FCM token for the user
  fastify.post<UpdateFCMTokenReq>('/updateFcmToken', UpdateFCMTokenReqOpts, updateFcmTokenHandler);

  // get leaderboard data
  fastify.get('/getLeaderboard', GetLeaderboardOpts, getLeaderboardHandler);
};

export default userRoute;
