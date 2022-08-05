import {RouteShorthandOptions} from 'fastify';
import {playTrackerObject} from '../playTracker/playTracker.schema';

export const GetWalletBalOpts: RouteShorthandOptions = {
  schema: {
    description: 'Get wallet balance of an user',
    headers: {
      type: 'object',
      required: ['authorization'],
      properties: {
        authorization: {type: 'string'},
      },
    },
    response: {
      200: {
        type: 'object',
        properties: {
          success: {type: 'boolean'},
          balance: {type: 'number'},
        },
      },
    },
  },
};

export interface AddBalInitRequest {
  Headers: {
    authorization: string;
  };
  Body: {
    amount: number;
  };
}

export const AddBalInitOpts: RouteShorthandOptions = {
  schema: {
    description: 'Add Balnce initialize API',
    headers: {
      type: 'object',
      required: ['authorization'],
      properties: {
        authorization: {type: 'string'},
      },
    },
    body: {
      type: 'object',
      required: ['amount'],
      properties: {
        amount: {type: 'number', minimum: 1, multipleOf: 1},
      },
    },
    response: {
      200: {
        properties: {
          success: {type: 'boolean'},
          transactionId: {type: 'string'},
          appUpiId: {type: 'string'},
        },
      },
    },
  },
};

export interface AddBalEndRequest {
  Headers: {
    authorization: string;
  };
  Body: {
    transactionId: string;
    amount: number;
    isSuccessful: boolean;
    errorReason?: string;
    trackingId?: string;
  };
}

export const AddBalEndOpts: RouteShorthandOptions = {
  schema: {
    description: 'Add Balnce finalize API',
    headers: {
      type: 'object',
      required: ['authorization'],
      properties: {
        authorization: {type: 'string'},
      },
    },
    body: {
      type: 'object',
      required: ['transactionId', 'amount', 'isSuccessful'],
      properties: {
        transactionId: {type: 'string', minLength: 24, maxLength: 24},
        amount: {type: 'number', minimum: 1, multipleOf: 1},
        isSuccessful: {type: 'boolean'},
        errorReason: {type: 'string'},
        trackingId: {type: 'string'},
      },
    },
    response: {
      200: {
        type: 'object',
        properties: {
          success: {type: 'boolean'},
          message: {type: 'string'},
        },
      },
    },
  },
};

export interface PayContestRequest {
  Headers: {
    authorization: string;
  };
  Body: {
    contestId: string;
  };
}

export const PayContestOpts: RouteShorthandOptions = {
  schema: {
    description: 'Pay for Contest initialize API',
    headers: {
      type: 'object',
      required: ['authorization'],
      properties: {
        authorization: {type: 'string'},
      },
    },
    body: {
      type: 'object',
      required: ['contestId'],
      properties: {
        contestId: {type: 'string', minLength: 24, maxLength: 24},
      },
    },
    response: {
      200: {
        properties: {
          success: {type: 'boolean'},
          data: playTrackerObject,
        },
      },
    },
  },
};

export interface WithdrawBalInitReq {
  Headers: {
    authorization: string;
  };
  Body: {
    amount: number;
    receiverUpiId: string;
  };
}

export const WithdrawBalInitOpts: RouteShorthandOptions = {
  schema: {
    description: 'Withdraw Balnce initialize API',
    headers: {
      type: 'object',
      required: ['authorization'],
      properties: {
        authorization: {type: 'string', minLength: 1},
      },
    },
    body: {
      type: 'object',
      required: ['amount', 'receiverUpiId'],
      properties: {
        amount: {type: 'number', minimum: 1, multipleOf: 1},
        receiverUpiId: {type: 'string', minLength: 1},
      },
    },
    response: {
      200: {
        properties: {
          success: {type: 'boolean'},
          transactionId: {type: 'string'},
        },
      },
    },
  },
};

export interface WithdrawBalEndRequest {
  Headers: {
    authorization: string;
  };
  Body: {
    transactionId: string;
    amount: number;
    isSuccessful: boolean;
    errorReason?: string;
    trackingId?: string;
  };
}

export const WithdrawBalEndOpts: RouteShorthandOptions = {
  schema: {
    description: 'Withdraw Balnce finalize API',
    headers: {
      type: 'object',
      required: ['authorization'],
      properties: {
        authorization: {type: 'string'},
      },
    },
    body: {
      type: 'object',
      required: ['transactionId', 'amount', 'isSuccessful'],
      properties: {
        transactionId: {type: 'string', minLength: 24, maxLength: 24},
        amount: {type: 'number', minimum: 1, multipleOf: 1},
        isSuccessful: {type: 'boolean'},
        errorReason: {type: 'string'},
        trackingId: {type: 'string'},
      },
    },
    response: {
      200: {
        type: 'object',
        properties: {
          success: {type: 'boolean'},
          message: {type: 'string'},
        },
      },
    },
  },
};
