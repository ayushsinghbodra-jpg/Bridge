import { Injectable, OnModuleDestroy, OnModuleInit } from "@nestjs/common";
import { PrismaClient } from "@prisma/client";

@Injectable()
export class PrismaService extends PrismaClient implements OnModuleInit, OnModuleDestroy {
  async onModuleInit() {
    await this.$connect();
  }

  async onModuleDestroy() {
    await this.$disconnect();
  }

  async enableShutdownHooks(app: any) {
    const shutdown = async () => {
      await this.$disconnect();
      process.exit(0);
    };

    process.on("SIGINT", shutdown);
    process.on("SIGTERM", shutdown);
  }

  async connect() {
    await this.$connect();
    return { ok: true, message: "Prisma client connected" };
  }

  async disconnect() {
    await this.$disconnect();
    return { ok: true, message: "Prisma connection closed" };
  }

  async healthCheck() {
    await this.$queryRaw`SELECT 1`;
    return { ok: true, message: "Prisma service ready" };
  }
  
}
