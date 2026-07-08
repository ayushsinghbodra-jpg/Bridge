import { z } from "zod";

import { serverEnvSchema } from "./schemas/server";
import { webEnvSchema } from "./schemas/web";
import { workerEnvSchema } from "./schemas/worker";

export type ServerEnv = z.infer<typeof serverEnvSchema>;

export type WebEnv = z.infer<typeof webEnvSchema>;

export type WorkerEnv = z.infer<typeof workerEnvSchema>;