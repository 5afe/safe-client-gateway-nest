import { Inject, Injectable } from '@nestjs/common';
import { ISafeRepository } from '../../domain/safe/safe.repository.interface';
import { MasterCopyVersionState, SafeState } from './entities/safe-info.entity';
import { IChainsRepository } from '../../domain/chains/chains.repository.interface';
import * as semver from 'semver';
import { MasterCopy } from '../../domain/chains/entities/master-copies.entity';
import { Safe } from '../../domain/safe/entities/safe.entity';
import { AddressInfo } from './entities/address.info.entity';
import { IContractsRepository } from '../../domain/contracts/contracts.repository.interface';
import { AddressInfoHelper } from '../common/address-info/address-info.helper';
import {
  isEthereumTransaction,
  isModuleTransaction,
  isMultisigTransaction,
} from '../../domain/safe/entities/transaction.entity';

@Injectable()
export class SafesService {
  constructor(
    @Inject(ISafeRepository)
    private readonly safeRepository: ISafeRepository,
    @Inject(IChainsRepository)
    private readonly chainsRepository: IChainsRepository,
    @Inject(IContractsRepository)
    private readonly contractsRepository: IContractsRepository,
    private readonly addressInfoHelper: AddressInfoHelper,
  ) {}

  async getSafeInfo(chainId: string, safeAddress: string): Promise<SafeState> {
    const safe = await this.safeRepository.getSafe(chainId, safeAddress);

    const recommendedMasterCopyVersion = (
      await this.chainsRepository.getChain(chainId)
    ).recommendedMasterCopyVersion;

    const supportedMasterCopies = await this.chainsRepository.getMasterCopies(
      chainId,
    );

    const versionState = this.computeVersionState(
      safe,
      recommendedMasterCopyVersion,
      supportedMasterCopies,
    );

    const masterCopyInfo: AddressInfo =
      await this.addressInfoHelper.getOrDefault(chainId, safe.masterCopy);

    let moduleAddressesInfo: AddressInfo[] | null = null;
    if (safe.modules) {
      moduleAddressesInfo = await this.addressInfoHelper
        .getCollection(chainId, safe.modules)
        .then((modules) => {
          // If modules are empty, return null instead (api spec)
          if (modules.length == 0) {
            return null;
          } else {
            return modules;
          }
        });
    }

    const fallbackHandlerInfo: AddressInfo | null =
      await this.addressInfoHelper.get(chainId, safe.fallbackHandler);

    const guardInfo: AddressInfo | null = await this.addressInfoHelper.get(
      chainId,
      safe.guard,
    );

    const collectiblesTag = await this.getCollectiblesTag(chainId, safeAddress);
    const queuedTransactionTag = await this.getQueuedTransactionTag(
      chainId,
      safeAddress,
    );
    const transactionHistoryTag = await this.executedTransactionTag(
      chainId,
      safeAddress,
    );

    return new SafeState(
      new AddressInfo(safe.address),
      chainId,
      safe.nonce,
      safe.threshold,
      safe.owners.map((ownerAddress) => new AddressInfo(ownerAddress)),
      masterCopyInfo,
      versionState,
      this.toUnixTimestampInSecondsOrNow(collectiblesTag).toString(),
      this.toUnixTimestampInSecondsOrNow(queuedTransactionTag).toString(),
      this.toUnixTimestampInSecondsOrNow(transactionHistoryTag).toString(),
      moduleAddressesInfo,
      fallbackHandlerInfo,
      guardInfo,
      safe.version,
    );
  }

  private toUnixTimestampInSecondsOrNow(date: Date | undefined): number {
    const dateValue = date ? date.valueOf() : Date.now();
    return Math.floor(dateValue / 1000);
  }

  private async getCollectiblesTag(
    chainId: string,
    safeAddress: string,
  ): Promise<Date | undefined> {
    const lastCollectibleTransfer =
      await this.safeRepository.getCollectibleTransfers(
        chainId,
        safeAddress,
        1,
        0,
      );

    return lastCollectibleTransfer.results[0]?.executionDate;
  }

  private async getQueuedTransactionTag(
    chainId: string,
    safeAddress: string,
  ): Promise<Date | undefined> {
    const lastQueuedTransaction =
      await this.safeRepository.getQueuedTransactions(chainId, safeAddress, 1);

    return lastQueuedTransaction.results[0]?.modified;
  }

  private async executedTransactionTag(
    chainId: string,
    safeAddress: string,
  ): Promise<Date | undefined> {
    const lastExecutedTransaction = (
      await this.safeRepository.getExecutedTransactions(chainId, safeAddress)
    ).results[0];

    if (isMultisigTransaction(lastExecutedTransaction)) {
      return (
        lastExecutedTransaction.modified ??
        lastExecutedTransaction.submissionDate
      );
    } else if (isEthereumTransaction(lastExecutedTransaction)) {
      return lastExecutedTransaction.executionDate;
    } else if (isModuleTransaction(lastExecutedTransaction)) {
      return lastExecutedTransaction.executionDate;
    }
  }

  private computeVersionState(
    safe: Safe,
    recommendedSafeVersion: string,
    supportedMasterCopies: MasterCopy[],
  ): MasterCopyVersionState {
    // If the safe version or the recommended safe version is not valid we return UNKNOWN
    if (!semver.valid(safe.version)) return MasterCopyVersionState.UNKNOWN;
    if (!semver.valid(recommendedSafeVersion))
      return MasterCopyVersionState.UNKNOWN;
    // If the master copy of this safe is not part of the collection
    // of recommended master copies we return UNKNOWN
    if (
      !supportedMasterCopies
        .map((masterCopy) => masterCopy.address)
        .includes(safe.masterCopy)
    )
      return MasterCopyVersionState.UNKNOWN;

    // If the safe version is lower than the recommended safe version
    // we return it as outdated
    if (semver.lt(safe.version, recommendedSafeVersion))
      return MasterCopyVersionState.OUTDATED;

    // Else we consider that the safe is up-to-date
    return MasterCopyVersionState.UP_TO_DATE;
  }
}
