// EDGE service example: the Tender/Bid product composes CORE contracts only.
// It never imports a core *service* — only the contract interfaces. This is why
// it can later be extracted (or sold) as a standalone product with no rewrite.
import { DemandContract } from '../modules/demand/contract';
import { ComplianceContract, Destination } from '../modules/compliance/contract';
import { DocumentsContract } from '../modules/documents/contract';
import { PoolContract } from '../modules/pool/contract';
import { CategoryId } from '../modules/catalog/contract';
import { SkuId } from '../modules/pool/contract';

export interface TenderInput {
  authority: string; sourceUrl: string; destination: Destination;
  lines: { id: string; categoryId: CategoryId; quantity: number; unit: string }[];
  candidateSkus: SkuId[];
}
export interface BidDraft { requirementId: string; readiness: 'draftable' | 'blocked'; blockedSkus: SkuId[]; packageId: string; }

export async function draftTenderApplication(
  deps: { demand: DemandContract; compliance: ComplianceContract; documents: DocumentsContract; pool: PoolContract },
  input: TenderInput
): Promise<BidDraft> {
  const req = await deps.demand.createRequirement({ source: 'tender', destination: input.destination, lines: input.lines });
  const checks = await Promise.all(input.candidateSkus.map(s => deps.compliance.check(s, input.destination)));
  const blockedSkus = checks.filter(c => c.verdict === 'blocked').map(c => c.skuId);
  const pkg = await deps.documents.assembleBidPackage(req.id, 'draft');
  // Gate: never draftable if any category is compliance-blocked.
  return { requirementId: req.id, readiness: blockedSkus.length ? 'blocked' : 'draftable', blockedSkus, packageId: pkg.id };
}
