import { CardRepositoryDexie } from '@/repositories/implementations/CardRepositoryDexie';
import { ReviewRepositoryDexie } from '@/repositories/implementations/ReviewRepositoryDexie';
import { DexieTransactionManager } from '@/infrastructure/database/DexieTransactionManager';
import { QueueBuilder } from '@/services/QueueBuilder';
import { ReviewService } from '@/services/ReviewService';
import { SearchService } from '@/services/SearchService';
import { BackupRestoreService } from '@/services/backup/BackupRestoreService';
import { AnkiExportService } from '@/services/export/AnkiExportService';
import { Scheduler } from '@/domain/srs/Scheduler';
import { eventBus } from '@/events/EventBus';
import { IClock } from '@/shared/interfaces/IClock';
import { IIdGenerator } from '@/shared/interfaces/IIdGenerator';
import { FlexSearchClient } from '@/infrastructure/search/FlexSearchClient';

export const clock: IClock = Object.freeze({
  now: () => Date.now(),
  dateId: (timestamp: number) => {
    const d = new Date(timestamp);
    return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
  }
});

const idGenerator: IIdGenerator = Object.freeze({
  generate: () => crypto.randomUUID()
});

const transactionManager = new DexieTransactionManager();

// Singletons
export const cardRepo = new CardRepositoryDexie();
export const reviewRepo = new ReviewRepositoryDexie();

const scheduler = new Scheduler(clock);

// Search Infrastructure
const searchEngine = new FlexSearchClient(idGenerator);
export const searchService = new SearchService(searchEngine, cardRepo);

// Application Services
export const queueBuilder = new QueueBuilder(cardRepo, reviewRepo, clock);

export const reviewService = new ReviewService(
  cardRepo,
  reviewRepo,
  scheduler,
  clock,
  idGenerator,
  transactionManager,
  eventBus
);

export const ankiExportService = new AnkiExportService(cardRepo);

export const backupRestoreService = new BackupRestoreService(
  cardRepo,
  reviewRepo,
  clock,
  transactionManager,
  eventBus,
  searchService
);
