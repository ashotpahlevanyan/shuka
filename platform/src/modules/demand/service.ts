import { EventBus, NotFound, addMoney, event, newId, now, zero } from '../../shared';
import { DemandContract, DemandEvents, Offer, OfferId, Order, OrderId, Requirement, RequirementId } from './contract';
import { ComplianceContract } from '../compliance/contract';
import { CatalogContract } from '../catalog/contract';
import { PoolContract } from '../pool/contract';

/** Demand owns the unified pipeline. Depends on other cores only via their contracts. */
export class DemandService implements DemandContract {
  private requirements = new Map<RequirementId, Requirement>();
  private offers = new Map<OfferId, Offer>();
  private orders = new Map<OrderId, Order>();
  constructor(private deps: { compliance: ComplianceContract; catalog: CatalogContract; pool: PoolContract; events: EventBus }) {}

  async createRequirement(input: Pick<Requirement, 'source' | 'buyerRef' | 'destination' | 'lines' | 'deadline'>) {
    const r: Requirement = { ...input, id: newId('req'), status: 'open', createdAt: now() };
    this.requirements.set(r.id, r);
    this.deps.events.emit(event(DemandEvents.RequirementCreated, { requirementId: r.id, source: r.source }));
    return r;
  }
  async getRequirement(id: RequirementId) { const r = this.requirements.get(id); if (!r) throw new NotFound('requirement'); return r; }

  async submitOffer(input: Omit<Offer, 'id' | 'status'>) {
    // Gate: only eligible products may be offered.
    const c = await this.deps.compliance.check(input.skuId, (await this.reqDestForLine(input.requirementLineId)));
    if (c.verdict === 'blocked') throw new NotFound('eligible product'); // reject blocked
    const o: Offer = { ...input, id: newId('off'), status: 'submitted' };
    this.offers.set(o.id, o);
    return o;
  }
  async approveOffers(requirementId: RequirementId, offerIds: OfferId[]): Promise<Order> {
    const req = await this.getRequirement(requirementId);
    let goods = zero('EUR');
    const lines = offerIds.map(id => {
      const off = this.offers.get(id); if (!off) throw new NotFound('offer');
      off.status = 'approved';
      goods = addMoney(goods, { amount: off.price.amount * off.quantityAvailable, currency: off.price.currency });
      return { offerRef: off.id, producerId: off.producerId, skuId: off.skuId, quantity: off.quantityAvailable, landedUnitCost: off.price };
    });
    const order: Order = { id: newId('ord'), requirementId, buyerRef: req.buyerRef ?? 'unknown', lines,
      status: 'draft', totals: { goods, duty: zero('EUR'), freight: zero('EUR') }, createdAt: now() };
    this.orders.set(order.id, order);
    req.status = 'awarded';
    this.deps.events.emit(event(DemandEvents.OrderApproved, { orderId: order.id, requirementId }));
    return order;
  }
  async getOrder(id: OrderId) { const o = this.orders.get(id); if (!o) throw new NotFound('order'); return o; }

  private async reqDestForLine(lineId: string) {
    for (const r of this.requirements.values()) if (r.lines.some(l => l.id === lineId)) return r.destination;
    return 'EU' as const;
  }
}
