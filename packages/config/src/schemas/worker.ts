import { z } from "zod";
import { sharedEnvSchema } from "./shared";

export const workerEnvSchema = sharedEnvSchema.extend({
  REDIS_URL: z.string().url(),

  QUEUE_NAME: z.string(),
});