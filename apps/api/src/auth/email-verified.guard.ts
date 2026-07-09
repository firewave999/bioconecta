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
      throw new ForbiddenException("Usuario autenticado nao encontrado.");
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
      throw new ForbiddenException("Usuario autenticado nao encontrado.");
    }

    if (user.roles.includes("ADMIN") || user.emailVerifiedAt) {
      return true;
    }

    throw new ForbiddenException(
      "Confirme seu e-mail antes de executar esta acao. Use o botao de reenvio no dashboard.",
    );
  }
}
