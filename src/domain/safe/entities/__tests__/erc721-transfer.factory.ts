import { ERC721Transfer } from '../transfer.entity';
import { faker } from '@faker-js/faker';
import { Builder } from '../../../common/__tests__/builder';

export class ERC721TransferTransferBuilder implements Builder<ERC721Transfer> {
  blockNumber: number = faker.datatype.number();
  executionDate: Date = faker.date.recent();
  from: string = faker.finance.ethereumAddress();
  to: string = faker.finance.ethereumAddress();
  transactionHash: string = faker.datatype.hexadecimal();
  tokenAddress: string | null = faker.finance.ethereumAddress();
  tokenId: string = faker.datatype.string();

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

  withTokenId(tokenId: string) {
    this.tokenId = tokenId;
    return this;
  }

  build(): ERC721Transfer {
    return <ERC721Transfer>{
      blockNumber: this.blockNumber,
      executionDate: this.executionDate,
      from: this.from,
      to: this.to,
      transactionHash: this.transactionHash,
      tokenAddress: this.tokenAddress,
      tokenId: this.tokenId,
    };
  }
}
