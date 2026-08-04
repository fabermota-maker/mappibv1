/**
 * Valida parser, índice e nodes oficiais L00.
 * Uso: node scripts/validate-l00-poi-routing.js
 */
const fs = require("fs");
const path = require("path");
const vm = require("vm");

const ROOT = path.join(__dirname, "..");
const L00 = JSON.parse(fs.readFileSync(path.join(ROOT, "data/navigation/floors/L00.json"), "utf8"));

const nodesById = new Map(L00.nodes.map((n) => [n.id, n]));
const adj = new Map();
for (const e of L00.edges || []) {
  if (!adj.has(e.from)) adj.set(e.from, []);
  if (!adj.has(e.to)) adj.set(e.to, []);
  adj.get(e.from).push(e.to);
  adj.get(e.to).push(e.from);
}

const navGraph = { nodesById, adjacency: adj };
const gNodes = Object.fromEntries(L00.nodes.map((n) => [n.id, n]));
const gAdj = Object.fromEntries([...adj.entries()]);

const sandbox = { globalThis: {}, console };
vm.createContext(sandbox);
vm.runInContext(
  fs.readFileSync(path.join(ROOT, "js/app/l00PoiLayerIndex.js"), "utf8"),
  sandbox
);
const L00I = sandbox.globalThis.L00PoiLayerIndex;

const poisSvg = fs.readFileSync(path.join(ROOT, "assets/mapa-pois.svg"), "utf8");
const layerIds = [...poisSvg.matchAll(/\bid="(L\d{2}_poi_[^"]+)"/g)].map((m) => m[1]);

const mockSvg = {
  querySelectorAll(sel) {
    if (sel !== "[id]") return [];
    return layerIds.map((id) => ({ id }));
  },
};

const report = L00I.buildSearchIndex(mockSvg, navGraph, gNodes, gAdj);

const tests = [
  { name: "Entrada de Narnia", query: "Entrada de Narnia", layer: "L00_poi_0083_entrada_de_narnia_node_0016", node: "L00_node_0016" },
  { name: "Narnia (alias)", query: "Narnia", layer: "L00_poi_0083_entrada_de_narnia_node_0016", node: "L00_node_0016" },
  { name: "Capela", query: "Capela", layer: "L00_poi_0029_capela__node_0068", node: "L00_node_0068", notNode: "L00_node_0029" },
  { name: "Berçário", query: "Berçário", layer: "L00_poi_0074_bercario__node_0075", node: "L00_node_0075", notNode: "L00_node_0074" },
  { name: "Estacionamento de motos", query: "Estacionamento de motos", layer: "L00_poi_0002_icon_moto_node_0009", node: "L00_node_0009", notNode: "L00_node_0002" },
];

console.log("=== Índice L00 ===");
console.log(`Layers: ${report.totalLayers} | Válidos: ${report.validCount} | Inválidos: ${report.invalidCount}`);
if (report.invalid.length) console.log("Sem edge:", report.invalid.join(", "));

let passed = 0;
for (const t of tests) {
  const { items } = L00I.search(t.query, navGraph, gNodes, gAdj);
  const first = items[0];
  const parsed = L00I.parsePoiLayerName(t.layer);
  const okLayer = first && (first.rawId === t.layer || first.id === t.layer);
  const okNode = first && L00I.nodeIdBase(first.officialAccessNodeId || first.graphNodeId) === t.node;
  const badNode = t.notNode && first && L00I.nodeIdBase(first.officialAccessNodeId || first.graphNodeId) === t.notNode;
  const okParsed = parsed && L00I.nodeIdBase(parsed.accessNodeId) === t.node;
  const ok = okLayer && okNode && okParsed && !badNode;
  console.log(`${ok ? "OK" : "FAIL"} — ${t.name}: node=${first?.officialAccessNodeId || first?.graphNodeId || "?"}`);
  if (ok) passed++;
}

const templo = L00I.search("Templo", navGraph, gNodes, gAdj);
const temploNodes = (templo.items || []).map((p) => L00I.nodeIdBase(p.officialAccessNodeId || p.graphNodeId));
const expectedTemple = ["L00_node_0088", "L00_node_0072", "L00_node_0036", "L00_node_0015", "L00_node_0018"];
const temploOk = expectedTemple.every((n) => temploNodes.includes(n)) && templo.items.length >= 5;
console.log(`${temploOk ? "OK" : "FAIL"} — Templo multi-acesso: ${temploNodes.join(", ")}`);
if (temploOk) passed++;

console.log(`\n${passed}/${tests.length + 1} testes passaram.`);
