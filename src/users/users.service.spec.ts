import { PrismaService } from '../prisma/prisma.service';
import { UsersService } from './users.service';

describe('UsersService', () => {
  let service: UsersService;
  let prisma: {
    user: {
      create: jest.Mock;
      findUnique: jest.Mock;
    };
  };

  beforeEach(() => {
    prisma = {
      user: {
        create: jest.fn(),
        findUnique: jest.fn(),
      },
    };
    service = new UsersService(prisma as unknown as PrismaService);
  });

  it('creates users through Prisma', async () => {
    prisma.user.create.mockResolvedValue({ id: 'user-id' });

    await service.create({
      email: 'ada@example.com',
      passwordHash: 'hash',
    });

    expect(prisma.user.create).toHaveBeenCalledWith({
      data: {
        email: 'ada@example.com',
        passwordHash: 'hash',
      },
    });
  });

  it('normalizes email lookup to lowercase', async () => {
    prisma.user.findUnique.mockResolvedValue(null);

    await service.findByEmail('ADA@example.com');

    expect(prisma.user.findUnique).toHaveBeenCalledWith({
      where: { email: 'ada@example.com' },
    });
  });

  it('looks up users by id', async () => {
    prisma.user.findUnique.mockResolvedValue(null);

    await service.findById('user-id');

    expect(prisma.user.findUnique).toHaveBeenCalledWith({
      where: { id: 'user-id' },
    });
  });

  it('removes passwordHash from safe user responses', () => {
    const result = service.toSafeUser({
      id: 'user-id',
      email: 'ada@example.com',
      name: null,
      passwordHash: 'hash',
      createdAt: new Date(),
      updatedAt: new Date(),
    });

    expect(result).not.toHaveProperty('passwordHash');
  });
});
