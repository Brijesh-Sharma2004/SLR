import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { MongooseModule } from '@nestjs/mongoose';
import { validate } from '../config/env.validation.js';
import { DatabaseModule } from '../database/database.module.js';
import { Course, CourseSchema } from '../database/schemas/course.schema.js';
import {
  Resource,
  ResourceSchema,
} from '../database/schemas/resource.schema.js';
import { Subject, SubjectSchema } from '../database/schemas/subject.schema.js';
import { User, UserSchema } from '../database/schemas/user.schema.js';
import { SeedService } from './seed.service.js';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      cache: true,
      validate,
    }),
    DatabaseModule,
    MongooseModule.forFeature([
      { name: Course.name, schema: CourseSchema },
      { name: Subject.name, schema: SubjectSchema },
      { name: Resource.name, schema: ResourceSchema },
      { name: User.name, schema: UserSchema },
    ]),
  ],
  providers: [SeedService],
})
export class SeedModule {}
