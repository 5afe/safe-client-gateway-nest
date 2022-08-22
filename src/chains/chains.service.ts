import { Injectable } from '@nestjs/common';
import { ConfigService } from '../services/config-service/config-service.service';
import { TransactionServiceManager } from '../services/transaction-service/transaction-service.manager';
import { Backbone, Chain, Page } from './entities';

@Injectable()
export class ChainsService {
  constructor(
    private readonly safeConfigService: ConfigService,
    private readonly transactionServiceManager: TransactionServiceManager,
  ) {}

  async getChains(): Promise<Page<Chain>> {
    const result = await this.safeConfigService.getChains();
    const page: Page<Chain> = {
      count: result.count,
      next: result.next,
      previous: result.previous,
      results: result.results.map(
        (chain) =>
          <Chain>{
            chainId: chain.chainId,
            chainName: chain.chainName,
            vpcTransactionService: chain.vpcTransactionService,
          },
      ),
    };
    return page;
  }

  async getBackbone(chainId: string): Promise<Backbone> {
    const transactionService = await this.transactionServiceManager.getTransactionService(chainId);
    return transactionService.getBackbone();
  }
}
