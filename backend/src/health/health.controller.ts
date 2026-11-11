import { Controller, Get } from '@nestjs/common';
import {
  HealthCheck,
  HealthCheckService,
  MongooseHealthIndicator,
} from '@nestjs/terminus';
import { ApiOkResponse, ApiOperation, ApiTags } from '@nestjs/swagger';

@ApiTags('Health')
@Controller('health')
export class HealthController {
  constructor(
    private readonly health: HealthCheckService,
    private readonly database: MongooseHealthIndicator,
  ) {}

  @Get()
  @ApiOperation({ summary: 'Check whether the API is running' })
  @ApiOkResponse({ description: 'The API is healthy' })
  check() {
    return {
      status: 'ok',
      service: 'slr-api',
      uptime: process.uptime(),
      timestamp: new Date().toISOString(),
    };
  }

  @Get('ready')
  @HealthCheck()
  @ApiOperation({ summary: 'Check whether the API and database are ready' })
  @ApiOkResponse({ description: 'The API and database are ready' })
  readiness() {
    return this.health.check([
      () => this.database.pingCheck('mongodb').withTimeout(3_000),
    ]);
  }
}
