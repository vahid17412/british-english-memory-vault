import { ICardRepository } from '@/repositories/contracts/ICardRepository';

export class AnkiExportService {
  constructor(private readonly cardRepo: ICardRepository) {}

  async generateTxtExport(): Promise<string> {
    const cards = await this.cardRepo.getAll();
    
    const lines: string[] = [];

    for (const card of cards) {
      const frontTarget = card.target.trim();
      const englishMeaning = card.englishMeaning.trim();

      // Skip cards with missing vital targets to prevent malformed imports
      if (!frontTarget || !englishMeaning) continue;

      // Sanitize front text strictly
      const front = frontTarget.replace(/[\t\n\r]/g, ' ');
      
      let backHTML = `${englishMeaning}`;
      if (card.ipa?.trim()) {
        backHTML = `[${card.ipa.trim()}]<br><br>${backHTML}`;
      }
      if (card.persianMeaning?.trim()) {
        backHTML = `${backHTML}<br><br>${card.persianMeaning.trim()}`;
      }
      
      // Sanitize back text strictly
      const cleanBack = backHTML.replace(/[\t\n\r]/g, ' ');

      // Use strict TSV format
      lines.push(`${front}\t${cleanBack}`);
    }

    // Force LF newlines for standard Unix/Ankidroid parsing
    return lines.join('\n');
  }
}
