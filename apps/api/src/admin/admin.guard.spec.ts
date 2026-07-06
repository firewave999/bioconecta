import { ExecutionContext, ForbiddenException } from "@nestjs/common";
import { describe, expect, it } from "vitest";

import { AdminGuard } from "./admin.guard.js";

describe("AdminGuard", () => {
  it("allows users with ADMIN role", () => {
    const guard = new AdminGuard();

    expect(guard.canActivate(createContext(["COMPANY", "ADMIN"]))).toBe(true);
  });

  it("blocks users without ADMIN role", () => {
    const guard = new AdminGuard();

    expect(() => guard.canActivate(createContext(["BIOLOGIST"]))).toThrow(ForbiddenException);
  });
});

function createContext(roles: string[]) {
  return {
    switchToHttp: () => ({
      getRequest: () => ({
        user: {
          roles,
        },
      }),
    }),
  } as ExecutionContext;
}
