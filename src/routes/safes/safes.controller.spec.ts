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
import safeFactory from '../../domain/safe/entities/__tests__/safe.factory';
import masterCopyFactory from '../../domain/chains/entities/__tests__/master-copy.factory';
import contractFactory from '../../domain/contracts/entities/__tests__/contract.factory';
import pageFactory from '../../domain/entities/__tests__/page.factory';
import erc20TransferFactory from '../../domain/safe/entities/__tests__/erc20-transfer.factory';
import ethereumTransactionFactory from '../../domain/safe/entities/__tests__/ethereum-transaction.factory';
import erc721TransferFactory from '../../domain/safe/entities/__tests__/erc721-transfer.factory';
import { ERC721Transfer } from '../../domain/safe/entities/transfer.entity';
import { MultisigTransaction } from '../../domain/safe/entities/multisig-transaction.entity';
import { ChainBuilder } from '../../domain/chains/entities/__tests__/chain.factory';
import { MultisigTransactionBuilder } from '../../domain/safe/entities/__tests__/multisig-transaction.factory';

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
    const chain = new ChainBuilder().withChainId(chainId).build();
    const owners = [faker.finance.ethereumAddress()];
    const safeInfo = safeFactory(safeAddress, undefined, undefined, owners);
    const masterCopies = [masterCopyFactory()];
    const masterCopyInfo = contractFactory(masterCopies[0].address);
    const fallbackHandlerInfo = contractFactory(safeInfo.fallbackHandler);
    const guardInfo = contractFactory(safeInfo.guard);
    const transfers = pageFactory(undefined, undefined, undefined, [
      erc20TransferFactory(),
      erc721TransferFactory(),
    ]);
    const multisigTransactions = pageFactory(undefined, undefined, undefined, [
      new MultisigTransactionBuilder().build(),
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

    const expectedCollectiblesTag = Math.floor(
      (transfers.results[1] as ERC721Transfer).executionDate.valueOf() / 1000,
    );
    const txQueuedTag = Math.floor(
      (
        multisigTransactions.results[0] as MultisigTransaction
      ).modified!.valueOf() / 1000,
    );
    await request(app.getHttpServer())
      .get(`/chains/${chainId}/safes/${safeAddress}`)
      .expect(200);
    // .expect({
    //   address: { value: safeInfo.address },
    //   chainId: chain.chainId,
    //   nonce: safeInfo.nonce,
    //   threshold: safeInfo.threshold,
    //   owners: [{ value: owners[0] }],
    //   implementation: {
    //     value: masterCopyInfo.address,
    //     name: masterCopyInfo.displayName,
    //     logoUri: masterCopyInfo.logoUri,
    //   },
    //   implementationVersionState: 'UNKNOWN',
    //   collectiblesTag: expectedCollectiblesTag,
    //   txQueuedTag: txQueuedTag,
    //   txHistoryTag: '1670426044',
    //   modules: null,
    //   fallbackHandler: {
    //     value: '0xbbc923fe82c0f1b87cf7b47e5bf40cfb74bca44d',
    //     name: 'Metal Electronics',
    //     logoUri: 'https://generous-feeling.info',
    //   },
    //   guard: {
    //     value: '0xcc4e766c71fafc0eb6bdb9bcce5dc9707d5cba3c',
    //     name: 'empower Operations Spain',
    //     logoUri: 'http://obedient-sac.com',
    //   },
    //   version: '2.8.8',
    // });
  });
});
