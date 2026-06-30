export interface ITransactionManager {
  /**
   * Executes multiple repository operations within a single ACID transaction.
   * Rollbacks automatically if any operation throws an Error.
   */
  readonly runInTransaction: <T>(operation: () => Promise<T>) => Promise<T>;
}
