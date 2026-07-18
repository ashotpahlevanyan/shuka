import { EventBus, NotFound, event, newId, now } from '../../shared';
import { CatalogContract, CatalogEvents, Category, CategoryId, Product } from './contract';
import { ProducerId, SkuId } from '../pool/contract';
export class CatalogService implements CatalogContract {
  private products = new Map<SkuId, Product>();
  private categories = new Map<CategoryId, Category>();
  constructor(private events: EventBus) {
    // seed reference categories so Compliance has something to reason about
    for (const [name, animalOrigin] of [['Wine', false], ['Cheese', true]] as [string, boolean][]) {
      const c: Category = { id: newId('cat'), name, animalOrigin }; this.categories.set(c.id, c);
    }
  }
  async getProduct(id: SkuId) { const p = this.products.get(id); if (!p) throw new NotFound('product'); return p; }
  async listProducts(f?: { categoryId?: CategoryId; producerId?: ProducerId }) {
    return [...this.products.values()].filter(p => (!f?.categoryId || p.categoryId === f.categoryId) && (!f?.producerId || p.producerId === f.producerId));
  }
  async addProduct(input: Omit<Product, 'id' | 'createdAt' | 'status'>) {
    const p: Product = { ...input, id: newId('sku'), status: 'listed', createdAt: now() };
    this.products.set(p.id, p);
    this.events.emit(event(CatalogEvents.Listed, { skuId: p.id }));
    return p;
  }
  async getCategory(id: CategoryId) { const c = this.categories.get(id); if (!c) throw new NotFound('category'); return c; }
  async listCategories() { return [...this.categories.values()]; }
}
