export interface UserSchema {
  id: number;
  name: string;
  email: string;
  phone: string;
  isActive: boolean;
  hasUsedReferralCode?: boolean;
  referralCode?: string;
  referredBy?: string;
}
