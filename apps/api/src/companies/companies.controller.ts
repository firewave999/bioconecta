import { Body, Controller, Get, Put, Req, UseGuards } from "@nestjs/common";
import { ApiBearerAuth, ApiOkResponse, ApiTags } from "@nestjs/swagger";

import { AuthGuard } from "../auth/auth.guard.js";
import type { AuthenticatedRequest } from "../auth/types.js";
import { CompaniesService } from "./companies.service.js";
import { UpsertCompanyDto } from "./dto/upsert-company.dto.js";

@ApiTags("companies")
@ApiBearerAuth()
@UseGuards(AuthGuard)
@Controller("companies")
export class CompaniesController {
  constructor(private readonly companiesService: CompaniesService) {}

  @Get("me")
  @ApiOkResponse({ description: "Empresa da conta autenticada." })
  getMine(@Req() request: AuthenticatedRequest) {
    return this.companiesService.getMine(request.user.sub);
  }

  @Put("me")
  @ApiOkResponse({ description: "Empresa criada ou atualizada." })
  upsertMine(@Req() request: AuthenticatedRequest, @Body() dto: UpsertCompanyDto) {
    return this.companiesService.upsertMine(request.user.sub, dto);
  }
}
