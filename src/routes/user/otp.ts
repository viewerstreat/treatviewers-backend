import {FastifyRequest} from 'fastify';
import {OtpSchema, UserSchema} from '../../models/user';
import {OTP_LENGTH, OTP_VALIDITY_MINS} from '../../utils/config';
import {COLL_OTPS, COLL_USERS} from '../../utils/constants';

// generate random otp
export const generateOtp = (len: number): string => {
  const digits = '0123456789';
  let otp = '';
  for (let i = 0; i < len; i++) {
    const idx = Math.floor(Math.random() * digits.length);
    otp = otp + digits[idx];
  }
  return otp;
};

// send otp via SMS, call SMS API
export const sendOtp = async (phone: string, otp: string): Promise<boolean> => {
  // call sms api
  return true;
};

// save otp for user
export const saveOtp = async (userId: number, request: FastifyRequest) => {
  const userColl = request.mongo.db?.collection<UserSchema>(COLL_USERS);
  const result = await userColl?.findOne({id: userId});
  if (!result) {
    throw new Error('User not found');
  }
  if (!result.phone) {
    throw new Error('User phone not found');
  }
  const otp = generateOtp(OTP_LENGTH);
  await sendOtp(result.phone, otp);
  const collection = request.mongo.db?.collection<OtpSchema>(COLL_OTPS);
  await collection?.insertOne({
    userId,
    otp,
    validTill: request.getCurrentTimestamp() + OTP_VALIDITY_MINS * 60 * 1000,
    isUsed: false,
    updateTs: request.getCurrentTimestamp(),
  });
};
