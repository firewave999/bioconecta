import {
  CanActivate,
  ExecutionContext,
  HttpException,
  HttpStatus,
  Injectable,
} from "@nestjs/common";
import { Reflector } from "@nestjs/core";

import { RATE_LIMIT_METADATA_KEY, RateLimitOptions } from "./rate-limit.decorator.js";

type RateLimitRequest = {
  headers?: Record<string, string | string[] | undefined>;
  ip?: string;
  socket?: {
    remoteAddress?: string;
  };
};

type Bucket = {
  count: number;
  resetAt: number;
};

@Injectable()
export class RateLimitGuard implements CanActivate {
  private readonly buckets = new Map<string, Bucket>();

  constructor(private readonly reflector: Reflector) {}

  canActivate(context: ExecutionContext): boolean {
    const options = this.reflector.get<RateLimitOptions>(
      RATE_LIMIT_METADATA_KEY,
      context.getHandler(),
    );

    if (!options) {
      return true;
    }

    const request = context.switchToHttp().getRequest<RateLimitRequest>();
    const now = Date.now();
    const key = `${options.keyPrefix}:${this.getClientIp(request)}`;
    const bucket = this.buckets.get(key);

    if (!bucket || bucket.resetAt <= now) {
      this.buckets.set(key, {
        count: 1,
        resetAt: now + options.windowMs,
      });
      this.pruneExpiredBuckets(now);
      return true;
    }

    if (bucket.count >= options.limit) {
      const retryAfterSeconds = Math.ceil((bucket.resetAt - now) / 1000);

      throw new HttpException(
        {
          message: "Muitas tentativas. Tente novamente em instantes.",
          retryAfterSeconds,
          statusCode: HttpStatus.TOO_MANY_REQUESTS,
        },
        HttpStatus.TOO_MANY_REQUESTS,
      );
    }

    bucket.count += 1;
    return true;
  }

  private getClientIp(request: RateLimitRequest) {
    const forwardedFor = request.headers?.["x-forwarded-for"];
    const forwardedIp = Array.isArray(forwardedFor) ? forwardedFor[0] : forwardedFor;

    return (
      forwardedIp?.split(",")[0]?.trim() ||
      request.headers?.["cf-connecting-ip"]?.toString() ||
      request.ip ||
      request.socket?.remoteAddress ||
      "unknown"
    );
  }

  private pruneExpiredBuckets(now: number) {
    for (const [key, bucket] of this.buckets) {
      if (bucket.resetAt <= now) {
        this.buckets.delete(key);
      }
    }
  }
}
