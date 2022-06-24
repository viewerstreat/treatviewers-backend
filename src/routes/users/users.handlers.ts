import {FastifyInstance, FastifyReply, FastifyRequest} from 'fastify';
import {COLL_USERS, USER_ID_SEQ} from '../../utils/constants';
import {CreateUserRequest, FindUserRequest, UserSchema} from './users.schema';

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

export const createUserHandler = async (
  request: FastifyRequest<CreateUserRequest>,
  reply: FastifyReply,
  fastify: FastifyInstance,
) => {
  const id = request.body.id || (await fastify.getSequenceNextVal(USER_ID_SEQ));
  request.log.warn('id is ' + id);
  const doc = {...request.body, isActive: true};
  const result = await fastify.mongo.db
    ?.collection<UserSchema>(COLL_USERS)
    .findOneAndUpdate({id}, {$set: {...doc}}, {upsert: true, returnDocument: 'after'});
  request.log.info('result is ' + JSON.stringify(result));
  const token = fastify.generateToken(id);
  reply.code(201).send({success: true, data: result?.value, token});
};
