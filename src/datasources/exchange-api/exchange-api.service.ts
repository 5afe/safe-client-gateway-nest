import { Inject, Injectable } from '@nestjs/common';
import { RatesExchangeResult } from '../../domain/exchange/entities/rates-exchange-result.entity';
import {
  INetworkService,
  NetworkService,
} from '../network/network.service.interface';
import { IConfigurationService } from '../../common/config/configuration.service.interface';
import { FiatCodesExchangeResult } from '../../domain/exchange/entities/fiat-codes-exchange-result.entity';
import { IExchangeApi } from '../../domain/interfaces/exchange-api.interface';

@Injectable()
export class ExchangeApi implements IExchangeApi {
  private readonly baseUrl: string;
  private readonly apiKey: string;

  constructor(
    @Inject(IConfigurationService)
    private readonly configurationService: IConfigurationService,
    @Inject(NetworkService) private readonly networkService: INetworkService,
  ) {
    this.baseUrl =
      this.configurationService.getOrThrow<string>('exchange.baseUri');
    this.apiKey =
      this.configurationService.getOrThrow<string>('exchange.apiKey');
  }

  async getFiatCodes(): Promise<FiatCodesExchangeResult> {
    const { data } = await this.networkService.get(`${this.baseUrl}/symbols`, {
      params: { access_key: this.apiKey },
    });

    return data;
  }

  async getRates(): Promise<RatesExchangeResult> {
    const { data } = await this.networkService.get(`${this.baseUrl}/latest`, {
      params: { access_key: this.apiKey },
    });

    return data;
  }
}
