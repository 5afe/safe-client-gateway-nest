import { Module } from '@nestjs/common';
import { AddressInfoModule } from '../common/address-info/address-info.module';
import { MultisigTransactionExecutionInfoMapper } from './mappers/multisig-transactions/multisig-transaction-execution-info.mapper';
import { MultisigTransactionInfoMapper } from './mappers/multisig-transactions/multisig-transaction-info.mapper';
import { MultisigTransactionStatusMapper } from './mappers/multisig-transactions/multisig-transaction-status.mapper';
import { MultisigTransactionMapper } from './mappers/multisig-transactions/multisig-transaction.mapper';
import { CustomTransactionMapper } from './mappers/multisig-transactions/transaction-info/custom-transaction.mapper';
import { SettingsChangeMapper } from './mappers/multisig-transactions/transaction-info/settings-change.mapper';
import { TransactionsController } from './transactions.controller';
import { TransactionsService } from './transactions.service';

@Module({
  controllers: [TransactionsController],
  imports: [AddressInfoModule],
  providers: [
    CustomTransactionMapper,
    MultisigTransactionExecutionInfoMapper,
    MultisigTransactionInfoMapper,
    MultisigTransactionMapper,
    MultisigTransactionStatusMapper,
    SettingsChangeMapper,
    TransactionsService,
  ],
})
export class TransactionsModule {}
