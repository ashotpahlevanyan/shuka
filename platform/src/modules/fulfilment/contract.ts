import { ISODate } from '../../shared';
import { OrderId } from '../demand/contract';
export type ShipmentId = `shp_${string}`;
export type Stage = 'confirmed' | 'at_hub' | 'qc' | 'loaded' | 'export_cleared' | 'in_transit' | 'import_cleared' | 'out_for_delivery' | 'delivered';
export interface Shipment {
  id: ShipmentId; orderId: OrderId; route: { origin: string; destination: string };
  stage: Stage; milestones: { stage: Stage; at: ISODate; location: string }[];
  etaAt: ISODate; container: { fillVolumePct: number; weightKg: number };
}
export interface FulfilmentContract {
  createShipment(orderId: OrderId, route: { origin: string; destination: string }): Promise<Shipment>;
  getShipment(id: ShipmentId): Promise<Shipment>;
  advance(id: ShipmentId, stage: Stage, location: string): Promise<Shipment>;
}
export const FulfilmentEvents = { Advanced: 'shipment.advanced', Delivered: 'shipment.delivered' } as const;
