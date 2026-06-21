/* ============================================================
 * build-roads.mjs — pre-generate a junction-to-junction road network
 *
 * Queries Overpass for a bbox, builds the combined road + footpath +
 * cycleway graph, splits it into segments between real junctions
 * (graph nodes of degree != 2), and writes a GeoJSON FeatureCollection.
 *
 * Each feature carries: segment_id, u, v (junction node ids), name, klass.
 * These let the front-end do instant hover/select (feature-state) and
 * connectivity checks without any live API.
 *
 * Usage:
 *   node scripts/build-roads.mjs                      # default pilot (Toa Payoh)
 *   node scripts/build-roads.mjs S W N E out.geojson  # custom bbox + output
 *
 * Pilot now → swap to whole-island PMTiles (tippecanoe) later; the
 * front-end logic is identical.
 * ============================================================ */
import { writeFileSync } from "node:fs";

const OVERPASS = [
  "https://overpass-api.de/api/interpreter",
  "https://overpass.kumi.systems/api/interpreter",
  "https://maps.mail.ru/osm/tools/overpass/api/interpreter",
];

// included highway classes (vehicular roads + pedestrian + cycle; service/driveways excluded as clutter)
const INCLUDE = new Set([
  "motorway", "trunk", "primary", "secondary", "tertiary", "unclassified",
  "residential", "living_street", "road",
  "motorway_link", "trunk_link", "primary_link", "secondary_link", "tertiary_link",
  "footway", "path", "pedestrian", "steps", "cycleway", "track",
]);

const argv = process.argv.slice(2);
// default pilot bbox: Toa Payoh  (south, west, north, east)
const [S, W, N, E] = argv.length >= 4 ? argv.slice(0, 4).map(Number) : [1.328, 103.844, 1.340, 103.860];
const OUT = argv[4] || "data/pilot-roads.geojson";

async function overpass(query) {
  let lastErr;
  for (const url of OVERPASS) {
    try {
      console.error(`  → trying ${url}`);
      const ctrl = new AbortController();
      const timer = setTimeout(() => ctrl.abort(), 75000); // abandon a stalled mirror after 75s
      const res = await fetch(url, { method: "POST", body: "data=" + encodeURIComponent(query), signal: ctrl.signal });
      clearTimeout(timer);
      if (res.ok) return res.json();
      lastErr = new Error("Overpass " + res.status + " @ " + url);
      console.error(`    ${res.status}`);
    } catch (e) { lastErr = e; console.error(`    ${e.message}`); }
  }
  throw lastErr;
}

const edgeKey = (a, b) => (a < b ? a + "_" + b : b + "_" + a);
const round = (n) => Math.round(n * 1e6) / 1e6;

async function main() {
  console.error(`Querying Overpass for bbox ${S},${W},${N},${E} …`);
  const data = await overpass(`[out:json][timeout:60];way(${S},${W},${N},${E})[highway];(._;>;);out;`);

  const nodes = {}, ways = [];
  for (const el of data.elements) {
    if (el.type === "node") nodes[el.id] = [el.lon, el.lat];
    else if (el.type === "way" && el.nodes && el.tags && INCLUDE.has(el.tags.highway)) ways.push(el);
  }
  console.error(`  ${ways.length} ways, ${Object.keys(nodes).length} nodes`);

  // adjacency over included ways; remember a wayId per edge for naming
  const adj = {};          // node -> [{ to, wayId }]
  const wayById = {};
  for (const w of ways) {
    wayById[w.id] = w;
    for (let i = 0; i < w.nodes.length - 1; i++) {
      const a = w.nodes[i], b = w.nodes[i + 1];
      if (!nodes[a] || !nodes[b]) continue;
      (adj[a] = adj[a] || []).push({ to: b, wayId: w.id });
      (adj[b] = adj[b] || []).push({ to: a, wayId: w.id });
    }
  }
  const degree = (n) => (adj[n] ? adj[n].length : 0);

  // split into chains between junctions (degree != 2)
  const visited = new Set();
  const chains = [];
  function walkChainsFrom(a) {
    for (const e0 of adj[a] || []) {
      const k0 = edgeKey(a, e0.to);
      if (visited.has(k0)) continue;
      visited.add(k0);
      const seq = [a, e0.to], wid = e0.wayId;
      let prev = a, cur = e0.to;
      while (degree(cur) === 2) {
        const nx = (adj[cur] || []).find((x) => x.to !== prev && !visited.has(edgeKey(cur, x.to)));
        if (!nx) break;
        visited.add(edgeKey(cur, nx.to)); seq.push(nx.to); prev = cur; cur = nx.to;
      }
      chains.push({ seq, wid });
    }
  }
  // 1) start from every junction / dead-end node
  for (const n in adj) if (degree(n) !== 2) walkChainsFrom(n);
  // 2) any leftover edges belong to pure loops (all degree-2) — start anywhere on them
  for (const n in adj) if (adj[n].some((e) => !visited.has(edgeKey(n, e.to)))) walkChainsFrom(n);

  // build features
  const features = chains
    .map(({ seq, wid }, idx) => {
      const coords = seq.map((n) => nodes[n]).filter(Boolean).map(([x, y]) => [round(x), round(y)]);
      if (coords.length < 2) return null;
      const t = (wayById[wid] && wayById[wid].tags) || {};
      return {
        type: "Feature",
        properties: {
          segment_id: idx,
          u: seq[0], v: seq[seq.length - 1],
          name: t.name || t.ref || null,
          klass: t.highway || null,
        },
        geometry: { type: "LineString", coordinates: coords },
      };
    })
    .filter(Boolean);

  writeFileSync(OUT, JSON.stringify({ type: "FeatureCollection", features }));
  const bytes = Buffer.byteLength(JSON.stringify({ type: "FeatureCollection", features }));
  console.error(`Wrote ${features.length} segments → ${OUT} (${(bytes / 1024).toFixed(0)} KB)`);
}

main().catch((e) => { console.error("FAILED:", e.message); process.exit(1); });
