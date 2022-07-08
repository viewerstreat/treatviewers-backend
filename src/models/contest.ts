import {ObjectId} from '@fastify/mongodb';

export enum CONTEST_CATEGORY {
  MOVIE = 'movie',
  OTHERS = 'others',
}

export interface ContestSchema {
  _id?: string | ObjectId;
  title?: string;
  category?: CONTEST_CATEGORY;
  movieId?: string;
  sponsoredBy?: string;
  sponsoredByLogo?: string;
  bannerImageUrl?: string;
  videoUrl?: string;
  entryFee?: number;
  topPrize?: string;
  prizeRatio?: string;
  topWinners?: string;
  startTime?: number;
  endTime?: number;
  questionCount?: number;
  viewCount?: number;
  likeCount?: number;
  isActive?: boolean;
  createdBy?: number;
  updatedBy?: number;
  createdTs?: number;
  updatedTs?: number;
}
