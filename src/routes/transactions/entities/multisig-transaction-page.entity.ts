import { ApiProperty } from '@nestjs/swagger';
import { Page } from '../../common/entities/page.entity';
import { MultisigTransaction } from './multisig-transaction.entity';

export class MultisigTransactionPage extends Page<MultisigTransaction> {
  @ApiProperty({ type: MultisigTransaction })
  results: MultisigTransaction[];
}
