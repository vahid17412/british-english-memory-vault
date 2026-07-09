export class DuplicateCardError extends Error {
  constructor(message: string = 'A card with this canonical form already exists.') {
    super(message);
    this.name = 'DuplicateCardError';
  }
}

export class CardNotFoundError extends Error {
  constructor(id: string) {
    super(`Card with ID ${id} not found.`);
    this.name = 'CardNotFoundError';
  }
}
