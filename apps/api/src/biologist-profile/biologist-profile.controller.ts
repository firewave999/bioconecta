import { Body, Controller, Get, Put, Req, UseGuards } from "@nestjs/common";
import { ApiBearerAuth, ApiOkResponse, ApiTags } from "@nestjs/swagger";

import { AuthGuard } from "../auth/auth.guard.js";
import type { AuthenticatedRequest } from "../auth/types.js";
import { BiologistProfileService } from "./biologist-profile.service.js";
import { UpsertBiologistProfileDto } from "./dto/upsert-biologist-profile.dto.js";

@ApiTags("biologist-profile")
@ApiBearerAuth()
@UseGuards(AuthGuard)
@Controller("biologist-profile")
export class BiologistProfileController {
  constructor(private readonly biologistProfileService: BiologistProfileService) {}

  @Get("me")
  @ApiOkResponse({ description: "Perfil do biologo autenticado." })
  getMine(@Req() request: AuthenticatedRequest) {
    return this.biologistProfileService.getMine(request.user.sub);
  }

  @Put("me")
  @ApiOkResponse({ description: "Perfil do biologo salvo." })
  upsertMine(@Req() request: AuthenticatedRequest, @Body() dto: UpsertBiologistProfileDto) {
    return this.biologistProfileService.upsertMine(request.user.sub, dto);
  }
}
