import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { Course, CourseSchema } from '../database/schemas/course.schema.js';
import {
  Resource,
  ResourceSchema,
} from '../database/schemas/resource.schema.js';
import { Subject, SubjectSchema } from '../database/schemas/subject.schema.js';
import { CoursesController } from './courses.controller.js';
import { CoursesService } from './courses.service.js';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: Course.name, schema: CourseSchema },
      { name: Subject.name, schema: SubjectSchema },
      { name: Resource.name, schema: ResourceSchema },
    ]),
  ],
  controllers: [CoursesController],
  providers: [CoursesService],
  exports: [CoursesService],
})
export class CoursesModule {}
