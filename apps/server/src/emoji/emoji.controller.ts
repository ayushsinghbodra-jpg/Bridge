import { Controller, Get, Post, Delete, Body, Param, UseGuards } from "@nestjs/common";
import { EmojiService } from "./emoji.service";
import { JwtAuthGuard } from "../auth/guards/jwt-auth.guard";
import { CurrentUser } from "../auth/decorators/current-user.decorator";
import { ZodValidationPipe } from "../common/pipes/zod-validation.pipe";
import { createCustomEmojiSchema } from "@bridge/types";
import type { CreateCustomEmojiDto } from "@bridge/types";

@Controller("servers/:serverId/emojis")
@UseGuards(JwtAuthGuard)
export class EmojiController {
  constructor(private readonly emojiService: EmojiService) {}

  @Get()
  async list(@Param("serverId") serverId: string, @CurrentUser("id") userId: string) {
    return this.emojiService.list(serverId, userId);
  }

  @Post()
  async upload(
    @Param("serverId") serverId: string,
    @Body(new ZodValidationPipe(createCustomEmojiSchema)) dto: CreateCustomEmojiDto,
    @CurrentUser("id") userId: string,
  ) {
    return this.emojiService.upload(serverId, dto, userId);
  }

  @Delete(":emojiId")
  async remove(
    @Param("serverId") serverId: string,
    @Param("emojiId") emojiId: string,
    @CurrentUser("id") userId: string,
  ) {
    await this.emojiService.remove(serverId, emojiId, userId);
    return { message: "Emoji deleted" };
  }
}
