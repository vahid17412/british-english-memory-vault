import '@testing-library/jest-dom';
import 'fake-indexeddb/auto';

// 1 & 3: Strict Worker Mock for Node.js 20+
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

// 2: Deterministic UUID for Predictable Tests
let uuidCounter = 0;
Object.defineProperty(globalThis, 'crypto', {
  value: {
    randomUUID: () => `test-uuid-${++uuidCounter}`,
  },
});

// 16 & 17: Global Teardown and Mock Reset
afterEach(async () => {
  jest.clearAllMocks();
  jest.restoreAllMocks();
  
  // Clean up fake-indexeddb safely
  const { indexedDB } = window;
  if (indexedDB.databases) {
    const dbs = await indexedDB.databases();
    dbs.forEach(db => {
      if (db.name) indexedDB.deleteDatabase(db.name);
    });
  }
});
