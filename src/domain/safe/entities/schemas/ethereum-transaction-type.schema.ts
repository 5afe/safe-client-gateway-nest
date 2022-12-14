import { Schema } from 'ajv';
import { transferSchema } from './transfer.schema';

export const ethereumTransactionTypeSchema: Schema = {
  type: 'object',
  properties: {
    txType: { type: 'string', const: 'ETHEREUM_TRANSACTION' },
    executionDate: { type: 'string', isDate: true },
    data: { type: 'string', nullable: true, default: null },
    txHash: { type: 'string' },
    blockNumber: { type: 'number' },
    transfers: {
      type: 'array',
      items: transferSchema,
      nullable: true,
      default: null,
    },
    from: { type: 'string' },
  },
  required: ['txType', 'executionDate', 'txHash', 'blockNumber', 'from'],
};
