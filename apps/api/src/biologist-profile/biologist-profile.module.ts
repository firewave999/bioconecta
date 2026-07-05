import { Module } from "@nestjs/common";
import { TypeOrmModule } from "@nestjs/typeorm";

import { AuthModule } from "../auth/auth.module.js";
import { User } from "../users/user.entity.js";
import { BiologistProfileController } from "./biologist-profile.controller.js";
import { BiologistProfile } from "./biologist-profile.entity.js";
import { BiologistProfileService } from "./biologist-profile.service.js";
import { BiologistCertification } from "./entities/biologist-certification.entity.js";
import { BiologistDocument } from "./entities/biologist-document.entity.js";
import { BiologistExperience } from "./entities/biologist-experience.entity.js";
import { PracticeArea } from "./entities/practice-area.entity.js";
import { Skill } from "./entities/skill.entity.js";
import { TaxonomicGroup } from "./entities/taxonomic-group.entity.js";

@Module({
  controllers: [BiologistProfileController],
  imports: [
    AuthModule,
    TypeOrmModule.forFeature([
      BiologistCertification,
      BiologistDocument,
      BiologistExperience,
      BiologistProfile,
      PracticeArea,
      Skill,
      TaxonomicGroup,
      User,
    ]),
  ],
  providers: [BiologistProfileService],
})
export class BiologistProfileModule {}
