import {ObjectId} from '@fastify/mongodb';

export enum NOTIFICATION_TYPE {
  PUSH_MESSAGE,
  SMS_MESSAGE,
  EMAIL_MESSAGE,
}

export enum NOTI_REQ_STATUS {
  NEW = 'NEW',
  READY_TO_SEND = 'READY_TO_SEND',
  SENT = 'SENT',
  ERROR = 'ERROR',
}

export interface NotificationSchema {
  _id?: ObjectId;
  eventName: string;
  notificationType: NOTIFICATION_TYPE;
  userId: number;
  message: string;
  isRead?: boolean;
  isCleared?: boolean;
  createdTs?: number;
  updatedTs?: number;
}

export interface NotiRequestSchema {
  _id?: ObjectId;
  eventName: string;
  notificationType: NOTIFICATION_TYPE;
  userId: number;
  data?: {[k: string]: string | number};
  status: NOTI_REQ_STATUS;
  finalMessage?: string;
  fcmTokens?: string[];
  errorMessage?: string;
  createdTs?: number;
  updatedTs?: number;
}

export interface NotiContentSchema {
  eventName: string;
  content: string;
  createdTs?: number;
  updatedTs?: number;
}
