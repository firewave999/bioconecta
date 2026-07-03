import { Controller, Get } from "@nestjs/common";
import { ApiOkResponse, ApiTags } from "@nestjs/swagger";

@ApiTags("health")
@Controller("health")
export class HealthController {
  @Get()
  @ApiOkResponse({
    description: "API health status.",
    schema: {
      example: {
        service: "BioConecta API",
        status: "ok",
        timestamp: "2026-07-03T00:00:00.000Z",
      },
    },
  })
  check() {
    return {
      service: "BioConecta API",
      status: "ok",
      timestamp: new Date().toISOString(),
    };
  }
}
