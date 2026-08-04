/**
 * Sincroniza assets/mapa-pois.svg → 2026 mapa pib_pois_tech.svg (fonte Illustrator).
 * Converte classes cls-N do app para stN do arquivo técnico 2026.
 * Uso: node scripts/sync-pois-to-source.js
 */
const fs = require("fs");
const path = require("path");

const ROOT = path.join(__dirname, "..");
const SRC_DIR = path.join(ROOT, "..");
const APP_POIS = path.join(ROOT, "assets", "mapa-pois.svg");
const SRC_POIS = path.join(SRC_DIR, "2026 mapa pib_pois_tech.svg");

/** cls-N (app) → stN (fonte 2026) — cores equivalentes. */
const CLS_TO_ST = {
  "cls-1": "st0",
  "cls-2": "st5",
  "cls-3": "st1",
  "cls-4": "st2",
  "cls-5": "st3",
  "cls-6": "st4",
  "cls-7": "st6",
  "cls-8": "st7",
  "cls-9": "st8",
  "cls-10": "st9",
};

function appToSourceSvg(appSvg) {
  let out = appSvg;
  for (const [cls, st] of Object.entries(CLS_TO_ST)) {
    out = out.replace(new RegExp(`class="${cls}"`, "g"), `class="${st}"`);
  }
  out = out.replace(/\sdata-name="[^"]*"/g, "");
  out = out.replace(
    /^<\?xml[^?]*\?>\s*<svg[^>]*>/,
    `<?xml version="1.0" encoding="UTF-8"?>
<svg id="Camada_1" xmlns="http://www.w3.org/2000/svg" version="1.1" viewBox="0 0 1134.67 1032">
  <!-- Generator: Adobe Illustrator 29.8.9, SVG Export Plug-In . SVG Version: 2.1.1 Build 1)  -->
  <defs>
    <style>
      .st0 {
        fill: #212e3f;
      }

      .st1 {
        fill: #fff;
      }

      .st2 {
        fill: #ce3434;
      }

      .st3 {
        fill: #193124;
      }

      .st4 {
        fill: #f9f9f9;
      }

      .st5 {
        fill: #575757;
      }

      .st6 {
        fill: #d3d3d3;
      }

      .st7 {
        fill: #8400c1;
      }

      .st8 {
        fill: #00c980;
      }

      .st9 {
        fill: #7f4c2f;
      }
    </style>
  </defs>`
  );
  return out;
}

function main() {
  if (!fs.existsSync(APP_POIS)) {
    console.error("MISSING:", APP_POIS);
    process.exit(1);
  }
  const app = fs.readFileSync(APP_POIS, "utf8");
  const out = appToSourceSvg(app);
  fs.writeFileSync(SRC_POIS, out);
  const ids = [...out.matchAll(/id="(L00_poi[^"]+)"/g)].map((m) => m[1]);
  console.log(`OK: mapa-pois.svg → 2026 mapa pib_pois_tech.svg (${ids.length} POIs L00)`);
  console.log("  Ajustes incluídos: Jardim translate(31 39), Elevador translate(13.21 2.59)");
}

main();
