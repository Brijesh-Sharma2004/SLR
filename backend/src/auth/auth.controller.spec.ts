import { jest } from '@jest/globals';
import { Test, type TestingModule } from '@nestjs/testing';
import type { Response } from 'express';
import { AuthService } from './auth.service.js';

type AuthControllerType = import('./auth.controller.js').AuthController;
type AuthControllerClass = typeof import('./auth.controller.js').AuthController;

describe('AuthController', () => {
  let controller: AuthControllerType;
  let authControllerClass: AuthControllerClass;
  let authService: {
    register: jest.Mock;
    login: jest.Mock;
    logout: jest.Mock;
  };

  beforeAll(async () => {
    const controllerModule = await import('./auth.controller.js');
    authControllerClass = controllerModule.AuthController;
  });

  beforeEach(async () => {
    authService = {
      register: jest.fn(),
      login: jest.fn(),
      logout: jest.fn(),
    };

    const moduleRef: TestingModule = await Test.createTestingModule({
      controllers: [authControllerClass],
      providers: [{ provide: AuthService, useValue: authService }],
    }).compile();

    controller = moduleRef.get<AuthControllerType>(authControllerClass);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  it('register() returns the result from authService.register', async () => {
    const dto = {
      name: 'Ada',
      email: 'ada@example.com',
      password: 'secret123',
    };
    const response = { cookie: jest.fn() } as unknown as Response;
    const expected = {
      id: '1',
      name: 'Ada',
      email: 'ada@example.com',
      role: 'USER',
      course: null,
      createdAt: '2024-01-01T00:00:00.000Z',
    };
    authService.register.mockReturnValue(Promise.resolve(expected));

    await expect(controller.register(dto, response)).resolves.toBe(expected);
    expect(authService.register).toHaveBeenCalledWith(dto, response);
  });

  it('login() passes the credentials to authService.login', async () => {
    const dto = { email: 'ada@example.com', password: 'secret123' };
    const response = { cookie: jest.fn() } as unknown as Response;
    const expected = {
      id: '1',
      name: 'Ada',
      email: 'ada@example.com',
      role: 'USER',
      course: null,
      createdAt: '2024-01-01T00:00:00.000Z',
    };
    authService.login.mockReturnValue(Promise.resolve(expected));

    await expect(controller.login(dto, response)).resolves.toBe(expected);
    expect(authService.login).toHaveBeenCalledWith(dto, response);
  });
});
