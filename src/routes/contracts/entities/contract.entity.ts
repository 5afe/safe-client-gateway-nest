import { ApiProperty } from '@nestjs/swagger';
import { Contract as DomainContract } from '../../../domain/contracts/entities/contract.entity';

export class Contract implements DomainContract {
  @ApiProperty()
  address: string;
  @ApiProperty()
  name: string;
  @ApiProperty()
  displayName: string;
  @ApiProperty()
  logoUri?: string;
  @ApiProperty()
  contractAbi?: object;
  @ApiProperty()
  trustedForDelegateCall: boolean;
}
