import { ISearchEngine } from '@/shared/interfaces/ISearchEngine';
import { ICardRepository } from '@/repositories/contracts/ICardRepository';
import { Card } from '@/domain/models/Card';

export class SearchService {
  constructor(
    private readonly searchEngine: ISearchEngine,
    private readonly cardRepo: ICardRepository
  ) {}

  async searchCards(query: string, limit = 20): Promise<readonly Card[]> {
    if (!query || query.trim().length === 0) return Object.freeze([]);
    
    try {
      const matchedIds = await this.searchEngine.search(query, limit);
      if (matchedIds.length === 0) return Object.freeze([]);

      const cards = await Promise.all(matchedIds.map(id => this.cardRepo.getById(id)));
      return Object.freeze(cards.filter((c): c is Card => Boolean(c)));
    } catch (error) {
      throw new Error('Search Worker failed to execute query.');
    }
  }

  async reindexAll(): Promise<void> {
    try {
      const allCards = await this.cardRepo.getAll();
      const searchDocs = allCards.map(c => ({ id: c.id, canonicalForm: c.canonicalForm, englishMeaning: c.englishMeaning }));
      await (this.searchEngine as any).indexAll(searchDocs); 
    } catch (error) {
      throw new Error('Failed to reindex search engine.');
    }
  }

  async indexCard(card: Card): Promise<void> {
    try {
      await (this.searchEngine as any).executeWorkerAction({
        type: 'INDEX_CARD',
        payload: { id: card.id, canonicalForm: card.canonicalForm, englishMeaning: card.englishMeaning }
      });
    } catch (error) {
      throw new Error('Failed to index single card.');
    }
  }

  async updateCardIndex(card: Card): Promise<void> {
    try {
      await (this.searchEngine as any).executeWorkerAction({
        type: 'UPDATE_CARD',
        payload: { id: card.id, canonicalForm: card.canonicalForm, englishMeaning: card.englishMeaning }
      });
    } catch (error) {
      throw new Error('Failed to update card index.');
    }
  }

  async removeCardIndex(id: string): Promise<void> {
    try {
      await (this.searchEngine as any).executeWorkerAction({ type: 'REMOVE_CARD', id });
    } catch (error) {
      throw new Error('Failed to remove card from index.');
    }
  }
}