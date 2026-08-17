import {
  ExceptionFilter,
  Catch,
  ArgumentsHost,
  HttpException,
  HttpStatus,
  Logger,
} from "@nestjs/common";
import { Prisma } from "@prisma/client";

type HttpRequest = {
  method: string;
  url: string;
};

type HttpResponse = {
  status(code: number): { json(body: unknown): unknown };
};

interface ErrorBody {
  message: string;
  errors?: Array<{ field: string; message: string }>;
}

@Catch()
export class HttpExceptionFilter implements ExceptionFilter {
  private readonly logger = new Logger(HttpExceptionFilter.name);

  catch(exception: unknown, host: ArgumentsHost) {
    const ctx = host.switchToHttp();
    const response = ctx.getResponse<HttpResponse>();
    const request = ctx.getRequest<HttpRequest>();

    const { status, body } = this.resolve(exception);

    if (status >= 500) {
      this.logger.error(
        `${request.method} ${request.url} -> ${status}`,
        exception instanceof Error ? exception.stack : String(exception)
      );
    } else {
      this.logger.warn(`${request.method} ${request.url} -> ${status}: ${body.message}`);
    }

    response.status(status).json(body);
  }

  private resolve(exception: unknown): { status: number; body: ErrorBody } {
    // NestJS HttpException (BadRequestException, NotFoundException, UnauthorizedException, etc.)
    if (exception instanceof HttpException) {
      const status = exception.getStatus();
      const res = exception.getResponse();

      if (typeof res === "string") {
        return { status, body: { message: res } };
      }

      const resObj = res as Record<string, unknown>;
      const message =
        typeof resObj.message === "string"
          ? resObj.message
          : Array.isArray(resObj.message)
            ? resObj.message.join(", ")
            : exception.message;

      return {
        status,
        body: {
          message,
          errors: resObj.errors as ErrorBody["errors"],
        },
      };
    }

    // Prisma known request errors (unique constraint violations, not found, etc.)
    if (exception instanceof Prisma.PrismaClientKnownRequestError) {
      return this.resolvePrismaError(exception);
    }

    // Unknown/unexpected error — never leak internals to the client.
    return {
      status: HttpStatus.INTERNAL_SERVER_ERROR,
      body: { message: "Something went wrong. Please try again." },
    };
  }

  private resolvePrismaError(
    exception: Prisma.PrismaClientKnownRequestError
  ): { status: number; body: ErrorBody } {
    switch (exception.code) {
      case "P2002": {
        const target = (exception.meta?.target as string[] | undefined)?.join(", ") ?? "field";
        return {
          status: HttpStatus.CONFLICT,
          body: { message: `A record with this ${target} already exists.` },
        };
      }
      case "P2025":
        return {
          status: HttpStatus.NOT_FOUND,
          body: { message: "Record not found." },
        };
      case "P2003":
        return {
          status: HttpStatus.BAD_REQUEST,
          body: { message: "Related record does not exist." },
        };
      default:
        return {
          status: HttpStatus.INTERNAL_SERVER_ERROR,
          body: { message: "A database error occurred." },
        };
    }
  }
}