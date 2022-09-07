import { Inject, Injectable, Logger } from '@nestjs/common';
import { Chain } from '../../domain/chains/entities/chain.entity';
import { TransactionApi } from './transaction-api.service';
import { CacheFirstDataSource } from '../cache/cache.first.data.source';
import { ITransactionApiManager } from '../../domain/interfaces/transaction-api.manager.interface';
import { IConfigApi } from '../../domain/interfaces/config-api.interface';
import { ValidationErrorFactory } from '../errors/validation-error-factory';
import { JsonSchemaService } from '../../common/schemas/json-schema.service';

@Injectable()
export class TransactionApiManager implements ITransactionApiManager {
  private readonly logger = new Logger(TransactionApiManager.name);
  private transactionApiMap: Record<string, TransactionApi> = {};

  constructor(
    @Inject(IConfigApi) private readonly configApi: IConfigApi,
    private readonly dataSource: CacheFirstDataSource,
    private readonly validationErrorFactory: ValidationErrorFactory,
    private readonly jsonSchemaService: JsonSchemaService,
  ) {}

  async getTransactionApi(chainId: string): Promise<TransactionApi> {
    this.logger.log(`Getting TransactionApi instance for chain ${chainId}`);
    const transactionApi = this.transactionApiMap[chainId];
    if (transactionApi !== undefined) return transactionApi;

    this.logger.log(
      `Transaction API for chain ${chainId} not available. Fetching from the Config Service`,
    );
    const chain: Chain = await this.configApi.getChain(chainId);
    this.transactionApiMap[chainId] = new TransactionApi(
      chainId,
      chain.transactionService,
      this.dataSource,
      this.validationErrorFactory,
      this.jsonSchemaService,
    );
    return this.transactionApiMap[chainId];
  }
}
