import { Injectable, NotFoundException, ForbiddenException } from "@nestjs/common";
import { PrismaService } from "../../prisma/prisma.service";
import { AnalyticsService } from "../../analytics/analytics.service";
import { MembershipService } from "../../common/membership.service";
import type { CreateChannelDto, UpdateChannelDto, ChannelResponse } from "@bridge/types";

@Injectable()
export class ChannelService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly analytics: AnalyticsService,
    private readonly membership: MembershipService,
  ) {}

  private mapDtoTypeToPrisma(type: string): "TEXT" | "VOICE" | "ANNOUNCEMENT" {
    const map: Record<string, "TEXT" | "VOICE" | "ANNOUNCEMENT"> = {
      text: "TEXT",
      voice: "VOICE",
      announcements: "ANNOUNCEMENT",
    };
    return map[type.toLowerCase()] ?? "TEXT";
  }

  private mapPrismaTypeToDto(type: string): ChannelResponse["type"] {
    const map: Record<string, ChannelResponse["type"]> = {
      TEXT: "text",
      VOICE: "voice",
      ANNOUNCEMENT: "announcements",
    };
    return map[type] ?? "text";
  }

  async create(serverId: string, dto: CreateChannelDto, userId: string): Promise<ChannelResponse> {
    await this.assertMemberRole(serverId, userId, ["OWNER", "ADMIN"]);

    const maxPos = await this.prisma.channel.aggregate({
      where: { serverId },
      _max: { position: true },
    });

    const channel = await this.prisma.channel.create({
      data: {
        serverId,
        name: dto.name,
        topic: dto.topic,
        type: this.mapDtoTypeToPrisma(dto.type ?? "text"),
        position: (maxPos._max.position ?? -1) + 1,
      },
    });

    this.analytics.track("channel_created", {
      userId,
      serverId,
      payload: { channelId: channel.id, name: channel.name, type: channel.type },
    });

    return this.toResponse(channel);
  }

  async listForServer(serverId: string, userId: string): Promise<ChannelResponse[]> {
    await this.membership.assertMember(serverId, userId);

    const channels = await this.prisma.channel.findMany({
      where: { serverId },
      orderBy: [{ type: "asc" }, { position: "asc" }],
    });
    return channels.map((channel) => this.toResponse(channel));
  }

  async findById(channelId: string): Promise<ChannelResponse> {
    const channel = await this.prisma.channel.findUnique({ where: { id: channelId } });
    if (!channel) throw new NotFoundException("Channel not found");
    return this.toResponse(channel);
  }

  async update(
    channelId: string,
    dto: UpdateChannelDto,
    userId: string,
  ): Promise<ChannelResponse> {
    const channel = await this.prisma.channel.findUnique({ where: { id: channelId } });
    if (!channel) throw new NotFoundException("Channel not found");

    await this.assertMemberRole(channel.serverId, userId, ["OWNER", "ADMIN"]);

    const updated = await this.prisma.channel.update({
      where: { id: channelId },
      data: {
        ...(dto.name !== undefined ? { name: dto.name } : {}),
        ...(dto.topic !== undefined ? { topic: dto.topic } : {}),
      },
    });

    return this.toResponse(updated);
  }

  async delete(channelId: string, userId: string): Promise<void> {
    const channel = await this.prisma.channel.findUnique({ where: { id: channelId } });
    if (!channel) throw new NotFoundException("Channel not found");

    await this.assertMemberRole(channel.serverId, userId, ["OWNER", "ADMIN"]);
    await this.prisma.channel.delete({ where: { id: channelId } });
  }

  private async assertMemberRole(serverId: string, userId: string, roles: string[]) {
    const member = await this.prisma.member.findUnique({
      where: { userId_serverId: { userId, serverId } },
    });
    if (!member || !roles.includes(member.role)) {
      throw new ForbiddenException("Insufficient permissions");
    }
  }

  private toResponse(channel: {
    id: string;
    serverId: string;
    name: string;
    topic: string | null;
    type: string;
    position: number;
    createdAt: Date;
  }): ChannelResponse {
    return {
      id: channel.id,
      serverId: channel.serverId,
      name: channel.name,
      topic: channel.topic,
      type: this.mapPrismaTypeToDto(channel.type),
      postion: channel.position,
      createdAt: channel.createdAt.toISOString(),
    };
  }
}
