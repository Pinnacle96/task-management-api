import { Injectable } from '@nestjs/common';
import { Prisma, User } from '@prisma/client';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class UsersService {
  constructor(private readonly prisma: PrismaService) {}

  create(data: Prisma.UserCreateInput) {
    return this.prisma.user.create({ data });
  }

  findByEmail(email: string) {
    return this.prisma.user.findUnique({ where: { email: email.toLowerCase() } });
  }

  findById(id: string) {
    return this.prisma.user.findUnique({ where: { id } });
  }

  toSafeUser(user: User) {
    const { passwordHash: _passwordHash, ...safeUser } = user;
    return safeUser;
  }
}
