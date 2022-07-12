import {ObjectId} from '@fastify/mongodb';

export enum CONTEST_CATEGORY {
  MOVIE = 'movie',
  OTHERS = 'others',
}

export enum PRIZE_SELECTION {
  TOP_WINNERS = 'TOP_WINNERS',
  RATIO_BASED = 'RATIO_BASED',
}

export enum CONTEST_STATUS {
  CREATED = 'CREATED',
  ACTIVE = 'ACTIVE',
  INACTIVE = 'INACTIVE',
  FINISHED = 'FINISHED',
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
  prizeSelection?: PRIZE_SELECTION;
  topWinnersCount?: number; // winners count if the prize selection is based on TOP_WINNERS basis
  prizeRatioNumerator?: number; // prize ratio numerator value
  prizeRatioDenominator?: number; // prize ratio denominator value
  topPrizeValue?: number; // value of the top Prize that can be won
  startTime: number;
  endTime: number;
  questionCount?: number;
  viewCount?: number;
  likeCount?: number;
  status: CONTEST_STATUS;
  createdBy?: number;
  updatedBy?: number;
  createdTs?: number;
  updatedTs?: number;
}
