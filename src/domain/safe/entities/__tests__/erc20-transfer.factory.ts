import { ERC20Transfer } from '../transfer.entity';
import { faker } from '@faker-js/faker';
import { Builder } from '../../../common/__tests__/builder';

export class ERC20TransferBuilder implements Builder<ERC20Transfer> {
  blockNumber: number = faker.datatype.number();
  executionDate: Date = faker.date.recent();
  from: string = faker.finance.ethereumAddress();
  to: string = faker.finance.ethereumAddress();
  transactionHash: string = faker.datatype.hexadecimal();
  tokenAddress: string | null = faker.finance.ethereumAddress();
  value: string = faker.datatype.hexadecimal();

  withBlockNumber(blockNumber: number) {
    this.blockNumber = blockNumber;
    return this;
  }

  withExecutionDate(executionDate: Date) {
    this.executionDate = executionDate;
    return this;
  }

  withFrom(from: string) {
    this.from = from;
    return this;
  }

  withTo(to: string) {
    this.to = to;
    return this;
  }

  withTransactionHash(transactionHash: string) {
    this.transactionHash = transactionHash;
    return this;
  }

  withTokenAddress(tokenAddress: string | null) {
    this.tokenAddress = tokenAddress;
    return this;
  }

  withValue(value: string) {
    this.value = value;
    return this;
  }

  build(): ERC20Transfer {
    return <ERC20Transfer>{
      blockNumber: this.blockNumber,
      executionDate: this.executionDate,
      from: this.from,
      to: this.to,
      transactionHash: this.transactionHash,
      tokenAddress: this.tokenAddress,
      value: this.value,
    };
  }
}
