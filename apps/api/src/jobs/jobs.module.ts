import { Module } from "@nestjs/common";
import { TypeOrmModule } from "@nestjs/typeorm";

import { AuthModule } from "../auth/auth.module.js";
import { Company } from "../companies/company.entity.js";
import { Job } from "./job.entity.js";
import { JobsController } from "./jobs.controller.js";
import { JobsService } from "./jobs.service.js";

@Module({
  controllers: [JobsController],
  imports: [AuthModule, TypeOrmModule.forFeature([Company, Job])],
  providers: [JobsService],
})
export class JobsModule {}
