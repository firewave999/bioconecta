import { Module } from "@nestjs/common";
import { JwtModule } from "@nestjs/jwt";
import { TypeOrmModule } from "@nestjs/typeorm";

import { User } from "../users/user.entity.js";
import { MailModule } from "../mail/mail.module.js";
import { RateLimitGuard } from "../rate-limit/rate-limit.guard.js";
import { AuthController } from "./auth.controller.js";
import { EmailVerifiedGuard } from "./email-verified.guard.js";
import { AuthGuard } from "./auth.guard.js";
import { AuthService } from "./auth.service.js";
import { EmailVerificationToken } from "./entities/email-verification-token.entity.js";
import { PasswordResetToken } from "./entities/password-reset-token.entity.js";
import { Session } from "./entities/session.entity.js";

@Module({
  controllers: [AuthController],
  exports: [AuthGuard, EmailVerifiedGuard, JwtModule],
  imports: [
    JwtModule.register({}),
    MailModule,
    TypeOrmModule.forFeature([User, Session, EmailVerificationToken, PasswordResetToken]),
  ],
  providers: [AuthGuard, AuthService, EmailVerifiedGuard, RateLimitGuard],
})
export class AuthModule {}
