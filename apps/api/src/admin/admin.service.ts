import { Injectable, NotFoundException } from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";
import { Repository } from "typeorm";

import { Application } from "../applications/application.entity.js";
import { BiologistProfile } from "../biologist-profile/biologist-profile.entity.js";
import { Company } from "../companies/company.entity.js";
import { Job } from "../jobs/job.entity.js";
import { User } from "../users/user.entity.js";
import { UpdateBiologistVerificationStatusDto } from "./dto/update-biologist-verification-status.dto.js";
import { UpdateCompanyVerificationStatusDto } from "./dto/update-company-verification-status.dto.js";
import { UpdateJobStatusDto } from "./dto/update-job-status.dto.js";

@Injectable()
export class AdminService {
  constructor(
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

  async updateCompanyVerificationStatus(id: string, dto: UpdateCompanyVerificationStatusDto) {
    const company = await this.companiesRepository.findOne({ where: { id } });

    if (!company) {
      throw new NotFoundException("Empresa nao encontrada.");
    }

    company.verificationStatus = dto.verificationStatus;
    return this.companiesRepository.save(company);
  }

  async updateBiologistVerificationStatus(id: string, dto: UpdateBiologistVerificationStatusDto) {
    const profile = await this.biologistProfilesRepository.findOne({ where: { id } });

    if (!profile) {
      throw new NotFoundException("Biologo nao encontrado.");
    }

    profile.verificationStatus = dto.verificationStatus;
    return this.biologistProfilesRepository.save(profile);
  }

  async updateJobStatus(id: string, dto: UpdateJobStatusDto) {
    const job = await this.jobsRepository.findOne({ where: { id } });

    if (!job) {
      throw new NotFoundException("Vaga nao encontrada.");
    }

    job.status = dto.status;

    if (dto.status === "PUBLISHED" && !job.publishedAt) {
      job.publishedAt = new Date();
    }

    return this.jobsRepository.save(job);
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
