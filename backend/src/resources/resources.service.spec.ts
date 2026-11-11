import { jest } from '@jest/globals';
import { NotFoundException } from '@nestjs/common';
import { getModelToken } from '@nestjs/mongoose';
import { Test, type TestingModule } from '@nestjs/testing';
import { Resource, ResourceType } from '../database/schemas/resource.schema.js';
import { Subject } from '../database/schemas/subject.schema.js';
import { ResourcesService } from './resources.service.js';

describe('ResourcesService', () => {
  let service: ResourcesService;
  let resourceModel: { findOne: jest.Mock };
  let subjectModel: { findById: jest.Mock };

  beforeEach(async () => {
    resourceModel = { findOne: jest.fn() };
    subjectModel = { findById: jest.fn() };

    const moduleRef: TestingModule = await Test.createTestingModule({
      providers: [
        ResourcesService,
        { provide: getModelToken(Resource.name), useValue: resourceModel },
        { provide: getModelToken(Subject.name), useValue: subjectModel },
      ],
    }).compile();

    service = moduleRef.get<ResourcesService>(ResourcesService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  it('findByIdOrSlug() throws NotFoundException when the resource is missing', async () => {
    resourceModel.findOne.mockReturnValue({
      populate: jest.fn().mockReturnValue({
        lean: jest.fn().mockReturnValue({
          exec: jest.fn().mockReturnValue(Promise.resolve(null)),
        }),
      }),
    });

    await expect(service.findByIdOrSlug('missing-resource')).rejects.toBeInstanceOf(
      NotFoundException,
    );
  });

  it('create() throws NotFoundException when the subject does not exist', async () => {
    subjectModel.findById.mockReturnValue({
      select: jest.fn().mockReturnValue({
        lean: jest.fn().mockReturnValue({
          exec: jest.fn().mockReturnValue(Promise.resolve(null)),
        }),
      }),
    });

    await expect(
      service.create({
        title: 'New Notes',
        type: ResourceType.Pdf,
        description: 'Some notes',
        url: '/resources/new-notes.pdf',
        subjectId: 'missing-subject',
      }),
    ).rejects.toBeInstanceOf(NotFoundException);
  });
});
