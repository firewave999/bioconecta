import { ExecutionContext, HttpException } from "@nestjs/common";
import { Reflector } from "@nestjs/core";
import { afterEach, describe, expect, it, vi } from "vitest";

import { RateLimitGuard } from "./rate-limit.guard.js";

describe("RateLimitGuard", () => {
  afterEach(() => {
    vi.useRealTimers();
  });

  it("allows requests when no rate limit metadata exists", () => {
    const guard = new RateLimitGuard(createReflector(null));

    expect(guard.canActivate(createContext({ ip: "127.0.0.1" }))).toBe(true);
  });

  it("blocks requests over the configured limit", () => {
    vi.useFakeTimers();
    vi.setSystemTime(new Date("2026-01-01T00:00:00.000Z"));

    const guard = new RateLimitGuard(
      createReflector({ keyPrefix: "auth:login", limit: 2, windowMs: 60_000 }),
    );
    const context = createContext({ ip: "127.0.0.1" });

    expect(guard.canActivate(context)).toBe(true);
    expect(guard.canActivate(context)).toBe(true);
    expect(() => guard.canActivate(context)).toThrow(HttpException);
  });

  it("resets the bucket after the window expires", () => {
    vi.useFakeTimers();
    vi.setSystemTime(new Date("2026-01-01T00:00:00.000Z"));

    const guard = new RateLimitGuard(
      createReflector({ keyPrefix: "auth:login", limit: 1, windowMs: 60_000 }),
    );
    const context = createContext({ ip: "127.0.0.1" });

    expect(guard.canActivate(context)).toBe(true);
    expect(() => guard.canActivate(context)).toThrow(HttpException);

    vi.setSystemTime(new Date("2026-01-01T00:01:01.000Z"));

    expect(guard.canActivate(context)).toBe(true);
  });

  it("uses x-forwarded-for as the client key when present", () => {
    const guard = new RateLimitGuard(
      createReflector({ keyPrefix: "auth:login", limit: 1, windowMs: 60_000 }),
    );

    expect(
      guard.canActivate(
        createContext({
          headers: { "x-forwarded-for": "203.0.113.10, 10.0.0.1" },
          ip: "127.0.0.1",
        }),
      ),
    ).toBe(true);
    expect(() =>
      guard.canActivate(
        createContext({
          headers: { "x-forwarded-for": "203.0.113.10, 10.0.0.1" },
          ip: "127.0.0.1",
        }),
      ),
    ).toThrow(HttpException);
  });
});

function createReflector(options: { keyPrefix: string; limit: number; windowMs: number } | null) {
  return {
    get: vi.fn(() => options),
  } as unknown as Reflector;
}

function createContext(request: {
  headers?: Record<string, string>;
  ip?: string;
  socket?: { remoteAddress?: string };
}) {
  return {
    getHandler: () => vi.fn(),
    switchToHttp: () => ({
      getRequest: () => request,
    }),
  } as unknown as ExecutionContext;
}
