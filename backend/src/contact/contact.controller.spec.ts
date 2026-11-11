import { jest } from '@jest/globals';
import { Test, type TestingModule } from '@nestjs/testing';
import { ContactController } from './contact.controller.js';
import { ContactService } from './contact.service.js';

describe('ContactController', () => {
  let controller: ContactController;
  let contactService: {
    create: jest.Mock;
    findAll: jest.Mock;
    findById: jest.Mock;
    markAsRead: jest.Mock;
    markAsUnread: jest.Mock;
    delete: jest.Mock;
  };

  beforeEach(async () => {
    contactService = {
      create: jest.fn(),
      findAll: jest.fn(),
      findById: jest.fn(),
      markAsRead: jest.fn(),
      markAsUnread: jest.fn(),
      delete: jest.fn(),
    };

    const moduleRef: TestingModule = await Test.createTestingModule({
      controllers: [ContactController],
      providers: [{ provide: ContactService, useValue: contactService }],
    }).compile();

    controller = moduleRef.get<ContactController>(ContactController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  it('create() returns the receipt provided by the service', async () => {
    const dto = {
      name: 'Ada',
      email: 'ada@example.com',
      subject: 'Question',
      message: 'Hello, I have a question.',
    };
    const expected = {
      id: 'm1',
      createdAt: '2024-01-01T00:00:00.000Z',
    };
    contactService.create.mockReturnValue(Promise.resolve(expected));

    await expect(controller.create(dto)).resolves.toBe(expected);
    expect(contactService.create).toHaveBeenCalledWith(dto);
  });

  it('findOne() asks the service for the given id', async () => {
    const expected = {
      id: 'm1',
      name: 'Ada',
      email: 'ada@example.com',
      subject: 'Question',
      message: 'Hello, I have a question.',
      status: 'UNREAD',
      createdAt: '2024-01-01T00:00:00.000Z',
      updatedAt: '2024-01-01T00:00:00.000Z',
    };
    contactService.findById.mockReturnValue(Promise.resolve(expected));

    await expect(controller.findOne('m1')).resolves.toBe(expected);
    expect(contactService.findById).toHaveBeenCalledWith('m1');
  });
});
