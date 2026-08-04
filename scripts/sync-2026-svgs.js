/**
 * Sincroniza SVGs fonte 2026 → assets/ do app.
 * Preserva customizações de POIs (mapa-pois.svg não é sobrescrito).
 * Uso: node scripts/sync-2026-svgs.js
 */
const fs = require("fs");
const path = require("path");

const ROOT = path.join(__dirname, "..");
const SRC = path.join(ROOT, "..");
const ASSETS = path.join(ROOT, "assets");

const COPY_MAP = [
  ["2026 mapa pib Background 01.svg", "mapa-background.svg"],
  ["2026 mapa pib_wall_parede.svg", "mapa-wall.svg"],
  ["2026 mapa pib_edge_indoor_tech.svg", "mapa-edge-indoor.svg"],
  ["2026 mapa pib_edge_outdoor_tech.svg", "mapa-edge-outdoor.svg"],
  ["2026 mapa pib_node.svg", "mapa-nodes.svg"],
  ["2026 mapa pib_txt_info_tech.svg", "mapa-info-textos.svg"],
];

/** Renomeia nó 0033 — corredor do Espaço Servir, não entrada do templo. */
function patchNodes(svg) {
  return svg.replace(
    /id="L00_node_0033_entrada_templo_03"/g,
    'id="L00_node_0033_corredor_servir"'
  );
}

/** Oculta rótulo "Entrada 01 Principal Templo" (oculto no app). */
function patchInfoTextos(svg) {
  return svg.replace(
    '<text class="cls-27" transform="translate(313.06 588.95)">',
    '<text class="cls-27" style="display:none" transform="translate(313.06 588.95)">'
  );
}

function main() {
  const report = [];
  for (const [srcName, dstName] of COPY_MAP) {
    const srcPath = path.join(SRC, srcName);
    const dstPath = path.join(ASSETS, dstName);
    if (!fs.existsSync(srcPath)) {
      report.push(`SKIP (missing): ${srcName}`);
      continue;
    }
    let content = fs.readFileSync(srcPath, "utf8");
    if (dstName === "mapa-nodes.svg") content = patchNodes(content);
    if (dstName === "mapa-info-textos.svg") content = patchInfoTextos(content);
    fs.writeFileSync(dstPath, content);
    report.push(`OK: ${srcName} → ${dstName}`);
  }
  report.push("SKIP: mapa-pois.svg (customizações do app preservadas)");
  console.log(report.join("\n"));
}

main();
