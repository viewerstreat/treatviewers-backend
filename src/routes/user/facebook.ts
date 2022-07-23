import {UserSchema} from '../../models/user';
import fetch from 'node-fetch';

const FB_ME_URL = 'https://graph.facebook.com/me';

export const verifyFbToken = async (fbToken: string): Promise<UserSchema> => {
  const url = `${FB_ME_URL}?access_token=${fbToken}&fields=id,name,email,picture`;
  const response = await fetch(url);
  const data: any = await response.json();
  if (!data || !data.email) {
    throw new Error('Not able to retrive user data');
  }
  const user: UserSchema = {
    name: data.name,
    email: data.email,
    profilePic: data.picture?.data?.url || '',
  };
  return user;
};
