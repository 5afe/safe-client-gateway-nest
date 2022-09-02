import { JSONSchemaType } from 'ajv';
import { FiatCodesExchangeResult } from '../fiat-codes-result.entity';

const fiatCodesExchangeResultSchema: JSONSchemaType<FiatCodesExchangeResult> = {
  type: 'object',
  properties: {
    success: { type: 'boolean' },
    symbols: { type: 'object', nullable: true },
  },
  required: [],
};

export { fiatCodesExchangeResultSchema };
