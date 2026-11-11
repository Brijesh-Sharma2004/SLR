import { jest } from '@jest/globals';
import { getModelToken } from '@nestjs/mongoose';
import { Test, type TestingModule } from '@nestjs/testing';
import {
  ContactMessage,
  ContactMessageStatus,
} from '../database/schemas/contact-message.schema.js';
import { Course } from '../database/schemas/course.schema.js';
import { Resource } from '../database/schemas/resource.schema.js';
import { Subject } from '../database/schemas/subject.schema.js';
import { User } from '../database/schemas/user.schema.js';
import { DashboardService } from './dashboard.service.js';

describe('DashboardService', () => {
  let service: DashboardService;
  let contactMessageModel: { countDocuments: jest.Mock };

  const countResult = (value: number) => ({
    exec: jest.fn().mockReturnValue(Promise.resolve(value)),
  });

  beforeEach(async () => {
    const courseModel = {
      countDocuments: jest.fn().mockReturnValue(countResult(2)),
    };
    const subjectModel = {
      countDocuments: jest.fn().mockReturnValue(countResult(3)),
    };
    const resourceModel = {
      countDocuments: jest.fn().mockReturnValue(countResult(4)),
    };
    const userModel = {
      countDocuments: jest.fn().mockReturnValue(countResult(5)),
    };
    contactMessageModel = {
      countDocuments: jest
        .fn()
        .mockReturnValueOnce(countResult(6))
        .mockReturnValueOnce(countResult(1)),
    };

    const moduleRef: TestingModule = await Test.createTestingModule({
      providers: [
        DashboardService,
        { provide: getModelToken(Course.name), useValue: courseModel },
        { provide: getModelToken(Subject.name), useValue: subjectModel },
        { provide: getModelToken(Resource.name), useValue: resourceModel },
        { provide: getModelToken(User.name), useValue: userModel },
        {
          provide: getModelToken(ContactMessage.name),
          useValue: contactMessageModel,
        },
      ],
    }).compile();

    service = moduleRef.get<DashboardService>(DashboardService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  it('getStats() returns the counts from every collection', async () => {
    const result = await service.getStats();

    expect(result).toEqual({
      totalCourses: 2,
      totalSubjects: 3,
      totalResources: 4,
      totalStudents: 5,
      totalMessages: 6,
      unreadMessages: 1,
    });
  });

  it('getStats() counts unread contact messages with a status filter', async () => {
    await service.getStats();

    expect(contactMessageModel.countDocuments).toHaveBeenCalledWith({
      status: ContactMessageStatus.Unread,
    });
  });
});
