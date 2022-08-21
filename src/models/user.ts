export enum LOGIN_SCHEME {
  'GOOGLE' = 'GOOGLE',
  'FACEBOOK' = 'FACEBOOK',
  'OTP_BASED' = 'OTP_BASED',
}

export interface UserSchema {
  id?: number;
  name?: string;
  email?: string;
  phone?: string;
  profilePic?: string;
  loginScheme?: LOGIN_SCHEME;
  isActive?: boolean;
  lastLoginTime?: number;
  hasUsedReferralCode?: boolean;
  referralCode?: string;
  referredBy?: string;
  totalPlayed?: number;
  contestWon?: number;
  totalEarning?: number;
  createdTs?: number;
  updatedTs?: number;
  fcmTokens?: string[];
}

export interface OtpSchema {
  userId: number;
  otp: string;
  validTill: number;
  isUsed: boolean;
  updateTs: number;
}

export interface UsedTokenSchema {
  userId: number;
  token: string;
  updateTs: number;
}
