# AuctionMap Web

MVP map + search frontend for distressed bank auction properties in India.

**Stack:** Next.js 16 · Mapbox GL · Supabase (read-only views + RPC)

**Data source:** [auctionmap-pipeline](https://github.com/beatnyk77/AuctionMap) writes to Supabase; this app reads `listings_public` and `listings_in_bbox`.

## Setup

```bash
cp .env.local.example .env.local
# Add NEXT_PUBLIC_SUPABASE_ANON_KEY and NEXT_PUBLIC_MAPBOX_TOKEN

npm install
npm run dev
```

Open [http://localhost:3000](http://localhost:3000).

## Pages

| Route | Description |
|-------|-------------|
| `/` | Full-screen map + sidebar listings (pins by risk tier) |
| `/search` | Filterable list/table view |
| `/property/[id]` | Listing detail + risk panel, price history, circle rate |
| `/alerts` | Email alert subscription form |
| `/brief` | Weekly inventory snapshot for advisors |
| `/pricing` | Free / Pro / white-label plan comparison |
| `/settings` | Plan usage, white-label branding (Pro+) |
| `/deals` | Deal pipeline (auth) |
| `/saved` | Saved searches (auth) |

**White-label:** visit `?tenant=demo` locally or `demo.auctionmap.in` in production for branded subdomain + territory filters.

## API routes

| Endpoint | Params |
|----------|--------|
| `GET /api/listings` | `bbox`, `state`, `type`, `risk`, `min_price`, `max_price`, `limit` |
| `GET /api/listings/[id]` | Property UUID |

## Deploy (Vercel)

1. Import repo to Vercel
2. Set environment variables from `.env.local.example`
3. Deploy — no server beyond Route Handlers

## Related repos

- **Pipeline:** `auctionmap-pipeline` — ingestion, intelligence, dual-write
- **Supabase project:** `wafdpmasoboazbjpgfwk` (Mumbai)