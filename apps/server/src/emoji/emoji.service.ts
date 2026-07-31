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
import type { CreateCustomEmojiDto, CustomEmojiResponse } from "@bridge/types";
import { EMOJI_NAME_REGEX, MAX_CUSTOM_EMOJIS_PER_SERVER } from "./emoji.constants";

const UPLOADER_SELECT = {
  select: { id: true, username: true, displayName: true, avatarUrl: true },
} as const;

@Injectable()
export class EmojiService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly analytics: AnalyticsService,
    private readonly membership: MembershipService,
  ) {}

  async list(serverId: string, userId: string): Promise<CustomEmojiResponse[]> {
    await this.membership.assertMember(serverId, userId);

    const emojis = await this.prisma.customEmoji.findMany({
      where: { serverId },
      include: { uploader: UPLOADER_SELECT },
      orderBy: { name: "asc" },
    });

    return emojis.map((emoji) => this.toResponse(emoji));
  }

  async upload(serverId: string, dto: CreateCustomEmojiDto, userId: string): Promise<CustomEmojiResponse> {
    await this.assertAdminOrOwner(serverId, userId);

    if (!EMOJI_NAME_REGEX.test(dto.name)) {
      throw new BadRequestException("Emoji name can only contain lowercase letters, numbers, and underscores");
    }

    const emojiCount = await this.prisma.customEmoji.count({ where: { serverId } });
    if (emojiCount >= MAX_CUSTOM_EMOJIS_PER_SERVER) {
      throw new ConflictException(
        `Cannot upload more than ${MAX_CUSTOM_EMOJIS_PER_SERVER} custom emojis per server`,
      );
    }

    try {
      const emoji = await this.prisma.customEmoji.create({
        data: { serverId, name: dto.name, imageUrl: dto.imageUrl, uploaderId: userId },
        include: { uploader: UPLOADER_SELECT },
      });

      this.analytics.track("custom_emoji_uploaded", {
        userId,
        serverId,
        payload: { emojiId: emoji.id, name: emoji.name },
      });

      return this.toResponse(emoji);
    } catch (err) {
      if (err instanceof Prisma.PrismaClientKnownRequestError && err.code === "P2002") {
        throw new ConflictException("An emoji with this name already exists in this server");
      }
      throw err;
    }
  }

  async remove(serverId: string, emojiId: string, userId: string): Promise<void> {
    await this.assertAdminOrOwner(serverId, userId);

    const emoji = await this.prisma.customEmoji.findUnique({ where: { id: emojiId } });
    if (!emoji || emoji.serverId !== serverId) {
      throw new NotFoundException("Emoji not found");
    }

    await this.prisma.customEmoji.delete({ where: { id: emojiId } });

    this.analytics.track("custom_emoji_deleted", {
      userId,
      serverId,
      payload: { emojiId, name: emoji.name },
    });
  }

  private async assertAdminOrOwner(serverId: string, userId: string): Promise<void> {
    const member = await this.prisma.member.findUnique({
      where: { userId_serverId: { userId, serverId } },
      select: { role: true },
    });

    const roleHierarchy: Record<string, number> = { OWNER: 0, ADMIN: 1, MODERATOR: 2, MEMBER: 3 };
    if (!member || (roleHierarchy[member.role] ?? 99) > roleHierarchy.ADMIN) {
      throw new ForbiddenException("Only admins or the server owner can manage custom emojis");
    }
  }

  private toResponse(emoji: {
    id: string;
    serverId: string;
    name: string;
    imageUrl: string;
    uploaderId: string;
    createdAt: Date;
    uploader: { id: string; username: string; displayName: string | null; avatarUrl: string | null };
  }): CustomEmojiResponse {
    return {
      id: emoji.id,
      serverId: emoji.serverId,
      name: emoji.name,
      imageUrl: emoji.imageUrl,
      uploaderId: emoji.uploaderId,
      uploader: emoji.uploader,
      createdAt: emoji.createdAt.toISOString(),
    };
  }
}
