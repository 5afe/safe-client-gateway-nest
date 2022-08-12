import { Test, TestingModule } from '@nestjs/testing';
import { SafeConfigModule } from '../services/safe-config/safe-config.module';
import { SafeTransactionModule } from '../services/safe-transaction/safe-transaction.module';
import { ChainsService } from './chains.service';

describe('ChainsService', () => {
  let service: ChainsService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      imports: [SafeConfigModule, SafeTransactionModule],
      providers: [ChainsService],
    }).compile();

    service = module.get<ChainsService>(ChainsService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  // TODO: implement actually useful tests
});
