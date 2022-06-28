import {test} from 'tap';
import Fastify from 'fastify';
import Jwt, {JWTPayload} from '../../src/plugins/jwt';
import {setupEnv} from '../helper';

test('support decorator function', async (t) => {
  setupEnv();
  const fastify = Fastify();
  fastify.register(Jwt);
  fastify.get('/verify', async function (request, reply) {
    await fastify.authenticate(request, reply);
    return request.jwtVerify();
  });
  await fastify.ready();
  const dummyPayload: JWTPayload = {
    id: 1,
    name: 'dummy test user',
  };
  const token = fastify.generateToken(dummyPayload.id, dummyPayload.name);
  t.ok(token);
  const verifyResponse = await fastify.inject({
    method: 'get',
    url: '/verify',
    headers: {
      authorization: `Bearer ${token}`,
    },
  });
  const decodedToken = JSON.parse(verifyResponse.payload);
  t.match(decodedToken, dummyPayload);
});
