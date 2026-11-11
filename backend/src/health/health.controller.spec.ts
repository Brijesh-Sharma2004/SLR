import { jest } from '@jest/globals';
import { Test, type TestingModule } from '@nestjs/testing';
import {
  HealthCheckService,
  MongooseHealthIndicator,
} from '@nestjs/terminus';
import { HealthController } from './health.controller.js';

type HealthCheckFn = (
  checks: Array<() => Promise<unknown>>,
) => Promise<unknown>;
type PingCheckFn = (key: string) => {
  withTimeout: (milliseconds: number) => Promise<unknown>;
};

describe('HealthController', () => {
  let controller: HealthController;
  let healthCheckService: { check: jest.Mock<HealthCheckFn> };
  let database: { pingCheck: jest.Mock<PingCheckFn> };
  let withTimeout: jest.Mock<(milliseconds: number) => Promise<unknown>>;

  beforeEach(async () => {
    withTimeout = jest
      .fn<(milliseconds: number) => Promise<unknown>>()
      .mockResolvedValue({ mongodb: { status: 'up' } });
    healthCheckService = {
      check: jest.fn<HealthCheckFn>().mockResolvedValue({
        status: 'ok',
        info: { mongodb: { status: 'up' } },
        error: {},
        details: { mongodb: { status: 'up' } },
      }),
    };
    database = {
      pingCheck: jest.fn<PingCheckFn>().mockReturnValue({ withTimeout }),
    };

    const module: TestingModule = await Test.createTestingModule({
      controllers: [HealthController],
      providers: [
        { provide: HealthCheckService, useValue: healthCheckService },
        { provide: MongooseHealthIndicator, useValue: database },
      ],
    }).compile();

    controller = module.get<HealthController>(HealthController);
  });

  it('reports the API as healthy', () => {
    const result = controller.check();

    expect(result.status).toBe('ok');
    expect(result.service).toBe('slr-api');
    expect(result.uptime).toBeGreaterThanOrEqual(0);
    expect(typeof result.timestamp).toBe('string');
  });

  it('checks the database for readiness', async () => {
    await controller.readiness();

    expect(healthCheckService.check).toHaveBeenCalledTimes(1);

    const checks = healthCheckService.check.mock.calls[0]?.[0];

    if (!checks) {
      throw new Error('Health check was not registered');
    }

    await checks[0]();

    expect(database.pingCheck).toHaveBeenCalledWith('mongodb');
    expect(withTimeout).toHaveBeenCalledWith(3_000);
  });
});
