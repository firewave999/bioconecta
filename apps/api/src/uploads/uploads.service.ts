import { randomUUID } from "node:crypto";
import { mkdir, writeFile } from "node:fs/promises";
import { extname, join } from "node:path";

import { BadRequestException, Injectable } from "@nestjs/common";
import { ConfigService } from "@nestjs/config";

import { Env } from "../config/env.validation.js";

const allowedMimeTypes = new Map([
  ["image/jpeg", ".jpg"],
  ["image/png", ".png"],
  ["image/webp", ".webp"],
]);

export type UploadKind = "biologist" | "company";

export type UploadedImageFile = {
  buffer: Buffer;
  mimetype: string;
  originalname: string;
};

@Injectable()
export class UploadsService {
  constructor(private readonly configService: ConfigService<Env, true>) {}

  async saveImage(file: UploadedImageFile | undefined, kind: UploadKind) {
    if (!file) {
      throw new BadRequestException("Envie uma imagem.");
    }

    const extension = allowedMimeTypes.get(file.mimetype);

    if (!extension) {
      throw new BadRequestException("Formato invalido. Use JPG, PNG ou WEBP.");
    }

    const uploadDir = this.configService.get("UPLOADS_DIR", { infer: true });
    const targetDir = join(uploadDir, kind);
    const originalExtension = extname(file.originalname).toLowerCase();
    const safeExtension = allowedMimeTypes.has(file.mimetype) ? extension : originalExtension;
    const fileName = `${randomUUID()}${safeExtension}`;

    await mkdir(targetDir, { recursive: true });
    await writeFile(join(targetDir, fileName), file.buffer);

    const apiUrl = this.configService.get("APP_API_URL", { infer: true }).replace(/\/$/, "");

    return {
      url: `${apiUrl}/uploads/${kind}/${fileName}`,
    };
  }
}
