import { Schema } from 'ajv';

export const erc721TransferSchema: Schema = {
  type: 'object',
  properties: {
    type: {
      type: 'string',
      const: 'ERC721_TRANSFER',
    },
    executionDate: { type: 'string', isDate: true },
    blockNumber: { type: 'number' },
    transactionHash: { type: 'string' },
    to: { type: 'string' },
    from: { type: 'string' },
    tokenId: { type: 'string' },
    tokenAddress: { type: 'string', nullable: true },
  },
  required: [
    'type',
    'executionDate',
    'blockNumber',
    'transactionHash',
    'to',
    'from',
    'tokenId',
  ],
};
