import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication } from '@nestjs/common';
import * as request from 'supertest';
import axios from 'axios';
import { BalancesModule } from './balances.module';
import safeBalanceFactory from '../services/transaction-service/entities/__tests__/balance.factory';
import exchangeResultFactory from '../services/exchange/entities/__tests__/exchange.factory';
import chainFactory from '../services/config-service/entities/__tests__/chain.factory';
import configuration from '../config/configuration';

jest.mock('axios');
const axiosMock = axios as jest.Mocked<typeof axios>;

describe('Balances Controller (Unit)', () => {
  let app: INestApplication;

  beforeEach(async () => {
    jest.clearAllMocks();
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [BalancesModule],
    }).compile();
    app = moduleFixture.createNestApplication();
    await app.init();
  });

  afterAll(async () => {
    await app.close();
  });

  describe('GET /balances', () => {
    it(`Success`, async () => {
      const chainId = '1';
      const safeAddress = '0x0000000000000000000000000000000000000001';
      const transactionServiceBalancesResponse = safeBalanceFactory(1);
      const exchangeResponse = exchangeResultFactory({ USD: 2.0 });
      const chainResponse = chainFactory(chainId);
      axiosMock.get.mockImplementation((url) => {
        if (url == `https://safe-config.gnosis.io/api/v1/chains/${chainId}`) {
          return Promise.resolve({ data: chainResponse });
        } else if (
          url ==
          `${chainResponse.transactionService}/api/v1/safes/${safeAddress}/balances/usd/`
        ) {
          return Promise.resolve({
            data: transactionServiceBalancesResponse,
          });
        } else if (url == configuration().exchange.baseUri) {
          return Promise.resolve({ data: exchangeResponse });
        } else {
          return Promise.reject(new Error(`Could not match ${url}`));
        }
      });

      const expectedBalance = transactionServiceBalancesResponse[0];
      await request(app.getHttpServer())
        .get(`/chains/${chainId}/safes/${safeAddress}/balances/usd`)
        .expect(200)
        .expect({
          fiatTotal: expectedBalance.fiatBalance,
          items: [
            {
              tokenInfo: {
                tokenType: 'ERC20',
                address: expectedBalance.tokenAddress,
                decimals: expectedBalance.token.decimals,
                symbol: expectedBalance.token.symbol,
                name: expectedBalance.token.name,
                logoUri: expectedBalance.token.logo_uri,
              },
              balance: expectedBalance.balance.toString(),
              fiatBalance: expectedBalance.fiatBalance,
              fiatConversion: expectedBalance.fiatConversion,
            },
          ],
        });

      // 4 Network calls are expected (1. Chain data, 2. Balances, 3. Exchange API, 4. Chain data (Native Currency)
      // Once caching is in place we don't need to retrieve the Chain Data again
      expect(axiosMock.get.mock.calls.length).toBe(4);
      expect(axiosMock.get.mock.calls[0][0]).toBe(
        'https://safe-config.gnosis.io/api/v1/chains/1',
      );
      expect(axiosMock.get.mock.calls[1][0]).toBe(
        `${chainResponse.transactionService}/api/v1/safes/0x0000000000000000000000000000000000000001/balances/usd/`,
      );
      expect(axiosMock.get.mock.calls[1][1]).toStrictEqual({
        params: { trusted: undefined, excludeSpam: undefined },
      });
      expect(axiosMock.get.mock.calls[2][0]).toBe(
        configuration().exchange.baseUri,
      );
    });

    describe('Exchange API Error', () => {
      it(`500 error response`, async () => {
        const chainId = '1';
        const safeAddress = '0x0000000000000000000000000000000000000001';
        const transactionServiceBalancesResponse = safeBalanceFactory(1);
        const chainResponse = chainFactory(chainId);
        axiosMock.get.mockImplementation((url) => {
          if (url == `https://safe-config.gnosis.io/api/v1/chains/${chainId}`) {
            return Promise.resolve({ data: chainResponse });
          } else if (
            url ==
            `${chainResponse.transactionService}/api/v1/safes/${safeAddress}/balances/usd/`
          ) {
            return Promise.resolve({
              data: transactionServiceBalancesResponse,
            });
          } else if (url == configuration().exchange.baseUri) {
            return Promise.reject({ status: 500 });
          } else {
            return Promise.reject(new Error(`Could not match ${url}`));
          }
        });

        await request(app.getHttpServer())
          .get(`/chains/${chainId}/safes/${safeAddress}/balances/usd`)
          .expect(503)
          .expect({
            message: 'Service unavailable',
            code: 503,
          });

        expect(axiosMock.get.mock.calls.length).toBe(3);
      });

      it(`No rates returned`, async () => {
        const chainId = '1';
        const safeAddress = '0x0000000000000000000000000000000000000001';
        const transactionServiceBalancesResponse = safeBalanceFactory(1);
        const exchangeResponse = {}; // no rates
        const chainResponse = chainFactory(chainId);
        axiosMock.get.mockImplementation((url) => {
          if (url == `https://safe-config.gnosis.io/api/v1/chains/${chainId}`) {
            return Promise.resolve({ data: chainResponse });
          } else if (
            url ==
            `${chainResponse.transactionService}/api/v1/safes/${safeAddress}/balances/usd/`
          ) {
            return Promise.resolve({
              data: transactionServiceBalancesResponse,
            });
          } else if (url == configuration().exchange.baseUri) {
            return Promise.resolve({ data: exchangeResponse });
          } else {
            return Promise.reject(new Error(`Could not match ${url}`));
          }
        });

        await request(app.getHttpServer())
          .get(`/chains/${chainId}/safes/${safeAddress}/balances/usd`)
          .expect(500)
          .expect({
            statusCode: 500,
            message: 'Exchange rates unavailable',
            error: 'Internal Server Error',
          });

        expect(axiosMock.get.mock.calls.length).toBe(3);
      });

      it(`from-rate missing`, async () => {
        const chainId = '1';
        const safeAddress = '0x0000000000000000000000000000000000000001';
        const transactionServiceBalancesResponse = safeBalanceFactory(1);
        const exchangeResponse = exchangeResultFactory({ XYZ: 2 }); // Returns different rate than USD
        const chainResponse = chainFactory(chainId);
        axiosMock.get.mockImplementation((url) => {
          if (url == `https://safe-config.gnosis.io/api/v1/chains/${chainId}`) {
            return Promise.resolve({ data: chainResponse });
          } else if (
            url ==
            `${chainResponse.transactionService}/api/v1/safes/${safeAddress}/balances/usd/`
          ) {
            return Promise.resolve({
              data: transactionServiceBalancesResponse,
            });
          } else if (url == configuration().exchange.baseUri) {
            return Promise.resolve({ data: exchangeResponse });
          } else {
            return Promise.reject(new Error(`Could not match ${url}`));
          }
        });

        await request(app.getHttpServer())
          .get(`/chains/${chainId}/safes/${safeAddress}/balances/usd`)
          .expect(500)
          .expect({
            statusCode: 500,
            message: 'Exchange rate for USD is not available',
            error: 'Internal Server Error',
          });

        expect(axiosMock.get.mock.calls.length).toBe(3);
      });

      it(`from-rate is 0`, async () => {
        const chainId = '1';
        const safeAddress = '0x0000000000000000000000000000000000000001';
        const transactionServiceBalancesResponse = safeBalanceFactory(1);
        const exchangeResponse = exchangeResultFactory({ USD: 0 }); // rate is zero
        const chainResponse = chainFactory(chainId);
        axiosMock.get.mockImplementation((url) => {
          if (url == `https://safe-config.gnosis.io/api/v1/chains/${chainId}`) {
            return Promise.resolve({ data: chainResponse });
          } else if (
            url ==
            `${chainResponse.transactionService}/api/v1/safes/${safeAddress}/balances/usd/`
          ) {
            return Promise.resolve({
              data: transactionServiceBalancesResponse,
            });
          } else if (url == configuration().exchange.baseUri) {
            return Promise.resolve({ data: exchangeResponse });
          } else {
            return Promise.reject(new Error(`Could not match ${url}`));
          }
        });

        await request(app.getHttpServer())
          .get(`/chains/${chainId}/safes/${safeAddress}/balances/usd`)
          .expect(500)
          .expect({
            statusCode: 500,
            message: 'Exchange rate for USD is not available',
            error: 'Internal Server Error',
          });

        expect(axiosMock.get.mock.calls.length).toBe(3);
      });

      it(`to-rate missing`, async () => {
        const chainId = '1';
        const toRate = 'XYZ';
        const safeAddress = '0x0000000000000000000000000000000000000001';
        const transactionServiceBalancesResponse = safeBalanceFactory(1);
        const exchangeResponse = exchangeResultFactory({ USD: 2 }); // Returns different rate than XYZ
        const chainResponse = chainFactory(chainId);
        axiosMock.get.mockImplementation((url) => {
          if (url == `https://safe-config.gnosis.io/api/v1/chains/${chainId}`) {
            return Promise.resolve({ data: chainResponse });
          } else if (
            url ==
            `${chainResponse.transactionService}/api/v1/safes/${safeAddress}/balances/usd/`
          ) {
            return Promise.resolve({
              data: transactionServiceBalancesResponse,
            });
          } else if (url == configuration().exchange.baseUri) {
            return Promise.resolve({ data: exchangeResponse });
          } else {
            return Promise.reject(new Error(`Could not match ${url}`));
          }
        });

        await request(app.getHttpServer())
          .get(`/chains/${chainId}/safes/${safeAddress}/balances/${toRate}`)
          .expect(500)
          .expect({
            statusCode: 500,
            message: 'Exchange rate for XYZ is not available',
            error: 'Internal Server Error',
          });

        expect(axiosMock.get.mock.calls.length).toBe(3);
      });
    });

    describe('Transaction Service API Error', () => {
      it(`500 error response`, async () => {
        const chainId = '1';
        const safeAddress = '0x0000000000000000000000000000000000000001';
        const exchangeResponse = exchangeResultFactory({ USD: 2.0 });
        const chainResponse = chainFactory(chainId);
        axiosMock.get.mockImplementation((url) => {
          if (url == `https://safe-config.gnosis.io/api/v1/chains/${chainId}`) {
            return Promise.resolve({ data: chainResponse });
          } else if (
            url ==
            `${chainResponse.transactionService}/api/v1/safes/${safeAddress}/balances/usd/`
          ) {
            return Promise.reject({ status: 500 });
          } else if (url == configuration().exchange.baseUri) {
            return Promise.resolve({ data: exchangeResponse });
          } else {
            return Promise.reject(new Error(`Could not match ${url}`));
          }
        });

        await request(app.getHttpServer())
          .get(`/chains/${chainId}/safes/${safeAddress}/balances/usd`)
          .expect(503)
          .expect({ message: 'Service unavailable', code: 503 });

        expect(axiosMock.get.mock.calls.length).toBe(2);
      });
    });
  });
});
