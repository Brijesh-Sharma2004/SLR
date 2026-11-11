import {
  ConflictException,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { JwtService } from '@nestjs/jwt';
import * as bcrypt from 'bcrypt';
import type { CookieOptions, Response } from 'express';
import ms, { type StringValue } from 'ms';
import type { UserDocument } from '../database/schemas/user.schema.js';
import { UsersService, type PublicUser } from '../users/users.service.js';
import type { LoginDto } from './dto/login.dto.js';
import type { RegisterDto } from './dto/register.dto.js';

@Injectable()
export class AuthService {
  constructor(
    private readonly usersService: UsersService,
    private readonly jwtService: JwtService,
    private readonly config: ConfigService,
  ) {}

  async register(
    dto: RegisterDto,
    response: Response,
  ): Promise<PublicUser> {
    const existingUser = await this.usersService.findByEmail(dto.email);

    if (existingUser) {
      throw new ConflictException(
        'An account with this email already exists',
      );
    }

    const passwordHash = await bcrypt.hash(
      dto.password,
      this.config.getOrThrow<number>('BCRYPT_SALT_ROUNDS'),
    );

    let user: UserDocument;

    try {
      user = await this.usersService.create({
        name: dto.name,
        email: dto.email,
        passwordHash,
      });
    } catch (error) {
      if (this.isDuplicateKeyError(error)) {
        throw new ConflictException(
          'An account with this email already exists',
        );
      }

      throw error;
    }

    await this.issueSession(user, response);

    return this.usersService.toPublicUser(user);
  }

  async login(
    dto: LoginDto,
    response: Response,
  ): Promise<PublicUser> {
    const user = await this.usersService.findByEmailWithPassword(
      dto.email,
    );

    if (!user) {
      throw new UnauthorizedException('Invalid email or password');
    }

    const passwordMatches = await bcrypt.compare(
      dto.password,
      user.passwordHash,
    );

    if (!passwordMatches) {
      throw new UnauthorizedException('Invalid email or password');
    }

    await this.issueSession(user, response);

    return this.usersService.toPublicUser(user);
  }

  logout(response: Response): { message: string } {
    response.clearCookie(
      this.config.getOrThrow<string>('COOKIE_NAME'),
      this.cookieOptions(),
    );

    return { message: 'Logged out successfully' };
  }

  private async issueSession(
    user: UserDocument,
    response: Response,
  ): Promise<void> {
    const token = await this.jwtService.signAsync({
      sub: user._id.toString(),
      email: user.email,
      role: user.role,
    });

    response.cookie(
      this.config.getOrThrow<string>('COOKIE_NAME'),
      token,
      this.cookieOptions(),
    );
  }

  private cookieOptions(): CookieOptions {
    return {
      httpOnly: true,
      secure: this.config.getOrThrow<boolean>('COOKIE_SECURE'),
      sameSite: 'lax',
      path: '/',
      maxAge: ms(
        this.config.getOrThrow<string>(
          'JWT_EXPIRES_IN',
        ) as StringValue,
      ),
    };
  }

  private isDuplicateKeyError(error: unknown): boolean {
    const code = (error as { code?: unknown }).code;
    return code === 11000;
  }
}
