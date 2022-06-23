import {FastifyInstance, FastifyReply, FastifyRequest} from 'fastify';
import {COLL_USERS} from '../../utils/constants';
import {FindUserRequest} from './users.schema';

export const getAllUsersHandler = async (
  request: FastifyRequest,
  reply: FastifyReply,
  fastify: FastifyInstance,
) => {
  const result = await fastify.mongo.db?.collection(COLL_USERS).find({isActive: true}).toArray();
  return {success: true, data: result};
};

export const findUserHandler = async (
  request: FastifyRequest<FindUserRequest>,
  reply: FastifyReply,
  fastify: FastifyInstance,
) => {
  const id = Number(request.params.id);
  if (!id || Number.isNaN(id)) {
    reply.badRequest(`invalid value provided for id: ${request.params.id}`);
    return;
  }
  const result = await fastify.mongo.db?.collection(COLL_USERS).findOne({id});
  if (!result) {
    reply.notFound(`user with id ${id} not found`);
    return;
  }
  return {success: true, data: result};
};
