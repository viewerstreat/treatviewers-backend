import * as dotenv from 'dotenv';
import {join} from 'path';
import AutoLoad, {AutoloadPluginOptions} from '@fastify/autoload';
import FastifyMongodb from '@fastify/mongodb';
import FastifyHelmet from '@fastify/helmet';
import FastifyCors from '@fastify/cors';
import FastifyStatic from '@fastify/static';
import {FastifyPluginAsync} from 'fastify';

dotenv.config();
export type AppOptions = {
  // Place your custom options for app below here
} & Partial<AutoloadPluginOptions>;

const app: FastifyPluginAsync<AppOptions> = async (fastify, opts): Promise<void> => {
  // register helmet
  void fastify.register(FastifyHelmet);
  // register cors
  void fastify.register(FastifyCors);
  // register mongodb plugins
  void fastify.register(FastifyMongodb, {
    forceClose: true,
    url: process.env.DB_CONN_URL,
  });
  // register static file serve
  void fastify.register(FastifyStatic, {
    root: join(__dirname, '../public'),
    prefix: '/public/',
    redirect: true,
  });

  // fastify.setNotFoundHandler((request, reply) => {
  //   // const p = join(__dirname, '../public/index.html');
  //   reply.sendFile('app.js');
  // });

  // This loads all plugins defined in plugins
  void fastify.register(AutoLoad, {
    dir: join(__dirname, 'plugins'),
    options: opts,
  });

  // This loads all plugins defined in routes
  void fastify.register(AutoLoad, {
    dir: join(__dirname, 'routes'),
    options: opts,
  });
};

export default app;
export {app};
