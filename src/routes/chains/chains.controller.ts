import { Controller, Get, Param } from '@nestjs/common';
import { ChainsService } from './chains.service';
import { PaginationData } from '../../common/pagination/pagination.data';
import { RouteUrlDecorator } from '../../common/decorators/route.url.decorator';
import { PaginationDataDecorator } from '../../common/decorators/pagination.data.decorator';
import { Backbone } from '../../domain/backbone/entities/backbone.entity';
import { Chain } from '../../domain/chains/entities/chain.entity';
import { ApiOkResponse, ApiTags } from '@nestjs/swagger';
import { Backbone as ApiBackbone } from './entities/backbone.entity';
import { Page } from '../../domain/entities/page.entity';
import { ChainPage } from './entities/chain-page.entity';

@ApiTags('chains')
@Controller({
  path: 'chains',
  version: '1',
})
export class ChainsController {
  constructor(private readonly chainsService: ChainsService) {}

  @ApiOkResponse({ type: ChainPage })
  @Get()
  async getChains(
    @RouteUrlDecorator() routeUrl: URL,
    @PaginationDataDecorator() paginationData?: PaginationData,
  ): Promise<Page<Chain>> {
    return this.chainsService.getChains(routeUrl, paginationData);
  }

  @ApiOkResponse({ type: ApiBackbone })
  @Get('/:chainId/about/backbone')
  async getBackbone(@Param('chainId') chainId: string): Promise<Backbone> {
    return this.chainsService.getBackbone(chainId);
  }
}
