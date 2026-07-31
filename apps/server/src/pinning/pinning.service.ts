import {
  Injectable,
  NotFoundException,
  ForbiddenException,
  BadRequestException,
  ConflictException,
} from "@nestjs/common";
import { Prisma } from "@prisma/client";
import { PrismaService } from "../prisma/prisma.service";
import { AnalyticsService } from "../analytics/analytics.service";
import { MembershipService } from "../common/membership.service";
import type { PinnedMessageResponse, PinnedMessagesPage } from "@bridge/types";
import {
  MAX_PINNED_MESSAGES_PER_CHANNEL,
  PINNED_MESSAGES_DEFAULT_TAKE,
  PINNED_MESSAGES_MAX_TAKE,
} from "./pinning.constants";

const PINNED_MESSAGE_INCLUDE = {
  message: {
    include: {
      author: {
        select: { id: true, username: true, displayName: true, avatarUrl: true },
      },
    },
  },
  pinnedBy: {
    select: { id: true, username: true, displayName: true, avatarUrl: true },
  },
} as const;

@Injectable()
export class PinningService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly analytics: AnalyticsService,
    private readonly membership: MembershipService,
  ) {}

  async pin(channelId: string, messageId: string, userId: string): Promise<PinnedMessageResponse> {
    const serverId = await this.membership.assertMemberForChannel(channelId, userId);
    await this.assertModeratorOrHigher(serverId, userId);

    const message = await this.prisma.message.findUnique({
      where: { id: messageId },
      select: { id: true, channelId: true, deleted: true },
    });
    if (!message) throw new NotFoundException("Message not found");
    if (message.channelId !== channelId) {
      throw new BadRequestException("Message is not in this channel");
    }
    if (message.deleted) {
      throw new BadRequestException("Cannot pin a deleted message");
    }

    const pinnedCount = await this.prisma.pinnedMessage.count({ where: { channelId } });
    if (pinnedCount >= MAX_PINNED_MESSAGES_PER_CHANNEL) {
      throw new ConflictException(
        `Cannot pin more than ${MAX_PINNED_MESSAGES_PER_CHANNEL} messages per channel`,
      );
    }

    try {
      const pinned = await this.prisma.pinnedMessage.create({
        data: { messageId, channelId, serverId, pinnedBy: userId },
        include: PINNED_MESSAGE_INCLUDE,
      });

      this.analytics.track("message_pinned", {
        userId,
        serverId,
        payload: { messageId, channelId },
      });

      return this.toResponse(pinned);
    } catch (err) {
      if (err instanceof Prisma.PrismaClientKnownRequestError && err.code === "P2002") {
        throw new ConflictException("Message is already pinned");
      }
      throw err;
    }
  }

  async unpin(channelId: string, messageId: string, userId: string): Promise<PinnedMessageResponse> {
    const serverId = await this.membership.assertMemberForChannel(channelId, userId);
    await this.assertModeratorOrHigher(serverId, userId);

    try {
      const pinned = await this.prisma.pinnedMessage.delete({
        where: { messageId },
        include: PINNED_MESSAGE_INCLUDE,
      });

      this.analytics.track("message_unpinned", {
        userId,
        serverId,
        payload: { messageId, channelId },
      });

      return this.toResponse(pinned);
    } catch (err) {
      if (err instanceof Prisma.PrismaClientKnownRequestError && err.code === "P2025") {
        throw new NotFoundException("Message is not pinned");
      }
      throw err;
    }
  }

  async listPinned(
    channelId: string,
    userId: string,
    cursor?: string,
    take = PINNED_MESSAGES_DEFAULT_TAKE,
  ): Promise<PinnedMessagesPage> {
    await this.membership.assertMemberForChannel(channelId, userId);

    const safeTake = Math.max(1, Math.min(take, PINNED_MESSAGES_MAX_TAKE));

    const pinned = await this.prisma.pinnedMessage.findMany({
      where: { channelId },
      include: PINNED_MESSAGE_INCLUDE,
      orderBy: { createdAt: "desc" },
      take: safeTake + 1,
      ...(cursor ? { cursor: { id: cursor }, skip: 1 } : {}),
    });

    const hasMore = pinned.length > safeTake;
    const results = hasMore ? pinned.slice(0, safeTake) : pinned;
    const nextCursor = hasMore ? results[results.length - 1]!.id : null;

    return {
      messages: results.map((p) => this.toResponse(p)),
      nextCursor,
    };
  }

  private async assertModeratorOrHigher(serverId: string, userId: string): Promise<void> {
    const member = await this.prisma.member.findUnique({
      where: { userId_serverId: { userId, serverId } },
      select: { role: true },
    });

    const roleHierarchy: Record<string, number> = { OWNER: 0, ADMIN: 1, MODERATOR: 2, MEMBER: 3 };
    if (!member || (roleHierarchy[member.role] ?? 99) > roleHierarchy.MODERATOR) {
      throw new ForbiddenException("Only moderators or higher can pin messages");
    }
  }

  private toResponse(pinned: {
    id: string;
    channelId: string;
    messageId: string;
    createdAt: Date;
    message: {
      id: string;
      content: string;
      createdAt: Date;
      author: { id: string; username: string; displayName: string | null; avatarUrl: string | null };
    };
    pinnedBy: { id: string; username: string; displayName: string | null; avatarUrl: string | null };
  }): PinnedMessageResponse {
    return {
      id: pinned.id,
      channelId: pinned.channelId,
      messageId: pinned.messageId,
      createdAt: pinned.createdAt.toISOString(),
      pinnedBy: pinned.pinnedBy,
      message: {
        id: pinned.message.id,
        content: pinned.message.content,
        createdAt: pinned.message.createdAt.toISOString(),
        author: pinned.message.author,
      },
    };
  }
}
