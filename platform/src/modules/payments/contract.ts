import { Money } from '../../shared';
import { OrderId } from '../demand/contract';
import { ProducerId } from '../pool/contract';
export type EscrowId = `esc_${string}`;
export interface EscrowSplit { producerId: ProducerId; amount: Money; released: boolean; }
export interface Escrow {
  id: EscrowId; orderId: OrderId; total: Money;
  state: 'pending' | 'held' | 'released' | 'refunded' | 'disputed';
  providerRef: string; splits: EscrowSplit[];
}
export interface PaymentsContract {
  fundEscrow(orderId: OrderId): Promise<Escrow>;
  releaseEscrow(orderId: OrderId, producerIds: ProducerId[]): Promise<Escrow>;
  getEscrow(orderId: OrderId): Promise<Escrow>;
}
export const PaymentsEvents = { Funded: 'escrow.funded', Released: 'escrow.released' } as const;
