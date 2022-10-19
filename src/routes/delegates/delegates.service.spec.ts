import { DelegatesService } from './delegates.service';
import { Delegate } from '../delegates/entities/delegate.entity';
import { IDelegateRepository } from '../../domain/delegate/delegate.repository.interface';
import delegateFactory from '../../domain/delegate/entities/__tests__/delegate.factory';
import { faker } from '@faker-js/faker';
import { Page } from '../common/entities/page.entity';
import { DelegateParamsDto } from './entities/delegate-params.entity';

const delegateRepository = {
  getDelegates: jest.fn(),
} as unknown as IDelegateRepository;

const delegateRepositoryMock = jest.mocked(delegateRepository);

describe('DelegatesService', () => {
  const service: DelegatesService = new DelegatesService(
    delegateRepositoryMock,
  );

  beforeEach(async () => {
    jest.clearAllMocks();
  });

  it('should retrieve the delegates from a safe', async () => {
    const chainId = '1';
    const safe = '0x5afe3855358e112b5647b952709e6165e1c1eeee';
    const url = faker.internet.url();
    const routeUrl: Readonly<URL> = new URL(url);
    const delegates = <Page<Delegate>>{
      count: 2,
      results: [delegateFactory(safe), delegateFactory(safe)],
    };
    delegateRepositoryMock.getDelegates.mockResolvedValueOnce(delegates);

    const params = new DelegateParamsDto(safe);
    const actual = await service.getDelegates(chainId, routeUrl, params);

    expect(actual).toEqual(delegates);
    expect(delegateRepositoryMock.getDelegates).toBeCalledTimes(1);
  });
});
