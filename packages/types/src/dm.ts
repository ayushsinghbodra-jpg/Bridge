import { z } from "zod";

export const sendDmSchema = z.object({
  content: z.string().min(1, "Message content should be at least 1 character").max(4000, "Message content should be at most 4000 characters"),
  replyToId: z.string().cuid("Invalid replyToId").optional(),
});

export const editDmSchema = z.object({
  content: z.string().min(1, "Message content should be at least 1 character").max(4000, "Message content should be at most 4000 characters"),
});

export const createConversationSchema = z
  .object({
    type: z.enum(["DM", "GROUP_DM"]),
    participantIds: z.array(z.string().cuid("Invalid participant id")).min(1),
  })
  .superRefine((data, ctx) => {
    if (data.type === "DM" && data.participantIds.length !== 1) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: "DM conversations require exactly one other participant",
        path: ["participantIds"],
      });
    }
    if (data.type === "GROUP_DM" && data.participantIds.length < 2) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: "GROUP_DM conversations require at least two other participants",
        path: ["participantIds"],
      });
    }
  });

export const addParticipantSchema = z.object({
  userId: z.string().cuid("Invalid user id"),
});

export type SendDmDto = z.infer<typeof sendDmSchema>;
export type EditDmDto = z.infer<typeof editDmSchema>;
export type CreateConversationDto = z.infer<typeof createConversationSchema>;
export type AddParticipantDto = z.infer<typeof addParticipantSchema>;

export interface ConversationUser {
  id: string;
  username: string;
  displayName: string | null;
  avatarUrl: string | null;
}

export interface ConversationParticipantResponse {
  id: string;
  joinedAt: string;
  lastReadAt: string | null;
  user: ConversationUser;
}

export interface DmAuthor {
  id: string;
  username: string;
  displayName: string | null;
  avatarUrl: string | null;
  role?: "owner" | "admin" | "moderator" | "member";
}

export interface ReplyToDm {
  id: string;
  content: string;
  author: DmAuthor;
}

export interface DmResponse {
  id: string;
  conversationId: string;
  content: string;
  author: DmAuthor;
  replyTo: ReplyToDm | null;
  editedAt: string | null;
  deleted: boolean;
  createdAt: string;
  mentionedUserIds: string[];
}

export interface Dm {
  id: string;
  conversationId: string;
  author: DmAuthor;
  content: string;
  replyTo: ReplyToDm | null;
  editedAt: string | null;
  deleted: boolean;
  createdAt: string;
  pending?: boolean;
}

export interface DmPage {
  messages: Dm[];
  nextCursor: string | null;
}

export interface ConversationResponse {
  id: string;
  type: "DM" | "GROUP_DM";
  createdAt: string;
  participants: ConversationParticipantResponse[];
  lastMessage: Dm | null;
}
