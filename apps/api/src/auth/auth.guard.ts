import { CanActivate, ExecutionContext, Injectable, UnauthorizedException } from "@nestjs/common";
import { ConfigService } from "@nestjs/config";
import { JwtService } from "@nestjs/jwt";

import { Env } from "../config/env.validation.js";
import { AccessTokenPayload, AuthenticatedRequest } from "./types.js";

@Injectable()
export class AuthGuard implements CanActivate {
  constructor(
    private readonly configService: ConfigService<Env, true>,
    private readonly jwtService: JwtService,
  ) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const request = context.switchToHttp().getRequest<AuthenticatedRequest>();
    const authHeader = request.headers.authorization;
    const token = authHeader?.startsWith("Bearer ")
      ? authHeader.slice("Bearer ".length)
      : undefined;

    if (!token) {
      throw new UnauthorizedException("Access token ausente.");
    }

    try {
      request.user = await this.jwtService.verifyAsync<AccessTokenPayload>(token, {
        secret: this.configService.get("JWT_ACCESS_SECRET", { infer: true }),
      });
      return true;
    } catch {
      throw new UnauthorizedException("Access token invalido ou expirado.");
    }
  }
}
