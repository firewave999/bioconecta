import { Body, Controller, Get, Param, Post, Put, Query, Req, UseGuards } from "@nestjs/common";
import { ApiBearerAuth, ApiOkResponse, ApiTags } from "@nestjs/swagger";

import { AuthGuard } from "../auth/auth.guard.js";
import type { AuthenticatedRequest } from "../auth/types.js";
import { ListJobsQueryDto } from "./dto/list-jobs-query.dto.js";
import { UpsertJobDto } from "./dto/upsert-job.dto.js";
import { JobsService } from "./jobs.service.js";

@ApiTags("jobs")
@Controller("jobs")
export class JobsController {
  constructor(private readonly jobsService: JobsService) {}

  @Get()
  @ApiOkResponse({ description: "Vagas publicadas." })
  listPublished(@Query() query: ListJobsQueryDto) {
    return this.jobsService.listPublished(query);
  }

  @Get("mine")
  @ApiBearerAuth()
  @UseGuards(AuthGuard)
  @ApiOkResponse({ description: "Vagas da empresa autenticada." })
  listMine(@Req() request: AuthenticatedRequest) {
    return this.jobsService.listMine(request.user.sub);
  }

  @Get("mine/:id")
  @ApiBearerAuth()
  @UseGuards(AuthGuard)
  @ApiOkResponse({ description: "Detalhe de vaga da empresa autenticada." })
  getMine(@Req() request: AuthenticatedRequest, @Param("id") id: string) {
    return this.jobsService.getMine(request.user.sub, id);
  }

  @Get(":id")
  @ApiOkResponse({ description: "Detalhe de vaga publicada." })
  getPublished(@Param("id") id: string) {
    return this.jobsService.getPublished(id);
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
