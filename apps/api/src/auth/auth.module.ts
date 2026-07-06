import { Module } from "@nestjs/common";
import { JwtModule } from "@nestjs/jwt";
import { TypeOrmModule } from "@nestjs/typeorm";

import { User } from "../users/user.entity.js";
import { RateLimitGuard } from "../rate-limit/rate-limit.guard.js";
import { AuthController } from "./auth.controller.js";
import { AuthGuard } from "./auth.guard.js";
import { AuthService } from "./auth.service.js";
import { EmailVerificationToken } from "./entities/email-verification-token.entity.js";
import { Session } from "./entities/session.entity.js";

@Module({
  controllers: [AuthController],
  exports: [AuthGuard, JwtModule],
  imports: [
    JwtModule.register({}),
    TypeOrmModule.forFeature([User, Session, EmailVerificationToken]),
  ],
  providers: [AuthGuard, AuthService, RateLimitGuard],
})
export class AuthModule {}
