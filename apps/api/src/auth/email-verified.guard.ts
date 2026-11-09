import { CanActivate, ExecutionContext, ForbiddenException, Injectable } from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";
import { Repository } from "typeorm";

import { User } from "../users/user.entity.js";
import type { AuthenticatedRequest } from "./types.js";

@Injectable()
export class EmailVerifiedGuard implements CanActivate {
  constructor(
    @InjectRepository(User)
    private readonly usersRepository: Repository<User>,
  ) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const request = context.switchToHttp().getRequest<AuthenticatedRequest>();
    const userId = request.user?.sub;

    if (!userId) {
      throw new ForbiddenException("Usuário autenticado não encontrado.");
    }

    const user = await this.usersRepository.findOne({
      select: {
        emailVerifiedAt: true,
        id: true,
        roles: true,
      },
      where: {
        id: userId,
      },
    });

    if (!user) {
      throw new ForbiddenException("Usuário autenticado não encontrado.");
    }

    if (user.roles.includes("ADMIN") || user.emailVerifiedAt) {
      return true;
    }

    throw new ForbiddenException(
      "Confirme seu e-mail antes de executar esta ação. Use o botão de reenvio no dashboard.",
    );
  }
}
