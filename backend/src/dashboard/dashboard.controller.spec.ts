import { jest } from '@jest/globals';
import { Test, type TestingModule } from '@nestjs/testing';
import { DashboardController } from './dashboard.controller.js';
import { DashboardService } from './dashboard.service.js';

describe('DashboardController', () => {
  let controller: DashboardController;
  let dashboardService: { getStats: jest.Mock };

  beforeEach(async () => {
    dashboardService = { getStats: jest.fn() };

    const moduleRef: TestingModule = await Test.createTestingModule({
      controllers: [DashboardController],
      providers: [{ provide: DashboardService, useValue: dashboardService }],
    }).compile();

    controller = moduleRef.get<DashboardController>(DashboardController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  it('getStats() returns the statistics from the service', async () => {
    const expected = {
      totalCourses: 2,
      totalSubjects: 6,
      totalResources: 4,
      totalStudents: 10,
      totalMessages: 3,
      unreadMessages: 1,
    };
    dashboardService.getStats.mockReturnValue(Promise.resolve(expected));

    await expect(controller.getStats()).resolves.toBe(expected);
    expect(dashboardService.getStats).toHaveBeenCalled();
  });
});
