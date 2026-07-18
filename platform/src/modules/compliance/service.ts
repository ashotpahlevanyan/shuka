import { EventBus, event, now } from '../../shared';
import { ComplianceContract, ComplianceEvents, ComplianceRecord, Destination } from './contract';
import { CatalogContract } from '../catalog/contract';
import { SkuId } from '../pool/contract';
export class ComplianceService implements ComplianceContract {
  // Depends on Catalog ONLY through its contract interface — never its store.
  constructor(private catalog: CatalogContract, private events: EventBus) {}
  async check(skuId: SkuId, destination: Destination): Promise<ComplianceRecord> {
    const product = await this.catalog.getProduct(skuId);
    const category = await this.catalog.getCategory(product.categoryId);
    let record: ComplianceRecord;
    if (category.animalOrigin && destination === 'EU') {
      record = { skuId, destination, verdict: 'blocked', checkedAt: now(),
        requirements: [{ severity: 'block', label: 'Approved establishment required',
          detail: 'Animal-origin goods need an EU-approved establishment listing (Armenia not listed).' }] };
    } else {
      record = { skuId, destination, verdict: 'eligible', checkedAt: now(),
        requirements: [{ severity: 'todo', label: `${destination} label + origin cert`, detail: 'Standard import paperwork.' }] };
    }
    this.events.emit(event(ComplianceEvents.Checked, { skuId, destination, verdict: record.verdict }));
    return record;
  }
}
