import {FastifyPluginAsync} from 'fastify';
import {findUserHandler, getAllUsersHandler} from './users.handlers';
import {FindUserOpts, FindUserRequest, GetAllUsersOpts} from './users.schema';

const usersRoute: FastifyPluginAsync = async (fastify, opts): Promise<void> => {
  fastify.get('/', GetAllUsersOpts, (request, reply) =>
    getAllUsersHandler(request, reply, fastify),
  );
  fastify.get<FindUserRequest>('/:id', FindUserOpts, (request, reply) =>
    findUserHandler(request, reply, fastify),
  );
};

export default usersRoute;
