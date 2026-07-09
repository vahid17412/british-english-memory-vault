import { z } from 'zod';

export const SettingsSchema = z.object({
  theme: z.enum(['light', 'dark']),
  newCardsCap: z.number().int().min(1).max(500),
  reviewCardsCap: z.number().int().min(1).max(5000),
}).strict();
