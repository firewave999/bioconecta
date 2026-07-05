import { Module } from "@nestjs/common";
import { TypeOrmModule } from "@nestjs/typeorm";

import { AuthModule } from "../auth/auth.module.js";
import { BiologistProfile } from "../biologist-profile/biologist-profile.entity.js";
import { PracticeArea } from "../biologist-profile/entities/practice-area.entity.js";
import { Skill } from "../biologist-profile/entities/skill.entity.js";
import { TaxonomicGroup } from "../biologist-profile/entities/taxonomic-group.entity.js";
import { Company } from "../companies/company.entity.js";
import { Job } from "../jobs/job.entity.js";
import { Application } from "./application.entity.js";
import { ApplicationsController } from "./applications.controller.js";
import { ApplicationsService } from "./applications.service.js";

@Module({
  controllers: [ApplicationsController],
  imports: [
    AuthModule,
    TypeOrmModule.forFeature([
      Application,
      BiologistProfile,
      Company,
      Job,
      PracticeArea,
      Skill,
      TaxonomicGroup,
    ]),
  ],
  providers: [ApplicationsService],
})
export class ApplicationsModule {}
