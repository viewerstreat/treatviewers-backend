import {ObjectId} from '@fastify/mongodb';

export interface Option {
  optionId?: number;
  optionText?: string;
  isCorrect?: boolean;
}

export interface QuestionSchema {
  _id?: string | ObjectId;
  contestId?: string;
  questionNo?: number;
  questionText?: string;
  options?: Option[];
  isActive?: boolean;
  createdBy?: number;
  updatedBy?: number;
  createdTs?: number;
  updatedTs?: number;
}
