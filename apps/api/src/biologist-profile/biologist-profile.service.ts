import { ForbiddenException, Injectable } from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";
import { Repository } from "typeorm";

import { User } from "../users/user.entity.js";
import { BiologistProfile } from "./biologist-profile.entity.js";
import { UpsertBiologistProfileDto } from "./dto/upsert-biologist-profile.dto.js";

@Injectable()
export class BiologistProfileService {
  constructor(
    @InjectRepository(BiologistProfile)
    private readonly profilesRepository: Repository<BiologistProfile>,
    @InjectRepository(User)
    private readonly usersRepository: Repository<User>,
  ) {}

  async getMine(userId: string) {
    const profile = await this.profilesRepository.findOneBy({ userId });

    return {
      completion: profile ? this.calculateCompletion(profile) : 0,
      profile,
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

    return {
      completion: this.calculateCompletion(saved),
      profile: saved,
    };
  }

  private calculateCompletion(profile: BiologistProfile) {
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
    ];

    const filled = values.filter(
      (value) => value !== null && value !== undefined && value !== "",
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
}
