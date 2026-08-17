import { Injectable, ConflictException, NotFoundException, BadRequestException } from "@nestjs/common";
import { Prisma } from "@prisma/client";
import { PrismaService } from "../prisma/prisma.service";
import { AnalyticsService } from "../analytics/analytics.service";
import { MembershipService } from "../common/membership.service";

const EMOJI_REGEX = /^(\p{Emoji_Presentation}|\p{Emoji}\uFE0F?|<a?:\w{2,32}:\d{17,20}>)$/u;
const MAX_DISTINCT_REACTIONS_PER_MESSAGE = 20;

@Injectable()
export class ReactionService {
    constructor(
        private readonly prisma: PrismaService,
        private readonly analytics: AnalyticsService,
        private readonly membership: MembershipService,
    ) {}

    async addReaction(messageId: string, userId: string, emoji: string) {
        if (!EMOJI_REGEX.test(emoji)) {
            throw new BadRequestException("Invalid emoji format");
        }

        const message = await this.prisma.message.findUnique({
            where: { id: messageId },
            select: { id: true, channelId: true },
        });
        if (!message) throw new NotFoundException("Message not found");

        await this.membership.assertMemberForChannel(message.channelId, userId);

        const distinctEmoji = await this.prisma.reaction.groupBy({
            by: ["emoji"],
            where: { messageId },
        });
        const isNewEmoji = !distinctEmoji.some((r) => r.emoji === emoji);
        if (isNewEmoji && distinctEmoji.length >= MAX_DISTINCT_REACTIONS_PER_MESSAGE) {
            throw new ConflictException("Reaction limit reached for this message");
        }

        try {
            const reaction = await this.prisma.reaction.create({
                data: { messageId, userId, emoji },
                include: {
                    user: { select: { id: true, username: true, displayName: true, avatarUrl: true } },
                },
            });

            try {
                this.analytics.track("reaction_added", {
                    userId,
                    payload: { messageId, emoji },
                });
            } catch {
                
            }

            return { ...reaction, channelId: message.channelId };
        } catch (err) {
            if (err instanceof Prisma.PrismaClientKnownRequestError && err.code === "P2002") {
                throw new ConflictException("Reaction already exists");
            }
            throw err;
        }
    }

    async removeReaction(messageId: string, userId: string, emoji: string) {
        const message = await this.prisma.message.findUnique({
            where: { id: messageId },
            select: { id: true, channelId: true },
        });
        if (!message) throw new NotFoundException("Message not found");

        await this.membership.assertMemberForChannel(message.channelId, userId);

        try {
            await this.prisma.reaction.delete({
                where: { messageId_userId_emoji: { messageId, userId, emoji } },
            });

            try {
                this.analytics.track("reaction_removed", {
                    userId,
                    payload: { messageId, emoji },
                });
            } catch {
                
            }

            return { messageId, userId, emoji, channelId: message.channelId };
        } catch (err) {
            if (err instanceof Prisma.PrismaClientKnownRequestError && err.code === "P2025") {
                throw new NotFoundException("Reaction not found");
            }
            throw err;
        }
    }

    async getReactionsForMessage(messageId: string, currentUserId?: string) {
        const reactions = await this.prisma.reaction.findMany({
            where: { messageId },
            include: {
                user: { select: { id: true, username: true, displayName: true, avatarUrl: true } },
            },
        });

        const grouped = new Map<string, { emoji: string; count: number; users: any[]; reacted: boolean }>();

        for (const r of reactions) {
            const entry = grouped.get(r.emoji) ?? { emoji: r.emoji, count: 0, users: [], reacted: false };
            entry.count++;
            entry.users.push(r);
            if (r.userId === currentUserId) entry.reacted = true;
            grouped.set(r.emoji, entry);
        }

        return Array.from(grouped.values());
    }
}