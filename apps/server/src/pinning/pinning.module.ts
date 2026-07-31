import { Module } from "@nestjs/common";
import { PrismaModule } from "../prisma/prisma.module";
import { CommonModule } from "../common/common.module";
import { MessageModule } from "../message/message/message.module";
import { PinningService } from "./pinning.service";
import { PinningController } from "./pinning.controller";

@Module({
  imports: [PrismaModule, CommonModule, MessageModule],
  controllers: [PinningController],
  providers: [PinningService],
  exports: [PinningService],
})
export class PinningModule {}
