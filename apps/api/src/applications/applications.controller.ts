import { Body, Controller, Get, Param, Post, Put, Req, UseGuards } from "@nestjs/common";
import { ApiBearerAuth, ApiOkResponse, ApiTags } from "@nestjs/swagger";

import { AuthGuard } from "../auth/auth.guard.js";
import type { AuthenticatedRequest } from "../auth/types.js";
import { ApplicationsService } from "./applications.service.js";
import { CreateApplicationDto } from "./dto/create-application.dto.js";
import { UpdateApplicationStatusDto } from "./dto/update-application-status.dto.js";

@ApiTags("applications")
@ApiBearerAuth()
@UseGuards(AuthGuard)
@Controller("applications")
export class ApplicationsController {
  constructor(private readonly applicationsService: ApplicationsService) {}

  @Get("mine")
  @ApiOkResponse({ description: "Candidaturas do biologo autenticado." })
  listMine(@Req() request: AuthenticatedRequest) {
    return this.applicationsService.listMine(request.user.sub);
  }

  @Get("jobs/:jobId/me")
  @ApiOkResponse({ description: "Candidatura do biologo autenticado para a vaga." })
  getMyApplicationForJob(@Req() request: AuthenticatedRequest, @Param("jobId") jobId: string) {
    return this.applicationsService.getMyApplicationForJob(request.user.sub, jobId);
  }

  @Post("jobs/:jobId")
  @ApiOkResponse({ description: "Candidatura criada." })
  apply(
    @Req() request: AuthenticatedRequest,
    @Param("jobId") jobId: string,
    @Body() dto: CreateApplicationDto,
  ) {
    return this.applicationsService.apply(request.user.sub, jobId, dto);
  }

  @Get("jobs/:jobId/candidates")
  @ApiOkResponse({ description: "Candidatos de uma vaga da empresa autenticada." })
  listForJob(@Req() request: AuthenticatedRequest, @Param("jobId") jobId: string) {
    return this.applicationsService.listForJob(request.user.sub, jobId);
  }

  @Put(":id/status")
  @ApiOkResponse({ description: "Status da candidatura atualizado." })
  updateStatus(
    @Req() request: AuthenticatedRequest,
    @Param("id") id: string,
    @Body() dto: UpdateApplicationStatusDto,
  ) {
    return this.applicationsService.updateStatus(request.user.sub, id, dto);
  }
}
