import { Injectable, NotFoundException, ForbiddenException, BadRequestException } from "@nestjs/common";
import { PrismaService } from "../../prisma/prisma.service";
import { AnalyticsService } from "../../analytics/analytics.service";
import { MembershipService } from "../../common/membership.service";
import type { MessagePage, MessageResponse, ReplyToMessage } from "@bridge/types";
import { MentionServices } from "../../mentions/mention.service";
import { REPLY_SNIPPET_MAX_LENGTH } from "./message.constants";

const REPLY_TO_SELECT = {
  id: true,
  content: true,
  author: {
    select: { id: true, username: true, displayName: true, avatarUrl: true },
  },
} as const;

@Injectable()
export class MessageService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly analytics: AnalyticsService,
    private readonly membership: MembershipService,
    private readonly mentionServices : MentionServices,
  ) {}

async send(channelId: string, authorId: string, content: string, replyToId?: string): Promise<MessageResponse> {
    const channel = await this.prisma.channel.findUnique({
      where: { id: channelId },
      select: { id: true, serverId: true },
    });
    if (!channel) throw new NotFoundException("Channel not found");

    const member = await this.prisma.member.findUnique({
      where: { userId_serverId: { userId: authorId, serverId: channel.serverId } },
    });
    if (!member) throw new ForbiddenException("You must be a member to send messages");

    if (replyToId) {
      await this.assertValidReplyTarget(replyToId, channelId);
    }

    const message = await this.prisma.message.create({
      data: { channelId, authorId, content, replyToId },
      include: {
        author: {
          select: { id: true, username: true, displayName: true, avatarUrl: true },
        },
        replyTo: { select: REPLY_TO_SELECT },
      },
    });

    this.analytics.track("message_sent", {
      userId: authorId,
      serverId: channel.serverId,
      payload: { channelId, messageId: message.id, replyToId: replyToId ?? null },
    });

    const mentions = await this.mentionServices.processMentions(content, channelId, message.id);
    const mentionedUserIds = mentions.map((m) => m.userId);

    return this.toResponse(message, mentionedUserIds);
  }

  private async assertValidReplyTarget(replyToId: string, channelId: string): Promise<void> {
    const target = await this.prisma.message.findUnique({
      where: { id: replyToId },
      select: { id: true, channelId: true },
    });
    if (!target) throw new NotFoundException("Message to reply to not found");
    if (target.channelId !== channelId) {
      throw new BadRequestException("Cannot reply to a message in a different channel");
    }
  }

  async list(channelId: string, userId: string, cursor?: string, take = 50): Promise<MessagePage> {
    await this.membership.assertMemberForChannel(channelId, userId);

    const messages = await this.prisma.message.findMany({
      where: { channelId, deleted: false },
      include: {
        author: {
          select: { id: true, username: true, displayName: true, avatarUrl: true },
        },
        replyTo: { select: REPLY_TO_SELECT },
      },
      orderBy: { createdAt: "desc" },
      take: take + 1,
      ...(cursor ? { cursor: { id: cursor }, skip: 1 } : {}),
    });

    const hasMore = messages.length > take;
    const results = hasMore ? messages.slice(0, take) : messages;
    const nextCursor = hasMore ? results[results.length - 1]!.id : null;

    return {
      messages: results.reverse().map((msg)=> this.toResponse(msg)),
      nextCursor,
    };
  }

  async edit(messageId: string, userId: string, content: string): Promise<MessageResponse> {
    const message = await this.prisma.message.findUnique({
      where: { id: messageId },
      include: { author: { select: { id: true, username: true, displayName: true, avatarUrl: true } } },
    });
    if (!message) throw new NotFoundException("Message not found");
    if (message.authorId !== userId) throw new ForbiddenException("You can only edit your own messages");

    const updated = await this.prisma.message.update({
      where: { id: messageId },
      data: { content, editedAt: new Date() },
      include: {
        author: { select: { id: true, username: true, displayName: true, avatarUrl: true } },
        replyTo: { select: REPLY_TO_SELECT },
      },
    });

    return this.toResponse(updated);
  }

  async delete(messageId: string, userId: string): Promise<void> {
    const message = await this.prisma.message.findUnique({ where: { id: messageId } });
    if (!message) throw new NotFoundException("Message not found");
    if (message.authorId !== userId) throw new ForbiddenException("You can only delete your own messages");

    await this.prisma.message.update({
      where: { id: messageId },
      data: { deleted: true, content: "[message deleted]" },
    });
  }

  private toResponse(
      msg: {
        id: string;
        channelId: string;
        content: string;
        replyTo: {
          id: string;
          content: string;
          author: { id: string; username: string; displayName: string | null; avatarUrl: string | null };
        } | null;
        editedAt: Date | null;
        deleted: boolean;
        createdAt: Date;
        author: { id: string; username: string; displayName: string | null; avatarUrl: string | null };
      },
      mentionedUserIds: string[] = [],
  ): MessageResponse {
      return {
        id: msg.id,
        channelId: msg.channelId,
        content: msg.content,
        author: msg.author,
        replyTo: msg.replyTo ? this.toReplyTo(msg.replyTo) : null,
        editedAt: msg.editedAt?.toISOString() ?? null,
        deleted: msg.deleted,
        createdAt: msg.createdAt.toISOString(),
        mentionedUserIds, 
      };
  }

  private toReplyTo(replyTo: { id: string; content: string; author: { id: string; username: string; displayName: string | null; avatarUrl: string | null } }): ReplyToMessage {
      return {
        id: replyTo.id,
        content: replyTo.content.length > REPLY_SNIPPET_MAX_LENGTH
          ? `${replyTo.content.slice(0, REPLY_SNIPPET_MAX_LENGTH)}\u2026`
          : replyTo.content,
        author: replyTo.author,
      };
  }
}
