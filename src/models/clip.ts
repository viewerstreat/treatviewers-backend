import {ObjectId} from '@fastify/mongodb';

export interface ClipSchema {
  _id?: string | ObjectId;
  name?: string;
  description?: string;
  videoUrl?: string;
  bannerImageUrl?: string;
  viewCount?: number;
  likeCount?: number;
  isActive?: boolean;
  createdBy?: number;
  updatedBy?: number;
  createdTs?: number;
  updatedTs?: number;
}
