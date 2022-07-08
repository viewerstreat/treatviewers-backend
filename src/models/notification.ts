import {ObjectId} from '@fastify/mongodb';

export enum NOTIFICATION_TYPE {
  PUSH_MESSAGE,
  SMS_MESSAGE,
  EMAIL_MESSAGE,
}

export interface NotificationSchema {
  _id?: ObjectId;
  eventType?: string;
  notificationType?: NOTIFICATION_TYPE;
  userId?: number;
  message?: string;
  isRead?: boolean;
  isCleared?: boolean;
  createdTs?: number;
  updatedTs?: number;
}
