import { Injectable, NotFoundException } from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";
import { IsNull, Repository } from "typeorm";

import { Notification, NotificationType } from "./notification.entity.js";

type CreateNotificationInput = {
  actionUrl?: string | null;
  message: string;
  metadata?: Record<string, unknown> | null;
  title: string;
  type: NotificationType;
  userId: string;
};

@Injectable()
export class NotificationsService {
  constructor(
    @InjectRepository(Notification)
    private readonly notificationsRepository: Repository<Notification>,
  ) {}

  async createForUser(input: CreateNotificationInput) {
    const notification = this.notificationsRepository.create({
      actionUrl: input.actionUrl ?? null,
      message: input.message,
      metadata: input.metadata ?? null,
      title: input.title,
      type: input.type,
      userId: input.userId,
    });

    return this.notificationsRepository.save(notification);
  }

  async listMine(userId: string) {
    const [notifications, unreadCount] = await Promise.all([
      this.notificationsRepository.find({
        order: { createdAt: "DESC" },
        take: 50,
        where: { userId },
      }),
      this.notificationsRepository.countBy({ readAt: IsNull(), userId }),
    ]);

    return { notifications, unreadCount };
  }

  async markAsRead(userId: string, notificationId: string) {
    const notification = await this.notificationsRepository.findOneBy({
      id: notificationId,
      userId,
    });

    if (!notification) {
      throw new NotFoundException("Notificacao nao encontrada.");
    }

    if (!notification.readAt) {
      notification.readAt = new Date();
      await this.notificationsRepository.save(notification);
    }

    return { notification };
  }

  async markAllAsRead(userId: string) {
    await this.notificationsRepository.update({ readAt: IsNull(), userId }, { readAt: new Date() });

    return this.listMine(userId);
  }
}
