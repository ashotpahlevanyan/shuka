import { now } from '../../shared';
import { IdentityContract, User, UserId, OrgId } from './contract';
export class IdentityService implements IdentityContract {
  async authenticate(_token: string): Promise<User> {
    // TODO: verify JWT / session. Stub returns a demo ops user.
    return { id: 'usr_demo' as UserId, email: 'ops@getshuka.com', orgId: 'org_shuka' as OrgId, roles: ['ops'], createdAt: now() };
  }
  async authorize(): Promise<boolean> { return true; } // TODO: real RBAC
}
