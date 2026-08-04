/** Atualiza entradas L00 do meta.json a partir de data/navigation/floors/L00.json */
const fs = require("fs");
const path = require("path");

const root = path.join(__dirname, "..");
const l00 = JSON.parse(fs.readFileSync(path.join(root, "data/navigation/floors/L00.json"), "utf8"));
const metaPath = path.join(root, "data/navigation/meta.json");
const meta = JSON.parse(fs.readFileSync(metaPath, "utf8"));

const byRaw = Object.fromEntries((l00.pois || []).map((p) => [p.rawId, p]));

const extraL00 = {
  P001_entrada_principal_toldo: ["L00_node_0023"],
  P022_banheiro_masculino_ginasio: ["L00_node_0052"],
  P024_banheiro_masculino: ["L00_node_0065"],
  P028_estacionamento_moto: ["L00_node_0002"],
  P029_entrada_pedestre_02_batel: ["L00_node_0087_entrada_av_batel_01"],
  P030_entrada_estacionamento_av_batel: ["L00_node_0086_entrada_av_batel_02"],
  P031_entrada_estacionamento_bento_viana: ["L00_node_0003_entrada_pedestre_bento"],
  B02_entrada_narnia: ["L00_node_0016_entrada_narnia"],
  P028_B02_entrada_narnia: ["L00_node_0016_entrada_narnia"],
  entrada_ginasio: ["L00_node_0024_entrada_sevenpass_ginasio"],
  min_esportes: ["L00_node_0063_min_esporte"],
  P000_templo: [
    "L00_node_0088__entrada_templo_01",
    "L00_node_0072_entrada_templo_02",
  ],
  P000E1_entrada_lateral_01_templo: ["L00_node_0088__entrada_templo_01"],
  P020_espaco_servir: [
    "L00_node_0035_espaco_servir",
    "L00_node_0033_corredor_servir",
    "L00_node_0036",
  ],
};

meta.poiCatalog = (meta.poiCatalog || []).map((entry) => {
  if (entry.inject || !String(entry.id || "").startsWith("L00_P_")) return entry;
  const raw = entry.rawId;
  const fromL00 = byRaw[raw];
  const extra = extraL00[raw];
  const nodeIds = extra || fromL00?.nodeIds;
  if (!nodeIds?.length) return entry;
  return { ...entry, nodeIds: [...nodeIds] };
});

meta.generatedAt = new Date().toISOString();
fs.writeFileSync(metaPath, JSON.stringify(meta));

// Aplica overrides também em L00.json (grafo usa estes nodeIds)
const l00Path = path.join(root, "data/navigation/floors/L00.json");
const l00Data = JSON.parse(fs.readFileSync(l00Path, "utf8"));
l00Data.pois = (l00Data.pois || []).map((p) => {
  const extra = extraL00[p.rawId];
  if (!extra?.length) return p;
  return { ...p, nodeIds: [...extra] };
});
fs.writeFileSync(l00Path, JSON.stringify(l00Data));
console.log("meta.json L00 POIs synced");
console.log("L00.json POI nodeIds patched");
