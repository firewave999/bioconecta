import { ConflictException, Injectable, NotFoundException } from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";
import { Repository } from "typeorm";

import { Job } from "../jobs/job.entity.js";
import { SavedJob } from "./saved-job.entity.js";

@Injectable()
export class FavoritesService {
  constructor(
    @InjectRepository(Job)
    private readonly jobsRepository: Repository<Job>,
    @InjectRepository(SavedJob)
    private readonly savedJobsRepository: Repository<SavedJob>,
  ) {}

  async listSavedJobs(userId: string) {
    const savedJobs = await this.savedJobsRepository.find({
      order: { createdAt: "DESC" },
      relations: { job: { company: true } },
      where: { userId },
    });

    return { savedJobs };
  }

  async saveJob(userId: string, jobId: string) {
    const job = await this.jobsRepository.findOneBy({ id: jobId, status: "PUBLISHED" });

    if (!job) {
      throw new NotFoundException("Vaga publicada nao encontrada.");
    }

    const existing = await this.savedJobsRepository.findOneBy({ jobId, userId });

    if (existing) {
      throw new ConflictException("Vaga ja esta salva.");
    }

    const savedJob = this.savedJobsRepository.create({ jobId, userId });

    return { savedJob: await this.savedJobsRepository.save(savedJob) };
  }

  async unsaveJob(userId: string, jobId: string) {
    await this.savedJobsRepository.delete({ jobId, userId });

    return { success: true };
  }

  async getSavedState(userId: string, jobId: string) {
    const savedJob = await this.savedJobsRepository.findOneBy({ jobId, userId });

    return { saved: Boolean(savedJob) };
  }
}
