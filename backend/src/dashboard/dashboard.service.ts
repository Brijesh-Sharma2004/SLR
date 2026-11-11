import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Course } from '../database/schemas/course.schema.js';
import { Subject } from '../database/schemas/subject.schema.js';
import { Resource } from '../database/schemas/resource.schema.js';
import { User, UserRole } from '../database/schemas/user.schema.js';
import { ContactMessage, ContactMessageStatus } from '../database/schemas/contact-message.schema.js';

export interface DashboardStats {
  totalCourses: number;
  totalSubjects: number;
  totalResources: number;
  totalStudents: number;
  totalMessages: number;
  unreadMessages: number;
}

@Injectable()
export class DashboardService {
  constructor(
    @InjectModel(Course.name)
    private readonly courseModel: Model<Course>,
    @InjectModel(Subject.name)
    private readonly subjectModel: Model<Subject>,
    @InjectModel(Resource.name)
    private readonly resourceModel: Model<Resource>,
    @InjectModel(User.name)
    private readonly userModel: Model<User>,
    @InjectModel(ContactMessage.name)
    private readonly contactMessageModel: Model<ContactMessage>,
  ) {}

  async getStats(): Promise<DashboardStats> {
    const [
      totalCourses,
      totalSubjects,
      totalResources,
      totalStudents,
      totalMessages,
      unreadMessages,
    ] = await Promise.all([
      this.courseModel.countDocuments().exec(),
      this.subjectModel.countDocuments().exec(),
      this.resourceModel.countDocuments().exec(),
      this.userModel.countDocuments({ role: UserRole.User }).exec(),
      this.contactMessageModel.countDocuments().exec(),
      this.contactMessageModel
        .countDocuments({ status: ContactMessageStatus.Unread })
        .exec(),
    ]);

    return {
      totalCourses,
      totalSubjects,
      totalResources,
      totalStudents,
      totalMessages,
      unreadMessages,
    };
  }
}