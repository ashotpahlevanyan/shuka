import { EventBus, NotFound, event, newId, now } from '../../shared';
import { Capacity, PoolContract, PoolEvents, Producer, ProducerId, SkuId } from './contract';
export class PoolService implements PoolContract {
  private producers = new Map<ProducerId, Producer>();
  private capacity: Capacity[] = [];
  constructor(private events: EventBus) {}
  async getProducer(id: ProducerId) { const p = this.producers.get(id); if (!p) throw new NotFound('producer'); return p; }
  async listProducers(f?: { region?: string; status?: Producer['status'] }) {
    return [...this.producers.values()].filter(p => (!f?.region || p.region === f.region) && (!f?.status || p.status === f.status));
  }
  async onboardProducer(input: Omit<Producer, 'id' | 'createdAt' | 'status'>) {
    const p: Producer = { ...input, id: newId('prd'), status: 'onboarding', createdAt: now() };
    this.producers.set(p.id, p);
    this.events.emit(event(PoolEvents.Onboarded, { producerId: p.id }));
    return p;
  }
  async getCapacity(producerId: ProducerId, period: string) { return this.capacity.filter(c => c.producerId === producerId && c.period === period); }
  async commitCapacity(producerId: ProducerId, skuId: SkuId, period: string, qty: number) {
    let c = this.capacity.find(x => x.producerId === producerId && x.skuId === skuId && x.period === period);
    if (!c) { c = { producerId, skuId, period, available: qty, committed: 0, unit: 'unit' }; this.capacity.push(c); }
    c.committed += qty; return c;
  }
}
