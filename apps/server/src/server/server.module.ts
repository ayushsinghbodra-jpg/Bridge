import { Module } from "@nestjs/common";
import { PrismaModule } from "../prisma/prisma.module";
import { CommonModule } from "../common/common.module";
import { ServerController } from "./server.controller";
import { ServerService } from "./server.service";
import { InviteController } from "./invite.controller";
import { InviteService } from "./invite.service";
import { MemberController } from "./member.controller";
import { MemberService } from "./member.service";

@Module({
  imports: [PrismaModule, CommonModule],
  controllers: [ServerController, InviteController, MemberController],
  providers: [ServerService, InviteService, MemberService],
  exports: [ServerService, MemberService],
})
export class ServerModule {}
