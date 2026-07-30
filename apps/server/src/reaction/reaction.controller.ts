import { Controller, Get, Post, Delete, Body, Param, UseGuards } from "@nestjs/common";
import { ReactionService } from "./reaction.service";
import { ChatGateway } from "../message/message/chat.gateway";
import { JwtAuthGuard } from "../auth/guards/jwt-auth.guard";
import { CurrentUser } from "../auth/decorators/current-user.decorator";
import { ZodValidationPipe } from "../common/pipes/zod-validation.pipe";
import { AddReactionSchema } from "@bridge/types";
import type { AddReactionDto } from "@bridge/types";

@Controller("messages/:messageId/reactions")
@UseGuards(JwtAuthGuard)
export class ReactionController {
  constructor(
    private readonly reactionService: ReactionService,
    private readonly chatGateway: ChatGateway,
  ) {}

  @Post()
  async addReaction(
    @Param("messageId") messageId: string,
    @Body(new ZodValidationPipe(AddReactionSchema)) dto: AddReactionDto,
    @CurrentUser("id") userId: string,
  ) {
    const reaction = await this.reactionService.addReaction(messageId, userId, dto.emoji);
    this.chatGateway.broadcastToChannel(reaction.channelId, "reaction:added", reaction);
    return reaction;
  }

  @Delete(":emoji")
  async removeReaction(
    @Param("messageId") messageId: string,
    @Param("emoji") emoji: string,
    @CurrentUser("id") userId: string,
  ) {
    const result = await this.reactionService.removeReaction(messageId, userId, decodeURIComponent(emoji));
    this.chatGateway.broadcastToChannel(result.channelId, "reaction:removed", result);
    return result;
  }

  @Get()
  async getReactions(@Param("messageId") messageId: string, @CurrentUser("id") userId: string) {
    return this.reactionService.getReactionsForMessage(messageId, userId);
  }
}