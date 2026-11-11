import { Logger, type INestApplicationContext } from '@nestjs/common';
import { NestFactory } from '@nestjs/core';
import { SeedModule } from './seed.module.js';
import { SeedService } from './seed.service.js';

async function bootstrap() {
  const logger = new Logger('Seed');
  let app: INestApplicationContext | undefined;

  try {
    app = await NestFactory.createApplicationContext(SeedModule);
    await app.get(SeedService).run();
  } catch (error) {
    logger.error(error instanceof Error ? error.stack : String(error));
    process.exitCode = 1;
  } finally {
    await app?.close();
  }
}

await bootstrap();
