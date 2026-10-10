import { INestApplication, ValidationPipe } from "@nestjs/common";
import { AppModule } from "../../../server/src/app.module";
import { HttpExceptionFilter } from "../../../server/src/common/filters/http-exception.filter";
import { Test, TestingModule } from "@nestjs/testing";

export async function createTestApp() : Promise<INestApplication> {
    const moduleRef = await  Test.createTestingModule({
        imports: [AppModule],
    }).compile();
    const app = moduleRef.createNestApplication();
    app.useGlobalFilters(new HttpExceptionFilter());
    app.useGlobalPipes(new ValidationPipe({ whitelist: true, transform: true, forbidNonWhitelisted: true }));
    app.setGlobalPrefix("api");
    await app.init();
    return app;
}