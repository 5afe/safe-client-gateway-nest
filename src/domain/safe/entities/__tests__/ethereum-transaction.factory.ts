import { Transfer } from '../transfer.entity';
import { faker } from '@faker-js/faker';

export default function (
  blockNumber?: number,
  data?: string | null,
  executionDate?: Date,
  from?: string,
  txHash?: string,
  transfers?: Transfer[] | null,
): unknown {
  return {
    txType: 'ETHEREUM_TRANSACTION',
    blockNumber: blockNumber ?? faker.datatype.number(),
    data: data === undefined ? faker.datatype.hexadecimal() : data,
    executionDate: executionDate?.toISOString() ?? new Date().toISOString(),
    from: from ?? faker.finance.ethereumAddress(),
    transfers: transfers === undefined ? [] : transfers,
    txHash: txHash ?? faker.datatype.hexadecimal(),
  };
}
