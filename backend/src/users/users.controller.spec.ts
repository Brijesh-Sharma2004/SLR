import { jest } from '@jest/globals';
import { Test, type TestingModule } from '@nestjs/testing';
import { UserRole } from '../database/schemas/user.schema.js';
import { UsersController } from './users.controller.js';
import { UsersService } from './users.service.js';

describe('UsersController', () => {
  let controller: UsersController;
  let usersService: {
    getProfile: jest.Mock;
    updateProfile: jest.Mock;
    findAllStudents: jest.Mock;
  };

  beforeEach(async () => {
    usersService = {
      getProfile: jest.fn(),
      updateProfile: jest.fn(),
      findAllStudents: jest.fn(),
    };

    const moduleRef: TestingModule = await Test.createTestingModule({
      controllers: [UsersController],
      providers: [{ provide: UsersService, useValue: usersService }],
    }).compile();

    controller = moduleRef.get<UsersController>(UsersController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  it('getMe() asks the service for the current user profile', async () => {
    const user = {
      id: 'user-1',
      name: 'Ada',
      email: 'ada@example.com',
      role: UserRole.User,
    };
    const expected = {
      id: 'user-1',
      name: 'Ada',
      email: 'ada@example.com',
      role: UserRole.User,
      course: null,
      createdAt: '2024-01-01T00:00:00.000Z',
    };
    usersService.getProfile.mockReturnValue(Promise.resolve(expected));

    await expect(controller.getMe(user)).resolves.toBe(expected);
    expect(usersService.getProfile).toHaveBeenCalledWith('user-1');
  });

  it('getStudents() converts page and limit strings into numbers', async () => {
    const expected = {
      data: [],
      meta: { page: 2, limit: 5, total: 0, totalPages: 0 },
    };
    usersService.findAllStudents.mockReturnValue(Promise.resolve(expected));

    await expect(controller.getStudents('2', '5')).resolves.toBe(expected);
    expect(usersService.findAllStudents).toHaveBeenCalledWith(2, 5);
  });
});
