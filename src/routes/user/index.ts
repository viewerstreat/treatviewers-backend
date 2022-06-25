import {FastifyPluginAsync} from 'fastify';
import {createUserHandler, findUserHandler, getAllUsersHandler} from './user.handlers';
import {
  CreateUserOpts,
  CreateUserRequest,
  FindUserOpts,
  FindUserRequest,
  GetAllUsersOpts,
} from './user.schema';

const userRoute: FastifyPluginAsync = async (fastify, opts): Promise<void> => {
  // get all users list
  fastify.get('/', GetAllUsersOpts, (request, reply) =>
    getAllUsersHandler(request, reply, fastify),
  );

  // find a particular user by id
  fastify.get<FindUserRequest>(
    '/:id',
    {onRequest: [fastify.authenticate], ...FindUserOpts},
    (request, reply) => findUserHandler(request, reply, fastify),
  );

  // create/update user
  fastify.post<CreateUserRequest>('/', CreateUserOpts, (request, reply) => {
    createUserHandler(request, reply, fastify);
  });
};

export default userRoute;
