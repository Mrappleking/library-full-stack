# Library Full-Stack — Architecture

> 2026-06-24 | v1.0

## Four-Layer Model

```
┌── FRONTEND ──────────────────────────────┐
│ views/ → composables/ → stores/ → api/  │
│ Pages     Logic Hooks   Shared State  API│
├── BACKEND: Routes ──────────────────────┤
│ Parse request → call service → return    │
│ Thin layer: each handler ≤30 lines      │
├── BACKEND: Services ────────────────────┤
│ Pure functions (prisma, params) → data  │
│ Transactions, rule engine, auth logic   │
├── BACKEND: Data ────────────────────────┤
│ Prisma Client + DTOs (types/api.types.ts)│
├── DATABASE ─────────────────────────────┤
│ MySQL + Prisma Schema + Migrations      │
└─────────────────────────────────────────┘
```

## Principles

### 1. Service Layer: Pure Functions
```typescript
export async function borrow(prisma: PrismaClient, userId: number, params: BorrowParams): Promise<BorrowRecordResponse>
```
- First parameter always PrismaClient
- Returns typed DTOs (not raw Prisma types)
- Zero HTTP knowledge — routes handle HTTP, services handle business logic

### 2. Route Layer: Thin Shell
- Each handler: parse input → call service → return
- Never call `prisma.findMany()` directly in routes
- Auth guards via Fastify hooks: `onRequest: [app.authenticate]`

### 3. Types First
- All API contracts defined in `backend/src/types/api.types.ts`
- Naming: `XxxParams` (request) / `XxxResponse` (response)
- Frontend mirrors in `frontend/src/types/api.ts`

### 4. Zero External API Dependency
Student project — no third-party API keys required.
- Covers: OpenLibrary (free, no auth) + CSS fallback
- Search: MySQL GROUP BY (no external OPAC)
- QR/Barcode: client-side JsBarcode (no external service)

## Directory Structure

```
backend/src/
├── types/
│   ├── api.types.ts        ← all DTOs (40 interfaces)
│   └── fastify.d.ts         ← Fastify decoration types
├── services/
│   ├── auth.service.ts      ← register, login, getMe
│   ├── book.service.ts      ← list, getById, getFacets, CRUD
│   ├── borrow.service.ts    ← borrow, return, renew (core)
│   ├── category.service.ts
│   ├── user.service.ts
│   ├── stats.service.ts
│   ├── fine.service.ts
│   ├── rule.service.ts
│   ├── cover.service.ts
│   ├── rules.ts             ← getRule(), checkBorrowLimit() [legacy, kept]
│   └── fines.ts             ← createFine(), calcOverdueFine() [legacy, kept]
├── routes/
│   ├── auth.ts              ← each ≤60 lines, only calls services
│   ├── books.ts
│   ├── borrows.ts
│   ├── categories.ts
│   ├── readers.ts
│   ├── stats.ts
│   ├── fines.ts
│   └── rules.ts
└── index.ts                 ← Fastify setup + JWT + CORS

frontend/src/
├── types/
│   └── api.ts               ← mirror of backend DTOs
├── api/
│   ├── index.ts             ← HTTP client with request<T>()
│   └── books.ts             ← typed bookApi
├── stores/
│   ├── auth.ts              ← Pinia: user, token, login/logout
│   └── books.ts             ← Pinia: search, facets, pagination
├── composables/
│   └── index.ts             ← usePagination, useDebounce
├── components/
│   ├── BookCard.vue         ← cover + title + author + status
│   ├── BookGrid.vue
│   ├── FacetPanel.vue       ← left sidebar facet filter
│   ├── SearchBar.vue
│   ├── HoldingsTable.vue    ← campus/location/callNumber table
│   ├── StatusBadge.vue      ← 4-color tag (在架/借出/预约/逾期)
│   ├── BarcodeInput.vue     ← auto-enter barcode scanner
│   ├── EmptyState.vue
│   ├── SkeletonCard.vue
│   └── BookDetailSection.vue
└── views/
    ├── public/
    │   ├── Search.vue       ← /books (main search page)
    │   └── BookDetail.vue   ← /books/:id
    ├── admin/
    │   ├── Circulation.vue  ← /admin/circulation
    │   └── ...
    └── reader/
        └── ...
```

## Data Model (9 Tables)

```
PatronCategory ──┐
User ────────────┤
Category         │
Book ────────────┤
  └─ BookItem ───┼── ItemType
  └─ BorrowRecord┼── Fine
                 └── CirculationRule (patronCategoryId × itemTypeId)
```

Key constraints:
- `BorrowRecord.status`: active/returned/overdue
- `BookItem.status`: available/borrowed/repairing/lost/withdrawn/on_hold
- `CirculationRule`: unique on (patronCategoryId, itemTypeId)
- All borrow/return operations wrapped in `prisma.$transaction`

## API Routes (38 Endpoints)

| Prefix | Count | Public | Auth |
|--------|-------|--------|------|
| /api/health | 1 | ✓ | - |
| /api/auth | 5 | 2 | 3 |
| /api/books | 7 | 4 | 3 |
| /api/categories | 4 | 1 | 3 |
| /api/borrows | 6 | - | 6 |
| /api/readers | 4 | - | 4 |
| /api/stats | 3 | - | 3 |
| /api/fines | 3 | - | 3 |
| /api/admin/rules | 4 | 3 | 1 |
| /api/book-items/:barcode | 1 | ✓ | - |

## External Dependencies

| Source | Purpose | Auth |
|--------|---------|------|
| OpenLibrary | Book covers | None |
| CSS gradient | Cover fallback | N/A |

All other functionality is self-contained.

## Implementation Plan

See `PLAN.md` — 7-module incremental plan with per-step verification gates.

## Test Strategy

See PLAN.md §测试体系:
- Layer 1: Regression baseline (curl diff)
- Layer 2: Service unit tests (vitest + vi.mock)
- Layer 3: API integration tests (Fastify inject)
- Layer 4: Component tests (@vue/test-utils)
- Layer 5: Manual E2E checklist
