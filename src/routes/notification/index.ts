import {FastifyPluginAsync} from 'fastify';
import {
  clearAllNotiHandler,
  clearNotiHandler,
  getNotiHandler,
  markAllNotiReadHandler,
  markNotiReadHandler,
} from './notification.handler';
import {
  ClearAllNotiReqOpts,
  ClearNotiReqOpts,
  ClearNotiRequest,
  GetNotiReqOpts,
  GetNotiRequest,
  MarkAllNotiReadReqOpts,
  MarkNotiReadReqOpts,
  MarkNotiReadRequest,
} from './notification.schema';

const notiRoute: FastifyPluginAsync = async (fastify, opts): Promise<void> => {
  // get all notification
  fastify.get<GetNotiRequest>('/', GetNotiReqOpts, getNotiHandler);

  // clear notification
  fastify.post<ClearNotiRequest>('/clear', ClearNotiReqOpts, clearNotiHandler);

  // clear all notification
  fastify.post<ClearNotiRequest>('/clearall', ClearAllNotiReqOpts, clearAllNotiHandler);

  // mark notification as read
  fastify.post<MarkNotiReadRequest>('/markRead', MarkNotiReadReqOpts, markNotiReadHandler);

  // mark all notification as read
  fastify.post('/markAllRead', MarkAllNotiReadReqOpts, markAllNotiReadHandler);
};

export default notiRoute;
