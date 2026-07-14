import { Injectable } from "@nestjs/common";
import { ConfigService } from "@nestjs/config";
import type { Prisma } from "@prisma/client";
import { PrismaService } from "../prisma/prisma.service";
import { parseDurationToDate } from "../common/parse-duration";

export interface SessionRecord {
  id: string;
  userId: string;
  refreshToken: string;
  userAgent: string | null;
  ipAddress: string | null;
  expiresAt: Date;
  createdAt: Date;
}

export interface SessionCreateData {
  userAgent?: string;
  ip?: string;
}

@Injectable()
export class SessionService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly config: ConfigService,
  ) {}

  private getExpiryDate(): Date {
    const raw = this.config.get<string>("JWT_REFRESH_EXPIRES_IN", "7d");
    return parseDurationToDate(raw, 7 * 24 * 60 * 60);
  }

  async create(userId: string, refreshToken: string, meta: SessionCreateData = {}) {
    return this.prisma.session.create({
      data: {
        userId,
        refreshToken,
        userAgent: meta.userAgent ?? null,
        ipAddress: meta.ip ?? null,
        expiresAt: this.getExpiryDate(),
      },
    });
  }

  async findByToken(refreshToken: string): Promise<SessionRecord | null> {
    return this.prisma.session.findUnique({
      where: { refreshToken },
    }) as Promise<SessionRecord | null>;
  }

  async rotate(sessionId: string, refreshToken: string) {
    return this.prisma.session.update({
      where: { id: sessionId },
      data: {
        refreshToken,
        expiresAt: this.getExpiryDate(),
      },
    });
  }

  async revoke(refreshToken: string): Promise<void> {
    await this.prisma.session.deleteMany({ where: { refreshToken } });
  }

  async revokeAllForUser(userId: string): Promise<void> {
    await this.prisma.session.deleteMany({ where: { userId } });
  }
}