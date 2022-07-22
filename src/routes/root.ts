import {FastifyPluginAsync} from 'fastify';
import {OtpSchema, UserSchema} from '../models/user';
import {COLL_OTPS, COLL_USERS} from '../utils/constants';
import {OAuth2Client} from 'google-auth-library';

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
      const clientId = process.env.GOOGLE_TOKEN_CLIENT_ID;
      const client = new OAuth2Client(clientId);
      const token =
        'eyJhbGciOiJSUzI1NiIsImtpZCI6IjYzMWZhZTliNTk0MGEyZDFmYmZmYjAwNDAzZDRjZjgwYTIxYmUwNGUiLCJ0eXAiOiJKV1QifQ.eyJpc3MiOiJodHRwczovL2FjY291bnRzLmdvb2dsZS5jb20iLCJhenAiOiI1MDUxMzY0NzM0OTktZDFnaWo3cGdyN3JjbTM1Y3AycGYwZDd1YjVldWdsNTYuYXBwcy5nb29nbGV1c2VyY29udGVudC5jb20iLCJhdWQiOiI1MDUxMzY0NzM0OTktYnZxMWpvcjg3aWgyaDBnM2NjODZzZzNjNnVkajl0ZWEuYXBwcy5nb29nbGV1c2VyY29udGVudC5jb20iLCJzdWIiOiIxMDA5MTA0MDYyOTcyNTYwMDk0ODMiLCJlbWFpbCI6InNpYnUuaXQxM0BnbWFpbC5jb20iLCJlbWFpbF92ZXJpZmllZCI6dHJ1ZSwibmFtZSI6IlNpYmFwcmFzYWQgTWFpdGkiLCJwaWN0dXJlIjoiaHR0cHM6Ly9saDMuZ29vZ2xldXNlcmNvbnRlbnQuY29tL2EtL0FGZFp1Y29saG45b21ZZDk4UE41QVBUOVF0ME1RSV9RYVppeUszMVVmbXg2Znc9czk2LWMiLCJnaXZlbl9uYW1lIjoiU2liYXByYXNhZCIsImZhbWlseV9uYW1lIjoiTWFpdGkiLCJsb2NhbGUiOiJlbiIsImlhdCI6MTY1ODQ2MjE0MCwiZXhwIjoxNjU4NDY1NzQwfQ.sKlEW6aZ5qbt-jdEM7xebI9TOHmiQx6WnJ2FWI2Zg_AWpmVGURgT-APuOYypnQiLRyHej96RxtBhJfK3gc4pCMcndIcE-8pmIIcxu_GF0NnfwoK8XLV60s2fnPHieP9h9kNpk8_kEf3UzhYQil74nnANEGM95JknBR6sjmyBq4MfI-QEA8dzzt8obB7HAyQrrdnfg4rGFJwo5oTpjm2kYuhV6-jmmnE9acxpSrLvtBDWZCwoy27b-hf2si5K6fY6NgZcDMARI1VHk_AiOYIAoMlpVLm4JGgCpKWatUy-e4niTTNLsKVyIn2GpOGyIdTew4YSsdc_kDWM8-lbdwdTtQ';
      const verify = async () => {
        const ticket = await client.verifyIdToken({
          idToken: token,
          audience: clientId,
        });
        const payload = ticket.getPayload();
        console.log(payload);
        const userid = payload && payload['sub'];
        console.log('userid is', userid);
      };
      verify().catch((err) => {
        console.log(err);
      });
      return {success: true};
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
      });
      if (!result) {
        reply.status(404).send({success: false});
      }
      return {success: true, otp: result?.otp};
    },
  );
};

export default root;
