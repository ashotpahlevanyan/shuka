import { EventBus, InMemoryEventBus } from '../shared';
import { IdentityService } from '../modules/identity/service';
import { PoolService } from '../modules/pool/service';
import { CatalogService } from '../modules/catalog/service';
import { ComplianceService } from '../modules/compliance/service';
import { DemandService } from '../modules/demand/service';
import { FulfilmentService } from '../modules/fulfilment/service';
import { PaymentsService } from '../modules/payments/service';
import { DocumentsService } from '../modules/documents/service';
import { IdentityContract } from '../modules/identity/contract';
import { PoolContract } from '../modules/pool/contract';
import { CatalogContract } from '../modules/catalog/contract';
import { ComplianceContract } from '../modules/compliance/contract';
import { DemandContract } from '../modules/demand/contract';
import { FulfilmentContract } from '../modules/fulfilment/contract';
import { PaymentsContract } from '../modules/payments/contract';
import { DocumentsContract } from '../modules/documents/contract';

/** The platform surface — edge services receive these contract interfaces only. */
export interface Platform {
  events: EventBus;
  identity: IdentityContract; pool: PoolContract; catalog: CatalogContract; compliance: ComplianceContract;
  demand: DemandContract; fulfilment: FulfilmentContract; payments: PaymentsContract; documents: DocumentsContract;
}

/** Composition root — the ONLY place that sees concrete implementations and wires dependencies. */
export function buildPlatform(): Platform {
  const events = new InMemoryEventBus();
  const identity = new IdentityService();
  const pool = new PoolService(events);
  const catalog = new CatalogService(events);
  const compliance = new ComplianceService(catalog, events);      // depends on Catalog contract
  const documents = new DocumentsService();
  const demand = new DemandService({ compliance, catalog, pool, events });
  const fulfilment = new FulfilmentService(events);
  const payments = new PaymentsService({ demand, events });

  // Loose coupling via events (edge services / cross-cutting react here)
  for (const t of ['order.approved', 'escrow.funded', 'escrow.released', 'shipment.delivered'])
    events.on(t, e => console.log('   ↳ event:', e.type, JSON.stringify(e.payload)));

  return { events, identity, pool, catalog, compliance, demand, fulfilment, payments, documents };
}
