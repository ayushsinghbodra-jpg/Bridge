import { describe, it, expect, beforeEach, jest } from '@jest/globals';
import { HttpException, HttpStatus, BadRequestException, NotFoundException } from '@nestjs/common';
import { ArgumentsHost } from '@nestjs/common';
import { Prisma } from '@prisma/client';
import { z } from 'zod';
import { parseDurationToSeconds, parseDurationToDate } from './parse-duration';
import { HttpExceptionFilter } from './filters/http-exception.filter';
import { ZodValidationPipe } from './pipes/zod-validation.pipe';

describe('Common Utilities, Filters and Pipes', () => {
  describe('parseDuration', () => {
    it('should parse seconds, minutes, hours, and days correctly', () => {
      expect(parseDurationToSeconds('30s', 0)).toBe(30);
      expect(parseDurationToSeconds('15m', 0)).toBe(900);
      expect(parseDurationToSeconds('2h', 0)).toBe(7200);
      expect(parseDurationToSeconds('7d', 0)).toBe(604800);
    });

    it('should return fallback seconds for invalid inputs', () => {
      expect(parseDurationToSeconds('invalid', 60)).toBe(60);
      expect(parseDurationToSeconds('10x', 120)).toBe(120);
      expect(parseDurationToSeconds('', 300)).toBe(300);
    });

    it('should calculate future date with parseDurationToDate', () => {
      const before = Date.now();
      const targetDate = parseDurationToDate('1h', 3600);
      const after = Date.now();

      expect(targetDate.getTime()).toBeGreaterThanOrEqual(before + 3600 * 1000);
      expect(targetDate.getTime()).toBeLessThanOrEqual(after + 3600 * 1000);
    });
  });

  describe('ZodValidationPipe', () => {
    const testSchema = z.object({
      name: z.string().min(2),
      age: z.number().positive(),
    });
    const pipe = new ZodValidationPipe(testSchema);

    it('should successfully transform valid input', () => {
      const valid = { name: 'Alice', age: 25 };
      expect(pipe.transform(valid)).toEqual(valid);
    });

    it('should throw BadRequestException with formatted field errors on invalid input', () => {
      const invalid = { name: 'A', age: -5 };
      try {
        pipe.transform(invalid);
        fail('Should have thrown BadRequestException');
      } catch (err) {
        expect(err).toBeInstanceOf(BadRequestException);
        const res = (err as BadRequestException).getResponse() as any;
        expect(res.message).toBe('Validation failed');
        expect(res.errors).toBeDefined();
        expect(res.errors.length).toBe(2);
        expect(res.errors[0].field).toBe('name');
        expect(res.errors[1].field).toBe('age');
      }
    });
  });

  describe('HttpExceptionFilter', () => {
    let filter: HttpExceptionFilter;
    let mockResponse: { status: jest.Mock<any>; json: jest.Mock<any> };
    let mockHost: ArgumentsHost;

    beforeEach(() => {
      filter = new HttpExceptionFilter();
      mockResponse = {
        status: jest.fn().mockReturnThis(),
        json: jest.fn().mockReturnThis(),
      };
      mockHost = {
        switchToHttp: () => ({
          getResponse: () => mockResponse,
          getRequest: () => ({ method: 'POST', url: '/api/test' }),
        }),
      } as unknown as ArgumentsHost;
    });

    it('should catch string HttpException and send json response', () => {
      const exception = new BadRequestException('Invalid input payload');
      filter.catch(exception, mockHost);

      expect(mockResponse.status).toHaveBeenCalledWith(HttpStatus.BAD_REQUEST);
      expect(mockResponse.json).toHaveBeenCalledWith({
        message: 'Invalid input payload',
      });
    });

    it('should catch object HttpException with structured errors', () => {
      const exception = new HttpException(
        { message: 'Validation error', errors: [{ field: 'email', message: 'Required' }] },
        HttpStatus.UNPROCESSABLE_ENTITY
      );
      filter.catch(exception, mockHost);

      expect(mockResponse.status).toHaveBeenCalledWith(HttpStatus.UNPROCESSABLE_ENTITY);
      expect(mockResponse.json).toHaveBeenCalledWith({
        message: 'Validation error',
        errors: [{ field: 'email', message: 'Required' }],
      });
    });

    it('should handle Prisma P2002 unique constraint violations as 409 Conflict', () => {
      const prismaError = new Prisma.PrismaClientKnownRequestError('Unique error', {
        code: 'P2002',
        clientVersion: '5.22.0',
        meta: { target: ['email'] },
      });
      filter.catch(prismaError, mockHost);

      expect(mockResponse.status).toHaveBeenCalledWith(HttpStatus.CONFLICT);
      expect(mockResponse.json).toHaveBeenCalledWith({
        message: 'A record with this email already exists.',
      });
    });

    it('should handle Prisma P2025 record not found as 404 NotFound', () => {
      const prismaError = new Prisma.PrismaClientKnownRequestError('Not found', {
        code: 'P2025',
        clientVersion: '5.22.0',
      });
      filter.catch(prismaError, mockHost);

      expect(mockResponse.status).toHaveBeenCalledWith(HttpStatus.NOT_FOUND);
      expect(mockResponse.json).toHaveBeenCalledWith({
        message: 'Record not found.',
      });
    });

    it('should handle unexpected generic errors as 500 without leaking details', () => {
      const secretDbCrash = new Error('Database connection string leaked credentials');
      filter.catch(secretDbCrash, mockHost);

      expect(mockResponse.status).toHaveBeenCalledWith(HttpStatus.INTERNAL_SERVER_ERROR);
      expect(mockResponse.json).toHaveBeenCalledWith({
        message: 'Something went wrong. Please try again.',
      });
    });
  });
});
