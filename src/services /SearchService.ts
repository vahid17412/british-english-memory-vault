import { ISearchEngine } from '@/shared/interfaces/ISearchEngine';
import { ICardRepository } from '@/repositories/contracts/ICardRepository';
import { Card } from '@/domain/models/Card';

export class SearchService {
  constructor(
    private readonly searchEngine: ISearchEngine,
    private readonly cardRepo: ICardRepository
  ) {}

  async searchCards(query: string, limit = 20): Promise<readonly Card[]> {
    if (!query || query.trim().length === 0) return [];
    const matchedIds = await this.searchEngine.search(query, limit);
    if (matchedIds.length === 0) return [];

    const cards = await Promise.all(matchedIds.map(id => this.cardRepo.getById(id)));
    return cards.filter((c): c is Card => Boolean(c));
  }

  async reindexAll(): Promise<void> {
    const allCards = await this.cardRepo.getAll();
    const searchDocs = allCards.map(c => ({ id: c.id, canonicalForm: c.canonicalForm, englishMeaning: c.englishMeaning }));
    // Using internal Client method for INDEX_ALL (Assumes FlexSearchClient is updated to support this)
    await (this.searchEngine as any).indexAll(searchDocs); 
  }

  async indexCard(card: Card): Promise<void> {
    await (this.searchEngine as any).executeWorkerAction({
      type: 'INDEX_CARD',
      payload: { id: card.id, canonicalForm: card.canonicalForm, englishMeaning: card.englishMeaning }
    });
  }

  async updateCardIndex(card: Card): Promise<void> {
    await (this.searchEngine as any).executeWorkerAction({
      type: 'UPDATE_CARD',
      payload: { id: card.id, canonicalForm: card.canonicalForm, englishMeaning: card.englishMeaning }
    });
  }

  async removeCardIndex(id: string): Promise<void> {
    await (this.searchEngine as any).executeWorkerAction({ type: 'REMOVE_CARD', id });
  }
}
