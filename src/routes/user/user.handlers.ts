import {FastifyReply, FastifyRequest} from 'fastify';
import {Filter} from 'mongodb';
import {LOGIN_SCHEME, OtpSchema, UsedTokenSchema, UserSchema} from '../../models/user';
import {COLL_OTPS, COLL_USED_TOKENS, COLL_USERS, USER_ID_SEQ} from '../../utils/constants';
import {verifyFbToken} from './facebook';
import {verifyIdToken} from './google';
import {saveOtp} from './otp';
import {
  CheckOtpRequest,
  CreateUserRequest,
  LoginRequest,
  RenewTokenRequest,
  UpdateUserRequest,
  VerifyUserRequest,
} from './user.schema';

// update lastLoginTime for an user
const updateLastLoginTime = async (request: FastifyRequest, userId: number) => {
  const collUser = request.mongo.db?.collection<UserSchema>(COLL_USERS);
  await collUser?.updateOne(
    {id: userId},
    {$set: {lastLoginTime: request.getCurrentTimestamp(), loginScheme: LOGIN_SCHEME.OTP_BASED}},
  );
};

// handler function for /create
// create user for OTP_BASED signup
// phone no is mandatory paramter
// generate and send an otp to the phone no once signup successful
type CrtUsrFstReq = FastifyRequest<CreateUserRequest>;
export const createUserHandler = async (request: CrtUsrFstReq, reply: FastifyReply) => {
  const collUser = request.mongo.db?.collection<UserSchema>(COLL_USERS);
  // check if the phone no exists already in the database
  const checkPhResult = await collUser?.findOne({phone: request.body.phone});
  if (checkPhResult) {
    return reply.badRequest('User already exists with same phone');
  }

  // check if the email already exists in the database
  const email = request.body.email || '';
  if (email) {
    const checkEmailResult = await collUser?.findOne({email});
    if (!checkEmailResult) {
      return reply.badRequest('User already exists with same email');
    }
  }

  // user document
  const doc: UserSchema = {
    id: await request.getSequenceNextVal(USER_ID_SEQ),
    name: request.body.name,
    phone: request.body.phone,
    email,
    loginScheme: LOGIN_SCHEME.OTP_BASED,
    profilePic: request.body.profilePic || '',
    isActive: true,
    totalPlayed: 0,
    totalEarning: 0,
    contestWon: 0,
    createdTs: request.getCurrentTimestamp(),
  };

  // insert into the databse
  await collUser?.insertOne(doc);
  // generate and send itp
  if (doc.id) {
    await saveOtp(doc.id, request);
  }
  // return successful response
  return {success: true, message: 'User created'};
};

// handler function of /update
// get user details from the user id in the token
type UpdtUsrFstReq = FastifyRequest<UpdateUserRequest>;
export const updateUserHandler = async (request: UpdtUsrFstReq, reply: FastifyReply) => {
  const collUser = request.mongo.db?.collection<UserSchema>(COLL_USERS);
  const setObj: UserSchema = {};
  if (request.body.name) {
    setObj.name = request.body.name;
  }
  if (request.body.profilePic) {
    setObj.profilePic = request.body.profilePic;
  }
  // when email already exists in the database for some other user id
  // then return error
  if (request.body.email) {
    let {email} = request.body;
    let check = await collUser?.findOne({email});
    if (check && check.id !== request.user.id) {
      return reply.badRequest('email already exists');
    } else {
      setObj.email = email;
    }
  }
  if (request.body.phone) {
    let {phone} = request.body;
    let check = await collUser?.findOne({phone});
    if (check && check.id !== request.user.id) {
      return reply.badRequest('phone already exists');
    } else {
      setObj.phone = phone;
    }
  }
  if (Object.keys(setObj).length === 0) {
    reply.status(400).send({success: false, message: 'name/profilePic/email/phone is required'});
    return;
  }
  setObj.updatedTs = request.getCurrentTimestamp();

  const result = await collUser?.findOneAndUpdate(
    {id: request.user.id},
    {$set: setObj},
    {upsert: false, returnDocument: 'after'},
  );

  if (request.user.id !== result?.value?.id) {
    return reply.notFound('User not found');
  }
  // return successful response
  return {success: true, data: result.value};
};

// verify handler function. Checks if user with phone no
// exists with the phone no in the database
// then generate an otp and send the otp
// return successful response
type VerFstReq = FastifyRequest<VerifyUserRequest>;
export const verifyUserHandler = async (request: VerFstReq, reply: FastifyReply) => {
  const collUser = request.mongo.db?.collection<UserSchema>(COLL_USERS);
  const result = await collUser?.findOne({phone: request.query.phone, isActive: true});
  if (!result || !result.id) {
    return reply.notFound('User not found');
  }
  // generate and send otp to the user
  await saveOtp(result.id, request);
  // return successful response
  return {success: true, message: 'Otp generated'};
};

// handler function for checkOtp
// checks whethere the otp is valid
// if valid then generate token and refreshToken
// return successful response
// otp should be signle use
type CkOtpFstReq = FastifyRequest<CheckOtpRequest>;
export const checkOtpHandler = async (request: CkOtpFstReq, reply: FastifyReply) => {
  const collUser = request.mongo.db?.collection<UserSchema>(COLL_USERS);
  const collOtp = request.mongo.db?.collection<OtpSchema>(COLL_OTPS);
  // get user data by phone no
  const userData = await collUser?.findOne({phone: request.query.phone, isActive: true});
  // if user data not found then return error
  if (!userData || !userData.id) {
    return reply.notFound('User not found');
  }
  const currTs = request.getCurrentTimestamp();
  const filter: Filter<OtpSchema> = {
    userId: userData.id,
    otp: request.query.otp,
    validTill: {$gte: currTs},
    isUsed: false,
  };
  // update the otp collection and set isUsed = true
  // the otp must be single use even if the otp is not yet expired
  const result = await collOtp?.updateOne(filter, {$set: {isUsed: true, updateTs: currTs}});
  // if the matchedCount is zero that means the valid otp does not exists
  // return error in that case
  request.log.info(result);
  if (!result?.matchedCount || result?.matchedCount === 0) {
    return reply.notFound('not valid otp');
  }
  // otp validation successful update lastLoginTime for the user
  await updateLastLoginTime(request, userData.id);
  // otp validation is successful generate token and refreshToken
  const token = request.generateToken(userData.id, userData.name);
  const refreshToken = request.generateRefreshToken(userData.id);
  // return successful response
  return {success: true, data: userData, token, refreshToken};
};

// handler function to renewToken
// request parameters:
// - scheme = GOOGLE | FACEBOOK | OTP_BASED
// - ?idToken
// - ?fbToken
// - ?refreshToken
// refreshToken must be single use
type ReToFstReq = FastifyRequest<RenewTokenRequest>;
export const renewTokenHandler = async (request: ReToFstReq, reply: FastifyReply) => {
  // when the loginScheme is GOOGLE
  if (request.body.loginScheme === LOGIN_SCHEME.GOOGLE) {
    return handleGoogleRenewal(request, reply);
  }
  // when the loginScheme is FACEBOOK
  if (request.body.loginScheme === LOGIN_SCHEME.FACEBOOK) {
    return handleFbRenewal(request, reply);
  }
  // when the loginScheme is OTP_BASED
  return handleOtpBasedRenewal(request, reply);
};

// when loginScheme is OTP_BASED
// validate refreshToken for expiry
// check if it exists in usedTokens
// update lastLoginTime
// generate new tokens and return success response
const handleOtpBasedRenewal = async (request: ReToFstReq, reply: FastifyReply) => {
  const collUser = request.mongo.db?.collection<UserSchema>(COLL_USERS);
  const collUsedToken = request.mongo.db?.collection<UsedTokenSchema>(COLL_USED_TOKENS);
  if (!request.body.refreshToken) {
    return reply.badRequest('refreshToken is required');
  }
  // validate the token and get user id from the payload
  const id = request.validateRefreshToken(request.body.refreshToken);
  // check if the token already exists in usedTokens
  const result = await collUsedToken?.findOne({token: request.body.refreshToken});
  if (result) {
    return reply.badRequest('token is already used');
  }
  // insert the refreshToken to usedToken collection
  await collUsedToken?.insertOne({
    userId: id,
    token: request.body.refreshToken,
    updateTs: request.getCurrentTimestamp(),
  });
  // get user data
  const user = await collUser?.findOne({id, isActive: true});
  // if user not found then throw error
  if (!user || !user.id) {
    return reply.notFound('user not found');
  }
  // match the loginScheme value if the loginScheme is not OTP_BASED then throw error
  if (user.loginScheme !== LOGIN_SCHEME.OTP_BASED) {
    return reply.badRequest('OTP_BASED loginScheme is not used to login previously');
  }
  // generate token
  const token = request.generateToken(user.id, user.name);
  // generate refreshToken
  const refreshToken = request.generateRefreshToken(user.id);
  // return successful response
  return {success: true, data: user, token, refreshToken};
};

// when loginScheme is GOOGLE
// validate idToken from google library
// get user details by the email
// update lastLoginTime
// generate new token and return success response
const handleGoogleRenewal = async (request: ReToFstReq, reply: FastifyReply) => {
  const collUser = request.mongo.db?.collection<UserSchema>(COLL_USERS);
  // check if idToken is present
  if (!request.body.idToken) {
    return reply.badRequest('idToken is required');
  }
  try {
    // verify the idToken
    const data = await verifyIdToken(request.body.idToken);
    // if email is not present then return error
    if (!data.email) {
      return reply.badRequest('email not found for the user');
    }
    // get user data by email
    const user = await collUser?.findOne({email: data.email, isActive: true});
    // if user is not found then throw error
    if (!user || !user.id) {
      return reply.badRequest('user not found');
    }
    // match loginScheme value
    if (user.loginScheme !== LOGIN_SCHEME.GOOGLE) {
      return reply.badRequest('GOOGLE loginScheme is not used to login previously');
    }
    // token validation is successful update lastLoginTime
    await updateLastLoginTime(request, user.id);
    // generate token
    const token = request.generateToken(user.id, user.name);
    // return successful response
    return {success: true, data: user, token};
  } catch (err) {
    request.log.error(err);
    if (err instanceof Error) {
      return reply.badRequest(err.message);
    } else {
      return reply.badRequest();
    }
  }
};

// when loginScheme is FACEBOOK
// validate idToken from facebook graph me api
// get user details by the email
// update lastLoginTime
// generate new token and return success response
const handleFbRenewal = async (request: ReToFstReq, reply: FastifyReply) => {
  const collUser = request.mongo.db?.collection<UserSchema>(COLL_USERS);
  // check if fbToken is present
  if (!request.body.fbToken) {
    return reply.badRequest('fbToken is required');
  }
  try {
    // verify the fbToken
    const data = await verifyFbToken(request.body.fbToken);
    // if email is not present then return error
    if (!data.email) {
      return reply.badRequest('email not found for the user');
    }
    // get user data by email
    const user = await collUser?.findOne({email: data.email, isActive: true});
    // if user is not found then throw error
    if (!user || !user.id) {
      return reply.badRequest('user not found');
    }
    // match loginScheme value
    if (user.loginScheme !== LOGIN_SCHEME.FACEBOOK) {
      return reply.badRequest('FACEBOOK loginScheme is not used to login previously');
    }
    // token validation is successful update lastLoginTime
    await updateLastLoginTime(request, user.id);
    // generate token
    const token = request.generateToken(user.id, user.name);
    // return successful response
    return {success: true, data: user, token};
  } catch (err) {
    request.log.error(err);
    if (err instanceof Error) {
      return reply.badRequest(err.message);
    } else {
      return reply.badRequest();
    }
  }
};

// handler function for login
// verify the idToken/fbToken depending on the loginScheme
// if user already exists then update lastLoginTime
// if user does not exists then insert user into database
// generate new token
// return user details and token (short lived)
type LoginFstReq = FastifyRequest<LoginRequest>;
export const loginHandler = async (request: LoginFstReq, reply: FastifyReply) => {
  const collUser = request.mongo.db?.collection<UserSchema>(COLL_USERS);
  const {loginScheme, idToken, fbToken} = request.body;
  // check if idToken received for Google login
  if (loginScheme === LOGIN_SCHEME.GOOGLE && !idToken) {
    return reply.badRequest('idToken is required');
  }
  // check if fbToken received for FB login
  if (loginScheme === LOGIN_SCHEME.FACEBOOK && !fbToken) {
    return reply.badRequest('fbToken is required');
  }
  let data: UserSchema = {};
  // verify idToken if token verification throws error
  // then return bad request error
  if (loginScheme === LOGIN_SCHEME.GOOGLE && idToken) {
    try {
      data = await verifyIdToken(idToken);
    } catch (err) {
      if (err instanceof Error) {
        return reply.badRequest(err.message);
      } else {
        return reply.badRequest();
      }
    }
  }
  // verify fbToken if token verification throw error
  // then return bad request error
  if (loginScheme === LOGIN_SCHEME.FACEBOOK && fbToken) {
    try {
      data = await verifyFbToken(fbToken);
    } catch (err) {
      if (err instanceof Error) {
        return reply.badRequest(err.message);
      } else {
        return reply.badRequest();
      }
    }
  }
  // email should be present otherwise throw error
  if (!data.email) {
    return reply.badRequest('email not found');
  }
  // check if the user already exists with the same email
  const usr = await collUser?.findOne({email: data.email});
  if (usr && usr.id) {
    if (usr.isActive === false) {
      return reply.badRequest('user is inactive');
    }
    const result = await collUser?.findOneAndUpdate(
      {id: usr.id},
      {$set: {lastLoginTime: request.getCurrentTimestamp(), loginScheme}},
      {upsert: false, returnDocument: 'after'},
    );
    if (result?.ok && result.value) {
      data = result.value;
    }
  } else {
    // if user does not exist already then insert
    data.id = await request.getSequenceNextVal(USER_ID_SEQ);
    data.loginScheme = loginScheme;
    data.isActive = true;
    data.totalPlayed = 0;
    data.totalEarning = 0;
    data.contestWon = 0;
    data.createdTs = request.getCurrentTimestamp();
    data.lastLoginTime = request.getCurrentTimestamp();

    request.log.info(data);

    await collUser?.insertOne(data);
  }
  // generate short lived token
  const token = data.id && request.generateToken(data.id, data.name);
  return {success: true, data, token};
};
