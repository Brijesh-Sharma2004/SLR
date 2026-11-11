import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { ContactMessage, ContactMessageSchema } from '../database/schemas/contact-message.schema.js';
import { Course, CourseSchema } from '../database/schemas/course.schema.js';
import { Resource, ResourceSchema } from '../database/schemas/resource.schema.js';
import { Subject, SubjectSchema } from '../database/schemas/subject.schema.js';
import { User, UserSchema } from '../database/schemas/user.schema.js';
import { DashboardController } from './dashboard.controller.js';
import { DashboardService } from './dashboard.service.js';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: Course.name, schema: CourseSchema },
      { name: Subject.name, schema: SubjectSchema },
      { name: Resource.name, schema: ResourceSchema },
      { name: User.name, schema: UserSchema },
      { name: ContactMessage.name, schema: ContactMessageSchema },
    ]),
  ],
  controllers: [DashboardController],
  providers: [DashboardService],
  exports: [DashboardService],
})
export class DashboardModule {}