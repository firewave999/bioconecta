import { Body, Controller, Get, Param, Post, Put, Req, UseGuards } from "@nestjs/common";
import { ApiBearerAuth, ApiOkResponse, ApiTags } from "@nestjs/swagger";

import { AuthGuard } from "../auth/auth.guard.js";
import type { AuthenticatedRequest } from "../auth/types.js";
import { UpsertJobDto } from "./dto/upsert-job.dto.js";
import { JobsService } from "./jobs.service.js";

@ApiTags("jobs")
@Controller("jobs")
export class JobsController {
  constructor(private readonly jobsService: JobsService) {}

  @Get()
  @ApiOkResponse({ description: "Vagas publicadas." })
  listPublished() {
    return this.jobsService.listPublished();
  }

  @Get("mine")
  @ApiBearerAuth()
  @UseGuards(AuthGuard)
  @ApiOkResponse({ description: "Vagas da empresa autenticada." })
  listMine(@Req() request: AuthenticatedRequest) {
    return this.jobsService.listMine(request.user.sub);
  }

  @Post()
  @ApiBearerAuth()
  @UseGuards(AuthGuard)
  @ApiOkResponse({ description: "Vaga criada." })
  createMine(@Req() request: AuthenticatedRequest, @Body() dto: UpsertJobDto) {
    return this.jobsService.createMine(request.user.sub, dto);
  }

  @Put(":id")
  @ApiBearerAuth()
  @UseGuards(AuthGuard)
  @ApiOkResponse({ description: "Vaga atualizada." })
  updateMine(
    @Req() request: AuthenticatedRequest,
    @Param("id") id: string,
    @Body() dto: UpsertJobDto,
  ) {
    return this.jobsService.updateMine(request.user.sub, id, dto);
  }
}
