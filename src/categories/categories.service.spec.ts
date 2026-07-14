import { ConflictException, NotFoundException } from '@nestjs/common';
import { Prisma } from '@prisma/client';
import { PrismaService } from '../prisma/prisma.service';
import { CategoriesService } from './categories.service';

describe('CategoriesService', () => {
  let service: CategoriesService;
  let prisma: {
    category: {
      create: jest.Mock;
      findMany: jest.Mock;
      findFirst: jest.Mock;
      update: jest.Mock;
      delete: jest.Mock;
    };
  };

  beforeEach(() => {
    prisma = {
      category: {
        create: jest.fn(),
        findMany: jest.fn(),
        findFirst: jest.fn(),
        update: jest.fn(),
        delete: jest.fn(),
      },
    };
    service = new CategoriesService(prisma as unknown as PrismaService);
  });

  it('creates a user-owned category', async () => {
    prisma.category.create.mockResolvedValue({ id: 'category-id' });

    await service.create('user-id', { name: ' Work ' });

    expect(prisma.category.create).toHaveBeenCalledWith({
      data: {
        name: 'Work',
        userId: 'user-id',
      },
    });
  });

  it('lists categories for the current user', async () => {
    prisma.category.findMany.mockResolvedValue([]);

    await service.findAll('user-id');

    expect(prisma.category.findMany).toHaveBeenCalledWith({
      where: { userId: 'user-id' },
      orderBy: { name: 'asc' },
    });
  });

  it('rejects duplicate category names', async () => {
    prisma.category.create.mockRejectedValue(
      new Prisma.PrismaClientKnownRequestError('Duplicate', {
        code: 'P2002',
        clientVersion: 'test',
      }),
    );

    await expect(service.create('user-id', { name: 'Work' })).rejects.toBeInstanceOf(
      ConflictException,
    );
  });

  it('throws not found when category is outside the user scope', async () => {
    prisma.category.findFirst.mockResolvedValue(null);

    await expect(service.ensureOwnedByUser('user-id', 'category-id')).rejects.toBeInstanceOf(
      NotFoundException,
    );
  });

  it('updates and deletes only owned categories', async () => {
    prisma.category.findFirst.mockResolvedValue({ id: 'category-id' });
    prisma.category.update.mockResolvedValue({ id: 'category-id', name: 'Personal' });
    prisma.category.delete.mockResolvedValue({ id: 'category-id' });

    await service.update('user-id', 'category-id', { name: ' Personal ' });
    await service.remove('user-id', 'category-id');

    expect(prisma.category.update).toHaveBeenCalledWith({
      where: { id: 'category-id' },
      data: { name: 'Personal' },
    });
    expect(prisma.category.delete).toHaveBeenCalledWith({ where: { id: 'category-id' } });
  });
});
