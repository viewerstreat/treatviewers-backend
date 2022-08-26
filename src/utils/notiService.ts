import {FastifyInstance, FastifyRequest} from 'fastify';
import {ObjectId} from '@fastify/mongodb';
import {JWT} from 'google-auth-library';
import fetch from 'node-fetch';
import * as key from '../firebase-service-account.json';
import {
  NotiContentSchema,
  NotificationSchema,
  NOTIFICATION_TYPE,
  NotiRequestSchema,
  NOTI_REQ_STATUS,
} from '../models/notification';
import {UserSchema} from '../models/user';
import {BATCH_FETCH_LIMIT, FCM_ENDPOINT, PUSH_ICON_COLOR, PUSH_MSG_LOGO_PATH} from './config';
import {COLL_NOTIFICATIONS, COLL_NOTI_CONTENT, COLL_NOTI_REQ, COLL_USERS} from './constants';

// replace placeholder variables from the template text
// placeholders are of patters {{variable}}
function replacePlaceholders(str: string, options: {[k: string]: string | number}): string {
  return str.replace(/{{(\w+)}}/g, (match, variable) => {
    if (options.hasOwnProperty(variable)) {
      return `${options[variable]}`;
    }
    return match;
  });
}

// get accesToken for FCM
async function getAccessToken(): Promise<string> {
  const scopes = ['https://www.googleapis.com/auth/firebase.messaging'];
  const jwtClient = new JWT(key.client_email, undefined, key.private_key, scopes, undefined);
  const token = await jwtClient.authorize();
  if (!token.access_token) {
    throw new Error('not able to get access_token from FCM');
  }
  return token.access_token;
}

async function handleNotification(fastify: FastifyInstance) {
  fastify.log.info('starting handleNotification...');
  const collNotiReq = fastify.mongo.db?.collection<NotiRequestSchema>(COLL_NOTI_REQ);

  // get accessToken to call FCM API
  fastify.log.info('getting FCM accessToken');
  const accessToken = await getAccessToken();
  // fetch notification requests that are in READY status
  // fetched in updatedTs ascending order so that oldest contest updated first
  let readyRequests = await collNotiReq
    ?.find({status: NOTI_REQ_STATUS.READY_TO_SEND})
    .sort({updatedTs: 1})
    .limit(BATCH_FETCH_LIMIT)
    .toArray();
  readyRequests = readyRequests || [];
  // process all ready requests
  const readyPromises = readyRequests.map((c) => processReadyReq(c, accessToken, fastify));

  // fetch notification requests that are in NEW status
  // fetched in createdTs ascending order so that oldest contest updated first
  let newRequests = await collNotiReq
    ?.find({status: NOTI_REQ_STATUS.NEW})
    .sort({createdTs: 1})
    .limit(BATCH_FETCH_LIMIT)
    .toArray();
  newRequests = newRequests || [];
  // process all new requests
  const newPromises = newRequests.map((c) => processNewReq(c, fastify));
  // wait for all requests to finish
  await Promise.all(newPromises.concat(readyPromises));
  fastify.log.info('New requests processed: ' + newPromises.length);
  fastify.log.info('Ready requests processed: ' + readyPromises.length);
}

async function processNewReq(req: NotiRequestSchema, fastify: FastifyInstance) {
  fastify.log.info('processing new request: ' + req._id?.toString());
  const requestId = req._id?.toString();
  if (!requestId) {
    return;
  }
  try {
    const collUser = fastify.mongo.db?.collection<UserSchema>(COLL_USERS);
    const collNotiContent = fastify.mongo.db?.collection<NotiContentSchema>(COLL_NOTI_CONTENT);
    const collReq = fastify.mongo.db?.collection<NotiRequestSchema>(COLL_NOTI_REQ);
    // get notification content for the eventName
    const contentResult = await collNotiContent?.findOne({eventName: req.eventName});

    // if content is not found then update request as error
    if (!contentResult) {
      return updateReqError(requestId, 'content not found', fastify);
    }
    const user = await collUser?.findOne({id: req.userId, isActive: true});
    if (!user) {
      return updateReqError(requestId, 'user not found', fastify);
    }
    // for push message
    if (req.notificationType === NOTIFICATION_TYPE.PUSH_MESSAGE) {
      if (!user.fcmTokens || user.fcmTokens.length === 0) {
        return updateReqError(requestId, 'user device token not found', fastify);
      }
      const dataObj = req.data || {};
      if (!dataObj.userName) {
        dataObj.userName = user.name || '';
      }
      // updated content by replacing the placeholder variables with actual values
      const content = replacePlaceholders(contentResult?.content || '', dataObj || {});
      console.log('replaced content', content);
      // update request to ready status
      await collReq?.updateOne(
        {_id: new ObjectId(requestId)},
        {
          $set: {
            status: NOTI_REQ_STATUS.READY_TO_SEND,
            fcmTokens: user.fcmTokens,
            finalMessage: content,
            updatedTs: fastify.getCurrentTimestamp(),
          },
        },
      );
      return;
    }

    // unknown error, code should not reach this line
    return updateReqError(requestId, 'Unknown error', fastify);
  } catch (err) {
    if (err && err instanceof Error) {
      await updateReqError(requestId, err.message, fastify);
    }
  }
}

async function processReadyReq(
  req: NotiRequestSchema,
  accessToken: string,
  fastify: FastifyInstance,
) {
  fastify.log.info('processing ready request: ' + req._id?.toString());
  const requestId = req._id?.toString();
  if (!requestId) {
    return;
  }
  try {
    const collReq = fastify.mongo.db?.collection<NotiRequestSchema>(COLL_NOTI_REQ);
    const collNoti = fastify.mongo.db?.collection<NotificationSchema>(COLL_NOTIFICATIONS);
    if (req.notificationType === NOTIFICATION_TYPE.PUSH_MESSAGE) {
      if (!req.fcmTokens || req.fcmTokens.length === 0) {
        throw new Error('fcmTokens not present');
      }
      if (!req.finalMessage) {
        throw new Error('finalMessage not present');
      }
      // send push messages to all devices of the user
      const promises = req.fcmTokens.map((t) =>
        sendPushMessage(req.finalMessage || '', t, accessToken),
      );
      await Promise.all(promises);
      // insert into notifications
      await collNoti?.insertOne({
        eventName: req.eventName,
        notificationType: req.notificationType,
        userId: req.userId,
        message: req.finalMessage,
        isRead: false,
        isCleared: false,
        createdTs: fastify.getCurrentTimestamp(),
        updatedTs: fastify.getCurrentTimestamp(),
      });
      // update request to ready status
      await collReq?.updateOne(
        {_id: new ObjectId(requestId)},
        {
          $set: {
            status: NOTI_REQ_STATUS.SENT,
            updatedTs: fastify.getCurrentTimestamp(),
          },
        },
      );
      return;
    }

    // unknown error, code should not reach this line
    return updateReqError(requestId, 'Unknown error', fastify);
  } catch (err) {
    if (err && err instanceof Error) {
      await updateReqError(requestId, err.message, fastify);
    }
  }
}

async function sendPushMessage(msg: string, device: string, accessToken: string): Promise<boolean> {
  const payload = {
    message: {
      token: device,
      data: {
        screenName: 'Home',
        screenParams: '{"screen": "Notifications"}',
      },
      notification: {
        body: msg,
        title: 'Trailsbuddy',
      },
      android: {
        notification: {
          color: PUSH_ICON_COLOR,
          image: PUSH_MSG_LOGO_PATH,
        },
      },
    },
  };
  const response = await fetch(FCM_ENDPOINT, {
    method: 'POST',
    body: JSON.stringify(payload),
    headers: {Authorization: 'Bearer ' + accessToken, 'Content-Type': 'application/json'},
  });
  return response.ok;
}

// update the notification request to error status
async function updateReqError(requestId: string, message: string, fastify: FastifyInstance) {
  try {
    const coll = await fastify.mongo.db?.collection<NotiRequestSchema>(COLL_NOTI_REQ);
    await coll?.updateOne(
      {_id: new ObjectId(requestId)},
      {
        $set: {
          status: NOTI_REQ_STATUS.ERROR,
          errorMessage: message,
          updatedTs: fastify.getCurrentTimestamp(),
        },
      },
    );
  } catch (err) {
    fastify.log.error('Not able to update request to error status');
  }
}

// insert notification request
async function insertPushNotiReq(
  request: FastifyRequest,
  userId: number,
  eventName: string,
  data?: {[k: string]: string | number},
) {
  const collNotiReq = request.mongo.db?.collection<NotiRequestSchema>(COLL_NOTI_REQ);
  await collNotiReq?.insertOne({
    userId,
    eventName,
    status: NOTI_REQ_STATUS.NEW,
    notificationType: NOTIFICATION_TYPE.PUSH_MESSAGE,
    data: data || {},
    createdTs: request.getCurrentTimestamp(),
    updatedTs: request.getCurrentTimestamp(),
  });
}

async function createPushReq(
  fastify: FastifyInstance,
  userId: number,
  eventName: string,
  data?: {[k: string]: string | number},
) {
  const collNotiReq = fastify.mongo.db?.collection<NotiRequestSchema>(COLL_NOTI_REQ);
  await collNotiReq?.insertOne({
    userId,
    eventName,
    status: NOTI_REQ_STATUS.NEW,
    notificationType: NOTIFICATION_TYPE.PUSH_MESSAGE,
    data: data || {},
    createdTs: fastify.getCurrentTimestamp(),
    updatedTs: fastify.getCurrentTimestamp(),
  });
}

export {handleNotification, insertPushNotiReq, createPushReq};
