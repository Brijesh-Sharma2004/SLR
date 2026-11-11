import type { INestApplication } from '@nestjs/common';
import request from 'supertest';
import type { App } from 'supertest/types.js';
import { createE2eApp } from './utils/create-e2e-app.js';

describe('Health (e2e)', () => {
  let app: INestApplication<App>;

  beforeAll(async () => {
    app = await createE2eApp();
  });

  afterAll(async () => {
    await app.close();
  });

  it('GET /api/v1/health returns a healthy response', async () => {
    const response = await request(app.getHttpServer())
      .get('/api/v1/health')
      .expect(200);

    expect(response.body).toMatchObject({
      data: {
        status: 'ok',
        service: 'slr-api',
      },
    });
  });

  it('GET /api/v1/health/ready confirms the database is available', async () => {
    const response = await request(app.getHttpServer())
      .get('/api/v1/health/ready')
      .expect(200);

    expect(response.body).toMatchObject({
      data: {
        status: 'ok',
        info: {
          mongodb: {
            status: 'up',
          },
        },
      },
    });
  });

  it('returns the standard error shape for unknown routes', async () => {
    const response = await request(app.getHttpServer())
      .get('/api/v1/does-not-exist')
      .expect(404);

    const body = response.body as {
      statusCode: number;
      path: string;
      timestamp: unknown;
    };

    expect(body).toMatchObject({
      statusCode: 404,
      path: '/api/v1/does-not-exist',
    });
    expect(typeof body.timestamp).toBe('string');
  });
});
