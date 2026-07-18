import { EventBus, NotFound, addMoney, event, newId } from '../../shared';
import { Escrow, PaymentsContract, PaymentsEvents } from './contract';
import { DemandContract, OrderId } from '../demand/contract';
import { ProducerId } from '../pool/contract';
export class PaymentsService implements PaymentsContract {
  private byOrder = new Map<OrderId, Escrow>();
  constructor(private deps: { demand: DemandContract; events: EventBus }) {}
  async fundEscrow(orderId: OrderId): Promise<Escrow> {
    const order = await this.deps.demand.getOrder(orderId);
    let total = addMoney(addMoney(order.totals.goods, order.totals.duty), order.totals.freight);
    const perProducer = new Map<ProducerId, number>();
    for (const l of order.lines) perProducer.set(l.producerId, (perProducer.get(l.producerId) ?? 0) + l.landedUnitCost.amount * l.quantity);
    const splits = [...perProducer.entries()].map(([producerId, amount]) => ({ producerId, amount: { amount, currency: total.currency }, released: false }));
    const esc: Escrow = { id: newId('esc'), orderId, total, state: 'held', providerRef: 'provider_stub', splits };
    this.byOrder.set(orderId, esc);
    this.deps.events.emit(event(PaymentsEvents.Funded, { orderId, escrowId: esc.id }));
    return esc;
  }
  async releaseEscrow(orderId: OrderId, producerIds: ProducerId[]): Promise<Escrow> {
    const esc = await this.getEscrow(orderId);
    for (const s of esc.splits) if (producerIds.includes(s.producerId)) s.released = true;
    if (esc.splits.every(s => s.released)) esc.state = 'released';
    this.deps.events.emit(event(PaymentsEvents.Released, { orderId, escrowId: esc.id }));
    return esc;
  }
  async getEscrow(orderId: OrderId) { const e = this.byOrder.get(orderId); if (!e) throw new NotFound('escrow'); return e; }
}
