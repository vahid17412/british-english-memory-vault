import { z } from 'zod';
import { APP_CONFIG } from '@/shared/constants/AppConfig';

export const ParsedCardSchema = z.object({
  target: z.string().min(1).max(APP_CONFIG.IMPORT.MAX_TARGET_LENGTH),
  canonicalForm: z.string().min(1).max(APP_CONFIG.IMPORT.MAX_TARGET_LENGTH),
  englishMeaning: z.string().min(1).max(APP_CONFIG.IMPORT.MAX_TEXT_LENGTH),
  persianMeaning: z.string().max(APP_CONFIG.IMPORT.MAX_TEXT_LENGTH).optional(),
  ipa: z.string().max(100).optional(),
}).strict();
