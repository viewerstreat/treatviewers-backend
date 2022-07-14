import {FastifyReply, FastifyRequest} from 'fastify';
import {OtpSchema, UserSchema} from '../../models/user';
import {COLL_OTPS, COLL_USERS, USER_ID_SEQ} from '../../utils/constants';
import {saveOtp} from './otp';
import {
  CheckOtpRequest,
  CreateUserRequest,
  FindUserRequest,
  RenewTokenRequest,
  UpdateUserRequest,
  VerifyUserRequest,
} from './user.schema';

export const getAllUsersHandler = async (request: FastifyRequest, reply: FastifyReply) => {
  const result = await request.mongo.db?.collection(COLL_USERS).find({isActive: true}).toArray();
  return {success: true, data: result};
};

export const findUserHandler = async (
  request: FastifyRequest<FindUserRequest>,
  reply: FastifyReply,
) => {
  request.log.info(request.user);
  const id = Number(request.params.id);
  if (!id || Number.isNaN(id)) {
    reply.badRequest(`invalid value provided for id: ${request.params.id}`);
    return;
  }
  const result = await request.mongo.db?.collection(COLL_USERS).findOne({id});
  if (!result) {
    reply.notFound(`user with id ${id} not found`);
    return;
  }
  return {success: true, data: result};
};

export const createUserHandler = async (
  request: FastifyRequest<CreateUserRequest>,
  reply: FastifyReply,
) => {
  const collUser = request.mongo.db?.collection<UserSchema>(COLL_USERS);
  // check if the phone no exists already in the database
  const checkPhResult = await collUser?.findOne({phone: request.body.phone});
  if (checkPhResult) {
    reply.status(400).send({success: false, message: 'User already exists with same phone'});
    return;
  }

  // check if the email already exists in the database
  const email = request.body.email || '';
  if (email) {
    const checkEmailResult = await collUser?.findOne({email});
    if (!checkEmailResult) {
      reply.status(400).send({success: false, message: 'User already exists with same email'});
      return;
    }
  }

  // user document
  const doc: UserSchema = {
    id: await request.getSequenceNextVal(USER_ID_SEQ),
    name: request.body.name,
    phone: request.body.phone,
    email,
    profilePic: request.body.profilePic || '',
    isActive: true,
    totalPlayed: 0,
    totalEarning: 0,
    contestWon: 0,
    createdTs: request.getCurrentTimestamp(),
  };
  // insert into the databse
  await collUser?.insertOne(doc);
  // save otp
  if (doc.id) {
    await saveOtp(doc.id, request);
  }
  return {success: true, message: 'User created'};
};

export const updateUserHandler = async (
  request: FastifyRequest<UpdateUserRequest>,
  reply: FastifyReply,
) => {
  const setObj: UserSchema = {};
  if (request.body.name) {
    setObj.name = request.body.name;
  }
  if (request.body.profilePic) {
    setObj.profilePic = request.body.profilePic;
  }

  if (Object.keys(setObj).length === 0) {
    reply.status(400).send({success: false, message: 'name or profilePic is required'});
    return;
  }
  setObj.updatedTs = request.getCurrentTimestamp();
  const collUser = request.mongo.db?.collection<UserSchema>(COLL_USERS);
  const result = await collUser?.findOneAndUpdate(
    {id: request.user.id},
    {$set: setObj},
    {upsert: false, returnDocument: 'after'},
  );

  if (request.user.id !== result?.value?.id) {
    reply.status(404).send({success: false, message: 'User not found'});
    return;
  }

  return {success: true, data: result.value};
};

export const verifyUserHandler = async (
  request: FastifyRequest<VerifyUserRequest>,
  reply: FastifyReply,
) => {
  const collUser = request.mongo.db?.collection<UserSchema>(COLL_USERS);
  const result = await collUser?.findOne({phone: request.query.phone});
  if (!result || !result.id) {
    reply.status(404).send({success: false, message: 'User not found'});
    return;
  }
  await saveOtp(result.id, request);
  return {success: true, message: 'Otp generated'};
};

export const checkOtpHandler = async (
  request: FastifyRequest<CheckOtpRequest>,
  reply: FastifyReply,
) => {
  const collUser = request.mongo.db?.collection<UserSchema>(COLL_USERS);
  const userData = await collUser?.findOne({phone: request.query.phone});
  if (!userData || !userData.id) {
    reply.status(404).send({success: false, message: 'User not found'});
    return;
  }
  const collOtp = request.mongo.db?.collection<OtpSchema>(COLL_OTPS);
  const currTs = request.getCurrentTimestamp();
  const result = await collOtp?.findOne({
    userId: userData.id,
    otp: request.query.otp,
    validTill: {$gte: currTs},
  });
  if (!result) {
    reply.status(404).send({success: false, message: 'OTP does not match'});
    return;
  }
  const token = request.generateToken(userData.id, userData.name);
  return {success: true, data: userData, token};
};

export const renewTokenHandler = async (
  request: FastifyRequest<RenewTokenRequest>,
  reply: FastifyReply,
) => {
  const collUser = request.mongo.db?.collection<UserSchema>(COLL_USERS);
  const data = await collUser?.findOne({id: request.user.id, isActive: true});
  if (!data || !data.id) {
    reply.status(404).send({success: false, message: 'User not found'});
    return;
  }
  const token = request.generateToken(data.id, data.name);
  return {success: true, data, token};
};
