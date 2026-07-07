import { Module } from "@nestjs/common";
import { TypeOrmModule } from "@nestjs/typeorm";

import { AuthModule } from "../auth/auth.module.js";
import { Notification } from "./notification.entity.js";
import { NotificationsController } from "./notifications.controller.js";
import { NotificationsService } from "./notifications.service.js";

@Module({
  controllers: [NotificationsController],
  exports: [NotificationsService],
  imports: [AuthModule, TypeOrmModule.forFeature([Notification])],
  providers: [NotificationsService],
})
export class NotificationsModule {}
