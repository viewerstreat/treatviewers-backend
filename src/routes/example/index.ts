import {FastifyPluginAsync} from 'fastify';

const example: FastifyPluginAsync = async (fastify, opts): Promise<void> => {
  fastify.get('/', async function (request, reply) {
    const nextId = await fastify.getSequenceNextVal('TEMP_SEQ_TEST2');
    return `this is an example ${nextId}`;
  });
};

export default example;
