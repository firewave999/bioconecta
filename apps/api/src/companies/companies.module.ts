import { Module } from "@nestjs/common";
import { TypeOrmModule } from "@nestjs/typeorm";

import { AuthModule } from "../auth/auth.module.js";
import { User } from "../users/user.entity.js";
import { CompaniesController } from "./companies.controller.js";
import { CompaniesService } from "./companies.service.js";
import { Company } from "./company.entity.js";

@Module({
  controllers: [CompaniesController],
  exports: [TypeOrmModule],
  imports: [AuthModule, TypeOrmModule.forFeature([Company, User])],
  providers: [CompaniesService],
})
export class CompaniesModule {}
