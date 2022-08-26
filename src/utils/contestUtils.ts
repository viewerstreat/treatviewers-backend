import {FastifyInstance} from 'fastify';
import {ContestSchema, PRIZE_SELECTION} from '../models/contest';
import {PlayTrackerSchema} from '../models/playTracker';
import {EVENT_CREDIT_PRIZE} from './constants';
import {createPushReq} from './notiService';

// sort playTrackers based on score, timeTaken and start time
export const sortPlayTracker = (e1: PlayTrackerSchema, e2: PlayTrackerSchema): 1 | -1 | 0 => {
  // score descending sort
  const score1 = e1.score || 0;
  const score2 = e2.score || 0;
  if (score1 < score2) return 1;
  if (score1 > score2) return -1;
  // timeTaken ascending sort
  const timeTaken1 = e1.timeTaken || 0;
  const timeTaken2 = e2.timeTaken || 0;
  if (timeTaken1 < timeTaken2) return -1;
  if (timeTaken1 > timeTaken2) return 1;
  // start time ascending sort
  const start1 = e1.startTs || 0;
  const start2 = e1.startTs || 0;
  if (start1 < start2) return -1;
  if (start1 > start2) return 1;
  return 0;
};

// get total number of winners of the contest based on prize selection strategy
// if prize selection strategy is ratio based then total count is calculated based
// on the numerator and denominator value
export const getWinnerCount = (contest: ContestSchema, totalPlayer: number): number => {
  if (contest.prizeSelection === PRIZE_SELECTION.TOP_WINNERS) {
    return contest.topWinnersCount || 0;
  }

  const numerator = contest.prizeRatioNumerator || 0;
  const denominator = contest.prizeRatioDenominator || 1;
  return Math.round((numerator * totalPlayer) / denominator);
};

// create new Push message request for prize money won
export const createPushForPrize = async (
  userId: number,
  amount: number,
  title: string,
  fastify: FastifyInstance,
) => {
  const data = {userId, amount, title};
  await createPushReq(fastify, userId, EVENT_CREDIT_PRIZE, data);
};
