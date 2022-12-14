import { ApiProperty } from '@nestjs/swagger';
import { AddressInfo } from '../../../common/entities/address-info.entity';
import { SettingsChange } from './settings-change.entity';

export class SwapOwner extends SettingsChange {
  @ApiProperty()
  oldOwner: AddressInfo;
  @ApiProperty()
  newOwner: AddressInfo;

  constructor(oldOwner: AddressInfo, newOwner: AddressInfo) {
    super('SWAP_OWNER');
    this.oldOwner = oldOwner;
    this.newOwner = newOwner;
  }
}
