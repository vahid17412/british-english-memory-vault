import { AppEvent } from './types';
import { IEventBus } from './IEventBus';
import { ErrorReporter } from '@/shared/utils/ErrorReporter';

export class EventBus implements IEventBus {
  private readonly listeners = new Map<string, Set<(event: any) => void | Promise<void>>>();

  subscribe<T extends AppEvent>(eventType: T['type'], handler: (event: T) => void | Promise<void>): () => void {
    if (!this.listeners.has(eventType)) {
      this.listeners.set(eventType, new Set());
    }
    this.listeners.get(eventType)!.add(handler);

    // Return true unsubscribe function to prevent memory leaks
    return () => {
      const eventListeners = this.listeners.get(eventType);
      if (eventListeners) {
        eventListeners.delete(handler);
        if (eventListeners.size === 0) {
          this.listeners.delete(eventType);
        }
      }
    };
  }

  async publish(event: AppEvent): Promise<void> {
    const frozenEvent = this.deepFreeze(event);
    const handlers = this.listeners.get(frozenEvent.type);
    
    if (!handlers || handlers.size === 0) return;

    // Isolate handlers so one failure doesn't stop others
    await Promise.allSettled(
      Array.from(handlers).map(async (handler) => {
        try {
          await handler(frozenEvent);
        } catch (error) {
          ErrorReporter.report(`EventBus Handler Error [${frozenEvent.type}]`, error);
        }
      })
    );
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