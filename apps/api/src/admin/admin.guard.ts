import { CanActivate, ExecutionContext, ForbiddenException, Injectable } from "@nestjs/common";

import { AuthenticatedRequest } from "../auth/types.js";

@Injectable()
export class AdminGuard implements CanActivate {
  canActivate(context: ExecutionContext): boolean {
    const request = context.switchToHttp().getRequest<AuthenticatedRequest>();

    if (request.user.roles.includes("ADMIN")) {
      return true;
    }

    throw new ForbiddenException("Acesso restrito ao admin.");
  }
}
