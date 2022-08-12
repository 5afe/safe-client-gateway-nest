import { Controller, Get, Param } from '@nestjs/common';
import { ChainsService } from './chains.service';
import { Backbone } from './entities/backbone.entity';
import { Chain } from './entities/chain.entity';
import { Page } from './entities/page.entity';

@Controller({
  path: 'chains',
  version: '1',
})
export class ChainsController {
  constructor(private readonly chainsService: ChainsService) {}

  @Get()
  async getChains(): Promise<Page<Chain>> {
    return this.chainsService.getChains();
  }

  @Get('/:chainId/about/backbone')
  async getBackbone(@Param('chainId') chainId: string): Promise<Backbone> {
    return this.chainsService.getBackbone(chainId);
  }
}
