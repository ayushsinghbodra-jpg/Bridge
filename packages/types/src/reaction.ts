import { z } from "zod";

const EMOJI_REGEX = /^(\p{Emoji_Presentation}(\u200d\p{Emoji_Presentation})*\uFE0F?|<a?:\w{2,32}:\d{17,20}>)$/u;

export const AddReactionSchema = z.object({
  emoji: z
    .string()
    .min(1, "Emoji is required")
    .max(64, "Emoji is too long")
    .regex(EMOJI_REGEX, "Invalid emoji format"),
});

export type AddReactionDto = z.infer<typeof AddReactionSchema>;

export const ReactionParamsSchema = z.object({
  messageId: z.string().cuid(),
});

export type ReactionParamsDto = z.infer<typeof ReactionParamsSchema>;

export const RemoveReactionParamsSchema = ReactionParamsSchema.extend({
  emoji: z.string().min(1).max(64),
});

export type RemoveReactionParamsDto = z.infer<typeof RemoveReactionParamsSchema>;

export interface ReactionResponse {
  id: string;
  messageId: string;
  userId: string;
  emoji: string;
  createdAt: Date;
  channelId: string;
  user: ReactionUser;
}

export interface ReactionUser {
  id: string;
  username: string;
  displayName: string | null;
  avatarUrl: string | null;
}

export interface GroupedReactionResponse {
  emoji: string;
  count: number;
  reacted: boolean;
  users: ReactionUser[];
}

export interface ReactionSocketPayload {
  messageId: string;
  channelId: string;
  emoji: string;
  userId: string;
}