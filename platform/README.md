# Shuka Platform — modular-monolith skeleton

Backend scaffold for the Shuka platform. One deployable today; clean module
boundaries so services can be **extracted (or sold) later without a rewrite**.
See [`../docs/ARCHITECTURE.md`](../docs/ARCHITECTURE.md) for the full model.

## Run the demo
```bash
cd platform
npm install
npm run demo      # builds, then walks the whole core loop through contracts
```

## Structure
```
src/
  shared/                primitives only (Money, ids, time, errors, EventBus)
  modules/<service>/
    contract.ts          PUBLIC surface — owned types + interface + events
    service.ts           implementation (in-memory stub; swap for real store later)
  app/
    container.ts         composition root — the ONLY place that sees implementations
    server.ts            runnable demo of the end-to-end loop
  edge/
    tender.workflow.ts   example edge service composing CORE contracts only
```

## The one rule
- Other modules import a module's **`contract.ts` only** — never its `service.ts` or store.
- Only `app/container.ts` imports `service.ts` (to construct and inject).
- Services depend on **contract interfaces**, so any implementation can be swapped
  (in-memory → Postgres → a remote service) with zero caller changes.

## Extraction order (only when earned)
1. **Compliance** — bounded, reusable, sellable as compliance-as-a-service.
2. **Tender & Bid** — strongest standalone product; see `edge/tender.workflow.ts`.
3. **Payments** — externalised early anyway (regulated provider).
