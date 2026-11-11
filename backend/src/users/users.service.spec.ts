import { jest } from '@jest/globals';
import { NotFoundException } from '@nestjs/common';
import { getModelToken } from '@nestjs/mongoose';
import { Test, type TestingModule } from '@nestjs/testing';
import { Types } from 'mongoose';
import { User, UserRole } from '../database/schemas/user.schema.js';
import { UsersService } from './users.service.js';

describe('UsersService', () => {
  let service: UsersService;
  let userModel: { findById: jest.Mock };

  const userId = new Types.ObjectId().toString();
  const fakeUser = {
    _id: new Types.ObjectId(userId),
    name: 'Ada',
    email: 'ada@example.com',
    role: UserRole.User,
    course: undefined,
    createdAt: new Date('2024-01-01T00:00:00.000Z'),
  };

  beforeEach(async () => {
    userModel = { findById: jest.fn() };

    const moduleRef: TestingModule = await Test.createTestingModule({
      providers: [
        UsersService,
        { provide: getModelToken(User.name), useValue: userModel },
      ],
    }).compile();

    service = moduleRef.get<UsersService>(UsersService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  it('getProfile() returns the public shape of the user', async () => {
    userModel.findById.mockReturnValue({
      exec: jest.fn().mockReturnValue(Promise.resolve(fakeUser)),
    });

    const result = await service.getProfile(userId);

    expect(result).toEqual({
      id: userId,
      name: 'Ada',
      email: 'ada@example.com',
      role: UserRole.User,
      course: null,
      createdAt: '2024-01-01T00:00:00.000Z',
    });
  });

  it('getProfile() throws NotFoundException when the user is missing', async () => {
    userModel.findById.mockReturnValue({
      exec: jest.fn().mockReturnValue(Promise.resolve(null)),
    });

    await expect(service.getProfile(userId)).rejects.toBeInstanceOf(
      NotFoundException,
    );
  });
});
