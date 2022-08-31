import { Balance } from './entities/balance.entity';
import { TransactionApi } from './transaction-api.service';
import { Backbone } from '../../chains/entities';
import { CacheFirstDataSource } from '../cache/cache.first.data.source';
import { ValidationErrorFactory } from '../errors/validation-error-factory';
import { HttpException } from '@nestjs/common';
import backboneFactory from '../../chains/entities/__tests__/backbone.factory';
import { balanceFactory } from './entities/__tests__/balance.factory';

const BALANCES: Balance[] = [balanceFactory(), balanceFactory()];
const BACKBONE: Backbone = backboneFactory();

const dataSource = {
  get: jest.fn(),
} as unknown as CacheFirstDataSource;

const mockDataSource = jest.mocked(dataSource);

const validationErrorFactory = {
  from: jest.fn().mockReturnValue(new HttpException('testErr', 500)),
} as unknown as ValidationErrorFactory;

const mockValidationErrorFactory = jest.mocked(validationErrorFactory);

describe('TransactionApi', () => {
  const service: TransactionApi = new TransactionApi(
    '1',
    'baseUrl',
    mockDataSource,
    mockValidationErrorFactory,
  );

  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('Balances', () => {
    it('should return the balances retrieved', async () => {
      mockDataSource.get.mockResolvedValue(BALANCES);
      const balances = await service.getBalances('test', true, true);
      expect(balances).toBe(BALANCES);
    });

    it('should throw a validation error when a unexpected payload arrives', async () => {
      const invalidBalances = [
        ...BALANCES,
        {
          ...balanceFactory(),
          fiatBalance: {},
        },
      ];
      mockDataSource.get.mockResolvedValueOnce(invalidBalances);
      await expect(service.getBackbone()).rejects.toThrow();
      expect(mockValidationErrorFactory.from).toHaveBeenCalledTimes(1);
    });

    it('should forward error', async () => {
      mockDataSource.get = jest
        .fn()
        .mockRejectedValueOnce(new Error('Some error'));

      await expect(service.getBalances('test', true, true)).rejects.toThrow(
        'Some error',
      );

      expect(mockDataSource.get).toHaveBeenCalledTimes(1);
    });
  });

  describe('Backbone', () => {
    it('should return the backbone retrieved', async () => {
      mockDataSource.get.mockResolvedValueOnce(BACKBONE);
      const backbone = await service.getBackbone();
      expect(backbone).toBe(BACKBONE);
    });

    it('should throw a validation error when a unexpected payload arrives', async () => {
      const invalidBackbone = {
        ...BACKBONE,
        name: [],
      };
      mockDataSource.get.mockResolvedValueOnce(invalidBackbone);
      await expect(service.getBackbone()).rejects.toThrow();
      expect(mockValidationErrorFactory.from).toHaveBeenCalledTimes(1);
    });

    it('should forward error', async () => {
      const err = new Error('testErr');
      mockDataSource.get = jest.fn().mockRejectedValueOnce(err);
      await expect(service.getBackbone()).rejects.toThrow(err.message);
      expect(mockDataSource.get).toHaveBeenCalledTimes(1);
    });
  });
});
