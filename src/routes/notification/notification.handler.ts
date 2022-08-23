import {FastifyReply, FastifyRequest} from 'fastify';
import {ObjectId} from '@fastify/mongodb';
import {Filter, Sort} from 'mongodb';
import {NotificationSchema} from '../../models/notification';
import {COLL_NOTIFICATIONS} from '../../utils/constants';
import {ClearNotiRequest, GetNotiRequest, MarkNotiReadRequest} from './notification.schema';
import {insertPushNotiReq} from '../../utils/notiService';

export const getNotiHandler = async (request: FastifyRequest<GetNotiRequest>) => {
  const findBy: Filter<NotificationSchema> = {isCleared: false, userId: request.user.id};
  const sortBy: Sort = {_id: -1};
  const pageNo = request.query.pageIndex || 0;
  const pageSize = request.query.pageSize || request.getDefaultPageSize();
  const result = await request.mongo.db
    ?.collection<NotificationSchema>(COLL_NOTIFICATIONS)
    .find(findBy)
    .skip(pageNo * pageSize)
    .limit(pageSize)
    .sort(sortBy)
    .toArray();
  return {success: true, data: result};
};

export const clearAllNotiHandler = async (request: FastifyRequest) => {
  const findBy: Filter<NotificationSchema> = {userId: request.user.id, isCleared: false};
  const coll = request.mongo.db?.collection<NotificationSchema>(COLL_NOTIFICATIONS);
  await coll?.updateMany(findBy, {
    $set: {isCleared: true, updatedTs: request.getCurrentTimestamp()},
  });

  return {success: true, message: 'Updated successfully'};
};

export const clearNotiHandler = async (request: FastifyRequest<ClearNotiRequest>) => {
  const findBy: Filter<NotificationSchema> = {
    userId: request.user.id,
    isCleared: false,
    _id: new ObjectId(request.body._id),
  };
  const coll = request.mongo.db?.collection<NotificationSchema>(COLL_NOTIFICATIONS);
  await coll?.updateOne(findBy, {
    $set: {isCleared: true, updatedTs: request.getCurrentTimestamp()},
  });

  return {success: true, message: 'Updated successfully'};
};

export const markAllNotiReadHandler = async (request: FastifyRequest) => {
  const findBy: Filter<NotificationSchema> = {userId: request.user.id, isRead: false};
  const coll = request.mongo.db?.collection<NotificationSchema>(COLL_NOTIFICATIONS);
  await coll?.updateMany(findBy, {
    $set: {isRead: true, updatedTs: request.getCurrentTimestamp()},
  });

  return {success: true, message: 'Updated successfully'};
};

export const markNotiReadHandler = async (request: FastifyRequest<MarkNotiReadRequest>) => {
  const findBy: Filter<NotificationSchema> = {
    userId: request.user.id,
    isRead: false,
    _id: new ObjectId(request.body._id),
  };
  const coll = request.mongo.db?.collection<NotificationSchema>(COLL_NOTIFICATIONS);
  await coll?.updateOne(findBy, {
    $set: {isRead: true, updatedTs: request.getCurrentTimestamp()},
  });

  return {success: true, message: 'Updated successfully'};
};

export const addTestPushMessage = async (request: FastifyRequest, reply: FastifyReply) => {
  const userId = request.user.id;
  await insertPushNotiReq(request, userId, 'EVENT_HELLO_PUSH');
  return {success: true};
};
