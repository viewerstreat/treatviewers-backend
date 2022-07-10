export enum PLAY_STATUS {
  INIT = 0,
  PAID = 1,
  STARTED = 2,
  FINISHED = 3,
}

export interface Answer {
  questionNo: number;
  questionText: string;
  options: {
    optionId: number;
    optionText: string;
  }[];
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
  answers?: Answer[];
  score?: number;
  createdTs?: number;
  updatedTs?: number;
}
