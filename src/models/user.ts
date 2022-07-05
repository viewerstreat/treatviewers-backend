export interface UserSchema {
  id?: number;
  name?: string;
  email?: string;
  phone?: string;
  profilePic?: string;
  isActive?: boolean;
  hasUsedReferralCode?: boolean;
  referralCode?: string;
  referredBy?: string;
  createdTs?: number;
  updatedTs?: number;
}

export interface OtpSchema {
  userId: number;
  otp: string;
  validTill: number;
}
