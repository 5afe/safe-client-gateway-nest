import { faker } from '@faker-js/faker';

export default function (
  owner?: string,
  signature?: string,
  signatureType?: string,
  submissionDate?: Date,
  transactionHash?: string,
): unknown {
  return {
    owner: owner ?? faker.finance.ethereumAddress(),
    signature:
      signature === undefined ? faker.datatype.hexadecimal() : signature,
    signatureType: signatureType ?? faker.datatype.string(),
    submissionDate:
      submissionDate?.toISOString() ?? faker.date.recent().toISOString(),
    transactionHash:
      transactionHash === undefined
        ? faker.datatype.hexadecimal()
        : transactionHash,
  };
}
