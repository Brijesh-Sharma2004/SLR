import { jest } from '@jest/globals';
import { getModelToken } from '@nestjs/mongoose';
import { Test, type TestingModule } from '@nestjs/testing';
import { Course } from '../database/schemas/course.schema.js';
import { Resource } from '../database/schemas/resource.schema.js';
import { Subject } from '../database/schemas/subject.schema.js';
import { SearchService } from './search.service.js';

describe('SearchService', () => {
  let service: SearchService;

  beforeEach(async () => {
    const courseModel = {
      aggregate: jest.fn().mockReturnValue({
        exec: jest.fn().mockReturnValue(Promise.resolve([])),
      }),
    };
    const subjectModel = {
      collection: { name: 'subjects' },
      find: jest.fn().mockReturnValue({
        populate: jest.fn().mockReturnValue({
          sort: jest.fn().mockReturnValue({
            limit: jest.fn().mockReturnValue({
              lean: jest.fn().mockReturnValue({
                exec: jest.fn().mockReturnValue(Promise.resolve([])),
              }),
            }),
          }),
        }),
      }),
    };
    const resourceModel = {
      find: jest.fn().mockReturnValue({
        populate: jest.fn().mockReturnValue({
          sort: jest.fn().mockReturnValue({
            limit: jest.fn().mockReturnValue({
              lean: jest.fn().mockReturnValue({
                exec: jest.fn().mockReturnValue(Promise.resolve([])),
              }),
            }),
          }),
        }),
      }),
      aggregate: jest.fn().mockReturnValue({
        exec: jest.fn().mockReturnValue(Promise.resolve([])),
      }),
    };

    const moduleRef: TestingModule = await Test.createTestingModule({
      providers: [
        SearchService,
        { provide: getModelToken(Course.name), useValue: courseModel },
        { provide: getModelToken(Subject.name), useValue: subjectModel },
        { provide: getModelToken(Resource.name), useValue: resourceModel },
      ],
    }).compile();

    service = moduleRef.get<SearchService>(SearchService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  it('search() returns grouped empty results with query metadata', async () => {
    const result = await service.search({ q: 'dbms', limit: 5 });

    expect(result).toEqual({
      data: { courses: [], subjects: [], resources: [] },
      meta: { query: 'dbms', limit: 5, total: 0 },
    });
  });
});
