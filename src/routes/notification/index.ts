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
  fastify.get<GetNotiRequest>(
    '/',
    {onRequest: [fastify.authenticate], ...GetNotiReqOpts},
    (request, reply) => getNotiHandler(request, reply, fastify),
  );

  // clear notification
  fastify.post<ClearNotiRequest>(
    '/clear',
    {onRequest: [fastify.authenticate], ...ClearNotiReqOpts},
    (request, reply) => clearNotiHandler(request, reply, fastify),
  );

  // clear all notification
  fastify.post<ClearNotiRequest>(
    '/clearall',
    {onRequest: [fastify.authenticate], ...ClearAllNotiReqOpts},
    (request, reply) => clearAllNotiHandler(request, reply, fastify),
  );

  // mark notification as read
  fastify.post<MarkNotiReadRequest>(
    '/markRead',
    {onRequest: [fastify.authenticate], ...MarkNotiReadReqOpts},
    (request, reply) => markNotiReadHandler(request, reply, fastify),
  );

  // mark all notification as read
  fastify.post(
    '/markAllRead',
    {onRequest: [fastify.authenticate], ...MarkAllNotiReadReqOpts},
    (request, reply) => markAllNotiReadHandler(request, reply, fastify),
  );
};

export default notiRoute;
