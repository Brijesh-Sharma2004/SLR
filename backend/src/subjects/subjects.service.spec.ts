import { jest } from '@jest/globals';
import { NotFoundException } from '@nestjs/common';
import { getModelToken } from '@nestjs/mongoose';
import { Test, type TestingModule } from '@nestjs/testing';
import { Course } from '../database/schemas/course.schema.js';
import { Resource } from '../database/schemas/resource.schema.js';
import { Subject } from '../database/schemas/subject.schema.js';
import { SubjectsService } from './subjects.service.js';

describe('SubjectsService', () => {
  let service: SubjectsService;
  let subjectModel: { findOne: jest.Mock };
  let courseModel: { findById: jest.Mock };

  beforeEach(async () => {
    subjectModel = { findOne: jest.fn() };
    courseModel = { findById: jest.fn() };

    const moduleRef: TestingModule = await Test.createTestingModule({
      providers: [
        SubjectsService,
        { provide: getModelToken(Subject.name), useValue: subjectModel },
        { provide: getModelToken(Course.name), useValue: courseModel },
        { provide: getModelToken(Resource.name), useValue: {} },
      ],
    }).compile();

    service = moduleRef.get<SubjectsService>(SubjectsService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  it('findBySlug() throws NotFoundException when the subject is missing', async () => {
    subjectModel.findOne.mockReturnValue({
      populate: jest.fn().mockReturnValue({
        lean: jest.fn().mockReturnValue({
          exec: jest.fn().mockReturnValue(Promise.resolve(null)),
        }),
      }),
    });

    await expect(service.findBySlug('unknown')).rejects.toBeInstanceOf(
      NotFoundException,
    );
  });

  it('create() throws NotFoundException when the course does not exist', async () => {
    courseModel.findById.mockReturnValue({
      select: jest.fn().mockReturnValue({
        lean: jest.fn().mockReturnValue({
          exec: jest.fn().mockReturnValue(Promise.resolve(null)),
        }),
      }),
    });

    await expect(
      service.create({
        name: 'New Subject',
        description: 'A subject',
        code: 'CS999',
        courseId: 'missing-course',
      }),
    ).rejects.toBeInstanceOf(NotFoundException);
  });
});
