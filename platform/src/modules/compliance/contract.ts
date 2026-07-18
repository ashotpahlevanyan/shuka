import { ISODate } from '../../shared';
import { SkuId } from '../pool/contract';
export type Destination = 'EU' | 'US';
export type Verdict = 'eligible' | 'needs_work' | 'blocked';
export interface Requirement { severity: 'ok' | 'todo' | 'risk' | 'block'; label: string; detail: string; }
export interface ComplianceRecord { skuId: SkuId; destination: Destination; verdict: Verdict; requirements: Requirement[]; checkedAt: ISODate; }
export interface ComplianceContract {
  /** The shared gate. Read by onboarding, demand, tenders, bid-desk, planner. */
  check(skuId: SkuId, destination: Destination): Promise<ComplianceRecord>;
}
export const ComplianceEvents = { Checked: 'compliance.checked' } as const;
