import { randomBytes, createHash } from "node:crypto";

import {
  BadRequestException,
  ConflictException,
  ForbiddenException,
  Injectable,
  UnauthorizedException,
} from "@nestjs/common";
import { ConfigService } from "@nestjs/config";
import { JwtService } from "@nestjs/jwt";
import { InjectRepository } from "@nestjs/typeorm";
import { compare, hash } from "bcryptjs";
import { IsNull, Repository } from "typeorm";

import { Env } from "../config/env.validation.js";
import { User } from "../users/user.entity.js";
import { LoginDto } from "./dto/login.dto.js";
import { RegisterDto } from "./dto/register.dto.js";
import { EmailVerificationToken } from "./entities/email-verification-token.entity.js";
import { Session } from "./entities/session.entity.js";
import { AccessTokenPayload, PublicUser } from "./types.js";

type RequestContext = {
  ipAddress?: string;
  userAgent?: string;
};

type TokenPair = {
  accessToken: string;
  expiresIn: number;
  refreshToken: string;
};

@Injectable()
export class AuthService {
  constructor(
    @InjectRepository(User)
    private readonly usersRepository: Repository<User>,
    @InjectRepository(Session)
    private readonly sessionsRepository: Repository<Session>,
    @InjectRepository(EmailVerificationToken)
    private readonly emailTokensRepository: Repository<EmailVerificationToken>,
    private readonly configService: ConfigService<Env, true>,
    private readonly jwtService: JwtService,
  ) {}

  async register(dto: RegisterDto, context: RequestContext) {
    if (!dto.acceptTerms || !dto.acceptPrivacy) {
      throw new BadRequestException("Termos de uso e politica de privacidade devem ser aceitos.");
    }

    const normalizedEmail = dto.email.trim().toLowerCase();
    const existing = await this.usersRepository.findOne({
      where: {
        email: normalizedEmail,
      },
      withDeleted: true,
    });

    if (existing) {
      throw new ConflictException("E-mail ja cadastrado.");
    }

    const now = new Date();
    const user = this.usersRepository.create({
      email: normalizedEmail,
      firstName: dto.firstName.trim(),
      lastName: dto.lastName.trim(),
      passwordHash: await hash(dto.password, 12),
      phone: dto.phone?.trim() || null,
      privacyAcceptedAt: now,
      roles: [dto.role],
      termsAcceptedAt: now,
    });

    await this.usersRepository.save(user);

    const verificationToken = await this.createEmailVerificationToken(user.id);
    const tokens = await this.createSession(user, context);

    return {
      devVerificationToken: this.shouldExposeDevTokens() ? verificationToken : undefined,
      tokens,
      user: this.toPublicUser(user),
    };
  }

  async login(dto: LoginDto, context: RequestContext) {
    const user = await this.usersRepository.findOne({
      where: {
        email: dto.email.trim().toLowerCase(),
      },
    });

    if (!user || !(await compare(dto.password, user.passwordHash))) {
      throw new UnauthorizedException("E-mail ou senha invalidos.");
    }

    if (user.blockedAt) {
      throw new ForbiddenException("Usuario bloqueado.");
    }

    return {
      tokens: await this.createSession(user, context),
      user: this.toPublicUser(user),
    };
  }

  async refresh(refreshToken: string, context: RequestContext) {
    const session = await this.getSessionFromRefreshToken(refreshToken);
    const user = await this.usersRepository.findOneByOrFail({ id: session.userId });

    if (user.blockedAt) {
      throw new ForbiddenException("Usuario bloqueado.");
    }

    const newRefreshSecret = this.generateTokenSecret();
    session.refreshTokenHash = await hash(newRefreshSecret, 12);
    session.expiresAt = this.daysFromNow(
      this.configService.get("JWT_REFRESH_TOKEN_TTL_DAYS", { infer: true }),
    );
    session.lastUsedAt = new Date();
    session.userAgent = context.userAgent ?? session.userAgent;
    session.ipAddress = context.ipAddress ?? session.ipAddress;
    await this.sessionsRepository.save(session);

    return {
      tokens: {
        accessToken: await this.signAccessToken(user, session.id),
        expiresIn: this.configService.get("JWT_ACCESS_TOKEN_TTL_SECONDS", { infer: true }),
        refreshToken: this.composeRefreshToken(session.id, newRefreshSecret),
      },
      user: this.toPublicUser(user),
    };
  }

  async logout(refreshToken: string) {
    const session = await this.getSessionFromRefreshToken(refreshToken);
    session.revokedAt = new Date();
    await this.sessionsRepository.save(session);

    return {
      success: true,
    };
  }

  async logoutAll(userId: string) {
    await this.sessionsRepository.update(
      {
        revokedAt: IsNull(),
        userId,
      },
      {
        revokedAt: new Date(),
      },
    );

    return {
      success: true,
    };
  }

  async verifyEmail(token: string) {
    const tokenHash = this.sha256(token);
    const verification = await this.emailTokensRepository.findOne({
      relations: {
        user: true,
      },
      where: {
        tokenHash,
      },
    });

    if (!verification || verification.usedAt || verification.expiresAt <= new Date()) {
      throw new BadRequestException("Token de verificacao invalido ou expirado.");
    }

    verification.usedAt = new Date();
    verification.user.emailVerifiedAt = verification.user.emailVerifiedAt ?? new Date();

    await this.emailTokensRepository.save(verification);
    await this.usersRepository.save(verification.user);

    return {
      user: this.toPublicUser(verification.user),
      verified: true,
    };
  }

  async me(userId: string) {
    const user = await this.usersRepository.findOneByOrFail({ id: userId });

    return {
      user: this.toPublicUser(user),
    };
  }

  private async createSession(user: User, context: RequestContext): Promise<TokenPair> {
    const refreshSecret = this.generateTokenSecret();
    const session = this.sessionsRepository.create({
      expiresAt: this.daysFromNow(
        this.configService.get("JWT_REFRESH_TOKEN_TTL_DAYS", { infer: true }),
      ),
      ipAddress: context.ipAddress ?? null,
      refreshTokenHash: await hash(refreshSecret, 12),
      userAgent: context.userAgent ?? null,
      userId: user.id,
    });

    await this.sessionsRepository.save(session);

    return {
      accessToken: await this.signAccessToken(user, session.id),
      expiresIn: this.configService.get("JWT_ACCESS_TOKEN_TTL_SECONDS", { infer: true }),
      refreshToken: this.composeRefreshToken(session.id, refreshSecret),
    };
  }

  private async signAccessToken(user: User, sessionId: string) {
    const payload: AccessTokenPayload = {
      email: user.email,
      roles: user.roles,
      sessionId,
      sub: user.id,
    };

    return this.jwtService.signAsync(payload, {
      expiresIn: this.configService.get("JWT_ACCESS_TOKEN_TTL_SECONDS", { infer: true }),
      secret: this.configService.get("JWT_ACCESS_SECRET", { infer: true }),
    });
  }

  private async createEmailVerificationToken(userId: string) {
    await this.emailTokensRepository.update(
      {
        usedAt: IsNull(),
        userId,
      },
      {
        usedAt: new Date(),
      },
    );

    const token = this.generateTokenSecret();
    const verification = this.emailTokensRepository.create({
      expiresAt: this.hoursFromNow(
        this.configService.get("EMAIL_VERIFICATION_TOKEN_TTL_HOURS", { infer: true }),
      ),
      tokenHash: this.sha256(token),
      userId,
    });

    await this.emailTokensRepository.save(verification);

    return token;
  }

  private async getSessionFromRefreshToken(refreshToken: string) {
    const [sessionId, secret] = refreshToken.split(".");

    if (!sessionId || !secret) {
      throw new UnauthorizedException("Refresh token invalido.");
    }

    const session = await this.sessionsRepository.findOneBy({ id: sessionId });

    if (
      !session ||
      session.revokedAt ||
      session.expiresAt <= new Date() ||
      !(await compare(secret, session.refreshTokenHash))
    ) {
      throw new UnauthorizedException("Refresh token invalido ou expirado.");
    }

    return session;
  }

  private composeRefreshToken(sessionId: string, secret: string) {
    return `${sessionId}.${secret}`;
  }

  private daysFromNow(days: number) {
    return new Date(Date.now() + days * 24 * 60 * 60 * 1000);
  }

  private generateTokenSecret() {
    return randomBytes(48).toString("base64url");
  }

  private hoursFromNow(hours: number) {
    return new Date(Date.now() + hours * 60 * 60 * 1000);
  }

  private sha256(value: string) {
    return createHash("sha256").update(value).digest("hex");
  }

  private shouldExposeDevTokens() {
    return this.configService.get("NODE_ENV", { infer: true }) === "development";
  }

  private toPublicUser(user: User): PublicUser {
    return {
      email: user.email,
      emailVerifiedAt: user.emailVerifiedAt,
      firstName: user.firstName,
      id: user.id,
      lastName: user.lastName,
      phone: user.phone,
      roles: user.roles,
    };
  }
}
