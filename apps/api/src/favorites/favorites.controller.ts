import { Controller, Delete, Get, Param, Post, Req, UseGuards } from "@nestjs/common";
import { ApiBearerAuth, ApiOkResponse, ApiTags } from "@nestjs/swagger";

import { AuthGuard } from "../auth/auth.guard.js";
import type { AuthenticatedRequest } from "../auth/types.js";
import { FavoritesService } from "./favorites.service.js";

@ApiTags("favorites")
@ApiBearerAuth()
@UseGuards(AuthGuard)
@Controller("favorites")
export class FavoritesController {
  constructor(private readonly favoritesService: FavoritesService) {}

  @Get("jobs")
  @ApiOkResponse({ description: "Vagas salvas do usuario autenticado." })
  listSavedJobs(@Req() request: AuthenticatedRequest) {
    return this.favoritesService.listSavedJobs(request.user.sub);
  }

  @Get("jobs/:jobId")
  @ApiOkResponse({ description: "Estado de favorito da vaga." })
  getSavedState(@Req() request: AuthenticatedRequest, @Param("jobId") jobId: string) {
    return this.favoritesService.getSavedState(request.user.sub, jobId);
  }

  @Post("jobs/:jobId")
  @ApiOkResponse({ description: "Vaga salva." })
  saveJob(@Req() request: AuthenticatedRequest, @Param("jobId") jobId: string) {
    return this.favoritesService.saveJob(request.user.sub, jobId);
  }

  @Delete("jobs/:jobId")
  @ApiOkResponse({ description: "Vaga removida dos favoritos." })
  unsaveJob(@Req() request: AuthenticatedRequest, @Param("jobId") jobId: string) {
    return this.favoritesService.unsaveJob(request.user.sub, jobId);
  }
}
