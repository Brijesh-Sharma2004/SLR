import type { INestApplication } from '@nestjs/common';
import { getModelToken } from '@nestjs/mongoose';
import type { Model } from 'mongoose';
import request from 'supertest';
import type { App } from 'supertest/types.js';
import { User } from '../src/database/schemas/user.schema.js';
import { createE2eApp } from './utils/create-e2e-app.js';

interface PublicUserResponse {
  data: {
    id: string;
    name: string;
    email: string;
    course: string | null;
    createdAt: string;
    passwordHash?: string;
  };
}

describe('Authentication (e2e)', () => {
  let app: INestApplication<App>;
  let userModel: Model<User>;
  let agent: ReturnType<typeof request.agent>;

  const email = `slr-e2e-${Date.now()}@example.com`;
  const password = 'TestPassword123';

  beforeAll(async () => {
    app = await createE2eApp();
    userModel = app.get<Model<User>>(getModelToken(User.name));
    agent = request.agent(app.getHttpServer());
  });

  afterAll(async () => {
    await userModel.deleteOne({ email }).exec();
    await app.close();
  });

  it('registers a user and starts a cookie session', async () => {
    const response = await agent
      .post('/api/v1/auth/register')
      .send({ name: 'E2E Student', email, password })
      .expect(201);

    const body = response.body as PublicUserResponse;

    expect(body.data).toMatchObject({
      name: 'E2E Student',
      email,
      course: null,
    });
    expect(body.data.id).toBeTruthy();
    expect(body.data.passwordHash).toBeUndefined();

    const setCookie = response.headers['set-cookie'];
    const cookieHeader = Array.isArray(setCookie)
      ? setCookie.join(';')
      : String(setCookie);

    expect(cookieHeader).toContain('slr_access_token=');
    expect(cookieHeader).toContain('HttpOnly');
    expect(cookieHeader).toContain('SameSite=Lax');
  });

  it('rejects a duplicate registration', async () => {
    const response = await request(app.getHttpServer())
      .post('/api/v1/auth/register')
      .send({ name: 'Another Student', email, password })
      .expect(409);

    expect(response.body).toMatchObject({
      statusCode: 409,
      error: 'Conflict',
    });
  });

  it('returns the authenticated user profile', async () => {
    const response = await agent
      .get('/api/v1/users/me')
      .expect(200);

    const body = response.body as PublicUserResponse;

    expect(body.data).toMatchObject({
      name: 'E2E Student',
      email,
    });
  });

  it('updates the authenticated user profile', async () => {
    const response = await agent
      .patch('/api/v1/users/me')
      .send({ name: 'Updated Student' })
      .expect(200);

    const body = response.body as PublicUserResponse;

    expect(body.data.name).toBe('Updated Student');
  });

  it('rejects invalid credentials', async () => {
    const response = await request(app.getHttpServer())
      .post('/api/v1/auth/login')
      .send({ email, password: 'WrongPassword123' })
      .expect(401);

    expect(response.body).toMatchObject({
      statusCode: 401,
      error: 'Unauthorized',
    });
  });

  it('logs in with valid credentials', async () => {
    const response = await agent
      .post('/api/v1/auth/login')
      .send({ email, password })
      .expect(200);

    const body = response.body as PublicUserResponse;

    expect(body.data.email).toBe(email);
  });

  it('logs out and blocks access to protected routes', async () => {
    await agent.post('/api/v1/auth/logout').expect(200);

    const response = await agent
      .get('/api/v1/users/me')
      .expect(401);

    expect(response.body).toMatchObject({
      statusCode: 401,
      error: 'Unauthorized',
    });
  });
});
