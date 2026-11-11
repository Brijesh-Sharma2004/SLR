import type { INestApplication } from '@nestjs/common';
import request from 'supertest';
import type { App } from 'supertest/types.js';
import { createE2eApp } from './utils/create-e2e-app.js';

interface CourseListItem {
  id: string;
  slug: string;
  name: string;
  subjectCount: number;
}

interface CourseListBody {
  data: CourseListItem[];
  meta: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
}

interface SubjectListItem {
  slug: string;
  name: string;
  code: string;
  resourceCount: number;
  course: {
    slug: string;
  };
}

interface SubjectListBody {
  data: SubjectListItem[];
  meta: {
    total: number;
  };
}

interface CourseDetailBody {
  data: {
    slug: string;
    subjects: SubjectListItem[];
  };
}

interface SubjectDetailBody {
  data: {
    slug: string;
    resources: Array<{
      slug: string;
      type: string;
    }>;
    course: {
      slug: string;
    };
  };
}

interface ResourceListBody {
  data: Array<{
    id: string;
    slug: string;
    type: string;
    subject: {
      slug: string;
    };
  }>;
  meta: {
    total: number;
  };
}

interface SearchBody {
  data: {
    courses: Array<{ slug: string }>;
    subjects: Array<{ slug: string; resourceCount: number }>;
    resources: Array<{ slug: string }>;
  };
  meta: {
    query: string;
    total: number;
  };
}

describe('Catalog and search (e2e)', () => {
  let app: INestApplication<App>;

  beforeAll(async () => {
    app = await createE2eApp();
  });

  afterAll(async () => {
    await app.close();
  });

  it('lists paginated courses with subject counts', async () => {
    const response = await request(app.getHttpServer())
      .get('/api/v1/courses')
      .expect(200);

    const body = response.body as CourseListBody;

    expect(body.meta).toMatchObject({
      page: 1,
      limit: 20,
      total: 2,
      totalPages: 1,
    });
    expect(body.data).toHaveLength(2);

    const cse = body.data.find(
      (course) => course.slug === 'btech-cse',
    );

    expect(cse).toMatchObject({
      name: 'B.Tech Computer Science',
      duration: '4 Years',
      subjectCount: 4,
    });
  });

  it('supports course pagination', async () => {
    const response = await request(app.getHttpServer())
      .get('/api/v1/courses?page=1&limit=1')
      .expect(200);

    const body = response.body as CourseListBody;

    expect(body.data).toHaveLength(1);
    expect(body.meta.totalPages).toBe(2);
  });

  it('returns a course with its subjects', async () => {
    const response = await request(app.getHttpServer())
      .get('/api/v1/courses/btech-cse')
      .expect(200);

    const body = response.body as CourseDetailBody;

    expect(body.data.slug).toBe('btech-cse');
    expect(body.data.subjects).toHaveLength(4);

    const dbms = body.data.subjects.find(
      (subject) => subject.slug === 'dbms',
    );

    expect(dbms).toMatchObject({
      name: 'Database Management Systems',
      code: 'CS301',
      resourceCount: 3,
    });
  });

  it('returns 404 for an unknown course', async () => {
    const response = await request(app.getHttpServer())
      .get('/api/v1/courses/does-not-exist')
      .expect(404);

    expect(response.body).toMatchObject({
      statusCode: 404,
      error: 'Not Found',
    });
  });

  it('lists subjects and filters them by course', async () => {
    const allResponse = await request(app.getHttpServer())
      .get('/api/v1/subjects')
      .expect(200);

    const allBody = allResponse.body as SubjectListBody;

    expect(allBody.meta.total).toBe(6);
    expect(allBody.data[0]?.course.slug).toBeTruthy();

    const filteredResponse = await request(app.getHttpServer())
      .get('/api/v1/subjects?course=btech-it')
      .expect(200);

    const filteredBody = filteredResponse.body as SubjectListBody;

    expect(filteredBody.meta.total).toBe(2);
    expect(
      filteredBody.data.map((subject) => subject.slug).sort(),
    ).toEqual(['software-engineering', 'web-technology']);
  });

  it('returns a subject with its resources', async () => {
    const response = await request(app.getHttpServer())
      .get('/api/v1/subjects/dbms')
      .expect(200);

    const body = response.body as SubjectDetailBody;

    expect(body.data).toMatchObject({
      slug: 'dbms',
      code: 'CS301',
      course: {
        slug: 'btech-cse',
      },
    });
    expect(body.data.resources).toHaveLength(3);
    expect(
      body.data.resources.map((resource) => resource.type),
    ).toContain('VIDEO');
  });

  it('lists and filters resources', async () => {
    const dbmsResponse = await request(app.getHttpServer())
      .get('/api/v1/resources?subject=dbms')
      .expect(200);

    const dbmsBody = dbmsResponse.body as ResourceListBody;

    expect(dbmsBody.meta.total).toBe(3);
    expect(dbmsBody.data[0]?.subject.slug).toBe('dbms');

    const videoResponse = await request(app.getHttpServer())
      .get('/api/v1/resources?type=VIDEO')
      .expect(200);

    const videoBody = videoResponse.body as ResourceListBody;

    expect(videoBody.meta.total).toBe(1);
    expect(videoBody.data[0]?.type).toBe('VIDEO');
  });

  it('returns a resource by slug and by id', async () => {
    const bySlugResponse = await request(app.getHttpServer())
      .get('/api/v1/resources/dbms-notes-1')
      .expect(200);

    const bySlugBody = bySlugResponse.body as {
      data: { id: string; slug: string };
    };

    expect(bySlugBody.data.slug).toBe('dbms-notes-1');

    const byIdResponse = await request(app.getHttpServer())
      .get(`/api/v1/resources/${bySlugBody.data.id}`)
      .expect(200);

    const byIdBody = byIdResponse.body as {
      data: { slug: string };
    };

    expect(byIdBody.data.slug).toBe('dbms-notes-1');
  });

  it('searches courses, subjects, and resources', async () => {
    const response = await request(app.getHttpServer())
      .get('/api/v1/search?q=dbms')
      .expect(200);

    const body = response.body as SearchBody;

    expect(body.meta.query).toBe('dbms');
    expect(body.data.courses).toHaveLength(0);
    expect(body.data.subjects.map((subject) => subject.slug)).toEqual([
      'dbms',
    ]);
    expect(body.data.subjects).toMatchObject([
      { slug: 'dbms', resourceCount: 3 },
    ]);
    expect(body.data.resources).toHaveLength(3);
    expect(body.meta.total).toBe(4);
  });

  it('returns empty search results for an unmatched query', async () => {
    const response = await request(app.getHttpServer())
      .get('/api/v1/search?q=zzzzzz')
      .expect(200);

    const body = response.body as SearchBody;

    expect(body.meta.total).toBe(0);
    expect(body.data.courses).toHaveLength(0);
    expect(body.data.subjects).toHaveLength(0);
    expect(body.data.resources).toHaveLength(0);
  });

  it('rejects an empty search query', async () => {
    const response = await request(app.getHttpServer())
      .get('/api/v1/search?q=')
      .expect(400);

    expect(response.body).toMatchObject({
      statusCode: 400,
      error: 'Bad Request',
    });
  });
});
