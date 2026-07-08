import { z } from "zod";
export const sendMessageSchema = z.object({
    content : z.string()
    .min(1,"Message content should be at least 1 character")
    .max(4000,"Message content should be at most 4000 characters"),
});

export const editMessageSchema = z.object({
    content : z.string()
    .min(1,"Message content should be at least 1 character")
    .max(4000,"Message content should be at most 4000 characters"),
});
export type sendMessageDto =z.infer<typeof sendMessageSchema>;

export type editMessageDto = z.infer<typeof editMessageSchema>;