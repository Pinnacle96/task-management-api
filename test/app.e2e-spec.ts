import { INestApplication, ValidationPipe } from '@nestjs/common';
import { Test } from '@nestjs/testing';
import request from 'supertest';
import { AppModule } from '../src/app.module';
import { HttpExceptionFilter } from '../src/common/filters/http-exception.filter';
import { PrismaService } from '../src/prisma/prisma.service';

type UserRecord = {
  id: string;
  email: string;
  name: string | null;
  passwordHash: string;
  createdAt: Date;
  updatedAt: Date;
};

type TaskRecord = {
  id: string;
  title: string;
  description: string | null;
  status: 'pending' | 'in_progress' | 'completed';
  priority: 'low' | 'medium' | 'high';
  dueDate: Date | null;
  userId: string;
  categoryId: string | null;
  createdAt: Date;
  updatedAt: Date;
};

const createPrismaMock = () => {
  const users: UserRecord[] = [];
  const tasks: TaskRecord[] = [];

  return {
    user: {
      create: jest.fn(({ data }) => {
        const now = new Date();
        const user: UserRecord = {
          id: `user-${users.length + 1}`,
          email: data.email,
          name: data.name ?? null,
          passwordHash: data.passwordHash,
          createdAt: now,
          updatedAt: now,
        };
        users.push(user);
        return Promise.resolve(user);
      }),
      findUnique: jest.fn(({ where }) => {
        const user = where.email
          ? users.find((item) => item.email === where.email)
          : users.find((item) => item.id === where.id);

        return Promise.resolve(user ?? null);
      }),
    },
    category: {
      findFirst: jest.fn(() => Promise.resolve(null)),
    },
    task: {
      create: jest.fn(({ data }) => {
        const now = new Date();
        const task: TaskRecord = {
          id: `task-${tasks.length + 1}`,
          title: data.title,
          description: data.description ?? null,
          status: data.status ?? 'pending',
          priority: data.priority ?? 'medium',
          dueDate: data.dueDate ?? null,
          userId: data.userId,
          categoryId: data.categoryId ?? null,
          createdAt: now,
          updatedAt: now,
        };
        tasks.push(task);
        return Promise.resolve({ ...task, category: null });
      }),
      findMany: jest.fn(({ where }) => {
        const results = tasks.filter((task) => {
          const matchesUser = task.userId === where.userId;
          const matchesStatus = where.status ? task.status === where.status : true;
          const matchesSearch = where.title?.contains
            ? task.title.toLowerCase().includes(where.title.contains.toLowerCase())
            : true;

          return matchesUser && matchesStatus && matchesSearch;
        });

        return Promise.resolve(results.map((task) => ({ ...task, category: null })));
      }),
      findFirst: jest.fn(({ where }) => {
        const task = tasks.find((item) => item.id === where.id && item.userId === where.userId);
        return Promise.resolve(task ? { ...task, category: null } : null);
      }),
      update: jest.fn(({ where, data }) => {
        const task = tasks.find((item) => item.id === where.id);

        if (!task) {
          return Promise.resolve(null);
        }

        Object.assign(task, data, { updatedAt: new Date() });
        return Promise.resolve({ ...task, category: null });
      }),
      delete: jest.fn(({ where }) => {
        const index = tasks.findIndex((item) => item.id === where.id);
        const [deleted] = tasks.splice(index, 1);
        return Promise.resolve(deleted);
      }),
    },
    $connect: jest.fn(),
    $disconnect: jest.fn(),
  };
};

describe('Task Management API (e2e)', () => {
  let app: INestApplication;

  beforeEach(async () => {
    process.env.JWT_SECRET = 'test-secret';
    process.env.JWT_EXPIRES_IN = '1h';

    const moduleRef = await Test.createTestingModule({
      imports: [AppModule],
    })
      .overrideProvider(PrismaService)
      .useValue(createPrismaMock())
      .compile();

    app = moduleRef.createNestApplication();
    app.setGlobalPrefix('api');
    app.useGlobalFilters(new HttpExceptionFilter());
    app.useGlobalPipes(
      new ValidationPipe({
        whitelist: true,
        forbidNonWhitelisted: true,
        transform: true,
      }),
    );

    await app.init();
  });

  afterEach(async () => {
    await app.close();
  });

  it('registers a user and manages tasks through protected endpoints', async () => {
    const server = app.getHttpServer();

    const registerResponse = await request(server)
      .post('/api/auth/register')
      .send({
        email: 'ada@example.com',
        password: 'password123',
        name: 'Ada Lovelace',
      })
      .expect(201);

    const token = registerResponse.body.accessToken;

    await request(server).get('/api/tasks').expect(401);

    const createResponse = await request(server)
      .post('/api/tasks')
      .set('Authorization', `Bearer ${token}`)
      .send({
        title: 'Prepare API submission',
        description: 'Finish testing',
        status: 'pending',
        priority: 'high',
      })
      .expect(201);

    const taskId = createResponse.body.id;

    await request(server)
      .get('/api/tasks?search=submission&status=pending')
      .set('Authorization', `Bearer ${token}`)
      .expect(200)
      .expect(({ body }) => {
        expect(body).toHaveLength(1);
        expect(body[0].id).toBe(taskId);
      });

    await request(server)
      .get(`/api/tasks/${taskId}`)
      .set('Authorization', `Bearer ${token}`)
      .expect(200)
      .expect(({ body }) => {
        expect(body.title).toBe('Prepare API submission');
      });

    await request(server)
      .put(`/api/tasks/${taskId}`)
      .set('Authorization', `Bearer ${token}`)
      .send({
        status: 'completed',
      })
      .expect(200)
      .expect(({ body }) => {
        expect(body.status).toBe('completed');
      });

    await request(server)
      .delete(`/api/tasks/${taskId}`)
      .set('Authorization', `Bearer ${token}`)
      .expect(200);
  });

  it('returns validation errors for invalid payloads', async () => {
    await request(app.getHttpServer())
      .post('/api/auth/register')
      .send({
        email: 'not-an-email',
        password: 'short',
      })
      .expect(400)
      .expect(({ body }) => {
        expect(body.statusCode).toBe(400);
        expect(Array.isArray(body.message)).toBe(true);
      });
  });
});
