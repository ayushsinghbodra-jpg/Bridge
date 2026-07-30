import { Module } from "@nestjs/common";
import { PrismaModule } from "../prisma/prisma.module";
import { CommonModule } from "../common/common.module";
import { MessageModule } from "../message/message/message.module";
import { ReactionService } from "./reaction.service";
import { ReactionController } from "./reaction.controller";

@Module({
    imports: [PrismaModule, CommonModule, MessageModule],
    controllers: [ReactionController],
    providers: [ReactionService],
    exports: [ReactionService],
})
export class ReactionModule {}