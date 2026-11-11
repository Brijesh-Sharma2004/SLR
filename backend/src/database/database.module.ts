import { Logger, Module } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { MongooseModule } from '@nestjs/mongoose';
import type { Connection } from 'mongoose';

const logger = new Logger('Database');

@Module({
  imports: [
    MongooseModule.forRootAsync({
      inject: [ConfigService],
      useFactory: (config: ConfigService) => {
        const dbName = config.getOrThrow<string>('MONGODB_DB_NAME');

        return {
          uri: config.getOrThrow<string>('MONGODB_URI'),
          dbName,
          serverSelectionTimeoutMS: 10_000,
          autoIndex: true,
          onConnectionCreate: (connection: Connection) => {
            connection.on('connected', () => {
              logger.log(`Connected to MongoDB database "${dbName}"`);
            });
            connection.on('disconnected', () => {
              logger.warn('Disconnected from MongoDB');
            });
            connection.on('reconnected', () => {
              logger.log('Reconnected to MongoDB');
            });
            connection.on('error', (error: Error) => {
              logger.error(`MongoDB connection error: ${error.message}`);
            });

            return connection;
          },
        };
      },
    }),
  ],
})
export class DatabaseModule {}
