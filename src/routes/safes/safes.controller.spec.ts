import { INestApplication } from '@nestjs/common';
import {
  fakeConfigurationService,
  TestConfigurationModule,
} from '../../config/__tests__/test.configuration.module';
import {
  fakeCacheService,
  TestCacheModule,
} from '../../datasources/cache/__tests__/test.cache.module';
import { Test, TestingModule } from '@nestjs/testing';
import { DomainModule } from '../../domain.module';
import {
  mockNetworkService,
  TestNetworkModule,
} from '../../datasources/network/__tests__/test.network.module';
import { DataSourceErrorFilter } from '../common/filters/data-source-error.filter';
import { SafesModule } from './safes.module';
import * as request from 'supertest';
import { faker } from '@faker-js/faker';
import chainFactory from '../../domain/chains/entities/__tests__/chain.factory';
import safeFactory from '../../domain/safe/entities/__tests__/safe.factory';
import masterCopyFactory from '../../domain/chains/entities/__tests__/master-copy.factory';
import contractFactory from '../../domain/contracts/entities/__tests__/contract.factory';
import pageFactory from '../../domain/entities/__tests__/page.factory';
import erc20TransferFactory from '../../domain/safe/entities/__tests__/erc20-transfer.factory';
import multisigTransactionFactory from '../../domain/safe/entities/__tests__/multisig-transaction.factory';
import ethereumTransactionFactory from '../../domain/safe/entities/__tests__/ethereum-transaction.factory';

describe('Safes Controller (Unit)', () => {
  let app: INestApplication;

  beforeAll(async () => {
    fakeConfigurationService.set(
      'safeConfig.baseUri',
      'https://test.safe.config',
    );

    fakeConfigurationService.set(
      'exchange.baseUri',
      'https://test.exchange.service',
    );

    fakeConfigurationService.set('exchange.apiKey', 'https://test.api.key');
  });

  beforeEach(async () => {
    jest.clearAllMocks();
    fakeCacheService.clear();

    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [
        // feature
        SafesModule,
        // common
        DomainModule,
        TestCacheModule,
        TestConfigurationModule,
        TestNetworkModule,
      ],
    }).compile();

    app = moduleFixture.createNestApplication();
    app.useGlobalFilters(new DataSourceErrorFilter());

    await app.init();
  });

  it('should x', async () => {
    const chainId = faker.datatype.number({ min: 0 }).toString();
    const safeAddress = faker.finance.ethereumAddress();
    const chain = chainFactory(chainId);
    const safeInfo = safeFactory(safeAddress);
    const masterCopies = [masterCopyFactory()];
    const masterCopyInfo = contractFactory(masterCopies[0].address);
    const fallbackHandlerInfo = contractFactory(safeInfo.fallbackHandler);
    const guardInfo = contractFactory(safeInfo.guard);
    const transfers = pageFactory(undefined, undefined, undefined, [
      erc20TransferFactory(),
    ]);
    const multisigTransactions = pageFactory(undefined, undefined, undefined, [
      multisigTransactionFactory(),
    ]);
    const allTransactions = pageFactory(undefined, undefined, undefined, [
      ethereumTransactionFactory(),
    ]);

    mockNetworkService.get.mockResolvedValueOnce({ data: chain });
    mockNetworkService.get.mockResolvedValueOnce({ data: safeInfo });
    mockNetworkService.get.mockResolvedValueOnce({ data: masterCopies });
    mockNetworkService.get.mockResolvedValueOnce({ data: masterCopyInfo });
    mockNetworkService.get.mockResolvedValueOnce({ data: fallbackHandlerInfo });
    mockNetworkService.get.mockResolvedValueOnce({ data: guardInfo });
    mockNetworkService.get.mockResolvedValueOnce({ data: transfers });
    mockNetworkService.get.mockResolvedValueOnce({
      data: multisigTransactions,
    });
    mockNetworkService.get.mockResolvedValueOnce({ data: allTransactions });

    await request(app.getHttpServer())
      .get(`/chains/${chainId}/safes/${safeAddress}`)
      .expect(200);
  });
});
