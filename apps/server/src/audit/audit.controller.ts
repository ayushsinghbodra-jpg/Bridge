import { Controller, Get, Param, Query, UseGuards } from "@nestjs/common";
import { AuditLogService } from "./audit.service";
import { JwtAuthGuard } from "../auth/guards/jwt-auth.guard";
import { CurrentUser } from "../auth/decorators/current-user.decorator";

@Controller("servers/:serverId/audit-logs")
@UseGuards(JwtAuthGuard)
export class AuditLogController {
  constructor(private readonly auditLogService: AuditLogService) {}

  @Get()
  async list(
    @Param("serverId") serverId: string,
    @CurrentUser("id") userId: string,
    @Query("cursor") cursor?: string,
    @Query("take") take?: string,
  ) {
    return this.auditLogService.list(serverId, userId, cursor, take ? parseInt(take, 10) : undefined);
  }
}
