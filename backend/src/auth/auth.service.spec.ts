import { jest } from '@jest/globals';
import { ConflictException, UnauthorizedException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { JwtService } from '@nestjs/jwt';
import { Test, type TestingModule } from '@nestjs/testing';
import type { Response } from 'express';
import { UsersService } from '../users/users.service.js';
import { AuthService } from './auth.service.js';

describe('AuthService', () => {
  let service: AuthService;
  let usersService: {
    findByEmail: jest.Mock;
    findByEmailWithPassword: jest.Mock;
    create: jest.Mock;
    toPublicUser: jest.Mock;
  };

  beforeEach(async () => {
    usersService = {
      findByEmail: jest.fn(),
      findByEmailWithPassword: jest.fn(),
      create: jest.fn(),
      toPublicUser: jest.fn(),
    };

    const moduleRef: TestingModule = await Test.createTestingModule({
      providers: [
        AuthService,
        { provide: UsersService, useValue: usersService },
        { provide: JwtService, useValue: { signAsync: jest.fn() } },
        { provide: ConfigService, useValue: { getOrThrow: jest.fn() } },
      ],
    }).compile();

    service = moduleRef.get<AuthService>(AuthService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  it('login() throws UnauthorizedException when the user does not exist', async () => {
    usersService.findByEmailWithPassword.mockReturnValue(
      Promise.resolve(null),
    );
    const response = {} as unknown as Response;

    await expect(
      service.login(
        { email: 'missing@example.com', password: 'secret123' },
        response,
      ),
    ).rejects.toBeInstanceOf(UnauthorizedException);
  });

  it('register() throws ConflictException when the email is already used', async () => {
    usersService.findByEmail.mockReturnValue(
      Promise.resolve({ _id: '1' }),
    );
    const response = {} as unknown as Response;

    await expect(
      service.register(
        { name: 'Ada', email: 'ada@example.com', password: 'secret123' },
        response,
      ),
    ).rejects.toBeInstanceOf(ConflictException);
  });
});
