export type ReleaseLockFn = () => void;

export interface IStatsLockManager {
  /**
   * Acquires a lock for a specific key (e.g., dateId) to prevent race conditions during async operations.
   */
  readonly acquire: (key: string) => Promise<ReleaseLockFn>;
}
