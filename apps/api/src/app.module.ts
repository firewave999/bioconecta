import { Module } from "@nestjs/common";
import { ConfigModule } from "@nestjs/config";

import { AuthModule } from "./auth/auth.module.js";
import { BiologistProfileModule } from "./biologist-profile/biologist-profile.module.js";
import { CompaniesModule } from "./companies/companies.module.js";
import { validateEnv } from "./config/env.validation.js";
import { DatabaseModule } from "./database/database.module.js";
import { HealthModule } from "./health/health.module.js";
import { JobsModule } from "./jobs/jobs.module.js";
import { UsersModule } from "./users/users.module.js";

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      validate: validateEnv,
    }),
    DatabaseModule,
    AuthModule,
    BiologistProfileModule,
    CompaniesModule,
    HealthModule,
    JobsModule,
    UsersModule,
  ],
})
export class AppModule {}
