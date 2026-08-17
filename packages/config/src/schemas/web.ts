import { z } from "zod";
import { sharedEnvSchema } from "./shared";

export const webEnvSchema = sharedEnvSchema.extend({
  NEXT_PUBLIC_API_URL: z.string().url(),

  NEXT_PUBLIC_WS_URL: z.string().url(),
});