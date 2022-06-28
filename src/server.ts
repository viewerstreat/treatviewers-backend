import Fastify from 'fastify';
import {loadEnv} from './utils/loadEnv';
import {app} from './app';

// load env file
loadEnv();

// start the server
const server = Fastify({logger: true});
server.register(app);
server.listen({port: Number(process.env.PORT) || 5000, host: '0.0.0.0'}).then(() => {
  server.log.info('Server has started successfully...');
});
