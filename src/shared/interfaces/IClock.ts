export interface IClock {
  readonly now: () => number;
  /**
   * GUARANTEE: Returns a timezone-safe, strictly formatted YYYY-MM-DD date ID.
   */
  readonly dateId: (timestamp: number) => string;
}
