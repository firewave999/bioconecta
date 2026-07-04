import { Module } from "@nestjs/common";
import { TypeOrmModule } from "@nestjs/typeorm";

import { User } from "../users/user.entity.js";
import { BiologistProfileController } from "./biologist-profile.controller.js";
import { BiologistProfile } from "./biologist-profile.entity.js";
import { BiologistProfileService } from "./biologist-profile.service.js";

@Module({
  controllers: [BiologistProfileController],
  imports: [TypeOrmModule.forFeature([BiologistProfile, User])],
  providers: [BiologistProfileService],
})
export class BiologistProfileModule {}
