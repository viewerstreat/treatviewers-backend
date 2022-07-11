import {Option} from './question';

export enum PLAY_STATUS {
  INIT = 'INIT',
  PAID = 'PAID',
  STARTED = 'STARTED',
  FINISHED = 'FINISHED',
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
  answers?: Answer[];
  score?: number;
  createdTs?: number;
  updatedTs?: number;
}
