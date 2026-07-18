import { ISODate } from '../../shared';
import { ProducerId, SkuId } from '../pool/contract';
export type CategoryId = `cat_${string}`;
export interface Category { id: CategoryId; name: string; animalOrigin: boolean; }
export interface Product {
  id: SkuId; producerId: ProducerId; categoryId: CategoryId; name: string; unit: string;
  attrs: { organic?: boolean; allergens?: string[] };
  footprint: { volumeM3: number; weightKg: number };  // per unit, for consolidation
  availability: { fromMonth: number; toMonth: number };
  status: 'draft' | 'listed' | 'delisted'; createdAt: ISODate;
}
export interface CatalogContract {
  getProduct(id: SkuId): Promise<Product>;
  listProducts(filter?: { categoryId?: CategoryId; producerId?: ProducerId }): Promise<Product[]>;
  addProduct(input: Omit<Product, 'id' | 'createdAt' | 'status'>): Promise<Product>;
  getCategory(id: CategoryId): Promise<Category>;
  listCategories(): Promise<Category[]>;
}
export const CatalogEvents = { Listed: 'product.listed' } as const;
