import type { INestApplication } from '@nestjs/common';
import { getModelToken } from '@nestjs/mongoose';
import type { Model } from 'mongoose';
import request from 'supertest';
import type { App } from 'supertest/types.js';
import { ContactMessage } from '../src/database/schemas/contact-message.schema.js';
import { createE2eApp } from './utils/create-e2e-app.js';

interface ContactResponse {
  data: {
    id: string;
    createdAt: string;
  };
}

describe('Contact messages (e2e)', () => {
  let app: INestApplication<App>;
  let contactModel: Model<ContactMessage>;

  const email = `contact-e2e-${Date.now()}@example.com`;

  beforeAll(async () => {
    app = await createE2eApp();
    contactModel = app.get<Model<ContactMessage>>(
      getModelToken(ContactMessage.name),
    );
  });

  afterAll(async () => {
    await contactModel.deleteMany({ email }).exec();
    await app.close();
  });

  it('accepts and stores a valid contact message', async () => {
    const response = await request(app.getHttpServer())
      .post('/api/v1/contact')
      .send({
        name: 'Contact Student',
        email,
        subject: 'Need help with DBMS notes',
        message: 'Could you please add more DBMS practice questions?',
      })
      .expect(201);

    const body = response.body as ContactResponse;

    expect(body.data.id).toBeTruthy();
    expect(Number.isNaN(Date.parse(body.data.createdAt))).toBe(false);

    const stored = await contactModel.findOne({ email }).exec();

    expect(stored).toMatchObject({
      name: 'Contact Student',
      email,
      subject: 'Need help with DBMS notes',
      message: 'Could you please add more DBMS practice questions?',
    });
  });

  it('normalizes email and trims text fields', async () => {
    const upperEmail = `UPPER-${email}`;

    await request(app.getHttpServer())
      .post('/api/v1/contact')
      .send({
        name: '  Trimmed Name  ',
        email: `  ${upperEmail}  `,
        subject: '  Trimmed subject  ',
        message: '  This message should be trimmed correctly.  ',
      })
      .expect(201);

    const stored = await contactModel
      .findOne({ email: upperEmail.toLowerCase() })
      .exec();

    expect(stored).toMatchObject({
      name: 'Trimmed Name',
      subject: 'Trimmed subject',
      message: 'This message should be trimmed correctly.',
    });

    await contactModel.deleteOne({ email: upperEmail.toLowerCase() }).exec();
  });

  it('rejects an invalid email address', async () => {
    const response = await request(app.getHttpServer())
      .post('/api/v1/contact')
      .send({
        name: 'Contact Student',
        email: 'not-an-email',
        subject: 'Invalid email',
        message: 'This message has a valid length.',
      })
      .expect(400);

    expect(response.body).toMatchObject({
      statusCode: 400,
      error: 'Bad Request',
    });
  });

  it('rejects a message that is too short', async () => {
    await request(app.getHttpServer())
      .post('/api/v1/contact')
      .send({
        name: 'Contact Student',
        email,
        subject: 'Short message',
        message: 'Too short',
      })
      .expect(400);
  });

  it('rejects unknown fields', async () => {
    await request(app.getHttpServer())
      .post('/api/v1/contact')
      .send({
        name: 'Contact Student',
        email,
        subject: 'Extra field',
        message: 'This message includes an unknown field.',
        role: 'admin',
      })
      .expect(400);
  });
});
