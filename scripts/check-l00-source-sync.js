const fs = require("fs");
const path = require("path");
const crypto = require("crypto");

const base = path.join(__dirname, "..", "..");
const app = path.join(__dirname, "..");

function hash(text) {
  return crypto.createHash("sha256").update(text, "utf8").digest("hex").slice(0, 16);
}

function patchNodes(s) {
  return s.replace(/id="L00_node_0033_entrada_templo_03"/g, 'id="L00_node_0033_corredor_servir"');
}

function patchInfo(s) {
  return s.replace(
    '<text class="cls-27" transform="translate(313.06 588.95)">',
    '<text class="cls-27" style="display:none" transform="translate(313.06 588.95)">'
  );
}

const pairs = [
  ["2026 mapa pib Background 01.svg", "assets/mapa-background.svg", null],
  ["2026 mapa pib_wall_parede.svg", "assets/mapa-wall.svg", null],
  ["2026 mapa pib_edge_indoor_tech.svg", "assets/mapa-edge-indoor.svg", null],
  ["2026 mapa pib_edge_outdoor_tech.svg", "assets/mapa-edge-outdoor.svg", null],
  ["2026 mapa pib_node.svg", "assets/mapa-nodes.svg", "nodes"],
  ["2026 mapa pib_txt_info_tech.svg", "assets/mapa-info-textos.svg", "info"],
  ["2026 mapa pib_pois_tech.svg", "assets/mapa-pois.svg", null],
];

console.log("=== SVG map pib V1 → map PIB Model V1/assets ===\n");
for (const [srcName, dstRel, patch] of pairs) {
  const src = path.join(base, srcName);
  const dst = path.join(app, dstRel);
  if (!fs.existsSync(src) || !fs.existsSync(dst)) {
    console.log(`MISSING  ${srcName} → ${dstRel}`);
    continue;
  }
  let sc = fs.readFileSync(src, "utf8");
  if (patch === "nodes") sc = patchNodes(sc);
  if (patch === "info") sc = patchInfo(sc);
  const sh = hash(sc);
  const dh = hash(fs.readFileSync(dst, "utf8"));
  const ss = fs.statSync(src).mtime.toISOString().slice(0, 16);
  const ds = fs.statSync(dst).mtime.toISOString().slice(0, 16);
  const synced = sh === dh ? "SYNC OK" : "OUT OF SYNC";
  const inSyncScript = ["pois"].includes(dstRel.split("/").pop()?.replace("mapa-", "").replace(".svg", ""))
    ? (dstRel.includes("pois") ? "NÃO (preservado manualmente)" : "SIM")
    : "SIM (sync-2026-svgs.js)";
  console.log(`${synced} | ${srcName}`);
  console.log(`         → ${dstRel} | src ${ss} | app ${ds}`);
}

const l00Path = path.join(app, "data/navigation/floors/L00.json");
const l00 = JSON.parse(fs.readFileSync(l00Path, "utf8"));
console.log(`\nL00.json: ${l00.nodes.length} nodes, ${l00.edges.length} edges`);
console.log(`         mtime ${fs.statSync(l00Path).mtime.toISOString().slice(0, 16)}`);
console.log(`         origem: build-l00-nav.js ← assets/mapa-edge-*.svg + mapa-nodes.svg`);

const poisSrc = path.join(base, "2026 mapa pib_pois_tech.svg");
const poisApp = path.join(app, "assets/mapa-pois.svg");
if (fs.existsSync(poisSrc) && fs.existsSync(poisApp)) {
  const srcIds = [...fs.readFileSync(poisSrc, "utf8").matchAll(/id="(L00_poi[^"]+)"/g)].map((m) => m[1]);
  const appIds = [...fs.readFileSync(poisApp, "utf8").matchAll(/id="(L00_poi[^"]+)"/g)].map((m) => m[1]);
  const onlySrc = srcIds.filter((id) => !appIds.includes(id));
  const onlyApp = appIds.filter((id) => !srcIds.includes(id));
  console.log(`\nPOIs L00_poi_* — fonte: ${srcIds.length} | app: ${appIds.length}`);
  if (onlySrc.length) console.log(`  só na fonte (${onlySrc.length}):`, onlySrc.join(", "));
  if (onlyApp.length) console.log(`  só no app (${onlyApp.length}):`, onlyApp.join(", "));
  console.log(`  sync automático app→fonte: node scripts/sync-pois-to-source.js`);
  console.log(`  sync automático fonte→app: NÃO — sync-2026-svgs.js preserva mapa-pois.svg`);
}

console.log("\n=== O que o app carrega em runtime (térreo L00) ===");
console.log("Visual SVG:  assets/mapa-*.svg (compostos em loadSVG)");
console.log("Roteamento:  data/navigation/floors/L00.json (primário)");
console.log("Fallback:    data/navigation.json (legado, se lazy load falhar)");
console.log("Catálogo POI: data/navigation/meta.json → poiCatalog");
