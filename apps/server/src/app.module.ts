import { Module } from "@nestjs/common";
import { ConfigModule } from "@nestjs/config";
import { ThrottlerModule, ThrottlerGuard } from "@nestjs/throttler";
import { APP_GUARD } from "@nestjs/core";
import { PrismaModule } from "./prisma/prisma.module";
import { AuthModule } from "./auth/auth.module";
import { HealthModule } from "./health/health.module";
import { ServerModule } from "./server/server.module";
import { ChannelModule } from "./channel/channel/channel.module";
import { MessageModule } from "./message/message/message.module";
import { AnalyticsModule } from "./analytics/analytics.module";
import { ReactionModule } from "./reaction/reaction.module";
import { MentionModule } from "./mentions/mention.module";
import { PinningModule } from "./pinning/pinning.module";
import { EmojiModule } from "./emoji/emoji.module";
import { AuditLogModule } from "./audit/audit.module";
import { DmModule } from "./dm/dm/dm.module";
@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true }),
    ThrottlerModule.forRoot([
      { name: "short", ttl: 1000, limit: 5 },
      { name: "medium", ttl: 10000, limit: 30 },
      { name: "long", ttl: 60000, limit: 100 },
    ]),
    PrismaModule,
    AuthModule,
    AnalyticsModule,
    AuditLogModule,
    ServerModule,
    ChannelModule,
    MessageModule,
    HealthModule,
    ReactionModule,
    MentionModule,
    PinningModule,
    EmojiModule,
    DmModule,
  ],
  providers: [
    {
      provide: APP_GUARD,
      useClass: ThrottlerGuard,
    },
  ],
})
export class AppModule {}