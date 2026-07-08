import { z } from "zod";

const envSchema = z.object({
  APP_API_PORT: z.coerce.number().int().positive().default(4000),
  APP_API_URL: z.string().url().default("http://localhost:4000"),
  APP_WEB_URL: z.string().url().default("http://localhost:3000"),
  BREVO_API_KEY: z.string().optional(),
  DATABASE_URL: z.string().min(1).optional(),
  EMAIL_VERIFICATION_TOKEN_TTL_HOURS: z.coerce.number().int().positive().default(24),
  JWT_ACCESS_SECRET: z.string().min(16),
  JWT_ACCESS_TOKEN_TTL_SECONDS: z.coerce.number().int().positive().default(900),
  JWT_REFRESH_SECRET: z.string().min(16),
  JWT_REFRESH_TOKEN_TTL_DAYS: z.coerce.number().int().positive().default(30),
  MAIL_FROM_EMAIL: z.string().email().optional().or(z.literal("")),
  MAIL_FROM_NAME: z.string().min(1).default("BioConecta"),
  NODE_ENV: z.enum(["development", "test", "staging", "production"]).default("development"),
  POSTGRES_DB: z.string().min(1).default("bioconecta"),
  POSTGRES_HOST: z.string().min(1).default("localhost"),
  POSTGRES_PASSWORD: z.string().min(1).default("bioconecta_dev_password"),
  POSTGRES_PORT: z.coerce.number().int().positive().default(5432),
  POSTGRES_USER: z.string().min(1).default("bioconecta"),
  REDIS_URL: z.string().min(1).default("redis://localhost:6379"),
  UPLOADS_DIR: z.string().min(1).default("uploads"),
});

export type Env = z.infer<typeof envSchema>;

export function validateEnv(config: Record<string, unknown>): Env {
  const parsed = envSchema.safeParse(config);

  if (!parsed.success) {
    const message = parsed.error.issues
      .map((issue) => `${issue.path.join(".")}: ${issue.message}`)
      .join("; ");

    throw new Error(`Invalid environment configuration: ${message}`);
  }

  return parsed.data;
}
