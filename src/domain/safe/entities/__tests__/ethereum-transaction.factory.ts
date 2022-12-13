import { EthereumTransaction } from '../ethereum-transaction.entity';
import { Transfer } from '../transfer.entity';
import { faker } from '@faker-js/faker';
import { Builder } from '../../../common/__tests__/builder';

export class EthereumTransactionBuilder
  implements Builder<EthereumTransaction>
{
  blockNumber: number = faker.datatype.number();
  data: string | null = faker.datatype.hexadecimal();
  executionDate: Date = faker.date.recent();
  from: string = faker.finance.ethereumAddress();
  transfers: Transfer[] | null = [];
  txHash: string;

  withBlockNumber(blockNumber: number) {
    this.blockNumber = blockNumber;
    return this;
  }

  withData(data: string | null) {
    this.data = data;
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

  withTransfers(transfers: Transfer[] | null) {
    this.transfers = transfers;
    return this;
  }

  withTxHash(txHash: string) {
    this.txHash = txHash;
    return this;
  }

  build(): EthereumTransaction {
    return <EthereumTransaction>{
      blockNumber: this.blockNumber,
      data: this.data,
      executionDate: this.executionDate,
      from: this.from,
      transfers: this.transfers,
      txHash: this.txHash,
    };
  }
}
