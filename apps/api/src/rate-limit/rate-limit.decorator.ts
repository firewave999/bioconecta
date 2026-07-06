import { SetMetadata } from "@nestjs/common";

export const RATE_LIMIT_METADATA_KEY = "bioconecta:rate-limit";

export type RateLimitOptions = {
  keyPrefix: string;
  limit: number;
  windowMs: number;
};

export function RateLimit(options: RateLimitOptions) {
  return SetMetadata(RATE_LIMIT_METADATA_KEY, options);
}
