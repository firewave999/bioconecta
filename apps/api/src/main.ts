import "reflect-metadata";

import { appConfig } from "@bioconecta/config";
import { ValidationPipe } from "@nestjs/common";
import { ConfigService } from "@nestjs/config";
import { NestFactory } from "@nestjs/core";
import { NestExpressApplication } from "@nestjs/platform-express";
import { DocumentBuilder, SwaggerModule } from "@nestjs/swagger";
import helmet from "helmet";

import { AppModule } from "./app.module.js";
import { Env } from "./config/env.validation.js";

function parseCorsOrigins(origin: string): string[] {
  return origin
    .split(",")
    .map((item) => item.trim())
    .filter(Boolean);
}

async function bootstrap() {
  const app = await NestFactory.create<NestExpressApplication>(AppModule, {
    bufferLogs: true,
  });

  const configService = app.get<ConfigService<Env, true>>(ConfigService);
  const port = configService.get("APP_API_PORT", { infer: true });
  const uploadsDir = configService.get("UPLOADS_DIR", { infer: true });
  const webUrl = configService.get("APP_WEB_URL", { infer: true });

  app.setGlobalPrefix(appConfig.apiPrefix.replace(/^\//, ""));
  app.useStaticAssets(uploadsDir, {
    prefix: "/uploads",
  });
  app.use(helmet());
  app.enableCors({
    credentials: true,
    origin: parseCorsOrigins(webUrl),
  });
  app.useGlobalPipes(
    new ValidationPipe({
      forbidNonWhitelisted: true,
      transform: true,
      whitelist: true,
    }),
  );

  const swaggerConfig = new DocumentBuilder()
    .setTitle("BioConecta API")
    .setDescription("REST API da plataforma BioConecta.")
    .setVersion("0.1.0")
    .addBearerAuth()
    .build();

  const document = SwaggerModule.createDocument(app, swaggerConfig);
  SwaggerModule.setup("api/docs", app, document, {
    jsonDocumentUrl: "api/docs-json",
  });

  await app.listen(port);
}

void bootstrap();
