import {test} from 'tap';
import Fastify from 'fastify';
import Database from '../../src/plugins/database';
import {setupEnv} from '../helper';

test('support decorator function', async (t) => {
  setupEnv();
  const fastify = Fastify();
  fastify.register(Database);
  await fastify.ready();
  const sequenceId = 'TEMP_TEST_SEQ';
  const seq1 = await fastify.getSequenceNextVal(sequenceId);
  const seq2 = await fastify.getSequenceNextVal(sequenceId);

  t.ok(seq1 > 0);
  t.ok(seq2 > 0);
  t.equal(seq2, seq1 + 1);

  fastify.mongo.client.close();
});
