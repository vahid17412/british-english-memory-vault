export class CanonicalEngine {
  static generate(target: string): string {
    if (!target || target.trim() === '') return '';
    
    return target
      .normalize('NFKC') // Must be applied before regex and case changes
      .toLowerCase()
      .replace(/^["']|["']$/g, '')
      .replace(/[.,/#!$%^&*;:{}=_`~()]/g, '')
      .replace(/\s{2,}/g, ' ')
      .trim();
  }
}