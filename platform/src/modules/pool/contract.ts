import { ISODate } from '../../shared';
import { OrgId } from '../identity/contract';
export type ProducerId = `prd_${string}`;
export type SkuId = `sku_${string}`;
export interface Producer {
  id: ProducerId; orgId: OrgId; name: string; region: string;
  kind: 'grower' | 'winemaker' | 'food' | 'artisan';
  status: 'prospect' | 'onboarding' | 'active' | 'suspended';
  certifications: string[]; createdAt: ISODate;
}
export interface Capacity { producerId: ProducerId; skuId: SkuId; period: string; available: number; committed: number; unit: string; }
export interface PoolContract {
  getProducer(id: ProducerId): Promise<Producer>;
  listProducers(filter?: { region?: string; status?: Producer['status'] }): Promise<Producer[]>;
  onboardProducer(input: Omit<Producer, 'id' | 'createdAt' | 'status'>): Promise<Producer>;
  getCapacity(producerId: ProducerId, period: string): Promise<Capacity[]>;
  commitCapacity(producerId: ProducerId, skuId: SkuId, period: string, qty: number): Promise<Capacity>;
}
export const PoolEvents = { Onboarded: 'producer.onboarded' } as const;
