import { Module } from "@nestjs/common";
import { JwtModule } from "@nestjs/jwt";
import { ConfigModule, ConfigService } from "@nestjs/config";
import { PrismaModule } from "../../prisma/prisma.module";
import { CommonModule } from "../../common/common.module";
import { MessageController } from "./message.controller";
import { MessageService } from "./message.service";
import { ChatGateway } from "./chat.gateway";
import { MentionModule } from "../../mentions/mention.module";

@Module({
  imports: [
    PrismaModule,
    CommonModule,
    MentionModule,
    JwtModule.registerAsync({
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: (config: ConfigService) => ({
        secret: config.getOrThrow<string>("JWT_SECRET"),
      }),
    }),
  ],
  controllers: [MessageController],
  providers: [MessageService, ChatGateway],
  exports : [ChatGateway],
})
export class MessageModule {};

