import { jest } from '@jest/globals';
import { NotFoundException } from '@nestjs/common';
import { getModelToken } from '@nestjs/mongoose';
import { Test, type TestingModule } from '@nestjs/testing';
import { Course } from '../database/schemas/course.schema.js';
import { Resource } from '../database/schemas/resource.schema.js';
import { Subject } from '../database/schemas/subject.schema.js';
import { CoursesService } from './courses.service.js';

describe('CoursesService', () => {
  let service: CoursesService;
  let courseModel: { findOne: jest.Mock };

  beforeEach(async () => {
    courseModel = { findOne: jest.fn() };

    const moduleRef: TestingModule = await Test.createTestingModule({
      providers: [
        CoursesService,
        { provide: getModelToken(Course.name), useValue: courseModel },
        { provide: getModelToken(Subject.name), useValue: {} },
        { provide: getModelToken(Resource.name), useValue: {} },
      ],
    }).compile();

    service = moduleRef.get<CoursesService>(CoursesService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  it('findBySlug() throws NotFoundException when the course is missing', async () => {
    courseModel.findOne.mockReturnValue({
      lean: jest.fn().mockReturnValue({
        exec: jest.fn().mockReturnValue(Promise.resolve(null)),
      }),
    });

    await expect(service.findBySlug('unknown')).rejects.toBeInstanceOf(
      NotFoundException,
    );
  });

  it('delete() throws NotFoundException when the course is missing', async () => {
    courseModel.findOne.mockReturnValue({
      exec: jest.fn().mockReturnValue(Promise.resolve(null)),
    });

    await expect(service.delete('unknown')).rejects.toBeInstanceOf(
      NotFoundException,
    );
  });
});
