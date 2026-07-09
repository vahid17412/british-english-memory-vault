import { ImportRequestMessage, ImportResponseMessage, ParsedCardDTO } from '@/infrastructure/import/ImportWorkerTypes';
import { CanonicalEngine } from '@/domain/canonical/CanonicalEngine';

self.onmessage = (event: MessageEvent<ImportRequestMessage>) => {
  const { data } = event;

  if (data.type === 'PARSE_RAW_DATA') {
    try {
      const uniqueCards = new Map<string, ParsedCardDTO>();
      let startIndex = 0;

      // Memory-efficient string traversal (No huge arrays created from split)
      while (startIndex < data.rawText.length) {
        let endIndex = data.rawText.indexOf('\n', startIndex);
        if (endIndex === -1) endIndex = data.rawText.length;
        
        const line = data.rawText.substring(startIndex, endIndex).trim();
        startIndex = endIndex + 1; // Move past the newline character

        if (!line) continue;

        const columns = line.split(data.delimiter);
        if (columns.length < 2) continue;

        const target = columns[0].trim();
        const englishMeaning = columns[1].trim();

        if (!target || !englishMeaning) continue;

        const canonicalForm = CanonicalEngine.generate(target);

        // In-worker deduplication
        if (!uniqueCards.has(canonicalForm)) {
          uniqueCards.set(canonicalForm, {
            target,
            canonicalForm,
            englishMeaning,
            persianMeaning: columns.length > 2 && columns[2].trim() ? columns[2].trim() : undefined,
            ipa: columns.length > 3 && columns[3].trim() ? columns[3].trim() : undefined,
          });
        }
      }

      const response: ImportResponseMessage = {
        type: 'PARSE_SUCCESS',
        data: Object.freeze(Array.from(uniqueCards.values()))
      };
      self.postMessage(response);

    } catch (error) {
      const response: ImportResponseMessage = {
        type: 'PARSE_ERROR',
        error: error instanceof Error ? error.message : 'Unknown parsing error in Worker.'
      };
      self.postMessage(response);
    }
  }
};
