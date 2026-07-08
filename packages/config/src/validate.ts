import { z } from "zod";

export function validateEnv<T extends z.ZodTypeAny>(schema: T, env: Record<string, unknown>): z.infer<T> {
  const result = schema.safeParse(env);
  if (!result.success) {
    throw new Error(`Environment validation failed: ${result.error.message}`);
  }
  return result.data;
}