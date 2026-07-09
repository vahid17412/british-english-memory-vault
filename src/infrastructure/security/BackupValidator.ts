import { z } from 'zod';
import { ErrorReporter } from '@/shared/utils/ErrorReporter';

export const BACKUP_VERSION = 1;

const CardSchema = z.object({
  id: z.string(),
  canonicalForm: z.string(),
  target: z.string(),
  type: z.enum(['word', 'expression', 'chunk', 'collocation', 'phrasalVerb', 'idiom', 'pattern', 'sentence']),
  ipa: z.string().optional(),
  englishMeaning: z.string(),
  persianMeaning: z.string().optional(),
  status: z.enum(['learning', 'mature', 'archived']),
  difficulty: z.number().min(0).max(100),
  recallStrength: z.number().min(0).max(100),
  intervalDays: z.number().min(0),
  nextReviewAt: z.number(),
  consecutiveSuccesses: z.number().min(0),
  consecutiveFailures: z.number().min(0),
  createdAt: z.number(),
  updatedAt: z.number(),
  archivedAt: z.number().optional(),
  deletedAt: z.number().optional(),
  metadata: z.record(z.unknown()).optional(),
}).strict();

const ReviewHistorySchema = z.object({
  id: z.string(),
  cardId: z.string(),
  isCorrect: z.boolean(),
  reviewTimeMs: z.number().min(0),
  hintUsageLevel: z.number().min(0).max(3),
  scheduledIntervalDays: z.number().min(0),
  actualIntervalDays: z.number().min(0),
  timestamp: z.number(),
  createdAt: z.number(),
}).strict();

const BackupPayloadSchema = z.object({
  metadata: z.object({
    version: z.literal(BACKUP_VERSION),
    timestamp: z.number(),
    totalCards: z.number(),
  }).strict(),
  data: z.object({
    cards: z.array(CardSchema),
    reviewHistory: z.array(ReviewHistorySchema),
  }).strict(),
}).strict();

export type ValidatedBackupPayload = z.infer<typeof BackupPayloadSchema>;

export class BackupValidator {
  /**
   * Safely validates the payload without exposing internal schema structures to the UI.
   */
  static validate(parsedData: unknown): ValidatedBackupPayload {
    const result = BackupPayloadSchema.safeParse(parsedData);
    if (!result.success) {
      // Log full internal error silently
      ErrorReporter.report('BackupValidator', result.error);
      // Throw generic error for the UI
      throw new Error('Data corruption, schema mismatch, or incompatible backup version detected.');
    }
    return result.data;
  }
}
