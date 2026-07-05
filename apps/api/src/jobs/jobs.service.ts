import { ForbiddenException, Injectable, NotFoundException } from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";
import { Repository } from "typeorm";

import { Company } from "../companies/company.entity.js";
import { UpsertJobDto } from "./dto/upsert-job.dto.js";
import { Job } from "./job.entity.js";

@Injectable()
export class JobsService {
  constructor(
    @InjectRepository(Company)
    private readonly companiesRepository: Repository<Company>,
    @InjectRepository(Job)
    private readonly jobsRepository: Repository<Job>,
  ) {}

  async listPublished() {
    const jobs = await this.jobsRepository.find({
      order: { publishedAt: "DESC", createdAt: "DESC" },
      relations: { company: true },
      where: { status: "PUBLISHED" },
    });

    return { jobs };
  }

  async getPublished(jobId: string) {
    const job = await this.jobsRepository.findOne({
      relations: { company: true },
      where: { id: jobId, status: "PUBLISHED" },
    });

    if (!job) {
      throw new NotFoundException("Vaga publicada nao encontrada.");
    }

    return { job };
  }

  async listMine(userId: string) {
    const company = await this.getRequiredCompany(userId);
    const jobs = await this.jobsRepository.find({
      order: { createdAt: "DESC" },
      where: { companyId: company.id },
    });

    return { company, jobs };
  }

  async createMine(userId: string, dto: UpsertJobDto) {
    const company = await this.getRequiredCompany(userId);
    const normalized = this.normalize(dto);
    const job = this.jobsRepository.create({
      ...normalized,
      companyId: company.id,
      publishedAt: normalized.status === "PUBLISHED" ? new Date() : null,
    });

    return { job: await this.jobsRepository.save(job) };
  }

  async updateMine(userId: string, jobId: string, dto: UpsertJobDto) {
    const company = await this.getRequiredCompany(userId);
    const existing = await this.jobsRepository.findOneBy({ id: jobId });

    if (!existing) {
      throw new NotFoundException("Vaga nao encontrada.");
    }

    if (existing.companyId !== company.id) {
      throw new ForbiddenException("Esta vaga pertence a outra empresa.");
    }

    const normalized = this.normalize(dto);
    const job = this.jobsRepository.create({
      ...existing,
      ...normalized,
      publishedAt:
        normalized.status === "PUBLISHED" && !existing.publishedAt
          ? new Date()
          : existing.publishedAt,
    });

    return { job: await this.jobsRepository.save(job) };
  }

  private async getRequiredCompany(userId: string) {
    const company = await this.companiesRepository.findOneBy({ ownerUserId: userId });

    if (!company) {
      throw new NotFoundException("Cadastre a empresa antes de criar vagas.");
    }

    return company;
  }

  private normalize(dto: UpsertJobDto) {
    return {
      acceptsStudents: dto.acceptsStudents,
      city: dto.city.trim(),
      contractType: dto.contractType,
      description: dto.description.trim(),
      requiredPracticeAreas: this.normalizeList(dto.requiredPracticeAreas),
      requiredSkills: this.normalizeList(dto.requiredSkills),
      requiredTaxonomicGroups: this.normalizeList(dto.requiredTaxonomicGroups),
      requiresCrbio: dto.requiresCrbio,
      requiresTravel: dto.requiresTravel,
      salaryMaxCents: dto.salaryMaxCents ?? null,
      salaryMinCents: dto.salaryMinCents ?? null,
      state: dto.state.trim().toUpperCase(),
      status: dto.status,
      title: dto.title.trim(),
      workMode: dto.workMode,
    };
  }

  private normalizeList(values: string[]) {
    return [...new Set(values.map((value) => value.trim()).filter(Boolean))].slice(0, 30);
  }
}
