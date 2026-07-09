import { AppDatabase } from '@/database/schema/AppDatabase';
import { CardRepositoryDexie } from '@/repositories/implementations/CardRepositoryDexie';
import { ReviewRepositoryDexie } from '@/repositories/implementations/ReviewRepositoryDexie';
import { StatisticsRepositoryDexie } from '@/repositories/implementations/StatisticsRepositoryDexie';
import { SettingsRepositoryLocalStorage } from '@/repositories/implementations/SettingsRepositoryLocalStorage';
import { DexieTransactionManager } from '@/infrastructure/database/DexieTransactionManager';
import { EventBus } from '@/events/EventBus';
import { Scheduler } from '@/domain/srs/Scheduler';
import { ReviewService } from '@/services/ReviewService';
import { QueueBuilder } from '@/services/QueueBuilder';
import { SearchService } from '@/services/SearchService';
import { ImportService } from '@/services/import/ImportService';
import { BackupRestoreService } from '@/services/backup/BackupRestoreService';
import { AnkiExportService } from '@/services/export/AnkiExportService';
import { SettingsService } from '@/services/settings/SettingsService';
import { DashboardService } from '@/services/dashboard/DashboardService';
import { FlexSearchClient } from '@/infrastructure/search/FlexSearchClient';
import { CardEditorService } from '@/services/editor/CardEditorService';

// Shared Utils & Interfaces
export const clock = {
  now: () => Date.now(),
  dateId: (timestamp: number) => {
    const d = new Date(timestamp);
    return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
  }
};

export const idGenerator = {
  generate: () => typeof crypto !== 'undefined' && 'randomUUID' in crypto 
    ? crypto.randomUUID() 
    : `id-${Date.now().toString(36)}-${Math.random().toString(36).substring(2, 9)}`
};

// Core Infrastructure
export const db = new AppDatabase();
export const transactionManager = new DexieTransactionManager();
export const eventBus = new EventBus();
export const searchEngine = new FlexSearchClient(idGenerator);

// Repositories
export const cardRepo = new CardRepositoryDexie();
export const reviewRepo = new ReviewRepositoryDexie();
export const statsRepo = new StatisticsRepositoryDexie();
export const settingsRepo = new SettingsRepositoryLocalStorage();

// Domain & Services
export const scheduler = new Scheduler(clock);
export const queueBuilder = new QueueBuilder(cardRepo, reviewRepo, clock);
export const ankiExportService = new AnkiExportService(cardRepo);

export const searchService = new SearchService(searchEngine, cardRepo);

export const reviewService = new ReviewService(
  cardRepo,
  reviewRepo,
  scheduler,
  clock,
  idGenerator,
  transactionManager,
  eventBus
);

export const backupRestoreService = new BackupRestoreService(
  cardRepo,
  reviewRepo,
  clock,
  transactionManager,
  eventBus,
  searchService
);

export const settingsService = new SettingsService(
  settingsRepo,
  backupRestoreService,
  ankiExportService
);

export const dashboardService = new DashboardService(
  queueBuilder,
  statsRepo,
  settingsService,
  clock
);

export const importService = new ImportService(
  cardRepo,
  clock,
  idGenerator,
  transactionManager,
  eventBus,
  searchService
);

export const cardEditorService = new CardEditorService(
  cardRepo,
  clock,
  idGenerator,
  transactionManager,
  searchService
);
