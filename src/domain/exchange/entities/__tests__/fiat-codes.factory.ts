import { FiatCodesExchangeResult } from '../fiat-codes-result.entity';

export default function (
  success?: boolean,
  symbols?: Record<string, string>,
): FiatCodesExchangeResult {
  return <FiatCodesExchangeResult>{
    success: success ?? true,
    symbols: symbols ?? { EUR: 'Euro' },
  };
}
