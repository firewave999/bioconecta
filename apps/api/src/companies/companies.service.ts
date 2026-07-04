import { ForbiddenException, Injectable } from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";
import { Repository } from "typeorm";

import { User } from "../users/user.entity.js";
import { Company } from "./company.entity.js";
import { UpsertCompanyDto } from "./dto/upsert-company.dto.js";

@Injectable()
export class CompaniesService {
  constructor(
    @InjectRepository(Company)
    private readonly companiesRepository: Repository<Company>,
    @InjectRepository(User)
    private readonly usersRepository: Repository<User>,
  ) {}

  async getMine(userId: string) {
    const company = await this.companiesRepository.findOneBy({ ownerUserId: userId });

    return { company };
  }

  async upsertMine(userId: string, dto: UpsertCompanyDto) {
    const user = await this.usersRepository.findOneByOrFail({ id: userId });

    if (!user.roles.includes("COMPANY") && !user.roles.includes("RECRUITER")) {
      throw new ForbiddenException("Apenas contas de empresa podem cadastrar uma empresa.");
    }

    const existing = await this.companiesRepository.findOneBy({ ownerUserId: userId });
    const company = this.companiesRepository.create({
      ...existing,
      city: dto.city.trim(),
      cnpj: dto.cnpj.replace(/\D/g, ""),
      description: dto.description?.trim() || null,
      name: dto.name.trim(),
      ownerUserId: userId,
      size: dto.size,
      state: dto.state.trim().toUpperCase(),
      website: dto.website?.trim() || null,
    });

    return { company: await this.companiesRepository.save(company) };
  }
}
