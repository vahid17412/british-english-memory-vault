import { AppEvent } from './types';

export interface IEventBus {
  readonly subscribe: <T extends AppEvent>(
    eventType: T['type'], 
    handler: (event: T) => void | Promise<void>
  ) => void;
  
  readonly publish: (event: AppEvent) => void;
}
