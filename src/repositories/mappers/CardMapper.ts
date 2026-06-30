import { Card } from '@/domain/models/Card';

export class CardMapper {
  static toDomain(raw: any): Card {
    return {
      id: raw.id,
      canonicalForm: raw.canonicalForm,
      target: raw.target,
      type: raw.type,
      ipa: raw.ipa,
      englishMeaning: raw.englishMeaning,
      persianMeaning: raw.persianMeaning,
      status: raw.status,
      difficulty: raw.difficulty,
      recallStrength: raw.recallStrength,
      intervalDays: raw.intervalDays,
      nextReviewAt: raw.nextReviewAt,
      consecutiveSuccesses: raw.consecutiveSuccesses,
      consecutiveFailures: raw.consecutiveFailures,
      createdAt: raw.createdAt,
      updatedAt: raw.updatedAt,
      archivedAt: raw.archivedAt,
      deletedAt: raw.deletedAt,
      metadata: raw.metadata
    };
  }

  static toDB(domain: Card) {
    // Whitelist only allowed fields for DB operations
    return {
      id: domain.id,
      canonicalForm: domain.canonicalForm,
      target: domain.target,
      type: domain.type,
      ipa: domain.ipa,
      englishMeaning: domain.englishMeaning,
      persianMeaning: domain.persianMeaning,
      status: domain.status,
      difficulty: domain.difficulty,
      recallStrength: domain.recallStrength,
      intervalDays: domain.intervalDays,
      nextReviewAt: domain.nextReviewAt,
      consecutiveSuccesses: domain.consecutiveSuccesses,
      consecutiveFailures: domain.consecutiveFailures,
      createdAt: domain.createdAt,
      updatedAt: domain.updatedAt,
      archivedAt: domain.archivedAt,
      deletedAt: domain.deletedAt,
      metadata: domain.metadata
    };
  }
}
