import { jest } from '@jest/globals';
import { Test, type TestingModule } from '@nestjs/testing';
import { ResourceType } from '../database/schemas/resource.schema.js';
import { ResourcesController } from './resources.controller.js';
import { ResourcesService } from './resources.service.js';

describe('ResourcesController', () => {
  let controller: ResourcesController;
  let resourcesService: {
    findAll: jest.Mock;
    findByIdOrSlug: jest.Mock;
    create: jest.Mock;
    createWithFile: jest.Mock;
    update: jest.Mock;
    updateWithFile: jest.Mock;
    delete: jest.Mock;
  };

  beforeEach(async () => {
    resourcesService = {
      findAll: jest.fn(),
      findByIdOrSlug: jest.fn(),
      create: jest.fn(),
      createWithFile: jest.fn(),
      update: jest.fn(),
      updateWithFile: jest.fn(),
      delete: jest.fn(),
    };

    const moduleRef: TestingModule = await Test.createTestingModule({
      controllers: [ResourcesController],
      providers: [{ provide: ResourcesService, useValue: resourcesService }],
    }).compile();

    controller = moduleRef.get<ResourcesController>(ResourcesController);
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
    resourcesService.findAll.mockReturnValue(Promise.resolve(expected));

    await expect(controller.findAll(query)).resolves.toBe(expected);
    expect(resourcesService.findAll).toHaveBeenCalledWith(query);
  });

  it('create() passes the new resource to the service', async () => {
    const dto = {
      title: 'DBMS Notes',
      type: ResourceType.Pdf,
      description: 'Unit 1 notes',
      url: '/resources/dbms/unit-1-notes.pdf',
      subjectId: 'subject-1',
    };
    const expected = {
      id: 'r1',
      slug: 'dbms-notes',
      title: 'DBMS Notes',
      type: ResourceType.Pdf,
      description: 'Unit 1 notes',
      url: '/resources/dbms/unit-1-notes.pdf',
      subject: {
        id: 'subject-1',
        slug: 'dbms',
        name: 'Database Management Systems',
        code: 'CS301',
      },
    };
    resourcesService.create.mockReturnValue(Promise.resolve(expected));

    await expect(controller.create(dto)).resolves.toBe(expected);
    expect(resourcesService.create).toHaveBeenCalledWith(dto);
  });
});
