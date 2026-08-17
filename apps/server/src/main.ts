import { NestFactory } from "@nestjs/core";
import { Logger, ValidationPipe } from "@nestjs/common";
import { AppModule } from "./app.module";
import { HttpExceptionFilter } from "./common/filters/http-exception.filter";
import { PrismaService } from "./prisma/prisma.service";

async function bootstrap() {
  const logger = new Logger("Bootstrap");

  const app = await NestFactory.create(AppModule, {
    logger: ["error", "warn", "log"],
  });

  // CORS — only allow requests from the actual frontend origin.
  app.enableCors({
    origin: process.env.FRONTEND_URL ?? "http://localhost:3000",
    credentials: true,
  });

  // Global error shaping — matches the frontend's ApiError { message, errors } contract.
  app.useGlobalFilters(new HttpExceptionFilter());

  // Strip unknown properties from incoming payloads as a defense-in-depth layer
  // alongside the per-route ZodValidationPipe (which does the real validation).
  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      forbidNonWhitelisted: false,
    })
  );

  // Global API prefix — every route is under /api, e.g. /api/auth/login.
  app.setGlobalPrefix("api");

  // Graceful shutdown: let Prisma close its DB connection cleanly on
  // SIGTERM/SIGINT (important once this runs in Docker/Kubernetes).
  const prismaService = app.get(PrismaService);
  await prismaService.enableShutdownHooks(app);
  app.enableShutdownHooks();

  const port = process.env.PORT ?? 3000;
  await app.listen(port);

  logger.log(`Bridge API running on http://localhost:${port}/api`);
}

bootstrap().catch((error) => {
  // eslint-disable-next-line no-console
  console.error("Failed to start application:", error);
  process.exit(1);
});