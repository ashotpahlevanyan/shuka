import { ISODate, Money } from '../../shared';
import { CategoryId } from '../catalog/contract';
import { ProducerId, SkuId } from '../pool/contract';
import { Destination } from '../compliance/contract';
export type RequirementId = `req_${string}`;
export type OfferId = `off_${string}`;
export type OrderId = `ord_${string}`;
export interface RequirementLine { id: string; categoryId: CategoryId; quantity: number; unit: string; window?: string; }
export interface Requirement {
  id: RequirementId; source: 'marketplace' | 'tender' | 'fair'; buyerRef?: string;
  destination: Destination; lines: RequirementLine[];
  status: 'open' | 'matching' | 'quoting' | 'awarded' | 'closed'; deadline?: ISODate; createdAt: ISODate;
}
export interface Offer {
  id: OfferId; requirementLineId: string; producerId: ProducerId; skuId: SkuId;
  price: Money; quantityAvailable: number; leadTimeWeeks: number; status: 'submitted' | 'approved' | 'rejected' | 'withdrawn';
}
export interface OrderLine { offerRef: OfferId; producerId: ProducerId; skuId: SkuId; quantity: number; landedUnitCost: Money; }
export interface Order {
  id: OrderId; requirementId: RequirementId; buyerRef: string; lines: OrderLine[];
  status: 'draft' | 'funded' | 'in_fulfilment' | 'delivered' | 'settled' | 'disputed';
  totals: { goods: Money; duty: Money; freight: Money }; createdAt: ISODate;
}
export interface DemandContract {
  createRequirement(input: Pick<Requirement, 'source' | 'buyerRef' | 'destination' | 'lines' | 'deadline'>): Promise<Requirement>;
  getRequirement(id: RequirementId): Promise<Requirement>;
  submitOffer(input: Omit<Offer, 'id' | 'status'>): Promise<Offer>;
  approveOffers(requirementId: RequirementId, offerIds: OfferId[]): Promise<Order>;
  getOrder(id: OrderId): Promise<Order>;
}
export const DemandEvents = { RequirementCreated: 'requirement.created', OrderApproved: 'order.approved' } as const;
