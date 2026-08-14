import { Controller, Get, Post, Patch, Delete, Body, Param, Query, UseGuards } from "@nestjs/common";
import { DmService } from "./dm.service";
import { JwtAuthGuard } from "../../auth/guards/jwt-auth.guard";
import { CurrentUser } from "../../auth/decorators/current-user.decorator";
import { ZodValidationPipe } from "../../common/pipes/zod-validation.pipe";
import { sendDmSchema, editDmSchema, createConversationSchema, addParticipantSchema } from "@bridge/types";
import type { SendDmDto, EditDmDto, CreateConversationDto, AddParticipantDto } from "@bridge/types";

@Controller("conversations")
@UseGuards(JwtAuthGuard)
export class DmController {
  constructor(private readonly dmService: DmService) {}

  @Post()
  create(
    @Body(new ZodValidationPipe(createConversationSchema)) dto: CreateConversationDto,
    @CurrentUser("id") userId: string,
  ) {
    return this.dmService.createConversation(userId, dto.type, dto.participantIds);
  }

  @Get()
  list(@CurrentUser("id") userId: string) {
    return this.dmService.listConversations(userId);
  }

  @Get(":conversationId/messages")
  listMessages(
    @Param("conversationId") conversationId: string,
    @CurrentUser("id") userId: string,
    @Query("cursor") cursor?: string,
    @Query("take") take?: string,
  ) {
    return this.dmService.listMessages(
      conversationId,
      userId,
      cursor,
      take ? Math.min(parseInt(take, 10), 100) : 50,
    );
  }

  @Post(":conversationId/messages")
  send(
    @Param("conversationId") conversationId: string,
    @Body(new ZodValidationPipe(sendDmSchema)) dto: SendDmDto,
    @CurrentUser("id") userId: string,
  ) {
    return this.dmService.sendMessage(conversationId, userId, dto.content, dto.replyToId);
  }

  @Patch(":conversationId/messages/:messageId")
  edit(
    @Param("conversationId") conversationId: string,
    @Param("messageId") messageId: string,
    @Body(new ZodValidationPipe(editDmSchema)) dto: EditDmDto,
    @CurrentUser("id") userId: string,
  ) {
    return this.dmService.editMessage(conversationId, messageId, userId, dto.content);
  }

  @Delete(":conversationId/messages/:messageId")
  remove(
    @Param("conversationId") conversationId: string,
    @Param("messageId") messageId: string,
    @CurrentUser("id") userId: string,
  ) {
    return this.dmService.deleteMessage(conversationId, messageId, userId);
  }

  @Post(":conversationId/participants")
  addParticipant(
    @Param("conversationId") conversationId: string,
    @Body(new ZodValidationPipe(addParticipantSchema)) dto: AddParticipantDto,
    @CurrentUser("id") userId: string,
  ) {
    return this.dmService.addParticipant(conversationId, userId, dto.userId);
  }

  @Delete(":conversationId/participants/:userId")
  removeParticipant(
    @Param("conversationId") conversationId: string,
    @Param("userId") targetUserId: string,
    @CurrentUser("id") userId: string,
  ) {
    return this.dmService.removeParticipant(conversationId, userId, targetUserId);
  }
}
