import { newId } from '../../shared';
import { Document, DocType, DocumentsContract } from './contract';
export class DocumentsService implements DocumentsContract {
  private docs: Document[] = [];
  async list(ownerRef: string, type?: DocType) { return this.docs.filter(d => d.ownerRef === ownerRef && (!type || d.type === type)); }
  async assembleBidPackage(tenderRef: string, _orderDraftRef: string): Promise<Document> {
    // TODO: real generator (Claude-powered) pulls dossiers, capacity letters, pricing into one package.
    const doc: Document = { id: newId('doc'), ownerRef: tenderRef, type: 'compliance_dossier', status: 'auto' };
    this.docs.push(doc); return doc;
  }
}
