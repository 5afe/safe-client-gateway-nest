import { INestApplication } from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';
import * as request from 'supertest';
import chainFactory from '../../domain/chains/entities/__tests__/chain.factory';
import { ChainsModule } from './chains.module';
import {
  mockNetworkService,
  TestNetworkModule,
} from '../../datasources/network/__tests__/test.network.module';
import {
  fakeConfigurationService,
  TestConfigurationModule,
} from '../../config/__tests__/test.configuration.module';
import {
  fakeCacheService,
  TestCacheModule,
} from '../../datasources/cache/__tests__/test.cache.module';
import { DomainModule } from '../../domain.module';
import { Page } from '../../domain/entities/page.entity';
import { Chain } from '../../domain/chains/entities/chain.entity';
import { Backbone } from '../../domain/backbone/entities/backbone.entity';
import backboneFactory from '../../domain/balances/entities/__tests__/backbone.factory';
import { DataSourceErrorFilter } from '../common/filters/data-source-error.filter';
import { MasterCopy as DomainMasterCopy } from '../../domain/chains/entities/master-copies.entity';
import masterCopyFactory from '../../domain/chains/entities/__tests__/master-copy.factory';
import { MasterCopy } from './entities/master-copy.entity';
import { NetworkResponseError } from '../../datasources/network/entities/network.error.entity';

describe('Chains Controller (Unit)', () => {
  let app: INestApplication;

  const chainsResponse: Page<Chain> = {
    count: 2,
    next: undefined,
    previous: undefined,
    results: [chainFactory(), chainFactory()],
  };

  const chainResponse: Chain = chainFactory();
  const backboneResponse: Backbone = backboneFactory();

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
        ChainsModule,
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

  describe('GET /chains', () => {
    it('Success', async () => {
      mockNetworkService.get.mockResolvedValueOnce({ data: chainsResponse });

      await request(app.getHttpServer())
        .get('/chains')
        .expect(200)
        .expect(<Page<Chain>>{
          count: chainsResponse.count,
          results: chainsResponse.results,
        });

      expect(mockNetworkService.get).toBeCalledTimes(1);
      expect(mockNetworkService.get).toBeCalledWith(
        'https://test.safe.config/api/v1/chains',
        { params: { limit: undefined, offset: undefined } },
      );
    });

    it('Failure: network service fails', async () => {
      mockNetworkService.get.mockRejectedValueOnce(<NetworkResponseError>{
        status: 500,
      });

      await request(app.getHttpServer()).get('/chains').expect(500).expect({
        message: 'An error occurred',
        code: 500,
      });

      expect(mockNetworkService.get).toBeCalledTimes(1);
      expect(mockNetworkService.get).toBeCalledWith(
        'https://test.safe.config/api/v1/chains',
        { params: { limit: undefined, offset: undefined } },
      );
    });

    it('Failure: received data is not valid', async () => {
      mockNetworkService.get.mockResolvedValueOnce({
        data: {
          ...chainsResponse,
          results: [...chainsResponse.results, { invalid: 'item' }],
        },
      });

      await request(app.getHttpServer()).get('/chains').expect(500).expect({
        message: 'Validation failed',
        code: 42,
        arguments: [],
      });

      expect(mockNetworkService.get).toBeCalledTimes(1);
      expect(mockNetworkService.get).toBeCalledWith(
        'https://test.safe.config/api/v1/chains',
        { params: { limit: undefined, offset: undefined } },
      );
    });
  });

  describe('GET /:chainId/about/backbone', () => {
    it('Success', async () => {
      mockNetworkService.get.mockResolvedValueOnce({ data: chainResponse });
      mockNetworkService.get.mockResolvedValueOnce({ data: backboneResponse });

      await request(app.getHttpServer())
        .get('/chains/1/about/backbone')
        .expect(200)
        .expect(backboneResponse);

      expect(mockNetworkService.get).toBeCalledTimes(2);
      expect(mockNetworkService.get.mock.calls[0][0]).toBe(
        'https://test.safe.config/api/v1/chains/1',
      );
      expect(mockNetworkService.get.mock.calls[1][0]).toBe(
        `${chainResponse.transactionService}/api/v1/about`,
      );
      expect(mockNetworkService.get.mock.calls[1][1]).toBe(undefined);
    });

    it('Failure getting the chain', async () => {
      mockNetworkService.get.mockRejectedValueOnce({
        status: 400,
      });

      await request(app.getHttpServer())
        .get('/chains/1/about/backbone')
        .expect(400)
        .expect({
          message: 'An error occurred',
          code: 400,
        });

      expect(mockNetworkService.get).toBeCalledTimes(1);
      expect(mockNetworkService.get).toBeCalledWith(
        'https://test.safe.config/api/v1/chains/1',
        undefined,
      );
    });

    it('Failure getting the backbone data', async () => {
      mockNetworkService.get.mockResolvedValueOnce({ data: chainResponse });
      mockNetworkService.get.mockRejectedValueOnce({
        status: 502,
      });

      await request(app.getHttpServer())
        .get('/chains/1/about/backbone')
        .expect(502)
        .expect({
          message: 'An error occurred',
          code: 502,
        });

      expect(mockNetworkService.get).toBeCalledTimes(2);
      expect(mockNetworkService.get.mock.calls[0][0]).toBe(
        'https://test.safe.config/api/v1/chains/1',
      );
      expect(mockNetworkService.get.mock.calls[1][0]).toBe(
        `${chainResponse.transactionService}/api/v1/about`,
      );
      expect(mockNetworkService.get.mock.calls[1][1]).toBe(undefined);
    });
  });

  describe('GET /:chainId/about/master-copies', () => {
    it('Success', async () => {
      mockNetworkService.get.mockResolvedValueOnce({ data: chainResponse });
      const domainMasterCopiesResponse: DomainMasterCopy[] = [
        masterCopyFactory('test_address_1', 'test_version_1'),
        masterCopyFactory('test_address_2', 'test_version_2'),
      ];
      mockNetworkService.get.mockResolvedValueOnce({
        data: domainMasterCopiesResponse,
      });
      const masterCopiesResponse = [
        <MasterCopy>{
          address: 'test_address_1',
          version: 'test_version_1',
        },
        <MasterCopy>{
          address: 'test_address_2',
          version: 'test_version_2',
        },
      ];

      await request(app.getHttpServer())
        .get('/chains/1/about/master-copies')
        .expect(200)
        .expect(masterCopiesResponse);

      expect(mockNetworkService.get).toBeCalledTimes(2);
      expect(mockNetworkService.get.mock.calls[0][0]).toBe(
        'https://test.safe.config/api/v1/chains/1',
      );
      expect(mockNetworkService.get.mock.calls[1][0]).toBe(
        `${chainResponse.transactionService}/api/v1/about/master-copies/`,
      );
      expect(mockNetworkService.get.mock.calls[1][1]).toBe(undefined);
    });

    it('Failure getting the chain', async () => {
      mockNetworkService.get.mockRejectedValueOnce({
        status: 400,
      });

      await request(app.getHttpServer())
        .get('/chains/1/about/master-copies')
        .expect(400)
        .expect({
          message: 'An error occurred',
          code: 400,
        });

      expect(mockNetworkService.get).toBeCalledTimes(1);
      expect(mockNetworkService.get).toBeCalledWith(
        'https://test.safe.config/api/v1/chains/1',
        undefined,
      );
    });

    it('Should fail getting the master-copies data', async () => {
      mockNetworkService.get.mockResolvedValueOnce({ data: chainResponse });
      mockNetworkService.get.mockRejectedValueOnce({
        status: 502,
      });

      await request(app.getHttpServer())
        .get('/chains/1/about/master-copies')
        .expect(502)
        .expect({
          message: 'An error occurred',
          code: 502,
        });

      expect(mockNetworkService.get).toBeCalledTimes(2);
      expect(mockNetworkService.get.mock.calls[0][0]).toBe(
        'https://test.safe.config/api/v1/chains/1',
      );
      expect(mockNetworkService.get.mock.calls[1][0]).toBe(
        `${chainResponse.transactionService}/api/v1/about/master-copies/`,
      );
      expect(mockNetworkService.get.mock.calls[1][1]).toBe(undefined);
    });

    it('Should return validation error', async () => {
      mockNetworkService.get.mockResolvedValueOnce({ data: chainResponse });
      const domainMasterCopiesResponse = [
        { address: 1223, safe: 'error' },
        masterCopyFactory('test_address_2', 'test_version_2'),
      ];
      mockNetworkService.get.mockResolvedValueOnce({
        data: domainMasterCopiesResponse,
      });

      await request(app.getHttpServer())
        .get('/chains/1/about/master-copies')
        .expect(500)
        .expect({
          message: 'Validation failed',
          code: 42,
          arguments: [],
        });
    });
  });
});
