import { ApiTags } from '@nestjs/swagger';
import { Controller, Get, Param } from '@nestjs/common';
import { SafesService } from './safes.service';

@ApiTags('safes')
@Controller({
  version: '1',
})
export class SafesController {
  constructor(private readonly service: SafesService) {}

  @Get('chains/:chainId/safes/:safeAddress')
  async getSafe(
    @Param('chainId') chainId: string,
    @Param('safeAddress') safeAddress: string,
  ) {
    return this.service.getSafeInfo(chainId, safeAddress);
  }
}
