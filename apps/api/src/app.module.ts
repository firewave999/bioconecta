import { Module } from "@nestjs/common";
import { ConfigModule } from "@nestjs/config";

import { AdminModule } from "./admin/admin.module.js";
import { ApplicationsModule } from "./applications/applications.module.js";
import { AuthModule } from "./auth/auth.module.js";
import { BiologistProfileModule } from "./biologist-profile/biologist-profile.module.js";
import { CompaniesModule } from "./companies/companies.module.js";
import { validateEnv } from "./config/env.validation.js";
import { DatabaseModule } from "./database/database.module.js";
import { FavoritesModule } from "./favorites/favorites.module.js";
import { HealthModule } from "./health/health.module.js";
import { JobsModule } from "./jobs/jobs.module.js";
import { NotificationsModule } from "./notifications/notifications.module.js";
import { UploadsModule } from "./uploads/uploads.module.js";
import { UsersModule } from "./users/users.module.js";

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      validate: validateEnv,
    }),
    DatabaseModule,
    AdminModule,
    ApplicationsModule,
    AuthModule,
    BiologistProfileModule,
    CompaniesModule,
    FavoritesModule,
    HealthModule,
    JobsModule,
    NotificationsModule,
    UploadsModule,
    UsersModule,
  ],
})
export class AppModule {}
