import {ObjectId} from '@fastify/mongodb';

export interface ClipSchema {
  _id?: string | ObjectId;
  name?: string;
  description?: string;
  videoUrl?: string;
  bannerImageUrl?: string;
  viewCount?: number;
  likeCount?: number;
  isLikedByMe?: boolean;
  isActive?: boolean;
  createdBy?: number;
  updatedBy?: number;
  createdTs?: number;
  updatedTs?: number;
}

export interface ClipViewSchema {
  clipId: string;
  userId: number;
  updatedTs: number;
}
