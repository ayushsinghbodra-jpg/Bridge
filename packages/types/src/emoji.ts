import { z } from "zod";

export const EMOJI_NAME_REGEX = /^[a-z0-9_]{2,32}$/;

export const createCustomEmojiSchema = z.object({
  name: z
    .string()
    .min(2, "Emoji name should be at least 2 characters")
    .max(32, "Emoji name should be at most 32 characters")
    .regex(EMOJI_NAME_REGEX, "Emoji name can only contain lowercase letters, numbers, and underscores"),
  imageUrl: z.string().url("imageUrl must be a valid URL"),
});

export type CreateCustomEmojiDto = z.infer<typeof createCustomEmojiSchema>;

export interface CustomEmojiUploader {
  id: string;
  username: string;
  displayName: string | null;
  avatarUrl: string | null;
}

export interface CustomEmojiResponse {
  id: string;
  serverId: string;
  name: string;
  imageUrl: string;
  uploaderId: string;
  uploader: CustomEmojiUploader;
  createdAt: string;
}
