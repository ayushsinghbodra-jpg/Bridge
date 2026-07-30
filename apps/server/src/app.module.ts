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
    ServerModule,
    ChannelModule,
    MessageModule,
    HealthModule,
    ReactionModule,
  ],
  providers: [
    {
      provide: APP_GUARD,
      useClass: ThrottlerGuard,
    },
  ],
})
export class AppModule {}