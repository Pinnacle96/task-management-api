import { ConflictException, UnauthorizedException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import * as argon2 from 'argon2';
import { AuthService } from './auth.service';
import { UsersService } from '../users/users.service';

describe('AuthService', () => {
  let service: AuthService;
  let usersService: jest.Mocked<Pick<UsersService, 'create' | 'findByEmail' | 'findById' | 'toSafeUser'>>;
  let jwtService: jest.Mocked<Pick<JwtService, 'sign'>>;

  beforeEach(() => {
    usersService = {
      create: jest.fn(),
      findByEmail: jest.fn(),
      findById: jest.fn(),
      toSafeUser: jest.fn((user) => {
        const { passwordHash: _passwordHash, ...safeUser } = user;
        return safeUser;
      }),
    };
    jwtService = {
      sign: jest.fn().mockReturnValue('signed.jwt.token'),
    };
    service = new AuthService(
      usersService as unknown as UsersService,
      jwtService as unknown as JwtService,
    );
  });

  it('registers a user with a hashed password and returns a token', async () => {
    usersService.findByEmail.mockResolvedValue(null);
    usersService.create.mockResolvedValue({
      id: 'user-id',
      email: 'ada@example.com',
      name: 'Ada',
      passwordHash: 'hashed',
      createdAt: new Date(),
      updatedAt: new Date(),
    });

    const result = await service.register({
      email: 'ADA@example.com',
      password: 'strong-password',
      name: 'Ada',
    });

    expect(usersService.create).toHaveBeenCalledWith(
      expect.objectContaining({
        email: 'ada@example.com',
        passwordHash: expect.any(String),
      }),
    );
    expect(result.accessToken).toBe('signed.jwt.token');
    expect(result.user).not.toHaveProperty('passwordHash');
  });

  it('rejects duplicate registrations', async () => {
    usersService.findByEmail.mockResolvedValue({
      id: 'user-id',
      email: 'ada@example.com',
      name: null,
      passwordHash: 'hashed',
      createdAt: new Date(),
      updatedAt: new Date(),
    });

    await expect(
      service.register({ email: 'ada@example.com', password: 'strong-password' }),
    ).rejects.toBeInstanceOf(ConflictException);
  });

  it('rejects invalid login credentials', async () => {
    usersService.findByEmail.mockResolvedValue({
      id: 'user-id',
      email: 'ada@example.com',
      name: null,
      passwordHash: await argon2.hash('actual-password'),
      createdAt: new Date(),
      updatedAt: new Date(),
    });

    await expect(
      service.login({ email: 'ada@example.com', password: 'wrong-password' }),
    ).rejects.toBeInstanceOf(UnauthorizedException);
  });
});
