import { randomUUID } from "node:crypto";
import { mkdir, writeFile } from "node:fs/promises";
import { extname, join } from "node:path";

import { BadRequestException, Injectable } from "@nestjs/common";
import { ConfigService } from "@nestjs/config";

import { Env } from "../config/env.validation.js";

const allowedImageMimeTypes = new Map([
  ["image/jpeg", ".jpg"],
  ["image/png", ".png"],
  ["image/webp", ".webp"],
]);

const allowedDocumentMimeTypes = new Map([
  ["application/pdf", ".pdf"],
  ["image/jpeg", ".jpg"],
  ["image/png", ".png"],
]);

export type UploadKind = "biologist" | "company";

export type UploadedUploadFile = {
  buffer: Buffer;
  mimetype: string;
  originalname: string;
};

@Injectable()
export class UploadsService {
  constructor(private readonly configService: ConfigService<Env, true>) {}

  async saveImage(file: UploadedUploadFile | undefined, kind: UploadKind) {
    if (!file) {
      throw new BadRequestException("Envie uma imagem.");
    }

    const extension = allowedImageMimeTypes.get(file.mimetype);

    if (!extension) {
      throw new BadRequestException("Formato invalido. Use JPG, PNG ou WEBP.");
    }

    return this.saveFile(file, kind, allowedImageMimeTypes);
  }

  async saveBiologistDocument(file: UploadedUploadFile | undefined) {
    if (!file) {
      throw new BadRequestException("Envie um documento.");
    }

    const extension = allowedDocumentMimeTypes.get(file.mimetype);

    if (!extension) {
      throw new BadRequestException("Formato invalido. Use PDF, JPG ou PNG.");
    }

    return this.saveFile(file, "biologist/documents", allowedDocumentMimeTypes);
  }

  private async saveFile(
    file: UploadedUploadFile,
    path: string,
    allowedMimeTypes: Map<string, string>,
  ) {
    const extension = allowedMimeTypes.get(file.mimetype);

    if (!extension) {
      throw new BadRequestException("Formato de arquivo invalido.");
    }

    const uploadDir = this.configService.get("UPLOADS_DIR", { infer: true });
    const targetDir = join(uploadDir, path);
    const originalExtension = extname(file.originalname).toLowerCase();
    const safeExtension = allowedMimeTypes.has(file.mimetype) ? extension : originalExtension;
    const fileName = `${randomUUID()}${safeExtension}`;

    await mkdir(targetDir, { recursive: true });
    await writeFile(join(targetDir, fileName), file.buffer);

    const apiUrl = this.configService.get("APP_API_URL", { infer: true }).replace(/\/$/, "");

    return {
      url: `${apiUrl}/uploads/${path}/${fileName}`,
    };
  }
}
