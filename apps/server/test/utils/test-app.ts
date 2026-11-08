import { INestApplication } from "@nestjs/common";
import { APP_GUARD } from "@nestjs/core";
import { AppModule } from "../../src/app.module";
import { HttpExceptionFilter } from "../../src/common/filters/http-exception.filter";
import { Test } from "@nestjs/testing";
import { ThrottlerGuard } from "@nestjs/throttler";
import { PrismaService } from "../../src/prisma/prisma.service";
import { testDb } from "./test-db";

export async function createTestApp(): Promise<INestApplication> {
  const moduleRef = await Test.createTestingModule({
    imports: [AppModule],
  })
    .overrideProvider(APP_GUARD)
    .useValue({ canActivate: () => true })
    .overrideGuard(ThrottlerGuard)
    .useValue({ canActivate: () => true })
    .overrideProvider(PrismaService)
    .useValue(testDb)
    .compile();

  const app = moduleRef.createNestApplication();
  app.useGlobalFilters(new HttpExceptionFilter());
  app.setGlobalPrefix("api");
  await app.init();
  return app;
}
