import {FastifyPluginAsync} from 'fastify';
import {
  checkOtpHandler,
  createUserHandler,
  renewTokenHandler,
  updateUserHandler,
  // findUserHandler,
  // getAllUsersHandler,
  verifyUserHandler,
} from './user.handlers';
import {
  CheckOtpReqOpts,
  CheckOtpRequest,
  CreateUserOpts,
  CreateUserRequest,
  RenewTokenReqOpts,
  RenewTokenRequest,
  UpdateUserOpts,
  UpdateUserRequest,
  // FindUserOpts,
  // FindUserRequest,
  // GetAllUsersOpts,
  VerifyUserRequest,
  VerifyUserRequestOpts,
} from './user.schema';

const userRoute: FastifyPluginAsync = async (fastify, opts): Promise<void> => {
  // // get all users list
  // fastify.get('/', GetAllUsersOpts, (request, reply) =>
  //   getAllUsersHandler(request, reply, fastify),
  // );

  // // find a particular user by id
  // fastify.get<FindUserRequest>(
  //   '/:id',
  //   {onRequest: [fastify.authenticate], ...FindUserOpts},
  //   (request, reply) => findUserHandler(request, reply, fastify),
  // );

  // verify user
  fastify.get<VerifyUserRequest>('/verify', VerifyUserRequestOpts, verifyUserHandler);

  // verify otp
  fastify.get<CheckOtpRequest>('/checkOtp', CheckOtpReqOpts, checkOtpHandler);

  // renew token
  fastify.get<RenewTokenRequest>('/renewToken', RenewTokenReqOpts, renewTokenHandler);

  // create user
  fastify.post<CreateUserRequest>('/create', CreateUserOpts, createUserHandler);

  // update user
  fastify.post<UpdateUserRequest>('/update', UpdateUserOpts, updateUserHandler);
};

export default userRoute;
