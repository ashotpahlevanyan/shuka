import { ISODate } from '../../shared';
export type OrgId = `org_${string}`;
export type UserId = `usr_${string}`;
export type Role = 'producer' | 'buyer' | 'ops' | 'gov_partner' | 'investor' | 'admin';
export interface Org { id: OrgId; name: string; kind: 'producer' | 'buyer' | 'authority' | 'internal'; country: string; }
export interface User { id: UserId; email: string; orgId: OrgId; roles: Role[]; createdAt: ISODate; }

/** Public contract. Other modules import ONLY this file from identity/. */
export interface IdentityContract {
  authenticate(token: string): Promise<User>;
  authorize(userId: UserId, action: string, resourceRef: string): Promise<boolean>;
}
