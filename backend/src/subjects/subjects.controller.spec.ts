import { jest } from '@jest/globals';
import { Test, type TestingModule } from '@nestjs/testing';
import { SubjectsController } from './subjects.controller.js';
import { SubjectsService } from './subjects.service.js';

describe('SubjectsController', () => {
  let controller: SubjectsController;
  let subjectsService: {
    findAll: jest.Mock;
    findBySlug: jest.Mock;
    create: jest.Mock;
    update: jest.Mock;
    delete: jest.Mock;
  };

  beforeEach(async () => {
    subjectsService = {
      findAll: jest.fn(),
      findBySlug: jest.fn(),
      create: jest.fn(),
      update: jest.fn(),
      delete: jest.fn(),
    };

    const moduleRef: TestingModule = await Test.createTestingModule({
      controllers: [SubjectsController],
      providers: [{ provide: SubjectsService, useValue: subjectsService }],
    }).compile();

    controller = moduleRef.get<SubjectsController>(SubjectsController);
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
    subjectsService.findAll.mockReturnValue(Promise.resolve(expected));

    await expect(controller.findAll(query)).resolves.toBe(expected);
    expect(subjectsService.findAll).toHaveBeenCalledWith(query);
  });

  it('findBySlug() asks the service for the given slug', async () => {
    const expected = {
      id: '1',
      slug: 'dbms',
      name: 'Database Management Systems',
      code: 'CS301',
      course: { id: 'c1', name: 'B.Tech CSE', slug: 'btech-cse' },
      resourceCount: 0,
      resources: [],
    };
    subjectsService.findBySlug.mockReturnValue(Promise.resolve(expected));

    await expect(controller.findBySlug('dbms')).resolves.toBe(expected);
    expect(subjectsService.findBySlug).toHaveBeenCalledWith('dbms');
  });
});
