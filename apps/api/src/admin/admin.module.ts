import { Module } from "@nestjs/common";
import { TypeOrmModule } from "@nestjs/typeorm";

import { Application } from "../applications/application.entity.js";
import { AuthModule } from "../auth/auth.module.js";
import { BiologistProfile } from "../biologist-profile/biologist-profile.entity.js";
import { Company } from "../companies/company.entity.js";
import { Job } from "../jobs/job.entity.js";
import { User } from "../users/user.entity.js";
import { AdminAuditLog } from "./admin-audit-log.entity.js";
import { AdminController } from "./admin.controller.js";
import { AdminGuard } from "./admin.guard.js";
import { AdminService } from "./admin.service.js";

@Module({
  controllers: [AdminController],
  imports: [
    AuthModule,
    TypeOrmModule.forFeature([AdminAuditLog, Application, BiologistProfile, Company, Job, User]),
  ],
  providers: [AdminGuard, AdminService],
})
export class AdminModule {}
