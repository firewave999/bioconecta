import {
  BadRequestException,
  Controller,
  Param,
  Post,
  UploadedFile,
  UseGuards,
  UseInterceptors,
} from "@nestjs/common";
import { FileInterceptor } from "@nestjs/platform-express";
import { ApiBearerAuth, ApiConsumes, ApiTags } from "@nestjs/swagger";

import { AuthGuard } from "../auth/auth.guard.js";
import type { UploadedImageFile, UploadKind } from "./uploads.service.js";
import { UploadsService } from "./uploads.service.js";

const uploadKinds = ["biologist", "company"];

@ApiTags("uploads")
@ApiBearerAuth()
@UseGuards(AuthGuard)
@Controller("uploads")
export class UploadsController {
  constructor(private readonly uploadsService: UploadsService) {}

  @Post(":kind/image")
  @ApiConsumes("multipart/form-data")
  @UseInterceptors(
    FileInterceptor("file", {
      limits: {
        fileSize: 2 * 1024 * 1024,
      },
    }),
  )
  uploadImage(@Param("kind") kind: string, @UploadedFile() file: UploadedImageFile | undefined) {
    if (!uploadKinds.includes(kind)) {
      throw new BadRequestException("Tipo de upload invalido.");
    }

    return this.uploadsService.saveImage(file, kind as UploadKind);
  }
}
