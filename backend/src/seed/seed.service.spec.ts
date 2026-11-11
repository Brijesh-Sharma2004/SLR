import { jest } from '@jest/globals';
import { getModelToken } from '@nestjs/mongoose';
import { Test, type TestingModule } from '@nestjs/testing';
import { Types } from 'mongoose';
import { Course } from '../database/schemas/course.schema.js';
import { Resource } from '../database/schemas/resource.schema.js';
import { Subject } from '../database/schemas/subject.schema.js';
import { SeedService } from './seed.service.js';

describe('SeedService', () => {
  let service: SeedService;
  let courseModel: { updateOne: jest.Mock; find: jest.Mock };
  let subjectModel: { updateOne: jest.Mock; find: jest.Mock };
  let resourceModel: { updateOne: jest.Mock };

  const writeResult = () => ({
    exec: jest.fn().mockReturnValue(Promise.resolve({})),
  });
  const findResult = (documents: unknown[]) => ({
    exec: jest.fn().mockReturnValue(Promise.resolve(documents)),
  });

  beforeEach(async () => {
    courseModel = {
      updateOne: jest.fn().mockReturnValue(writeResult()),
      find: jest.fn().mockReturnValue(
        findResult([
          { slug: 'btech-cse', _id: new Types.ObjectId() },
          { slug: 'btech-it', _id: new Types.ObjectId() },
        ]),
      ),
    };
    subjectModel = {
      updateOne: jest.fn().mockReturnValue(writeResult()),
      find: jest.fn().mockReturnValue(
        findResult([
          { slug: 'dbms', _id: new Types.ObjectId() },
          { slug: 'computer-networks', _id: new Types.ObjectId() },
          { slug: 'operating-systems', _id: new Types.ObjectId() },
          { slug: 'data-structures', _id: new Types.ObjectId() },
          { slug: 'web-technology', _id: new Types.ObjectId() },
          { slug: 'software-engineering', _id: new Types.ObjectId() },
        ]),
      ),
    };
    resourceModel = {
      updateOne: jest.fn().mockReturnValue(writeResult()),
    };

    const moduleRef: TestingModule = await Test.createTestingModule({
      providers: [
        SeedService,
        { provide: getModelToken(Course.name), useValue: courseModel },
        { provide: getModelToken(Subject.name), useValue: subjectModel },
        { provide: getModelToken(Resource.name), useValue: resourceModel },
      ],
    }).compile();

    service = moduleRef.get<SeedService>(SeedService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  it('run() seeds courses, subjects and resources without throwing', async () => {
    await expect(service.run()).resolves.toBeUndefined();

    expect(courseModel.updateOne).toHaveBeenCalled();
    expect(subjectModel.updateOne).toHaveBeenCalled();
    expect(resourceModel.updateOne).toHaveBeenCalled();
  });
});
