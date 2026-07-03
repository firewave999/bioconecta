import "reflect-metadata";

import { config } from "dotenv";
import { DataSource } from "typeorm";

import { validateEnv } from "../config/env.validation.js";
import { buildDataSourceOptions } from "./typeorm.options.js";

config();

const env = validateEnv(process.env);

export default new DataSource(buildDataSourceOptions(env));
