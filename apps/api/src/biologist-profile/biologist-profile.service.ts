import { ForbiddenException, Injectable, NotFoundException } from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";
import { DataSource, Repository } from "typeorm";

import { User } from "../users/user.entity.js";
import { BiologistProfile } from "./biologist-profile.entity.js";
import { UpsertProfessionalProfileDto } from "./dto/upsert-professional-profile.dto.js";
import { UpsertBiologistProfileDto } from "./dto/upsert-biologist-profile.dto.js";
import { BiologistCertification } from "./entities/biologist-certification.entity.js";
import { BiologistDocument } from "./entities/biologist-document.entity.js";
import { BiologistExperience } from "./entities/biologist-experience.entity.js";
import { PracticeArea } from "./entities/practice-area.entity.js";
import { Skill } from "./entities/skill.entity.js";
import { TaxonomicGroup } from "./entities/taxonomic-group.entity.js";

type ProfessionalProfile = {
  certifications: BiologistCertification[];
  documents: BiologistDocument[];
  experiences: BiologistExperience[];
  practiceAreas: PracticeArea[];
  skills: Skill[];
  taxonomicGroups: TaxonomicGroup[];
};

type CatalogItem = PracticeArea | TaxonomicGroup | Skill;

@Injectable()
export class BiologistProfileService {
  constructor(
    private readonly dataSource: DataSource,
    @InjectRepository(BiologistProfile)
    private readonly profilesRepository: Repository<BiologistProfile>,
    @InjectRepository(User)
    private readonly usersRepository: Repository<User>,
    @InjectRepository(PracticeArea)
    private readonly practiceAreasRepository: Repository<PracticeArea>,
    @InjectRepository(TaxonomicGroup)
    private readonly taxonomicGroupsRepository: Repository<TaxonomicGroup>,
    @InjectRepository(Skill)
    private readonly skillsRepository: Repository<Skill>,
    @InjectRepository(BiologistExperience)
    private readonly experiencesRepository: Repository<BiologistExperience>,
    @InjectRepository(BiologistCertification)
    private readonly certificationsRepository: Repository<BiologistCertification>,
    @InjectRepository(BiologistDocument)
    private readonly documentsRepository: Repository<BiologistDocument>,
  ) {}

  async getMine(userId: string) {
    const profile = await this.profilesRepository.findOneBy({ userId });
    const professional = profile
      ? await this.getProfessionalByProfileId(profile.id)
      : this.emptyProfessionalProfile();

    return {
      completion: profile ? this.calculateCompletion(profile, professional) : 0,
      profile,
      professional,
    };
  }

  async upsertMine(userId: string, dto: UpsertBiologistProfileDto) {
    const user = await this.usersRepository.findOneByOrFail({ id: userId });

    if (!user.roles.includes("BIOLOGIST")) {
      throw new ForbiddenException("Apenas contas de biologo podem preencher este perfil.");
    }

    const existing = await this.profilesRepository.findOneBy({ userId });
    const profile = this.profilesRepository.create({
      ...existing,
      ...this.normalize(dto),
      userId,
    });

    const saved = await this.profilesRepository.save(profile);
    const professional = await this.getProfessionalByProfileId(saved.id);

    return {
      completion: this.calculateCompletion(saved, professional),
      profile: saved,
      professional,
    };
  }

  async getProfessionalMine(userId: string) {
    const profile = await this.getRequiredProfile(userId);
    const professional = await this.getProfessionalByProfileId(profile.id);

    return {
      completion: this.calculateCompletion(profile, professional),
      professional,
    };
  }

  async upsertProfessionalMine(userId: string, dto: UpsertProfessionalProfileDto) {
    const profile = await this.getRequiredProfile(userId);
    const practiceAreaNames = this.normalizeNames(dto.practiceAreas);
    const taxonomicGroupNames = this.normalizeNames(dto.taxonomicGroups);
    const skillNames = this.normalizeNames(dto.skills);

    await this.dataSource.transaction(async (manager) => {
      const practiceAreas = await this.ensureCatalogItems(
        practiceAreaNames,
        manager.getRepository(PracticeArea),
      );
      const taxonomicGroups = await this.ensureCatalogItems(
        taxonomicGroupNames,
        manager.getRepository(TaxonomicGroup),
      );
      const skills = await this.ensureCatalogItems(skillNames, manager.getRepository(Skill));

      await manager.delete(BiologistExperience, { profileId: profile.id });
      await manager.delete(BiologistCertification, { profileId: profile.id });
      await manager.delete(BiologistDocument, { profileId: profile.id });

      await manager.query(
        `DELETE FROM "biologist_profile_practice_areas" WHERE "profile_id" = $1`,
        [profile.id],
      );
      await manager.query(
        `DELETE FROM "biologist_profile_taxonomic_groups" WHERE "profile_id" = $1`,
        [profile.id],
      );
      await manager.query(`DELETE FROM "biologist_profile_skills" WHERE "profile_id" = $1`, [
        profile.id,
      ]);

      for (const item of practiceAreas) {
        await manager.query(
          `INSERT INTO "biologist_profile_practice_areas" ("profile_id", "practice_area_id") VALUES ($1, $2)`,
          [profile.id, item.id],
        );
      }

      for (const item of taxonomicGroups) {
        await manager.query(
          `INSERT INTO "biologist_profile_taxonomic_groups" ("profile_id", "taxonomic_group_id") VALUES ($1, $2)`,
          [profile.id, item.id],
        );
      }

      for (const item of skills) {
        await manager.query(
          `INSERT INTO "biologist_profile_skills" ("profile_id", "skill_id") VALUES ($1, $2)`,
          [profile.id, item.id],
        );
      }

      await manager.save(
        BiologistExperience,
        dto.experiences.map((experience) => ({
          description: experience.description?.trim() || null,
          endYear: experience.endYear ?? null,
          isCurrent: experience.isCurrent,
          organizationName: experience.organizationName?.trim() || null,
          profileId: profile.id,
          startYear: experience.startYear,
          title: experience.title.trim(),
        })),
      );

      await manager.save(
        BiologistCertification,
        dto.certifications.map((certification) => ({
          credentialUrl: certification.credentialUrl?.trim() || null,
          issuedYear: certification.issuedYear ?? null,
          issuerName: certification.issuerName?.trim() || null,
          name: certification.name.trim(),
          profileId: profile.id,
        })),
      );

      await manager.save(
        BiologistDocument,
        dto.documents.map((document): Partial<BiologistDocument> => ({
          fileUrl: document.fileUrl.trim(),
          profileId: profile.id,
          title: document.title.trim(),
          type: document.type,
          verificationStatus: "PENDING",
        })),
      );
    });

    const professional = await this.getProfessionalByProfileId(profile.id);

    return {
      completion: this.calculateCompletion(profile, professional),
      professional,
    };
  }

  private calculateCompletion(profile: BiologistProfile, professional: ProfessionalProfile) {
    const values = [
      profile.fullName,
      profile.cpf,
      profile.birthDate,
      profile.crbioNumber,
      profile.crbioRegion,
      profile.state,
      profile.city,
      profile.registrationStatus,
      profile.graduationYear,
      profile.headline,
      profile.bio,
      profile.availabilityStatus,
      professional.practiceAreas.length,
      professional.taxonomicGroups.length,
      professional.skills.length,
      professional.experiences.length,
      professional.certifications.length,
      professional.documents.length,
    ];

    const filled = values.filter(
      (value) => value !== null && value !== undefined && value !== "" && value !== 0,
    ).length;

    return Math.round((filled / values.length) * 100);
  }

  private normalize(dto: UpsertBiologistProfileDto) {
    return {
      acceptsTravel: dto.acceptsTravel,
      availabilityStatus: dto.availabilityStatus,
      availableFrom: dto.availableFrom || null,
      bio: dto.bio?.trim() || null,
      birthDate: dto.birthDate,
      city: dto.city.trim(),
      cpf: dto.cpf.replace(/\D/g, ""),
      crbioNumber: dto.crbioNumber.trim(),
      crbioRegion: dto.crbioRegion.trim(),
      fullName: dto.fullName.trim(),
      graduationYear: dto.graduationYear,
      hasCnpj: dto.hasCnpj,
      hasDriverLicense: dto.hasDriverLicense,
      hasOwnVehicle: dto.hasOwnVehicle,
      headline: dto.headline?.trim() || null,
      issuesInvoice: dto.issuesInvoice,
      registrationStatus: dto.registrationStatus,
      state: dto.state.trim().toUpperCase(),
    };
  }

  private async getRequiredProfile(userId: string) {
    const profile = await this.profilesRepository.findOneBy({ userId });

    if (!profile) {
      throw new NotFoundException("Complete o perfil basico antes do perfil profissional.");
    }

    return profile;
  }

  private async getProfessionalByProfileId(profileId: string): Promise<ProfessionalProfile> {
    const [practiceAreas, taxonomicGroups, skills, experiences, certifications, documents] =
      await Promise.all([
        this.practiceAreasRepository
          .createQueryBuilder("practiceArea")
          .innerJoin(
            "biologist_profile_practice_areas",
            "link",
            "link.practice_area_id = practiceArea.id",
          )
          .where("link.profile_id = :profileId", { profileId })
          .orderBy("practiceArea.name", "ASC")
          .getMany(),
        this.taxonomicGroupsRepository
          .createQueryBuilder("taxonomicGroup")
          .innerJoin(
            "biologist_profile_taxonomic_groups",
            "link",
            "link.taxonomic_group_id = taxonomicGroup.id",
          )
          .where("link.profile_id = :profileId", { profileId })
          .orderBy("taxonomicGroup.name", "ASC")
          .getMany(),
        this.skillsRepository
          .createQueryBuilder("skill")
          .innerJoin("biologist_profile_skills", "link", "link.skill_id = skill.id")
          .where("link.profile_id = :profileId", { profileId })
          .orderBy("skill.name", "ASC")
          .getMany(),
        this.experiencesRepository.find({
          order: { startYear: "DESC" },
          where: { profileId },
        }),
        this.certificationsRepository.find({
          order: { issuedYear: "DESC", name: "ASC" },
          where: { profileId },
        }),
        this.documentsRepository.find({
          order: { createdAt: "DESC" },
          where: { profileId },
        }),
      ]);

    return {
      certifications,
      documents,
      experiences,
      practiceAreas,
      skills,
      taxonomicGroups,
    };
  }

  private normalizeNames(values: string[]) {
    return [...new Set(values.map((value) => value.trim()).filter(Boolean))].slice(0, 30);
  }

  private emptyProfessionalProfile(): ProfessionalProfile {
    return {
      certifications: [],
      documents: [],
      experiences: [],
      practiceAreas: [],
      skills: [],
      taxonomicGroups: [],
    };
  }

  private async ensureCatalogItems<T extends CatalogItem>(
    names: string[],
    repository: Repository<T>,
  ) {
    const items: T[] = [];

    for (const name of names) {
      let item = await repository.findOne({ where: { name } as never });

      if (!item) {
        item = repository.create();
        item.name = name;
        item = await repository.save(item);
      }

      items.push(item);
    }

    return items;
  }
}
