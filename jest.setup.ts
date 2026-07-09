// @ts-nocheck
import '@testing-library/jest-dom';
import 'fake-indexeddb/auto';

class WorkerMock implements Partial<Worker> {
  url: string;
  onmessage: ((this: Worker, ev: MessageEvent) => any) | null = null;
  onerror: ((this: AbstractWorker, ev: ErrorEvent) => any) | null = null;

  constructor(stringUrl: string) {
    this.url = stringUrl;
  }

  postMessage = jest.fn();
  terminate = jest.fn();
  addEventListener = jest.fn();
  removeEventListener = jest.fn();
  dispatchEvent = jest.fn();
}

Object.defineProperty(globalThis, 'Worker', {
  writable: true,
  value: WorkerMock,
});

let uuidCounter = 0;
Object.defineProperty(globalThis, 'crypto', {
  value: {
    randomUUID: () => `test-uuid-${++uuidCounter}`,
  },
});

afterEach(async () => {
  jest.clearAllMocks();
  jest.restoreAllMocks();
  
  const { indexedDB } = window;
  if (indexedDB.databases) {
    const dbs = await indexedDB.databases();
    dbs.forEach(db => {
      if (db.name) indexedDB.deleteDatabase(db.name);
    });
  }
});
