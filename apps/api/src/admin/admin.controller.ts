import { Body, Controller, Get, Param, Put, Req, UseGuards } from "@nestjs/common";
import { ApiBearerAuth, ApiTags } from "@nestjs/swagger";

import { AuthGuard } from "../auth/auth.guard.js";
import type { AuthenticatedRequest } from "../auth/types.js";
import { AdminGuard } from "./admin.guard.js";
import { AdminService } from "./admin.service.js";
import { UpdateBiologistVerificationStatusDto } from "./dto/update-biologist-verification-status.dto.js";
import { UpdateCompanyVerificationStatusDto } from "./dto/update-company-verification-status.dto.js";
import { UpdateJobStatusDto } from "./dto/update-job-status.dto.js";

@ApiTags("admin")
@ApiBearerAuth()
@UseGuards(AuthGuard, AdminGuard)
@Controller("admin")
export class AdminController {
  constructor(private readonly adminService: AdminService) {}

  @Get("overview")
  getOverview() {
    return this.adminService.getOverview();
  }

  @Get("users")
  listUsers() {
    return this.adminService.listUsers();
  }

  @Get("companies")
  listCompanies() {
    return this.adminService.listCompanies();
  }

  @Get("biologists")
  listBiologists() {
    return this.adminService.listBiologists();
  }

  @Get("jobs")
  listJobs() {
    return this.adminService.listJobs();
  }

  @Get("applications")
  listApplications() {
    return this.adminService.listApplications();
  }

  @Get("audit-logs")
  listAuditLogs() {
    return this.adminService.listAuditLogs();
  }

  @Put("companies/:id/verification")
  updateCompanyVerificationStatus(
    @Req() request: AuthenticatedRequest,
    @Param("id") id: string,
    @Body() dto: UpdateCompanyVerificationStatusDto,
  ) {
    return this.adminService.updateCompanyVerificationStatus(request.user.sub, id, dto);
  }

  @Put("biologists/:id/verification")
  updateBiologistVerificationStatus(
    @Req() request: AuthenticatedRequest,
    @Param("id") id: string,
    @Body() dto: UpdateBiologistVerificationStatusDto,
  ) {
    return this.adminService.updateBiologistVerificationStatus(request.user.sub, id, dto);
  }

  @Put("jobs/:id/status")
  updateJobStatus(
    @Req() request: AuthenticatedRequest,
    @Param("id") id: string,
    @Body() dto: UpdateJobStatusDto,
  ) {
    return this.adminService.updateJobStatus(request.user.sub, id, dto);
  }
}
