import { INestApplication } from '@nestjs/common';
import { Test } from '@nestjs/testing';
import { readFileSync } from 'fs';
import { RedisClientType } from 'redis';
import * as request from 'supertest';
import { AppModule } from '../../../app.module';
import { redisClientFactory } from '../../../__tests__/redis-client.factory';
import { Page } from '../../common/entities/page.entity';
import { MultisigTransaction } from '../entities/multisig-transaction.entity';

describe('Get multisig transactions e2e test', () => {
  let app: INestApplication;
  let redisClient: RedisClientType;
  const chainId = '5'; // Görli testnet

  beforeAll(async () => {
    const moduleRef = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();

    app = moduleRef.createNestApplication();
    await app.init();
    redisClient = await redisClientFactory();
  });

  beforeEach(async () => {
    await redisClient.flushAll();
  });

  it('GET /safes/<address>/multisig-transactions (native token)', async () => {
    const safeAddress = '0x4127839cdf4F73d9fC9a2C2861d8d1799e9DF40C';
    const executionDateGte = '2022-10-20T00:00:00.000Z';
    const executionDateLte = '2022-11-08T00:00:00.000Z';
    const cacheKey = `${chainId}_${safeAddress}_multisig_transactions`;
    const cacheKeyField = `-modified_undefined_true_${executionDateGte}_${executionDateLte}_undefined_undefined_undefined_undefined_undefined`;
    const expectedResponse = getJsonResource(
      'e2e/native-token-expected-response.json',
    );

    await request(app.getHttpServer())
      .get(
        `/chains/${chainId}/safes/${safeAddress}/multisig-transactions?execution_date__gte=${executionDateGte}&execution_date__lte=${executionDateLte}`,
      )
      .expect(200)
      .then(({ body }) => {
        expect(sortTransactionsByTimestamp(body)).toEqual(
          sortTransactionsByTimestamp(expectedResponse),
        );
      });

    const cacheContent = await redisClient.hGet(cacheKey, cacheKeyField);
    expect(cacheContent).not.toBeNull();
  });

  it('GET /safes/<address>/multisig-transactions (ERC-721)', async () => {
    const safeAddress = '0x4127839cdf4F73d9fC9a2C2861d8d1799e9DF40C';
    const executionDateGte = '2022-11-20T00:00:00.000Z';
    const executionDateLte = '2022-12-06T00:00:00.000Z';
    const cacheKey = `${chainId}_${safeAddress}_multisig_transactions`;
    const cacheKeyField = `-modified_undefined_true_${executionDateGte}_${executionDateLte}_undefined_undefined_undefined_undefined_undefined`;
    const expectedResponse = getJsonResource(
      'e2e/erc721-expected-response.json',
    );

    await request(app.getHttpServer())
      .get(
        `/chains/${chainId}/safes/${safeAddress}/multisig-transactions?execution_date__gte=${executionDateGte}&execution_date__lte=${executionDateLte}`,
      )
      .expect(200)
      .then(({ body }) => {
        expect(sortTransactionsByTimestamp(body)).toEqual(
          sortTransactionsByTimestamp(expectedResponse),
        );
      });

    const cacheContent = await redisClient.hGet(cacheKey, cacheKeyField);
    expect(cacheContent).not.toBeNull();
  });

  afterAll(async () => {
    await app.close();
    await redisClient.flushAll();
    await redisClient.quit();
  });
});

const getJsonResource = (relativePath: string) => {
  const basePath = 'src/routes/transactions/__tests__/resources';
  return JSON.parse(readFileSync(`${basePath}/${relativePath}`, 'utf8'));
};

const sortTransactionsByTimestamp = (
  page: Partial<Page<MultisigTransaction>>,
) => {
  return page?.results?.sort(
    (a, b) => (a.transaction?.timestamp || 0) - (b.transaction?.timestamp || 0),
  );
};