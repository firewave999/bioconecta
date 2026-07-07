"use client";

import { useParams } from "next/navigation";

import { JobForm } from "@/components/jobs/job-form";

export function EditJobClient() {
  const params = useParams<{ id: string }>();

  return <JobForm jobId={params.id} />;
}
