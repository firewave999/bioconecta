import { Injectable, NotFoundException } from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";
import { Repository } from "typeorm";

import { Application } from "../applications/application.entity.js";
import { BiologistProfile } from "../biologist-profile/biologist-profile.entity.js";
import { Company } from "../companies/company.entity.js";
import { Job } from "../jobs/job.entity.js";
import { User } from "../users/user.entity.js";
import { AdminAuditLog, AdminAuditAction, AdminAuditTargetType } from "./admin-audit-log.entity.js";
import { UpdateBiologistVerificationStatusDto } from "./dto/update-biologist-verification-status.dto.js";
import { UpdateCompanyVerificationStatusDto } from "./dto/update-company-verification-status.dto.js";
import { UpdateJobStatusDto } from "./dto/update-job-status.dto.js";

@Injectable()
export class AdminService {
  constructor(
    @InjectRepository(AdminAuditLog)
    private readonly auditLogsRepository: Repository<AdminAuditLog>,
    @InjectRepository(Application)
    private readonly applicationsRepository: Repository<Application>,
    @InjectRepository(BiologistProfile)
    private readonly biologistProfilesRepository: Repository<BiologistProfile>,
    @InjectRepository(Company)
    private readonly companiesRepository: Repository<Company>,
    @InjectRepository(Job)
    private readonly jobsRepository: Repository<Job>,
    @InjectRepository(User)
    private readonly usersRepository: Repository<User>,
  ) {}

  async getOverview() {
    const [
      applicationsCount,
      biologistProfilesCount,
      companiesCount,
      jobsCount,
      usersCount,
      verifiedBiologistsCount,
      verifiedCompaniesCount,
      publishedJobsCount,
    ] = await Promise.all([
      this.applicationsRepository.count(),
      this.biologistProfilesRepository.count(),
      this.companiesRepository.count(),
      this.jobsRepository.count(),
      this.usersRepository.count(),
      this.biologistProfilesRepository.count({ where: { verificationStatus: "VERIFIED" } }),
      this.companiesRepository.count({ where: { verificationStatus: "VERIFIED" } }),
      this.jobsRepository.count({ where: { status: "PUBLISHED" } }),
    ]);

    return {
      applicationsCount,
      biologistProfilesCount,
      companiesCount,
      jobsCount,
      publishedJobsCount,
      usersCount,
      verifiedBiologistsCount,
      verifiedCompaniesCount,
    };
  }

  async listUsers() {
    const users = await this.usersRepository.find({
      order: { createdAt: "DESC" },
      take: 100,
    });

    return users.map(toAdminUser);
  }

  async listCompanies() {
    const companies = await this.companiesRepository.find({
      order: { createdAt: "DESC" },
      relations: { owner: true },
      take: 100,
    });

    return companies.map((company) => ({
      ...company,
      owner: toAdminUser(company.owner),
    }));
  }

  async listBiologists() {
    const profiles = await this.biologistProfilesRepository.find({
      order: { createdAt: "DESC" },
      relations: { user: true },
      take: 100,
    });

    return profiles.map((profile) => ({
      ...profile,
      user: toAdminUser(profile.user),
    }));
  }

  async listJobs() {
    return this.jobsRepository.find({
      order: { createdAt: "DESC" },
      relations: { company: true },
      take: 100,
    });
  }

  async listApplications() {
    const applications = await this.applicationsRepository.find({
      order: { createdAt: "DESC" },
      relations: { biologistProfile: { user: true }, job: { company: true } },
      take: 100,
    });

    return applications.map((application) => ({
      ...application,
      biologistProfile: {
        ...application.biologistProfile,
        user: toAdminUser(application.biologistProfile.user),
      },
    }));
  }

  async listAuditLogs() {
    const logs = await this.auditLogsRepository.find({
      order: { createdAt: "DESC" },
      relations: { actor: true },
      take: 100,
    });

    return logs.map((log) => ({
      ...log,
      actor: toAdminUser(log.actor),
    }));
  }

  async updateCompanyVerificationStatus(
    actorUserId: string,
    id: string,
    dto: UpdateCompanyVerificationStatusDto,
  ) {
    const company = await this.companiesRepository.findOne({ where: { id } });

    if (!company) {
      throw new NotFoundException("Empresa nao encontrada.");
    }

    const previousStatus = company.verificationStatus;
    company.verificationStatus = dto.verificationStatus;
    const saved = await this.companiesRepository.save(company);

    await this.createAuditLog({
      action: "COMPANY_VERIFICATION_UPDATED",
      actorUserId,
      afterState: { verificationStatus: saved.verificationStatus },
      beforeState: { verificationStatus: previousStatus },
      targetId: saved.id,
      targetType: "COMPANY",
    });

    return saved;
  }

  async updateBiologistVerificationStatus(
    actorUserId: string,
    id: string,
    dto: UpdateBiologistVerificationStatusDto,
  ) {
    const profile = await this.biologistProfilesRepository.findOne({ where: { id } });

    if (!profile) {
      throw new NotFoundException("Biologo nao encontrado.");
    }

    const previousStatus = profile.verificationStatus;
    profile.verificationStatus = dto.verificationStatus;
    const saved = await this.biologistProfilesRepository.save(profile);

    await this.createAuditLog({
      action: "BIOLOGIST_VERIFICATION_UPDATED",
      actorUserId,
      afterState: { verificationStatus: saved.verificationStatus },
      beforeState: { verificationStatus: previousStatus },
      targetId: saved.id,
      targetType: "BIOLOGIST_PROFILE",
    });

    return saved;
  }

  async updateJobStatus(actorUserId: string, id: string, dto: UpdateJobStatusDto) {
    const job = await this.jobsRepository.findOne({ where: { id } });

    if (!job) {
      throw new NotFoundException("Vaga nao encontrada.");
    }

    const previousStatus = job.status;
    job.status = dto.status;

    if (dto.status === "PUBLISHED" && !job.publishedAt) {
      job.publishedAt = new Date();
    }

    const saved = await this.jobsRepository.save(job);

    await this.createAuditLog({
      action: "JOB_STATUS_UPDATED",
      actorUserId,
      afterState: { status: saved.status },
      beforeState: { status: previousStatus },
      targetId: saved.id,
      targetType: "JOB",
    });

    return saved;
  }

  private async createAuditLog(input: {
    action: AdminAuditAction;
    actorUserId: string;
    afterState: Record<string, unknown>;
    beforeState: Record<string, unknown>;
    targetId: string;
    targetType: AdminAuditTargetType;
  }) {
    if (input.actorUserId === "system") {
      return;
    }

    const auditLog = this.auditLogsRepository.create(input);
    await this.auditLogsRepository.save(auditLog);
  }
}

function toAdminUser(user: User) {
  return {
    blockedAt: user.blockedAt,
    createdAt: user.createdAt,
    deletedAt: user.deletedAt,
    email: user.email,
    emailVerifiedAt: user.emailVerifiedAt,
    firstName: user.firstName,
    id: user.id,
    lastName: user.lastName,
    phone: user.phone,
    roles: user.roles,
    updatedAt: user.updatedAt,
  };
}
