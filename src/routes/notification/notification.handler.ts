import {FastifyInstance, FastifyReply, FastifyRequest} from 'fastify';
import {ObjectId} from '@fastify/mongodb';
import {Filter, Sort} from 'mongodb';
import {NotificationSchema} from '../../models/notification';
import {COLL_NOTIFICATIONS} from '../../utils/constants';
import {ClearNotiRequest, GetNotiRequest, MarkNotiReadRequest} from './notification.schema';

export const getNotiHandler = async (
  request: FastifyRequest<GetNotiRequest>,
  reply: FastifyReply,
  fastify: FastifyInstance,
) => {
  const findBy: Filter<NotificationSchema> = {isCleared: false, userId: request.user.id};
  const sortBy: Sort = {_id: -1};
  const pageNo = request.query.pageIndex || 0;
  const pageSize = request.query.pageSize || fastify.getDefaultPageSize();
  const result = await fastify.mongo.db
    ?.collection<NotificationSchema>(COLL_NOTIFICATIONS)
    .find(findBy)
    .skip(pageNo * pageSize)
    .limit(pageSize)
    .sort(sortBy)
    .toArray();
  return {success: true, data: result};
};

export const clearAllNotiHandler = async (
  request: FastifyRequest,
  reply: FastifyReply,
  fastify: FastifyInstance,
) => {
  const findBy: Filter<NotificationSchema> = {userId: request.user.id, isCleared: false};
  const coll = fastify.mongo.db?.collection<NotificationSchema>(COLL_NOTIFICATIONS);
  await coll?.updateMany(findBy, {
    $set: {isCleared: true, updatedTs: fastify.getCurrentTimestamp()},
  });

  return {success: true, message: 'Updated successfully'};
};

export const clearNotiHandler = async (
  request: FastifyRequest<ClearNotiRequest>,
  reply: FastifyReply,
  fastify: FastifyInstance,
) => {
  const findBy: Filter<NotificationSchema> = {
    userId: request.user.id,
    isCleared: false,
    _id: new ObjectId(request.body._id),
  };
  const coll = fastify.mongo.db?.collection<NotificationSchema>(COLL_NOTIFICATIONS);
  await coll?.updateOne(findBy, {
    $set: {isCleared: true, updatedTs: fastify.getCurrentTimestamp()},
  });

  return {success: true, message: 'Updated successfully'};
};

export const markAllNotiReadHandler = async (
  request: FastifyRequest,
  reply: FastifyReply,
  fastify: FastifyInstance,
) => {
  const findBy: Filter<NotificationSchema> = {userId: request.user.id, isRead: false};
  const coll = fastify.mongo.db?.collection<NotificationSchema>(COLL_NOTIFICATIONS);
  await coll?.updateMany(findBy, {
    $set: {isRead: true, updatedTs: fastify.getCurrentTimestamp()},
  });

  return {success: true, message: 'Updated successfully'};
};

export const markNotiReadHandler = async (
  request: FastifyRequest<MarkNotiReadRequest>,
  reply: FastifyReply,
  fastify: FastifyInstance,
) => {
  const findBy: Filter<NotificationSchema> = {
    userId: request.user.id,
    isRead: false,
    _id: new ObjectId(request.body._id),
  };
  const coll = fastify.mongo.db?.collection<NotificationSchema>(COLL_NOTIFICATIONS);
  await coll?.updateOne(findBy, {
    $set: {isRead: true, updatedTs: fastify.getCurrentTimestamp()},
  });

  return {success: true, message: 'Updated successfully'};
};
