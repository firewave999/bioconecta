import {
  ConflictException,
  ForbiddenException,
  Injectable,
  NotFoundException,
} from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";
import { Repository } from "typeorm";

import { BiologistProfile } from "../biologist-profile/biologist-profile.entity.js";
import { PracticeArea } from "../biologist-profile/entities/practice-area.entity.js";
import { Skill } from "../biologist-profile/entities/skill.entity.js";
import { TaxonomicGroup } from "../biologist-profile/entities/taxonomic-group.entity.js";
import { Company } from "../companies/company.entity.js";
import { Job } from "../jobs/job.entity.js";
import { NotificationsService } from "../notifications/notifications.service.js";
import { Application } from "./application.entity.js";
import { CreateApplicationDto } from "./dto/create-application.dto.js";
import { UpdateApplicationStatusDto } from "./dto/update-application-status.dto.js";

type ProfessionalNames = {
  practiceAreas: string[];
  skills: string[];
  taxonomicGroups: string[];
};

@Injectable()
export class ApplicationsService {
  constructor(
    @InjectRepository(Application)
    private readonly applicationsRepository: Repository<Application>,
    @InjectRepository(BiologistProfile)
    private readonly profilesRepository: Repository<BiologistProfile>,
    @InjectRepository(Company)
    private readonly companiesRepository: Repository<Company>,
    @InjectRepository(Job)
    private readonly jobsRepository: Repository<Job>,
    @InjectRepository(PracticeArea)
    private readonly practiceAreasRepository: Repository<PracticeArea>,
    @InjectRepository(TaxonomicGroup)
    private readonly taxonomicGroupsRepository: Repository<TaxonomicGroup>,
    @InjectRepository(Skill)
    private readonly skillsRepository: Repository<Skill>,
    private readonly notificationsService: NotificationsService,
  ) {}

  async apply(userId: string, jobId: string, dto: CreateApplicationDto) {
    const [job, profile] = await Promise.all([
      this.jobsRepository.findOne({ relations: { company: true }, where: { id: jobId } }),
      this.profilesRepository.findOneBy({ userId }),
    ]);

    if (!job || job.status !== "PUBLISHED") {
      throw new NotFoundException("Vaga publicada nao encontrada.");
    }

    if (!profile) {
      throw new NotFoundException("Complete seu perfil de biologo antes de se candidatar.");
    }

    const existing = await this.applicationsRepository.findOneBy({
      biologistProfileId: profile.id,
      jobId: job.id,
    });

    if (existing) {
      throw new ConflictException("Voce ja se candidatou a esta vaga.");
    }

    const professional = await this.getProfessionalNames(profile.id);
    const match = this.calculateMatch(job, profile, professional);
    const application = this.applicationsRepository.create({
      biologistProfileId: profile.id,
      coverMessage: dto.coverMessage?.trim() || null,
      jobId: job.id,
      matchReasons: match.reasons,
      matchScore: match.score,
      status: "APPLIED",
    });

    const savedApplication = await this.applicationsRepository.save(application);

    await this.notificationsService.createForUser({
      actionUrl: `/empresa/vagas/${job.id}/candidatos`,
      message: `${profile.fullName} se candidatou para ${job.title}. Match: ${match.score}%.`,
      metadata: {
        applicationId: savedApplication.id,
        biologistProfileId: profile.id,
        jobId: job.id,
        matchScore: match.score,
      },
      title: "Nova candidatura recebida",
      type: "APPLICATION_CREATED",
      userId: job.company.ownerUserId,
    });

    return { application: savedApplication, match };
  }

  async listMine(userId: string) {
    const profile = await this.profilesRepository.findOneBy({ userId });

    if (!profile) {
      return { applications: [] };
    }

    const applications = await this.applicationsRepository.find({
      order: { createdAt: "DESC" },
      relations: { job: { company: true } },
      where: { biologistProfileId: profile.id },
    });

    return { applications };
  }

  async listForJob(userId: string, jobId: string) {
    const company = await this.companiesRepository.findOneBy({ ownerUserId: userId });

    if (!company) {
      throw new NotFoundException("Cadastre a empresa antes de ver candidatos.");
    }

    const job = await this.jobsRepository.findOneBy({ id: jobId });

    if (!job || job.companyId !== company.id) {
      throw new ForbiddenException("Esta vaga pertence a outra empresa.");
    }

    const applications = await this.applicationsRepository.find({
      order: { matchScore: "DESC", createdAt: "ASC" },
      relations: { biologistProfile: { user: true } },
      where: { jobId },
    });

    return {
      applications: applications.map((application) => ({
        ...application,
        biologistProfile: {
          ...application.biologistProfile,
          user: {
            email: application.biologistProfile.user.email,
            firstName: application.biologistProfile.user.firstName,
            id: application.biologistProfile.user.id,
            lastName: application.biologistProfile.user.lastName,
            phone: application.biologistProfile.user.phone,
          },
        },
      })),
      job,
    };
  }

  async updateStatus(userId: string, applicationId: string, dto: UpdateApplicationStatusDto) {
    const company = await this.companiesRepository.findOneBy({ ownerUserId: userId });

    if (!company) {
      throw new NotFoundException("Cadastre a empresa antes de atualizar candidaturas.");
    }

    const application = await this.applicationsRepository.findOne({
      relations: { biologistProfile: true, job: true },
      where: { id: applicationId },
    });

    if (!application) {
      throw new NotFoundException("Candidatura nao encontrada.");
    }

    if (application.job.companyId !== company.id) {
      throw new ForbiddenException("Esta candidatura pertence a outra empresa.");
    }

    const previousStatus = application.status;
    application.status = dto.status;

    const savedApplication = await this.applicationsRepository.save(application);

    if (previousStatus !== dto.status) {
      await this.notificationsService.createForUser({
        actionUrl: "/candidaturas",
        message: `Sua candidatura para ${application.job.title} mudou de ${previousStatus} para ${dto.status}.`,
        metadata: {
          applicationId: savedApplication.id,
          jobId: application.jobId,
          newStatus: dto.status,
          previousStatus,
        },
        title: "Status da candidatura atualizado",
        type: "APPLICATION_STATUS_UPDATED",
        userId: application.biologistProfile.userId,
      });
    }

    return { application: savedApplication };
  }

  async getMyApplicationForJob(userId: string, jobId: string) {
    const profile = await this.profilesRepository.findOneBy({ userId });

    if (!profile) {
      return { application: null };
    }

    const application = await this.applicationsRepository.findOneBy({
      biologistProfileId: profile.id,
      jobId,
    });

    return { application };
  }

  private async getProfessionalNames(profileId: string): Promise<ProfessionalNames> {
    const [practiceAreas, taxonomicGroups, skills] = await Promise.all([
      this.practiceAreasRepository
        .createQueryBuilder("practiceArea")
        .innerJoin(
          "biologist_profile_practice_areas",
          "link",
          "link.practice_area_id = practiceArea.id",
        )
        .where("link.profile_id = :profileId", { profileId })
        .getMany(),
      this.taxonomicGroupsRepository
        .createQueryBuilder("taxonomicGroup")
        .innerJoin(
          "biologist_profile_taxonomic_groups",
          "link",
          "link.taxonomic_group_id = taxonomicGroup.id",
        )
        .where("link.profile_id = :profileId", { profileId })
        .getMany(),
      this.skillsRepository
        .createQueryBuilder("skill")
        .innerJoin("biologist_profile_skills", "link", "link.skill_id = skill.id")
        .where("link.profile_id = :profileId", { profileId })
        .getMany(),
    ]);

    return {
      practiceAreas: practiceAreas.map((item) => item.name),
      skills: skills.map((item) => item.name),
      taxonomicGroups: taxonomicGroups.map((item) => item.name),
    };
  }

  private calculateMatch(job: Job, profile: BiologistProfile, professional: ProfessionalNames) {
    let score = 0;
    const reasons: string[] = [];

    score += this.scoreList(
      job.requiredPracticeAreas,
      professional.practiceAreas,
      30,
      reasons,
      "area",
    );
    score += this.scoreList(
      job.requiredTaxonomicGroups,
      professional.taxonomicGroups,
      25,
      reasons,
      "grupo taxonomico",
    );
    score += this.scoreList(job.requiredSkills, professional.skills, 25, reasons, "competencia");

    if (!job.requiresCrbio || profile.registrationStatus === "ACTIVE") {
      score += 10;
      reasons.push("CRBio compativel com a exigencia da vaga.");
    }

    if (profile.state === job.state) {
      score += 5;
      reasons.push("Mesmo estado da vaga.");
    }

    if (!job.requiresTravel || profile.acceptsTravel) {
      score += 5;
      reasons.push("Disponibilidade de viagem compativel.");
    }

    return { reasons, score: Math.min(100, score) };
  }

  private scoreList(
    required: string[],
    available: string[],
    maxScore: number,
    reasons: string[],
    label: string,
  ) {
    if (!required.length) {
      return maxScore;
    }

    const normalizedAvailable = new Set(available.map((item) => item.toLowerCase()));
    const matches = required.filter((item) => normalizedAvailable.has(item.toLowerCase()));

    if (matches.length) {
      reasons.push(`${matches.length}/${required.length} ${label}(s) em comum.`);
    }

    return Math.round((matches.length / required.length) * maxScore);
  }
}
