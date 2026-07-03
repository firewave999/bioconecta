import { TypeOrmModuleOptions } from "@nestjs/typeorm";
import { DataSourceOptions } from "typeorm";

import { Env } from "../config/env.validation.js";

export function buildDataSourceOptions(env: Env): DataSourceOptions {
  const baseOptions: DataSourceOptions = env.DATABASE_URL
    ? {
        type: "postgres",
        url: env.DATABASE_URL,
      }
    : {
        type: "postgres",
        database: env.POSTGRES_DB,
        host: env.POSTGRES_HOST,
        password: env.POSTGRES_PASSWORD,
        port: env.POSTGRES_PORT,
        username: env.POSTGRES_USER,
      };

  return {
    ...baseOptions,
    entities: ["dist/**/*.entity.js"],
    migrations: ["dist/database/migrations/*.js"],
    migrationsTableName: "typeorm_migrations",
    synchronize: false,
  };
}

export function buildTypeOrmModuleOptions(env: Env): TypeOrmModuleOptions {
  return {
    ...buildDataSourceOptions(env),
    autoLoadEntities: true,
    retryAttempts: 5,
    retryDelay: 2000,
  };
}
