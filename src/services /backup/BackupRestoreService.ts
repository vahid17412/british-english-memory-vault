import { ICardRepository } from '@/repositories/contracts/ICardRepository';
import { IReviewRepository } from '@/repositories/contracts/IReviewRepository';
import { IClock } from '@/shared/interfaces/IClock';
import { ITransactionManager } from '@/shared/interfaces/ITransactionManager';
import { IEventBus } from '@/events/IEventBus';
import { BackupValidator, ValidatedBackupPayload, BACKUP_VERSION } from '@/infrastructure/security/BackupValidator';
import { SearchService } from '@/services/SearchService';

export class BackupRestoreService {
  private readonly MAX_FILE_SIZE_BYTES = 100 * 1024 * 1024;
  private readonly CHUNK_SIZE = 2000;

  constructor(
    private readonly cardRepo: ICardRepository,
    private readonly reviewRepo: IReviewRepository,
    private readonly clock: IClock,
    private readonly transactionManager: ITransactionManager,
    private readonly eventBus: IEventBus,
    private readonly searchService: SearchService
  ) {}

  async generateFullBackup(): Promise<string> {
    const [cards, reviewHistory] = await Promise.all([
      this.cardRepo.getAll(),
      this.reviewRepo.getAll()
    ]);

    const payload: ValidatedBackupPayload = {
      metadata: {
        version: BACKUP_VERSION,
        timestamp: this.clock.now(),
        totalCards: cards.length,
      },
      data: {
        cards: [...cards],
        reviewHistory: [...reviewHistory],
      }
    };

    return JSON.stringify(payload, null, 2);
  }

  async restoreFromBackup(jsonString: string, signal?: AbortSignal): Promise<void> {
    if (signal?.aborted) throw new Error('Restore aborted by user.');
    
    if (jsonString.length > this.MAX_FILE_SIZE_BYTES) {
      throw new Error('Backup file exceeds maximum allowed size.');
    }

    let parsedData: unknown;
    try {
      parsedData = JSON.parse(jsonString);
    } catch {
      throw new Error('Invalid JSON file format.');
    }
    
    if (signal?.aborted) throw new Error('Restore aborted.');
    const validPayload = BackupValidator.validate(parsedData);

    await this.transactionManager.runInTransaction(async () => {
      if (signal?.aborted) throw new Error('Restore aborted inside transaction.');
      
      await this.cardRepo.clear();
      await this.reviewRepo.clear();

      for (let i = 0; i < validPayload.data.cards.length; i += this.CHUNK_SIZE) {
        if (signal?.aborted) throw new Error('Restore aborted during execution.');
        const chunk = validPayload.data.cards.slice(i, i + this.CHUNK_SIZE);
        await this.cardRepo.bulkUpsert(chunk);
      }

      for (let i = 0; i < validPayload.data.reviewHistory.length; i += this.CHUNK_SIZE) {
        if (signal?.aborted) throw new Error('Restore aborted during execution.');
        const chunk = validPayload.data.reviewHistory.slice(i, i + this.CHUNK_SIZE);
        await this.reviewRepo.addMany(chunk);
      }
    });

    if (signal?.aborted) throw new Error('Restore aborted before reindexing.');

    await this.searchService.reindexAll();

    await this.eventBus.publish({
      type: 'RESTORE_COMPLETED',
      payload: Object.freeze({
        timestamp: this.clock.now(),
        totalCardsRestored: validPayload.data.cards.length,
        totalReviewsRestored: validPayload.data.reviewHistory.length,
      })
    });
  }
}