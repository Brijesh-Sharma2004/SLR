import { jest } from '@jest/globals';
import { Test, type TestingModule } from '@nestjs/testing';
import { SearchController } from './search.controller.js';
import { SearchService } from './search.service.js';

describe('SearchController', () => {
  let controller: SearchController;
  let searchService: { search: jest.Mock };

  beforeEach(async () => {
    searchService = { search: jest.fn() };

    const moduleRef: TestingModule = await Test.createTestingModule({
      controllers: [SearchController],
      providers: [{ provide: SearchService, useValue: searchService }],
    }).compile();

    controller = moduleRef.get<SearchController>(SearchController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  it('search() returns the grouped results from the service', async () => {
    const query = { q: 'dbms', limit: 5 };
    const expected = {
      data: { courses: [], subjects: [], resources: [] },
      meta: { query: 'dbms', limit: 5, total: 0 },
    };
    searchService.search.mockReturnValue(Promise.resolve(expected));

    await expect(controller.search(query)).resolves.toBe(expected);
    expect(searchService.search).toHaveBeenCalledWith(query);
  });
});
