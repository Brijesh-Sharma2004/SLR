import { ValidationPipe, type INestApplication } from '@nestjs/common';
import { Test } from '@nestjs/testing';
import cookieParser from 'cookie-parser';
import { MongoMemoryServer } from 'mongodb-memory-server';
import type { App } from 'supertest/types.js';
import { AllExceptionsFilter } from '../../src/common/filters/all-exceptions.filter.js';
import { TransformInterceptor } from '../../src/common/interceptors/transform.interceptor.js';

let memoryServer: MongoMemoryServer | undefined;

export async function createE2eApp(): Promise<INestApplication<App>> {
  if (!memoryServer) {
    memoryServer = await MongoMemoryServer.create({
      instance: {
        launchTimeout: 60000,
        args: ['--wiredTigerCacheSizeGB', '0.25'],
      },
    });

    process.env.NODE_ENV = 'test';
    process.env.MONGODB_URI = memoryServer.getUri();
    process.env.MONGODB_DB_NAME = 'slr_test';
    process.env.COOKIE_SECURE = 'false';
  }

  await import('@nestjs/common');
  const { AppModule } = await import('../../src/app.module.js');

  const moduleFixture = await Test.createTestingModule({
    imports: [AppModule],
  }).compile();

  const app = moduleFixture.createNestApplication();

  app.use(cookieParser());
  app.setGlobalPrefix('api/v1');
  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      forbidNonWhitelisted: true,
      transform: true,
      transformOptions: { enableImplicitConversion: true },
    }),
  );
  app.useGlobalFilters(new AllExceptionsFilter());
  app.useGlobalInterceptors(new TransformInterceptor());

  await app.init();

  const { getModelToken } = await import('@nestjs/mongoose');
  const { Course } = await import(
    '../../src/database/schemas/course.schema.js'
  );
  const { Resource } = await import(
    '../../src/database/schemas/resource.schema.js'
  );
  const { Subject } = await import(
    '../../src/database/schemas/subject.schema.js'
  );
  const { SeedService } = await import('../../src/seed/seed.service.js');

  const seedService = new SeedService(
    app.get(getModelToken(Course.name)),
    app.get(getModelToken(Subject.name)),
    app.get(getModelToken(Resource.name)),
  );
  await seedService.run();

  const close = app.close.bind(app);
  app.close = async () => {
    await close();
    await memoryServer?.stop();
    memoryServer = undefined;
  };

  return app;
}
