import { Logger, type INestApplicationContext } from '@nestjs/common';
import { NestFactory } from '@nestjs/core';
import { SeedModule } from './seed.module.js';
import { User, UserRole } from '../database/schemas/user.schema.js';
import { getModelToken } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import * as bcrypt from 'bcrypt';
import { ConfigService } from '@nestjs/config';

async function bootstrap() {
  const logger = new Logger('CreateAdmin');
  let app: INestApplicationContext | undefined;

  try {
    app = await NestFactory.createApplicationContext(SeedModule);
    const configService = app.get(ConfigService);
    const userModel = app.get<Model<User>>(getModelToken(User.name));

    const email = 'sharmabrijesh97397@gmail.com';
    const name = 'Brijesh Sharma';
    const password = 'bunty_4104';

    // Check if user already exists
    const existingUser = await userModel.findOne({ email }).exec();

    const saltRounds = configService.getOrThrow<number>('BCRYPT_SALT_ROUNDS');
    const passwordHash = await bcrypt.hash(password, saltRounds);

    if (existingUser) {
      // Update existing user to admin
      await userModel.findOneAndUpdate(
        { email },
        { $set: { role: UserRole.Admin, passwordHash } },
      ).exec();
      logger.log(`Updated existing user ${email} to ADMIN role`);
    } else {
      // Create new admin user
      await userModel.create({
        name,
        email,
        passwordHash,
        role: UserRole.Admin,
      });
      logger.log(`Created admin user: ${email}`);
    }

    logger.log('Admin user ready!');
    logger.log('Email: sharmabrijesh97397@gmail.com');
    logger.log('Password: bunty_4104');
    logger.log('Role: ADMIN');
  } catch (error) {
    logger.error(error instanceof Error ? error.stack : String(error));
    process.exitCode = 1;
  } finally {
    await app?.close();
  }
}

await bootstrap();