export class CanonicalEngine {
  /**
   * GUARANTEE: Deterministic across all environments.
   * No locale dependency, no Date, no randomness.
   * Safely normalizes Unicode (NFKC) and trims inputs.
   */
  static generateCanonicalForm(target: string): string {
    return target
      // 1. Standardize Unicode characters
      .normalize('NFKC')
      // 2. Strict lowercase mapping
      .toLowerCase()
      // 3. Remove leading and trailing quotes
      .replace(/^["']|["']$/g, '')
      // 4. Strip standard punctuation, keep hyphens inside words
      .replace(/[.,/#!$%^&*;:{}=_`~()]/g, '')
      // 5. Replace multiple internal spaces with a single space and trim edges
      .replace(/\s{2,}/g, ' ')
      .trim();
  }
}
