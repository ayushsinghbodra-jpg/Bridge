import { Controller, Get, Post, Delete, Body, Param, Query, UseGuards } from "@nestjs/common";
import { PinningService } from "./pinning.service";
import { ChatGateway } from "../message/message/chat.gateway";
import { JwtAuthGuard } from "../auth/guards/jwt-auth.guard";
import { CurrentUser } from "../auth/decorators/current-user.decorator";

@Controller("channels/:channelId")
@UseGuards(JwtAuthGuard)
export class PinningController {
  constructor(
    private readonly pinningService: PinningService,
    private readonly chatGateway: ChatGateway,
  ) {}

  @Post("messages/:messageId/pin")
  async pin(
    @Param("channelId") channelId: string,
    @Param("messageId") messageId: string,
    @CurrentUser("id") userId: string,
  ) {
    const pinned = await this.pinningService.pin(channelId, messageId, userId);
    this.chatGateway.broadcastToChannel(channelId, "message:pinned", pinned);
    return pinned;
  }

  @Delete("messages/:messageId/pin")
  async unpin(
    @Param("channelId") channelId: string,
    @Param("messageId") messageId: string,
    @CurrentUser("id") userId: string,
  ) {
    const unpinned = await this.pinningService.unpin(channelId, messageId, userId);
    this.chatGateway.broadcastToChannel(channelId, "message:unpinned", unpinned);
    return unpinned;
  }

  @Get("pins")
  async listPins(
    @Param("channelId") channelId: string,
    @CurrentUser("id") userId: string,
    @Query("cursor") cursor?: string,
    @Query("take") take?: string,
  ) {
    return this.pinningService.listPinned(channelId, userId, cursor, take ? parseInt(take, 10) : undefined);
  }
}
