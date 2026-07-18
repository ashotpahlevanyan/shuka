import { EventBus, NotFound, event, newId, now } from '../../shared';
import { FulfilmentContract, FulfilmentEvents, Shipment, ShipmentId, Stage } from './contract';
import { OrderId } from '../demand/contract';
export class FulfilmentService implements FulfilmentContract {
  private shipments = new Map<ShipmentId, Shipment>();
  constructor(private events: EventBus) {}
  async createShipment(orderId: OrderId, route: { origin: string; destination: string }): Promise<Shipment> {
    // TODO: run consolidation / bin-packing across the order's lines.
    const s: Shipment = { id: newId('shp'), orderId, route, stage: 'confirmed',
      milestones: [{ stage: 'confirmed', at: now(), location: route.origin }],
      etaAt: now(), container: { fillVolumePct: 0, weightKg: 0 } };
    this.shipments.set(s.id, s);
    return s;
  }
  async getShipment(id: ShipmentId) { const s = this.shipments.get(id); if (!s) throw new NotFound('shipment'); return s; }
  async advance(id: ShipmentId, stage: Stage, location: string): Promise<Shipment> {
    const s = await this.getShipment(id);
    s.stage = stage; s.milestones.push({ stage, at: now(), location });
    this.events.emit(event(FulfilmentEvents.Advanced, { shipmentId: id, stage }));
    if (stage === 'delivered') this.events.emit(event(FulfilmentEvents.Delivered, { shipmentId: id, orderId: s.orderId }));
    return s;
  }
}
