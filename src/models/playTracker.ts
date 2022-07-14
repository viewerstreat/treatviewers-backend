import {Option} from './question';

export enum PLAY_STATUS {
  INIT = 'INIT',
  PAID = 'PAID',
  STARTED = 'STARTED',
  FINISHED = 'FINISHED',
  ENDED = 'ENDED',
}

export interface Answer {
  questionNo: number;
  questionText: string;
  options: Option[];
  selectedOptionId: number;
}

export interface PlayTrackerSchema {
  userId: number;
  contestId: string;
  status: PLAY_STATUS;
  walletTransactionId?: string;
  initTs?: number;
  paidTs?: number;
  startTs?: number;
  resumeTs?: number[];
  finishTs?: number;
  currQuestionNo?: number;
  totalQuestions?: number;
  totalAnswered?: number;
  timeTaken?: number;
  score?: number;
  rank?: number;
  answers?: Answer[];
  createdTs?: number;
  updatedTs?: number;
}

export interface LeaderboardSchema {
  userId: number;
  name: string;
}
