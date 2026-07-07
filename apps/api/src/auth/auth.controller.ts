import {
  Body,
  Controller,
  Get,
  Headers,
  HttpCode,
  HttpStatus,
  Ip,
  Post,
  Req,
  UseGuards,
} from "@nestjs/common";
import { ApiBearerAuth, ApiCreatedResponse, ApiOkResponse, ApiTags } from "@nestjs/swagger";

import { AuthGuard } from "./auth.guard.js";
import { AuthService } from "./auth.service.js";
import { LoginDto } from "./dto/login.dto.js";
import { RefreshTokenDto } from "./dto/refresh-token.dto.js";
import { RegisterDto } from "./dto/register.dto.js";
import { VerifyEmailDto } from "./dto/verify-email.dto.js";
import { RateLimit } from "../rate-limit/rate-limit.decorator.js";
import { RateLimitGuard } from "../rate-limit/rate-limit.guard.js";
import type { AuthenticatedRequest } from "./types.js";

@ApiTags("auth")
@Controller("auth")
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Post("register")
  @RateLimit({ keyPrefix: "auth:register", limit: 10, windowMs: 60 * 60 * 1000 })
  @UseGuards(RateLimitGuard)
  @ApiCreatedResponse({ description: "Conta criada com sucesso." })
  register(
    @Body() dto: RegisterDto,
    @Headers("user-agent") userAgent?: string,
    @Ip() ipAddress?: string,
  ) {
    return this.authService.register(dto, { ipAddress, userAgent });
  }

  @Post("login")
  @RateLimit({ keyPrefix: "auth:login", limit: 5, windowMs: 60 * 1000 })
  @UseGuards(RateLimitGuard)
  @HttpCode(HttpStatus.OK)
  @ApiOkResponse({ description: "Login realizado com sucesso." })
  login(
    @Body() dto: LoginDto,
    @Headers("user-agent") userAgent?: string,
    @Ip() ipAddress?: string,
  ) {
    return this.authService.login(dto, { ipAddress, userAgent });
  }

  @Post("refresh")
  @RateLimit({ keyPrefix: "auth:refresh", limit: 30, windowMs: 60 * 1000 })
  @UseGuards(RateLimitGuard)
  @HttpCode(HttpStatus.OK)
  @ApiOkResponse({ description: "Tokens renovados com sucesso." })
  refresh(
    @Body() dto: RefreshTokenDto,
    @Headers("user-agent") userAgent?: string,
    @Ip() ipAddress?: string,
  ) {
    return this.authService.refresh(dto.refreshToken, { ipAddress, userAgent });
  }

  @Post("logout")
  @RateLimit({ keyPrefix: "auth:logout", limit: 30, windowMs: 60 * 1000 })
  @UseGuards(RateLimitGuard)
  @HttpCode(HttpStatus.OK)
  @ApiOkResponse({ description: "Sessao encerrada com sucesso." })
  logout(@Body() dto: RefreshTokenDto) {
    return this.authService.logout(dto.refreshToken);
  }

  @Post("logout-all")
  @UseGuards(AuthGuard)
  @HttpCode(HttpStatus.OK)
  @ApiBearerAuth()
  @ApiOkResponse({ description: "Todas as sessoes foram encerradas." })
  logoutAll(@Req() request: AuthenticatedRequest) {
    return this.authService.logoutAll(request.user.sub);
  }

  @Post("verify-email")
  @RateLimit({ keyPrefix: "auth:verify-email", limit: 10, windowMs: 10 * 60 * 1000 })
  @UseGuards(RateLimitGuard)
  @HttpCode(HttpStatus.OK)
  @ApiOkResponse({ description: "E-mail verificado com sucesso." })
  verifyEmail(@Body() dto: VerifyEmailDto) {
    return this.authService.verifyEmail(dto.token);
  }

  @Get("me")
  @UseGuards(AuthGuard)
  @ApiBearerAuth()
  @ApiOkResponse({ description: "Usuario autenticado." })
  me(@Req() request: AuthenticatedRequest) {
    return this.authService.me(request.user.sub);
  }
}
