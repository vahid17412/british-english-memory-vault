import { ICardRepository } from '@/repositories/contracts/ICardRepository';
import { IClock } from '@/shared/interfaces/IClock';
import { IIdGenerator } from '@/shared/interfaces/IIdGenerator';
import { ITransactionManager } from '@/shared/interfaces/ITransactionManager';
import { IEventBus } from '@/events/IEventBus';
import { SearchService } from '@/services/SearchService';
import { ImportResponseMessage, ParsedCardDTO } from '@/infrastructure/import/ImportWorkerTypes';
import { ParsedCardSchema } from '@/infrastructure/security/ImportValidator';
import { Card } from '@/domain/models/Card';
import { ErrorReporter } from '@/shared/utils/ErrorReporter';
import { APP_CONFIG } from '@/shared/constants/AppConfig';

export class ImportService {
  constructor(
    private readonly cardRepo: ICardRepository,
    private readonly clock: IClock,
    private readonly idGenerator: IIdGenerator,
    private readonly transactionManager: ITransactionManager,
    private readonly eventBus: IEventBus,
    private readonly searchService: SearchService
  ) {}

  async importRawText(rawText: string, delimiter: string = '\t', signal?: AbortSignal): Promise<number> {
    if (signal?.aborted) throw new Error('Import aborted initially.');

    const rawDTOs = await this.runWorkerParsing(rawText, delimiter);
    if (signal?.aborted) throw new Error('Import aborted post-parsing.');
    if (rawDTOs.length === 0) return 0;

    const validDTOs: ParsedCardDTO[] = [];
    for (const dto of rawDTOs) {
      const parseResult = ParsedCardSchema.safeParse(dto);
      if (parseResult.success) {
        validDTOs.push(parseResult.data as ParsedCardDTO);
      }
    }

    if (validDTOs.length === 0) return 0;

    const now = this.clock.now();
    let insertedCount = 0;

    await this.transactionManager.runInTransaction(async () => {
      const incomingForms = validDTOs.map(dto => dto.canonicalForm);
      const existingCards = await this.cardRepo.getByCanonicalForms(incomingForms);
      const existingFormsSet = new Set(existingCards.map(c => c.canonicalForm));

      const novelDTOs = validDTOs.filter(dto => !existingFormsSet.has(dto.canonicalForm));
      if (novelDTOs.length === 0) return;

      const newCards: Card[] = novelDTOs.map(dto => Object.freeze({
        id: this.idGenerator.generate(),
        canonicalForm: dto.canonicalForm,
        target: dto.target,
        type: 'word',
        ipa: dto.ipa,
        englishMeaning: dto.englishMeaning,
        persianMeaning: dto.persianMeaning,
        status: 'learning',
        difficulty: 50,
        recallStrength: 0,
        intervalDays: 0,
        nextReviewAt: now,
        consecutiveSuccesses: 0,
        consecutiveFailures: 0,
        createdAt: now,
        updatedAt: now,
      }));

      for (let i = 0; i < newCards.length; i += APP_CONFIG.IMPORT.CHUNK_SIZE) {
        if (signal?.aborted) throw new Error('Import aborted during DB write.');
        const chunk = newCards.slice(i, i + APP_CONFIG.IMPORT.CHUNK_SIZE);
        await this.cardRepo.bulkUpsert(chunk);
      }
      
      insertedCount = newCards.length;
    });

    if (signal?.aborted || insertedCount === 0) return insertedCount;

    try {
      await this.searchService.reindexAll();
    } catch (err) {
      ErrorReporter.report('ImportService: Search Reindex Failed', err);
    }

    await this.eventBus.publish({
      type: 'IMPORT_COMPLETED',
      payload: Object.freeze({
        timestamp: now,
        totalCardsImported: insertedCount,
      })
    });

    return insertedCount;
  }

  private runWorkerParsing(rawText: string, delimiter: string): Promise<readonly ParsedCardDTO[]> {
    return new Promise((resolve, reject) => {
      if (typeof window === 'undefined') {
        return reject(new Error('Web Workers are not available in SSR.'));
      }

      const worker = new Worker(new URL('../../workers/import.worker.ts', import.meta.url), { type: 'module' });

      worker.onmessage = (event: MessageEvent<ImportResponseMessage>) => {
        const { data } = event;
        worker.terminate();
        if (data.type === 'PARSE_SUCCESS') resolve(data.data);
        else reject(new Error(data.error));
      };

      worker.onerror = (error) => {
        worker.terminate();
        reject(new Error(`Worker instantiation failed: ${error.message}`));
      };

      worker.postMessage({ type: 'PARSE_RAW_DATA', rawText, delimiter });
    });
  }
}