import { ICardRepository } from '@/repositories/contracts/ICardRepository';
import { IClock } from '@/shared/interfaces/IClock';
import { IIdGenerator } from '@/shared/interfaces/IIdGenerator';
import { ITransactionManager } from '@/shared/interfaces/ITransactionManager';
import { SearchService } from '@/services/SearchService';
import { CanonicalEngine } from '@/domain/canonical/CanonicalEngine';
import { Card } from '@/domain/models/Card';
import { DuplicateCardError, CardNotFoundError } from '@/domain/errors/CardErrors';

export interface CardEditorPayload {
  readonly target: string;
  readonly englishMeaning: string;
  readonly persianMeaning?: string;
  readonly ipa?: string;
}

export class CardEditorService {
  constructor(
    private readonly cardRepo: ICardRepository,
    private readonly clock: IClock,
    private readonly idGenerator: IIdGenerator,
    private readonly transactionManager: ITransactionManager,
    private readonly searchService: SearchService
  ) {}

  async addCard(payload: CardEditorPayload): Promise<void> {
    const target = payload.target.normalize('NFKC').trim();
    const canonicalForm = CanonicalEngine.generateCanonicalForm(target);

    const now = this.clock.now();
    const newCard: Card = Object.freeze({
      id: this.idGenerator.generate(),
      canonicalForm,
      target,
      type: 'word',
      ipa: payload.ipa?.normalize('NFKC').trim(),
      englishMeaning: payload.englishMeaning.normalize('NFKC').trim(),
      persianMeaning: payload.persianMeaning?.normalize('NFKC').trim(),
      status: 'learning',
      difficulty: 50,
      recallStrength: 0,
      intervalDays: 0,
      nextReviewAt: now,
      consecutiveSuccesses: 0,
      consecutiveFailures: 0,
      createdAt: now,
      updatedAt: now,
    });

    // Transaction guarantees no race condition on duplicate check + insert
    await this.transactionManager.runInTransaction(async () => {
      const existing = await this.cardRepo.getByCanonicalForms([canonicalForm]);
      if (existing.length > 0) throw new DuplicateCardError();
      await this.cardRepo.create(newCard);
    });

    // Incremental Indexing
    await this.searchService.indexCard(newCard);
  }

  async updateCard(id: string, payload: CardEditorPayload): Promise<void> {
    const target = payload.target.normalize('NFKC').trim();
    const canonicalForm = CanonicalEngine.generateCanonicalForm(target);
    const now = this.clock.now();

    let updatedCard: Card;

    await this.transactionManager.runInTransaction(async () => {
      const existingCard = await this.cardRepo.getById(id);
      if (!existingCard) throw new CardNotFoundError(id);

      if (canonicalForm !== existingCard.canonicalForm) {
        const duplicateCheck = await this.cardRepo.getByCanonicalForms([canonicalForm]);
        if (duplicateCheck.length > 0) throw new DuplicateCardError();
      }

      // Immutability: Rebuilding the entire object
      updatedCard = Object.freeze({
        ...existingCard,
        target,
        canonicalForm,
        englishMeaning: payload.englishMeaning.normalize('NFKC').trim(),
        persianMeaning: payload.persianMeaning?.normalize('NFKC').trim(),
        ipa: payload.ipa?.normalize('NFKC').trim(),
        updatedAt: now,
      });

      // Saving the fully constructed immutable object
      await this.cardRepo.update(id, updatedCard);
    });

    // Incremental Indexing
    await this.searchService.updateCardIndex(updatedCard!);
  }
}
