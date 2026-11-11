import { jest } from '@jest/globals';
import { NotFoundException } from '@nestjs/common';
import { getModelToken } from '@nestjs/mongoose';
import { Test, type TestingModule } from '@nestjs/testing';
import { ContactMessage } from '../database/schemas/contact-message.schema.js';
import { ContactService } from './contact.service.js';

describe('ContactService', () => {
  let service: ContactService;
  let contactMessageModel: { create: jest.Mock };

  beforeEach(async () => {
    contactMessageModel = { create: jest.fn() };

    const moduleRef: TestingModule = await Test.createTestingModule({
      providers: [
        ContactService,
        {
          provide: getModelToken(ContactMessage.name),
          useValue: contactMessageModel,
        },
      ],
    }).compile();

    service = moduleRef.get<ContactService>(ContactService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  it('create() returns the new message id and createdAt', async () => {
    contactMessageModel.create.mockReturnValue(
      Promise.resolve({
        _id: { toString: () => 'm1' },
        createdAt: new Date('2024-01-01T00:00:00.000Z'),
      }),
    );

    const result = await service.create({
      name: 'Ada',
      email: 'ada@example.com',
      subject: 'Question',
      message: 'Hello, I have a question.',
    });

    expect(result).toEqual({
      id: 'm1',
      createdAt: '2024-01-01T00:00:00.000Z',
    });
  });

  it('findById() throws NotFoundException for an invalid id', async () => {
    await expect(service.findById('not-a-valid-id')).rejects.toBeInstanceOf(
      NotFoundException,
    );
  });
});
