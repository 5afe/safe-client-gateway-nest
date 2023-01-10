import { JsonSchemaService } from '../schema/json-schema.service';
import { GenericValidator } from '../schema/generic.validator';
import { exchangeFiatCodesSchema } from './entities/schemas/exchange-fiat-codes.schema';
import { ExchangeFiatCodesValidator } from './exchange-fiat-codes.validator';
import { exchangeFiatCodesBuilder } from './entities/__tests__/exchange-fiat-codes.builder';

const mockGenericValidator = jest.mocked({
  validate: jest.fn(),
} as unknown as GenericValidator);

const mockJsonSchemaService = jest.mocked({
  addSchema: jest.fn(),
  compile: jest.fn(),
} as unknown as JsonSchemaService);

describe('Fiat Codes Exchange Result validator', () => {
  const validator = new ExchangeFiatCodesValidator(
    mockGenericValidator,
    mockJsonSchemaService,
  );

  it('should mount the proper schema', () => {
    expect(mockJsonSchemaService.compile).toHaveBeenCalledWith(
      exchangeFiatCodesSchema,
    );
  });

  it('should return the data when validation succeed', () => {
    const fiatCodes = exchangeFiatCodesBuilder().build();
    mockGenericValidator.validate.mockReturnValue(fiatCodes);

    const result = validator.validate(fiatCodes);

    expect(result).toBe(fiatCodes);
    expect(mockGenericValidator.validate).toHaveBeenCalledTimes(1);
  });
});
