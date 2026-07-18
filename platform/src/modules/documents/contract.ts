import { ISODate } from '../../shared';
export type DocumentId = `doc_${string}`;
export type DocType = 'profile' | 'haccp' | 'organic' | 'origin' | 'compliance_dossier' | 'capacity_letter' | 'pricing' | 'reference' | 'bid_bond';
export interface Document { id: DocumentId; ownerRef: string; type: DocType; status: 'on_file' | 'auto' | 'per_producer' | 'to_prepare'; url?: string; validUntil?: ISODate; }
export interface DocumentsContract {
  list(ownerRef: string, type?: DocType): Promise<Document[]>;
  /** Assemble a tender application package from repository + order draft. */
  assembleBidPackage(tenderRef: string, orderDraftRef: string): Promise<Document>;
}
