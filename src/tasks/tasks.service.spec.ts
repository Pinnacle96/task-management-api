import { NotFoundException } from '@nestjs/common';
import { TaskPriority, TaskStatus } from '@prisma/client';
import { CategoriesService } from '../categories/categories.service';
import { PrismaService } from '../prisma/prisma.service';
import { TasksService } from './tasks.service';

describe('TasksService', () => {
  let service: TasksService;
  let prisma: {
    task: {
      create: jest.Mock;
      findMany: jest.Mock;
      findFirst: jest.Mock;
      update: jest.Mock;
      delete: jest.Mock;
    };
  };
  let categoriesService: jest.Mocked<Pick<CategoriesService, 'ensureOwnedByUser'>>;

  beforeEach(() => {
    prisma = {
      task: {
        create: jest.fn(),
        findMany: jest.fn(),
        findFirst: jest.fn(),
        update: jest.fn(),
        delete: jest.fn(),
      },
    };
    categoriesService = {
      ensureOwnedByUser: jest.fn(),
    };
    service = new TasksService(
      prisma as unknown as PrismaService,
      categoriesService as unknown as CategoriesService,
    );
  });

  it('creates a task scoped to the authenticated user', async () => {
    prisma.task.create.mockResolvedValue({ id: 'task-id' });

    await service.create('user-id', {
      title: ' Ship API ',
      status: TaskStatus.pending,
      priority: TaskPriority.high,
      categoryId: 'category-id',
    });

    expect(categoriesService.ensureOwnedByUser).toHaveBeenCalledWith('user-id', 'category-id');
    expect(prisma.task.create).toHaveBeenCalledWith(
      expect.objectContaining({
        data: expect.objectContaining({
          title: 'Ship API',
          userId: 'user-id',
          categoryId: 'category-id',
        }),
      }),
    );
  });

  it('filters tasks by user, status, priority, category, and search term', async () => {
    prisma.task.findMany.mockResolvedValue([]);

    await service.findAll('user-id', {
      status: TaskStatus.completed,
      priority: TaskPriority.medium,
      categoryId: 'category-id',
      search: ' docs ',
    });

    expect(prisma.task.findMany).toHaveBeenCalledWith(
      expect.objectContaining({
        where: {
          userId: 'user-id',
          status: TaskStatus.completed,
          priority: TaskPriority.medium,
          categoryId: 'category-id',
          title: {
            contains: 'docs',
            mode: 'insensitive',
          },
        },
      }),
    );
  });

  it('throws not found when a task is outside the user scope', async () => {
    prisma.task.findFirst.mockResolvedValue(null);

    await expect(service.findOne('user-id', 'task-id')).rejects.toBeInstanceOf(NotFoundException);
    expect(prisma.task.findFirst).toHaveBeenCalledWith(
      expect.objectContaining({
        where: { id: 'task-id', userId: 'user-id' },
      }),
    );
  });
});
