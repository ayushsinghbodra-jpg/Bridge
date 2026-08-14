import { Injectable, NotFoundException, ForbiddenException, BadRequestException } from "@nestjs/common";
import { PrismaService } from "../../prisma/prisma.service";
import { AnalyticsService } from "../../analytics/analytics.service";
import type { ConversationType } from "@prisma/client";
import type {
  ConversationResponse,
  ConversationParticipantResponse,
  Dm,
  DmPage,
  DmResponse,
  ReplyToDm,
} from "@bridge/types";
import { REPLY_SNIPPET_MAX_LENGTH } from "./dm.constants";

const USER_SELECT = {
  id: true,
  username: true,
  displayName: true,
  avatarUrl: true,
} as const;

const REPLY_TO_SELECT = {
  id: true,
  content: true,
  sender: { select: USER_SELECT },
} as const;

type ParticipantWithUser = {
  id: string;
  conversationId: string;
  userId: string;
  joinedAt: Date;
  lastReadAt: Date | null;
  user: { id: string; username: string; displayName: string | null; avatarUrl: string | null };
};

type DirectMessageWithRelations = {
  id: string;
  conversationId: string;
  senderId: string;
  content: string;
  replyToId: string | null;
  editedAt: Date | null;
  deleted: boolean;
  createdAt: Date;
  sender: { id: string; username: string; displayName: string | null; avatarUrl: string | null };
  replyTo: {
    id: string;
    content: string;
    sender: { id: string; username: string; displayName: string | null; avatarUrl: string | null };
  } | null;
};

@Injectable()
export class DmService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly analytics: AnalyticsService,
  ) {}

  // ── Conversations ──────────────────────────────────────────────

  async createConversation(
    actorId: string,
    type: ConversationType,
    participantIds: string[],
  ): Promise<ConversationResponse> {
    const uniqueIds = [...new Set(participantIds)];
    if (uniqueIds.length !== participantIds.length) {
      throw new BadRequestException("Duplicate participant ids are not allowed");
    }
    if (uniqueIds.includes(actorId)) {
      throw new BadRequestException("The requester cannot also be listed as a participant");
    }

    const expected = type === "DM" ? 1 : 2;
    if (uniqueIds.length < expected) {
      throw new BadRequestException(
        type === "DM"
          ? "DM conversations require exactly one other participant"
          : "GROUP_DM conversations require at least two other participants",
      );
    }

    const users = await this.prisma.user.findMany({
      where: { id: { in: uniqueIds } },
      select: { id: true },
    });
    if (users.length !== uniqueIds.length) {
      throw new BadRequestException("One or more participants do not exist");
    }

    if (type === "DM") {
      const existing = await this.findDmBetween(actorId, uniqueIds[0]!);
      if (existing) return existing;
    }

    const conversation = await this.prisma.conversation.create({
      data: {
        type,
        participants: {
          create: [{ userId: actorId }, ...uniqueIds.map((userId) => ({ userId }))],
        },
      },
      include: {
        participants: {
          include: { user: { select: USER_SELECT } },
          orderBy: { joinedAt: "asc" },
        },
      },
    });

    this.analytics.track("conversation_created", {
      userId: actorId,
      payload: { conversationId: conversation.id, type },
    });

    return this.toConversationResponse(conversation, null);
  }

  async listConversations(userId: string): Promise<ConversationResponse[]> {
    const conversations = await this.prisma.conversation.findMany({
      where: { participants: { some: { userId } } },
      include: {
        participants: {
          include: { user: { select: USER_SELECT } },
          orderBy: { joinedAt: "asc" },
        },
        messages: {
          include: {
            sender: { select: USER_SELECT },
            replyTo: { select: REPLY_TO_SELECT },
          },
          orderBy: { createdAt: "desc" },
          take: 1,
        },
      },
      orderBy: { createdAt: "desc" },
    });

    return conversations.map((conversation) =>
      this.toConversationResponse(
        conversation,
        conversation.messages[0] ? this.toDm(conversation.messages[0]) : null,
      ),
    );
  }

  private async findDmBetween(userId: string, otherUserId: string): Promise<ConversationResponse | null> {
    const candidates = await this.prisma.conversation.findMany({
      where: {
        type: "DM",
        participants: { some: { userId } },
      },
      include: {
        participants: {
          include: { user: { select: USER_SELECT } },
        },
      },
    });

    const match = candidates.find((candidate) => {
      const ids = candidate.participants.map((p) => p.userId);
      return ids.length === 2 && ids.includes(userId) && ids.includes(otherUserId);
    });

    if (!match) return null;
    return this.toConversationResponse(match, null);
  }

  // ── Messages ───────────────────────────────────────────────────

  async listMessages(
    conversationId: string,
    userId: string,
    cursor?: string,
    take = 50,
  ): Promise<DmPage> {
    await this.assertParticipant(conversationId, userId);

    const messages = await this.prisma.directMessage.findMany({
      where: { conversationId, deleted: false },
      include: {
        sender: { select: USER_SELECT },
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
      messages: results.reverse().map((message) => this.toDmResponse(message)),
      nextCursor,
    };
  }

  async sendMessage(
    conversationId: string,
    senderId: string,
    content: string,
    replyToId?: string,
  ): Promise<DmResponse> {
    await this.assertParticipant(conversationId, senderId);

    if (replyToId) {
      await this.assertValidReplyTarget(replyToId, conversationId);
    }

    const message = await this.prisma.directMessage.create({
      data: { conversationId, senderId, content, replyToId },
      include: {
        sender: { select: USER_SELECT },
        replyTo: { select: REPLY_TO_SELECT },
      },
    });

    this.analytics.track("dm_sent", {
      userId: senderId,
      payload: { conversationId, messageId: message.id, replyToId: replyToId ?? null },
    });

    return this.toDmResponse(message);
  }

  async editMessage(
    conversationId: string,
    messageId: string,
    userId: string,
    content: string,
  ): Promise<DmResponse> {
    await this.assertParticipant(conversationId, userId);

    const message = await this.findMessageInConversation(messageId, conversationId);
    if (message.senderId !== userId) {
      throw new ForbiddenException("You can only edit your own messages");
    }

    const updated = await this.prisma.directMessage.update({
      where: { id: messageId },
      data: { content, editedAt: new Date() },
      include: {
        sender: { select: USER_SELECT },
        replyTo: { select: REPLY_TO_SELECT },
      },
    });

    return this.toDmResponse(updated);
  }

  async deleteMessage(conversationId: string, messageId: string, userId: string): Promise<void> {
    await this.assertParticipant(conversationId, userId);

    const message = await this.findMessageInConversation(messageId, conversationId);
    if (message.senderId !== userId) {
      throw new ForbiddenException("You can only delete your own messages");
    }

    await this.prisma.directMessage.update({
      where: { id: messageId },
      data: { deleted: true, content: "[message deleted]" },
    });
  }

  async markRead(conversationId: string, userId: string) {
    await this.assertParticipant(conversationId, userId);

    const participant = await this.prisma.conversationParticipant.update({
      where: { conversationId_userId: { conversationId, userId } },
      data: { lastReadAt: new Date() },
      select: { userId: true, conversationId: true, lastReadAt: true },
    });

    return {
      conversationId: participant.conversationId,
      userId: participant.userId,
      lastReadAt: participant.lastReadAt?.toISOString() ?? null,
    };
  }

  // ── Participants (GROUP_DM only) ───────────────────────────────

  async addParticipant(
    conversationId: string,
    actorId: string,
    targetUserId: string,
  ): Promise<ConversationParticipantResponse> {
    const conversation = await this.getConversation(conversationId);
    if (conversation.type !== "GROUP_DM") {
      throw new BadRequestException("Participants can only be added to GROUP_DM conversations");
    }
    await this.assertParticipant(conversationId, actorId);

    const user = await this.prisma.user.findUnique({
      where: { id: targetUserId },
      select: { id: true },
    });
    if (!user) throw new NotFoundException("User not found");

    const participant = await this.prisma.conversationParticipant.upsert({
      where: { conversationId_userId: { conversationId, userId: targetUserId } },
      create: { conversationId, userId: targetUserId },
      update: {},
      include: { user: { select: USER_SELECT } },
    });

    return this.toParticipantResponse(participant);
  }

  async removeParticipant(
    conversationId: string,
    actorId: string,
    targetUserId: string,
  ): Promise<void> {
    const conversation = await this.getConversation(conversationId);
    if (conversation.type !== "GROUP_DM") {
      throw new BadRequestException("Participants can only be removed from GROUP_DM conversations");
    }
    await this.assertParticipant(conversationId, actorId);

    const participant = await this.prisma.conversationParticipant.findUnique({
      where: { conversationId_userId: { conversationId, userId: targetUserId } },
    });
    if (!participant) throw new NotFoundException("Participant not found");

    const count = await this.prisma.conversationParticipant.count({ where: { conversationId } });
    if (count <= 2) {
      throw new BadRequestException(
        "Cannot remove participant — conversation must keep at least 2 participants",
      );
    }

    await this.prisma.conversationParticipant.delete({
      where: { conversationId_userId: { conversationId, userId: targetUserId } },
    });
  }

  // ── Helpers ────────────────────────────────────────────────────

  private async getConversation(conversationId: string) {
    const conversation = await this.prisma.conversation.findUnique({
      where: { id: conversationId },
    });
    if (!conversation) throw new NotFoundException("Conversation not found");
    return conversation;
  }

  private async assertParticipant(conversationId: string, userId: string) {
    const participant = await this.prisma.conversationParticipant.findUnique({
      where: { conversationId_userId: { conversationId, userId } },
    });
    if (!participant) {
      throw new ForbiddenException("You are not a participant of this conversation");
    }
    return participant;
  }

  private async assertValidReplyTarget(replyToId: string, conversationId: string): Promise<void> {
    const target = await this.prisma.directMessage.findUnique({
      where: { id: replyToId },
      select: { id: true, conversationId: true },
    });
    if (!target) throw new NotFoundException("Message to reply to not found");
    if (target.conversationId !== conversationId) {
      throw new BadRequestException("Cannot reply to a message in a different conversation");
    }
  }

  private async findMessageInConversation(messageId: string, conversationId: string) {
    const message = await this.prisma.directMessage.findUnique({
      where: { id: messageId },
      select: { id: true, conversationId: true, senderId: true, deleted: true },
    });
    if (!message) throw new NotFoundException("Message not found");
    if (message.conversationId !== conversationId) {
      throw new BadRequestException("Message is not part of this conversation");
    }
    return message;
  }

  private toConversationResponse(
    conversation: {
      id: string;
      type: ConversationType;
      createdAt: Date;
      participants: ParticipantWithUser[];
    },
    lastMessage: Dm | null,
  ): ConversationResponse {
    return {
      id: conversation.id,
      type: conversation.type,
      createdAt: conversation.createdAt.toISOString(),
      participants: conversation.participants.map((participant) =>
        this.toParticipantResponse(participant),
      ),
      lastMessage,
    };
  }

  private toParticipantResponse(participant: ParticipantWithUser): ConversationParticipantResponse {
    return {
      id: participant.id,
      joinedAt: participant.joinedAt.toISOString(),
      lastReadAt: participant.lastReadAt?.toISOString() ?? null,
      user: participant.user,
    };
  }

  private toDmResponse(message: DirectMessageWithRelations): DmResponse {
    return {
      id: message.id,
      conversationId: message.conversationId,
      content: message.content,
      author: message.sender,
      replyTo: message.replyTo ? this.toReplyTo(message.replyTo) : null,
      editedAt: message.editedAt?.toISOString() ?? null,
      deleted: message.deleted,
      createdAt: message.createdAt.toISOString(),
      mentionedUserIds: [],
    };
  }

  private toDm(message: DirectMessageWithRelations): Dm {
    return {
      id: message.id,
      conversationId: message.conversationId,
      author: message.sender,
      content: message.content,
      replyTo: message.replyTo ? this.toReplyTo(message.replyTo) : null,
      editedAt: message.editedAt?.toISOString() ?? null,
      deleted: message.deleted,
      createdAt: message.createdAt.toISOString(),
    };
  }

  private toReplyTo(replyTo: {
    id: string;
    content: string;
    sender: { id: string; username: string; displayName: string | null; avatarUrl: string | null };
  }): ReplyToDm {
    return {
      id: replyTo.id,
      content:
        replyTo.content.length > REPLY_SNIPPET_MAX_LENGTH
          ? `${replyTo.content.slice(0, REPLY_SNIPPET_MAX_LENGTH)}\u2026`
          : replyTo.content,
      author: replyTo.sender,
    };
  }
}
