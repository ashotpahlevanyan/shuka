// Shared primitives — the ONLY cross-cutting code every module may import.
// Keep this tiny; it is not a dumping ground.

export class DomainError extends Error {
  constructor(public code: string, message: string) { super(message); this.name = 'DomainError'; }
}
export class NotFound extends DomainError { constructor(what: string) { super('not_found', `${what} not found`); } }
export class Invariant extends DomainError { constructor(message: string) { super('invariant', message); } }

export type Currency = 'EUR' | 'USD' | 'AMD';
export interface Money { amount: number; currency: Currency; } // amount in MINOR units (never floats)
export const money = (amount: number, currency: Currency): Money => ({ amount, currency });
export const zero = (currency: Currency): Money => ({ amount: 0, currency });
export function addMoney(a: Money, b: Money): Money {
  if (a.currency !== b.currency) throw new Invariant('currency mismatch');
  return { amount: a.amount + b.amount, currency: a.currency };
}

export type ISODate = string; // UTC ISO-8601
export const now = (): ISODate => new Date().toISOString();

let seq = 0;
export function newId<P extends string>(prefix: P): `${P}_${string}` {
  seq += 1;
  const rand = Math.random().toString(36).slice(2, 8);
  return `${prefix}_${Date.now().toString(36)}${seq.toString(36)}${rand}` as `${P}_${string}`;
}

export interface DomainEvent<T = unknown> { type: string; at: ISODate; payload: T; }
export type EventHandler = (e: DomainEvent) => void | Promise<void>;
export interface EventBus { emit(e: DomainEvent): void; on(type: string, h: EventHandler): void; }
export const event = <T>(type: string, payload: T): DomainEvent<T> => ({ type, at: now(), payload });
export class InMemoryEventBus implements EventBus {
  private handlers = new Map<string, EventHandler[]>();
  emit(e: DomainEvent) { for (const h of this.handlers.get(e.type) ?? []) void h(e); }
  on(type: string, h: EventHandler) { const a = this.handlers.get(type) ?? []; a.push(h); this.handlers.set(type, a); }
}
