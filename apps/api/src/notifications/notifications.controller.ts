import { Controller, Get, Param, Put, Req, UseGuards } from "@nestjs/common";
import { ApiBearerAuth, ApiOkResponse, ApiTags } from "@nestjs/swagger";

import { AuthGuard } from "../auth/auth.guard.js";
import type { AuthenticatedRequest } from "../auth/types.js";
import { NotificationsService } from "./notifications.service.js";

@ApiTags("notifications")
@ApiBearerAuth()
@UseGuards(AuthGuard)
@Controller("notifications")
export class NotificationsController {
  constructor(private readonly notificationsService: NotificationsService) {}

  @Get("mine")
  @ApiOkResponse({ description: "Notificacoes do usuario autenticado." })
  listMine(@Req() request: AuthenticatedRequest) {
    return this.notificationsService.listMine(request.user.sub);
  }

  @Put("read-all")
  @ApiOkResponse({ description: "Marca todas as notificacoes como lidas." })
  markAllAsRead(@Req() request: AuthenticatedRequest) {
    return this.notificationsService.markAllAsRead(request.user.sub);
  }

  @Put(":id/read")
  @ApiOkResponse({ description: "Marca uma notificacao como lida." })
  markAsRead(@Req() request: AuthenticatedRequest, @Param("id") id: string) {
    return this.notificationsService.markAsRead(request.user.sub, id);
  }
}
