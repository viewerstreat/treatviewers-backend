import {OAuth2Client} from 'google-auth-library';
import {UserSchema} from '../../models/user';

export const verifyIdToken = async (idToken: string): Promise<UserSchema> => {
  const clientId = process.env.GOOGLE_TOKEN_CLIENT_ID;
  const client = new OAuth2Client(clientId);
  const ticket = await client.verifyIdToken({idToken, audience: clientId});
  const payload = ticket.getPayload();
  if (!payload) {
    throw new Error('Not able to retrive payload');
  }
  if (!payload.sub || !payload.email) {
    throw new Error('Invalid payload received');
  }
  const u: UserSchema = {
    name: payload.name || '',
    email: payload.email,
    profilePic: payload.picture || '',
  };
  return u;
};
