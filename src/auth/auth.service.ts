import { ConflictException, Injectable, UnauthorizedException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import * as argon2 from 'argon2';
import { UsersService } from '../users/users.service';
import { LoginDto } from './dto/login.dto';
import { RegisterDto } from './dto/register.dto';

@Injectable()
export class AuthService {
  constructor(
    private readonly usersService: UsersService,
    private readonly jwtService: JwtService,
  ) {}

  async register(dto: RegisterDto) {
    const email = dto.email.toLowerCase();
    const existingUser = await this.usersService.findByEmail(email);

    if (existingUser) {
      throw new ConflictException('Email is already registered.');
    }

    const passwordHash = await argon2.hash(dto.password);
    const user = await this.usersService.create({
      email,
      name: dto.name?.trim(),
      passwordHash,
    });

    return this.buildAuthResponse(user);
  }

  async login(dto: LoginDto) {
    const user = await this.usersService.findByEmail(dto.email.toLowerCase());

    if (!user) {
      throw new UnauthorizedException('Invalid email or password.');
    }

    const passwordMatches = await argon2.verify(user.passwordHash, dto.password);

    if (!passwordMatches) {
      throw new UnauthorizedException('Invalid email or password.');
    }

    return this.buildAuthResponse(user);
  }

  async me(userId: string) {
    const user = await this.usersService.findById(userId);

    if (!user) {
      throw new UnauthorizedException('User no longer exists.');
    }

    return this.usersService.toSafeUser(user);
  }

  private buildAuthResponse(user: Awaited<ReturnType<UsersService['findById']>> extends infer T ? NonNullable<T> : never) {
    const safeUser = this.usersService.toSafeUser(user);

    return {
      user: safeUser,
      accessToken: this.jwtService.sign({
        sub: user.id,
        email: user.email,
      }),
    };
  }
}
