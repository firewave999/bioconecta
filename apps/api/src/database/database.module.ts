import { Module } from "@nestjs/common";
import { ConfigService } from "@nestjs/config";
import { TypeOrmModule } from "@nestjs/typeorm";

import { Env } from "../config/env.validation.js";
import { buildTypeOrmModuleOptions } from "./typeorm.options.js";

function envFromConfig(configService: ConfigService<Env, true>): Env {
  return {
    APP_API_PORT: configService.get("APP_API_PORT", { infer: true }),
    APP_API_URL: configService.get("APP_API_URL", { infer: true }),
    APP_WEB_URL: configService.get("APP_WEB_URL", { infer: true }),
    DATABASE_URL: configService.get("DATABASE_URL", { infer: true }),
    JWT_ACCESS_SECRET: configService.get("JWT_ACCESS_SECRET", { infer: true }),
    JWT_REFRESH_SECRET: configService.get("JWT_REFRESH_SECRET", { infer: true }),
    NODE_ENV: configService.get("NODE_ENV", { infer: true }),
    POSTGRES_DB: configService.get("POSTGRES_DB", { infer: true }),
    POSTGRES_HOST: configService.get("POSTGRES_HOST", { infer: true }),
    POSTGRES_PASSWORD: configService.get("POSTGRES_PASSWORD", { infer: true }),
    POSTGRES_PORT: configService.get("POSTGRES_PORT", { infer: true }),
    POSTGRES_USER: configService.get("POSTGRES_USER", { infer: true }),
    REDIS_URL: configService.get("REDIS_URL", { infer: true }),
  };
}

@Module({
  imports: [
    TypeOrmModule.forRootAsync({
      inject: [ConfigService],
      useFactory: (configService: ConfigService<Env, true>) =>
        buildTypeOrmModuleOptions(envFromConfig(configService)),
    }),
  ],
})
export class DatabaseModule {}
