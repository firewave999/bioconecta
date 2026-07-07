import { ForbiddenException, Injectable, NotFoundException } from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";
import { Repository } from "typeorm";

import { Company } from "../companies/company.entity.js";
import { ListJobsQueryDto } from "./dto/list-jobs-query.dto.js";
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

  async listPublished(query: ListJobsQueryDto) {
    const builder = this.jobsRepository
      .createQueryBuilder("job")
      .leftJoinAndSelect("job.company", "company")
      .where("job.status = :status", { status: "PUBLISHED" })
      .orderBy("job.published_at", "DESC")
      .addOrderBy("job.created_at", "DESC");

    if (query.q?.trim()) {
      builder.andWhere(
        "(job.title ILIKE :q OR job.description ILIKE :q OR company.name ILIKE :q)",
        {
          q: `%${query.q.trim()}%`,
        },
      );
    }

    if (query.state?.trim()) {
      builder.andWhere("job.state = :state", { state: query.state.trim().toUpperCase() });
    }

    if (query.city?.trim()) {
      builder.andWhere("job.city ILIKE :city", { city: `%${query.city.trim()}%` });
    }

    if (query.workMode?.trim()) {
      builder.andWhere("job.work_mode = :workMode", { workMode: query.workMode.trim() });
    }

    if (query.contractType?.trim()) {
      builder.andWhere("job.contract_type = :contractType", {
        contractType: query.contractType.trim(),
      });
    }

    if (query.requirement?.trim()) {
      builder.andWhere(
        `(
          :requirement = ANY(job.required_practice_areas)
          OR :requirement = ANY(job.required_taxonomic_groups)
          OR :requirement = ANY(job.required_skills)
        )`,
        { requirement: query.requirement.trim() },
      );
    }

    const jobs = await builder.getMany();

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

  async getMine(userId: string, jobId: string) {
    const company = await this.getRequiredCompany(userId);
    const job = await this.jobsRepository.findOneBy({ id: jobId });

    if (!job) {
      throw new NotFoundException("Vaga nao encontrada.");
    }

    if (job.companyId !== company.id) {
      throw new ForbiddenException("Esta vaga pertence a outra empresa.");
    }

    return { company, job };
  }

  async createMine(userId: string, dto: UpsertJobDto) {
    const company = await this.getRequiredCompany(userId);
    const normalized = this.normalize(dto);

    this.assertCanUseStatus(company, normalized.status);

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

    this.assertCanUseStatus(company, normalized.status);

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

  private assertCanUseStatus(company: Company, status: UpsertJobDto["status"]) {
    if (status === "PUBLISHED" && company.verificationStatus !== "VERIFIED") {
      throw new ForbiddenException(
        "A empresa precisa estar verificada para publicar vagas. Salve como rascunho.",
      );
    }
  }
}
