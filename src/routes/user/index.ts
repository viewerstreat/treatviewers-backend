import {FastifyPluginAsync} from 'fastify';
import {
  checkOtpHandler,
  createUserHandler,
  // findUserHandler,
  // getAllUsersHandler,
  verifyUserHandler,
} from './user.handlers';
import {
  CheckOtpReqOpts,
  CheckOtpRequest,
  CreateUserOpts,
  CreateUserRequest,
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
  fastify.get<VerifyUserRequest>('/verify', VerifyUserRequestOpts, (request, reply) =>
    verifyUserHandler(request, reply, fastify),
  );

  // verify otp
  fastify.get<CheckOtpRequest>('/checkOtp', CheckOtpReqOpts, (request, reply) =>
    checkOtpHandler(request, reply, fastify),
  );

  // create/update user
  fastify.post<CreateUserRequest>('/create', CreateUserOpts, (request, reply) =>
    createUserHandler(request, reply, fastify),
  );
};

export default userRoute;
