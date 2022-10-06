import { ExchangeApi } from './exchange-api.service';
import exchangeRatesFactory from '../../domain/exchange/entities/__tests__/exchange-rates.factory';
import exchangeFiatCodesFactory from '../../domain/exchange/entities/__tests__/exchange-fiat-codes.factory';
import { FakeConfigurationService } from '../../config/__tests__/fake.configuration.service';
import { mockNetworkService } from '../network/__tests__/test.network.module';
import { faker } from '@faker-js/faker';

describe('ExchangeApi', () => {
  let service: ExchangeApi;
  let fakeConfigurationService: FakeConfigurationService;

  beforeAll(async () => {
    fakeConfigurationService = new FakeConfigurationService();
    fakeConfigurationService.set('exchange.baseUri', faker.internet.url());
    fakeConfigurationService.set(
      'exchange.apiKey',
      faker.random.alphaNumeric(),
    );
  });

  beforeEach(async () => {
    jest.clearAllMocks();
    service = new ExchangeApi(fakeConfigurationService, mockNetworkService);
  });

  it('should error if configuration is not defined', async () => {
    const fakeConfigurationService = new FakeConfigurationService();
    await expect(
      () => new ExchangeApi(fakeConfigurationService, mockNetworkService),
    ).toThrow();
  });

  it('Should return the fiatCodes', async () => {
    const expectedFiatCodes = exchangeFiatCodesFactory(true, {
      USD: 'Dollar',
    });
    mockNetworkService.get.mockResolvedValue({ data: expectedFiatCodes });

    const fiatCodes = await service.getFiatCodes();

    expect(fiatCodes).toBe(expectedFiatCodes);
  });

  it('Should return the exchange rates', async () => {
    const expectedRates = exchangeRatesFactory(true, {
      USD: faker.datatype.number(),
    });
    mockNetworkService.get.mockResolvedValue({ data: expectedRates });

    const rates = await service.getRates();

    expect(rates).toBe(expectedRates);
  });
});
