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

export enum MEDIA_TYPE {
  MOVIE = 'movie',
  CLIP = 'clip',
}

export interface FavouriteSchema {
  mediaType: MEDIA_TYPE;
  userId: number;
  mediaId: string;
  mediaName: string;
  bannerImageUrl: string;
  isRemoved: boolean;
  createdTs?: number;
  updatedTs?: number;
}

export interface MovieViewSchema {
  movieId: string;
  userId: number;
  updatedTs: number;
}
