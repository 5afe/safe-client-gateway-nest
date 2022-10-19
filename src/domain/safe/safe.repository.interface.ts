import { Safe } from './entities/safe.entity';
import { Page } from '../entities/page.entity';
import { Transfer } from './entities/transfer.entity';
import { MultisigTransaction } from './entities/multisig-transaction.entity';

export const ISafeRepository = Symbol('ISafeRepository');

export interface ISafeRepository {
  getSafe(chainId: string, address: string): Promise<Safe>;

  getCollectibleTransfers(
    chainId: string,
    safeAddress: string,
    limit?: number,
    offset?: number,
  ): Promise<Page<Transfer>>;

  getQueuedTransactions(
    chainId: string,
    safeAddress: string,
    limit?: number,
    offset?: number,
  ): Promise<Page<MultisigTransaction>>;
}
