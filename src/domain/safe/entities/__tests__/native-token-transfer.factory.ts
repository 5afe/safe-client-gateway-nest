import { faker } from '@faker-js/faker';

export default function (
  blockNumber?: number,
  executionDate?: Date,
  from?: string,
  to?: string,
  transactionHash?: string,
  value?: string,
) {
  return {
    type: 'ETHER_TRANSFER',
    blockNumber: blockNumber ?? faker.datatype.number({ min: 0 }),
    executionDate: executionDate ?? faker.date.recent(),
    from: from ?? faker.finance.ethereumAddress(),
    to: to ?? faker.finance.ethereumAddress(),
    transactionHash: transactionHash ?? faker.datatype.hexadecimal(),
    value: value ?? faker.datatype.hexadecimal(),
  };
}
