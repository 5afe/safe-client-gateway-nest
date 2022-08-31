import { faker } from '@faker-js/faker';
import { Chain, NativeCurrency } from '../../../../chains/entities';
import nativeCurrencyFactory from './native.currency.factory';

export default function (
  chainId?: string,
  chainName?: string,
  transactionService?: string,
  vpcTransactionService?: string,
  nativeCurrency?: NativeCurrency,
): Chain {
  return <Chain>{
    chainId: chainId || faker.datatype.number().toString(),
    chainName: chainId || faker.company.name(),
    transactionService: transactionService || faker.internet.url(),
    vpcTransactionService: vpcTransactionService || faker.internet.url(),
    nativeCurrency: nativeCurrency || nativeCurrencyFactory(),
  };
}
