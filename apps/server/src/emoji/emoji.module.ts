import { Module } from "@nestjs/common";
import { PrismaModule } from "../prisma/prisma.module";
import { CommonModule } from "../common/common.module";
import { EmojiService } from "./emoji.service";
import { EmojiController } from "./emoji.controller";

@Module({
  imports: [PrismaModule, CommonModule],
  controllers: [EmojiController],
  providers: [EmojiService],
  exports: [EmojiService],
})
export class EmojiModule {}
