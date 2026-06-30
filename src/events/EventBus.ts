import { AppEvent } from './types';
import { IEventBus } from './IEventBus';

/**
 * ARCHITECTURE CONTRACT:
 * - Instance-based (No Global State).
 * - Fully non-blocking publish pipeline via Microtasks.
 * - Deep Freezes payloads to prevent mutation leaks.
 * - Handlers are isolated side-effects only.
 */
export class EventBus implements IEventBus {
  private readonly listeners = new Map<string, Set<(event: any) => void | Promise<void>>>();

  subscribe<T extends AppEvent>(eventType: T['type'], handler: (event: T) => void | Promise<void>): void {
    if (!this.listeners.has(eventType)) {
      this.listeners.set(eventType, new Set());
    }
    this.listeners.get(eventType)!.add(handler);
  }

  publish(event: AppEvent): void {
    const frozenEvent = this.deepFreeze(event);
    const handlers = this.listeners.get(frozenEvent.type);
    
    if (!handlers || handlers.size === 0) return;

    // Fire-and-forget: Offload to microtask queue to prevent blocking the main Review Pipeline
    queueMicrotask(() => {
      Promise.allSettled(
        Array.from(handlers).map(handler => handler(frozenEvent))
      ).catch(error => {
        // Observability hook for critical event failures
        console.error('[EventBus] Unhandled error in event handlers:', error);
      });
    });
  }

  private deepFreeze<T>(obj: T): T {
    if (obj === null || typeof obj !== 'object') return obj;
    Object.freeze(obj);
    Object.getOwnPropertyNames(obj).forEach(prop => {
      const val = (obj as any)[prop];
      if (val !== null && (typeof val === 'object' || typeof val === 'function') && !Object.isFrozen(val)) {
        this.deepFreeze(val);
      }
    });
    return obj;
  }
}
