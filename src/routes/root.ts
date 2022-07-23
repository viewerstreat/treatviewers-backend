import {FastifyPluginAsync} from 'fastify';
import {OtpSchema, UserSchema} from '../models/user';
import {COLL_OTPS, COLL_USERS} from '../utils/constants';

const root: FastifyPluginAsync = async (fastify, opts): Promise<void> => {
  fastify.get('/ping', async (request, reply) => {
    return {success: true, message: 'Server running successfully!'};
  });

  fastify.get<{Querystring: {userId: number; name: string}}>(
    '/tempApiGetToken',
    {
      schema: {
        querystring: {
          type: 'object',
          required: ['userId'],
          properties: {userId: {type: 'number'}, name: {type: 'string'}},
        },
      },
    },
    async (request, reply) => {
      const token = fastify.generateToken(request.query.userId, request.query.name);
      return {success: true, token};
    },
  );

  fastify.get<{Querystring: {phone: string}}>(
    '/tempApiGetOtp',
    {
      schema: {
        querystring: {
          type: 'object',
          properties: {
            phone: {type: 'string'},
          },
        },
      },
    },
    async (request, reply) => {
      const collOtps = fastify.mongo.db?.collection<OtpSchema>(COLL_OTPS);
      const collUser = fastify.mongo.db?.collection<UserSchema>(COLL_USERS);
      const user = await collUser?.findOne({phone: request.query.phone});
      const result = await collOtps?.findOne({
        userId: user?.id,
        validTill: {$gte: fastify.getCurrentTimestamp()},
        isUsed: false,
      });
      if (!result) {
        reply.status(404).send({success: false});
      }
      return {success: true, otp: result?.otp};
    },
  );
};

export default root;
