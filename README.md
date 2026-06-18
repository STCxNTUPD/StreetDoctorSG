# Street Doctor SG — runnable prototype

A self-contained, **front-end-only** prototype of the Street Doctor SG civic street-audit
platform described in the product planning document. No backend, no build step, no API keys.

## Run it

Just open `index.html` in a browser. (Map tiles need an internet connection.)

For best results — geolocation and clipboard work more reliably over `http://` than `file://` —
serve the folder:

```bash
cd "Street Doctor"
python3 -m http.server 8000
# then open http://localhost:8000
```

## What's included

| Spec section | Implemented as |
| --- | --- |
| §4.1 Home | Hero, dual CTA, non-government disclaimer, mini map, trust stats, STC/VZT blurb |
| §4.2 Map | Full MapLibre map, multi-select category + status filters, colored markers, mini-cards, floating report button |
| §4.3 Report | 8-step form with progress bar, map pin / geolocation, photo upload (≤3, client-side compression), optional email, consent + simulated Turnstile, localStorage draft autosave |
| §4.4 Issue detail | Status badge, category tag, photo carousel, affected groups, mini map, support button (deduped), public STC timeline, share/copy link |
| §4.5 Admin | Login (`stc-demo`), dashboard, case list with filter/sort + approve/reject, moderation page (edit content/coords/photos, status updates, mark duplicate), duplicate suggestions, CSV + GeoJSON export |
| §2 Roles | Public vs. admin separation; `/admin/*` guarded by a login flag |
| §11 Pages | About, FAQ, Privacy, Terms, Emergency |

## How it differs from the production spec (deliberately)

- **Storage**: browser `localStorage` stands in for Supabase Postgres/PostGIS. See `DB` in
  [`js/data.js`](js/data.js) — each method maps to a table/Server Action in §7–8.
- **Basemap**: free OpenStreetMap raster tiles instead of OneMap (which needs a token).
  Swap the `OSM_STYLE` source in [`js/app.js`](js/app.js) for OneMap in production.
- **Address search**: free-text + browser geolocation. Production proxies OneMap Search /
  reverse-geocode via `/api/onemap/*` (§8).
- **Turnstile**: a checkbox placeholder. Production embeds the real Cloudflare widget.
- **Auth**: a demo password flag, not Supabase Auth + RLS.

## Files

```
index.html      app shell + CDN scripts
css/styles.css  mobile-first styles (375px tested)
js/data.js      constants, seed cases, localStorage "DB"
js/app.js       hash router + all views (public + admin)
```

## Demo tips

- Admin login: open **Admin** in the nav → password `stc-demo`.
- Submit a report → it appears as *pending* in the admin case list → **Approve** → it shows on the public map.
- Footer has a **reset demo data** link to restore the seed cases.
