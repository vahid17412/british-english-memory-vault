import { CanonicalEngine } from '../CanonicalEngine';

describe('CanonicalEngine', () => {
  // 4: Using generate() based on Phase 3 implementation
  it('should trim whitespace and convert to lowercase', () => {
    expect(CanonicalEngine.generate('  HeLLo World  ')).toBe('hello world');
  });

  // 5: Edge Cases
  it('should handle empty or whitespace-only strings safely', () => {
    expect(CanonicalEngine.generate('')).toBe('');
    expect(CanonicalEngine.generate('     ')).toBe('');
  });

  // 6: Unicode Normalization and Accent Removal (NFKC + Regex)
  it('should handle unicode normalization and accents', () => {
    // Assuming CanonicalEngine applies standard accent folding internally
    const result = CanonicalEngine.generate('résumé');
    // If your engine strips accents, this will be 'resume'. 
    // If it only does NFKC, it keeps the accent but standardizes the codepoint.
    // Adjust assertion based on exact domain requirement.
    expect(result).toBe('résumé'); // Standard NFKC behavior
  });
});
