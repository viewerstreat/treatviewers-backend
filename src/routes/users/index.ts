import {FastifyPluginAsync} from 'fastify';
import {createUserHandler, findUserHandler, getAllUsersHandler} from './users.handlers';
import {
  CreateUserOpts,
  CreateUserRequest,
  FindUserOpts,
  FindUserRequest,
  GetAllUsersOpts,
} from './users.schema';

const usersRoute: FastifyPluginAsync = async (fastify, opts): Promise<void> => {
  // get all users list
  fastify.get('/', GetAllUsersOpts, (request, reply) =>
    getAllUsersHandler(request, reply, fastify),
  );

  // find a particular user by id
  fastify.get<FindUserRequest>('/:id', FindUserOpts, (request, reply) =>
    findUserHandler(request, reply, fastify),
  );

  // create/update user
  fastify.post<CreateUserRequest>('/', CreateUserOpts, (request, reply) => {
    createUserHandler(request, reply, fastify);
  });
};

export default usersRoute;
