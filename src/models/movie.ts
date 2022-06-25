import {ObjectId} from '@fastify/mongodb';

export interface MovieSchema {
  _id?: string | ObjectId;
  name?: string;
  description?: string;
  tags?: string[];
  videoUrl?: string;
  bannerImageUrl?: string;
  viewCount?: number;
  likeCount?: number;
  sponsoredBy?: string;
  sponsoredByLogo?: string;
  releaseDate?: number;
  releaseOutlets?: string[];
  moviePromotionExpiry?: number;
  isActive?: boolean;
  createdBy?: number;
  updatedBy?: number;
  createdTs?: number;
  updatedTs?: number;
}
