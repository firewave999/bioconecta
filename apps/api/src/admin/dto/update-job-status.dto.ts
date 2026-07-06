import { IsIn } from "class-validator";

import type { JobStatus } from "../../jobs/job.entity.js";

export class UpdateJobStatusDto {
  @IsIn(["DRAFT", "PUBLISHED", "CLOSED"])
  status!: JobStatus;
}
