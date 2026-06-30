# British English Memory Vault

A local-first, offline-first Progressive Web Application (PWA) designed as a long-term memory system for British English.

## Installation
`npm install`

## Scripts
- `npm run dev`: Start development server
- `npm run build`: Production build
- `npm run test`: Run Vitest
- `npm run typecheck`: Strict TypeScript validation

## Project Structure
- `src/domain/`: Business logic & pure domain rules.
- `src/services/`: Application orchestration.
- `src/repositories/`: Persistence abstraction.
- `src/database/`: Persistence implementation (Dexie).
- `src/infrastructure/`: Low-level adapters.
- `src/features/`: Feature-sliced UI components.

## Architecture Overview
Layered Architecture (UI → Application → Domain → Repository → Database). 
Dependencies strictly flow downwards.
