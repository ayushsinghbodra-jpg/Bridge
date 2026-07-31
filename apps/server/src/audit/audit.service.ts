import { Injectable, Logger, ForbiddenException } from "@nestjs/common";
import { Prisma } from "@prisma/client";
import type { AuditAction } from "@prisma/client";
import { PrismaService } from "../prisma/prisma.service";
import type { AuditLogResponse, AuditLogsPage } from "@bridge/types";
import { AUDIT_LOGS_DEFAULT_TAKE, AUDIT_LOGS_MAX_TAKE } from "./audit.constants";

const ACTOR_SELECT = {
  select: { id: true, username: true, displayName: true, avatarUrl: true },
} as const;

@Injectable()
export class AuditLogService {
  private readonly logger = new Logger(AuditLogService.name);

  constructor(private readonly prisma: PrismaService) {}

  log(
    serverId: string,
    actorId: string,
    action: AuditAction,
    targetId: string | null = null,
    metadata: Record<string, unknown> | null = null,
  ): void {
    void this.write(serverId, actorId, action, targetId, metadata);
  }

  async list(
    serverId: string,
    userId: string,
    cursor?: string,
    take = AUDIT_LOGS_DEFAULT_TAKE,
  ): Promise<AuditLogsPage> {
    await this.assertAdminOrOwner(serverId, userId);

    const safeTake = Math.max(1, Math.min(take, AUDIT_LOGS_MAX_TAKE));

    const logs = await this.prisma.auditLog.findMany({
      where: { serverId },
      include: { actor: ACTOR_SELECT },
      orderBy: { createdAt: "desc" },
      take: safeTake + 1,
      ...(cursor ? { cursor: { id: cursor }, skip: 1 } : {}),
    });

    const hasMore = logs.length > safeTake;
    const results = hasMore ? logs.slice(0, safeTake) : logs;
    const nextCursor = hasMore ? results[results.length - 1]!.id : null;

    return {
      logs: results.map((log) => this.toResponse(log)),
      nextCursor,
    };
  }

  private async write(
    serverId: string,
    actorId: string,
    action: AuditAction,
    targetId: string | null,
    metadata: Record<string, unknown> | null,
  ): Promise<void> {
    try {
      const sanitizedMetadata = metadata === null
        ? Prisma.DbNull
        : (JSON.parse(JSON.stringify(metadata)) as Prisma.InputJsonValue);

      await this.prisma.auditLog.create({
        data: { serverId, actorId, action, targetId, metadata: sanitizedMetadata },
      });
    } catch (error) {
      this.logger.error(`Failed to write audit log entry for action ${action}`, error);
    }
  }

  private async assertAdminOrOwner(serverId: string, userId: string): Promise<void> {
    const member = await this.prisma.member.findUnique({
      where: { userId_serverId: { userId, serverId } },
      select: { role: true },
    });

    const roleHierarchy: Record<string, number> = { OWNER: 0, ADMIN: 1, MODERATOR: 2, MEMBER: 3 };
    if (!member || (roleHierarchy[member.role] ?? 99) > roleHierarchy.ADMIN) {
      throw new ForbiddenException("Only admins or the server owner can view audit logs");
    }
  }

  private toResponse(log: {
    id: string;
    serverId: string;
    action: AuditAction;
    targetId: string | null;
    metadata: unknown;
    createdAt: Date;
    actor: { id: string; username: string; displayName: string | null; avatarUrl: string | null };
  }): AuditLogResponse {
    return {
      id: log.id,
      serverId: log.serverId,
      action: log.action,
      actor: log.actor,
      targetId: log.targetId,
      metadata: (log.metadata as Record<string, unknown> | null) ?? null,
      createdAt: log.createdAt.toISOString(),
    };
  }
}
