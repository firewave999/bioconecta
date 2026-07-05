import { Module } from "@nestjs/common";
import { TypeOrmModule } from "@nestjs/typeorm";

import { AuthModule } from "../auth/auth.module.js";
import { Job } from "../jobs/job.entity.js";
import { FavoritesController } from "./favorites.controller.js";
import { FavoritesService } from "./favorites.service.js";
import { SavedJob } from "./saved-job.entity.js";

@Module({
  controllers: [FavoritesController],
  imports: [AuthModule, TypeOrmModule.forFeature([Job, SavedJob])],
  providers: [FavoritesService],
})
export class FavoritesModule {}
