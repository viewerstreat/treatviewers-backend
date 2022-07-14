export interface WalletSchema {
  userId: number;
  balance: number;
  createdTs: number;
  updatedTs: number;
}

export enum WALLET_TRANSACTION_TYPE {
  ADD_BALANCE = 'ADD_BALANCE',
  WITHDRAW = 'WITHDRAW',
  PAY_FOR_CONTEST = 'PAY_FOR_CONTEST',
  CONTEST_WIN = 'CONTEST_WIN',
}

export enum TRANSACTION_STATUS {
  PENDING = 'PENDING',
  COMPLETED = 'COMPLETED',
  ERROR = 'ERROR',
}

export interface WalletTransactionSchema {
  userId: number;
  transactionType: WALLET_TRANSACTION_TYPE;
  amount: number;
  status: TRANSACTION_STATUS;
  errorReason?: string;
  balanceBefore?: number;
  balanceAfter?: number;
  trackingId?: string;
  remarks?: string;
  createdTs?: number;
  updatedTs?: number;
}
