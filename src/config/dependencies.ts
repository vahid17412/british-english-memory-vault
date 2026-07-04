import { CardRepositoryDexie } from '@/repositories/implementations/CardRepositoryDexie';
import { ReviewRepositoryDexie } from '@/repositories/implementations/ReviewRepositoryDexie';
import { QueueBuilder } from '@/services/QueueBuilder';
import { ReviewService } from '@/services/ReviewService';
import { Scheduler } from '@/domain/srs/Scheduler';
import { eventBus } from '@/events/EventBus'; // Assuming EventBus instance is exported from phase 4.1
import { IClock } from '@/shared/interfaces/IClock';
import { IIdGenerator } from '@/shared/interfaces/IIdGenerator';
import { ITransactionManager } from '@/shared/interfaces/ITransactionManager';

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

const transactionManager: ITransactionManager = Object.freeze({
  runInTransaction: async <T>(operation: () => Promise<T>): Promise<T> => {
    return await operation();
  }
});

// Singletons
export const cardRepo = new CardRepositoryDexie();
export const reviewRepo = new ReviewRepositoryDexie();

// Domain Services
const scheduler = new Scheduler(clock);

// Application Services
export const queueBuilder = new QueueBuilder(cardRepo, clock);

export const reviewService = new ReviewService(
  cardRepo,
  reviewRepo,
  scheduler,
  clock,
  idGenerator,
  transactionManager,
  eventBus
);
