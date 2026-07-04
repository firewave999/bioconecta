import { Module } from "@nestjs/common";
import { TypeOrmModule } from "@nestjs/typeorm";

import { Company } from "../companies/company.entity.js";
import { Job } from "./job.entity.js";
import { JobsController } from "./jobs.controller.js";
import { JobsService } from "./jobs.service.js";

@Module({
  controllers: [JobsController],
  imports: [TypeOrmModule.forFeature([Company, Job])],
  providers: [JobsService],
})
export class JobsModule {}
