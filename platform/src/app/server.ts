import { buildPlatform } from './container';
import { money } from '../shared';

/** Demo: walk the whole core loop — every step crosses a module boundary via its contract only. */
async function demo() {
  const p = buildPlatform();
  console.log('Shuka platform (modular monolith) — demo run\n');

  const producer = await p.pool.onboardProducer({ orgId: 'org_areni' as any, name: 'Areni Cellars', region: 'Vayots Dzor', kind: 'winemaker', certifications: [] });
  console.log('1. onboarded producer:', producer.name, `(${producer.id})`);

  const [wine] = await p.catalog.listCategories();
  const sku = await p.catalog.addProduct({ producerId: producer.id, categoryId: wine.id, name: 'Areni Red', unit: 'case', attrs: {}, footprint: { volumeM3: 0.02, weightKg: 16 }, availability: { fromMonth: 1, toMonth: 12 } });
  console.log('2. listed product:', sku.name, `(${sku.id})`);

  console.log('3. compliance EU:', (await p.compliance.check(sku.id, 'EU')).verdict);

  const req = await p.demand.createRequirement({ source: 'marketplace', buyerRef: 'buyer_rewe', destination: 'EU', lines: [{ id: 'l1', categoryId: wine.id, quantity: 500, unit: 'case' }] });
  console.log('4. requirement:', req.id, `(source: ${req.source})`);

  const offer = await p.demand.submitOffer({ requirementLineId: 'l1', producerId: producer.id, skuId: sku.id, price: money(3800, 'EUR'), quantityAvailable: 500, leadTimeWeeks: 5 });
  console.log('5. offer:', offer.id, '€' + offer.price.amount / 100 + '/case');

  const order = await p.demand.approveOffers(req.id, [offer.id]);
  console.log('6. order:', order.id, 'goods €' + order.totals.goods.amount / 100);

  const esc = await p.payments.fundEscrow(order.id);
  console.log('7. escrow:', esc.state, '€' + esc.total.amount / 100);

  const ship = await p.fulfilment.createShipment(order.id, { origin: 'Yerevan hub', destination: 'Köln DC' });
  for (const st of ['at_hub', 'qc', 'loaded', 'export_cleared', 'in_transit', 'import_cleared', 'out_for_delivery', 'delivered'] as const)
    await p.fulfilment.advance(ship.id, st, 'route');
  console.log('8. shipment:', (await p.fulfilment.getShipment(ship.id)).stage);

  const released = await p.payments.releaseEscrow(order.id, [producer.id]);
  console.log('9. escrow:', released.state, '→ producers paid');

  console.log('\n✓ Whole loop ran through contracts only. This is the merge-safe seam.');
}
demo().catch(e => { console.error(e); process.exit(1); });
