import { jest } from '@jest/globals';
import { Test, type TestingModule } from '@nestjs/testing';
import { CoursesController } from './courses.controller.js';
import { CoursesService } from './courses.service.js';

describe('CoursesController', () => {
  let controller: CoursesController;
  let coursesService: {
    findAll: jest.Mock;
    findBySlug: jest.Mock;
    create: jest.Mock;
    update: jest.Mock;
    delete: jest.Mock;
  };

  beforeEach(async () => {
    coursesService = {
      findAll: jest.fn(),
      findBySlug: jest.fn(),
      create: jest.fn(),
      update: jest.fn(),
      delete: jest.fn(),
    };

    const moduleRef: TestingModule = await Test.createTestingModule({
      controllers: [CoursesController],
      providers: [{ provide: CoursesService, useValue: coursesService }],
    }).compile();

    controller = moduleRef.get<CoursesController>(CoursesController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  it('findAll() returns the list provided by the service', async () => {
    const query = { page: 1, limit: 20 };
    const expected = {
      data: [],
      meta: { page: 1, limit: 20, total: 0, totalPages: 0 },
    };
    coursesService.findAll.mockReturnValue(Promise.resolve(expected));

    await expect(controller.findAll(query)).resolves.toBe(expected);
    expect(coursesService.findAll).toHaveBeenCalledWith(query);
  });

  it('findBySlug() asks the service for the given slug', async () => {
    const expected = {
      id: 'c1',
      slug: 'btech-cse',
      name: 'B.Tech Computer Science',
      description: 'Computer science course',
      duration: '4 Years',
      subjectCount: 0,
      subjects: [],
    };
    coursesService.findBySlug.mockReturnValue(Promise.resolve(expected));

    await expect(controller.findBySlug('btech-cse')).resolves.toBe(expected);
    expect(coursesService.findBySlug).toHaveBeenCalledWith('btech-cse');
  });
});
