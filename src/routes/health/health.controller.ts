import { Controller, Get } from '@nestjs/common';
import { ApiOkResponse, ApiTags } from '@nestjs/swagger';
import { Health } from './entities/health.entity';

@ApiTags('health')
@Controller({ path: 'health' })
export class HealthController {
  @ApiOkResponse({ type: Health })
  @Get()
  getHealth(): Health {
    return { status: 'OK' };
  }
}
