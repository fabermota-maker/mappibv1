/**
 * Gera data/navigation/floors/L00.json a partir dos SVGs refinados 2026.
 * Uso: node scripts/build-l00-nav.js
 */
const fs = require("fs");
const path = require("path");

const ROOT = path.join(__dirname, "..");
const ASSETS = path.join(ROOT, "assets");
const METERS_PER_UNIT = 0.35;

function read(file) {
  return fs.readFileSync(path.join(ASSETS, file), "utf8");
}

function parseNodes(svgText) {
  const nodes = [];
  const re = /<circle[^>]*id="([^"]+)"[^>]*cx="([^"]+)"[^>]*cy="([^"]+)"/g;
  let m;
  while ((m = re.exec(svgText))) {
    nodes.push({
      id: m[1],
      level: "L00",
      x: +m[2],
      y: +m[3],
      active: true,
    });
  }
  return nodes;
}

function parsePoints(el) {
  const pts = [];
  const x1 = el.match(/x1="([^"]+)"/);
  const y1 = el.match(/y1="([^"]+)"/);
  const x2 = el.match(/x2="([^"]+)"/);
  const y2 = el.match(/y2="([^"]+)"/);
  if (x1 && y1 && x2 && y2) {
    pts.push({ x: +x1[1], y: +y1[1] }, { x: +x2[1], y: +y2[1] });
    return pts;
  }
  const points = el.match(/points="([^"]+)"/);
  if (points) {
    const nums = points[1].trim().split(/[\s,]+/).map(Number);
    for (let i = 0; i < nums.length - 1; i += 2) {
      pts.push({ x: nums[i], y: nums[i + 1] });
    }
  }
  return pts;
}

function buildNodeIndex(nodes) {
  const byNum = new Map();
  for (const n of nodes) {
    const m = n.id.match(/^L00_node_(\d{4})/);
    if (m) byNum.set(m[1], n.id);
  }
  return byNum;
}

function resolveNode(num, byNum) {
  return byNum.get(num) || `L00_node_${num}`;
}

function orientPath(path, fromNode, toNode) {
  if (!path?.length || path.length < 2 || !fromNode || !toNode) return path;
  const start = path[0];
  const end = path[path.length - 1];
  const forward = dist(start, fromNode) + dist(end, toNode);
  const reverse = dist(end, fromNode) + dist(start, toNode);
  return reverse < forward ? [...path].reverse() : path;
}

function parseEdges(svgText, zone, byNum, nodesById) {
  const edges = [];
  const re = /<(line|polyline)[^>]*id="([^"]+)"[^>]*\/?>/g;
  let m;
  while ((m = re.exec(svgText))) {
    const id = m[2];
    const el = m[0];
    let path = parsePoints(el);
    if (path.length < 2) continue;

    const nums = [...id.matchAll(/node_(\d{4})/g)].map((x) => x[1]);
    if (nums.length < 2) continue;
    const from = resolveNode(nums[0], byNum);
    const to = resolveNode(nums[nums.length - 1], byNum);

    const fromNode = nodesById.get(from);
    const toNode = nodesById.get(to);
    path = orientPath(path, fromNode, toNode);

    let distLen = 0;
    for (let i = 1; i < path.length; i++) {
      const dx = path[i].x - path[i - 1].x;
      const dy = path[i].y - path[i - 1].y;
      distLen += Math.sqrt(dx * dx + dy * dy);
    }

    edges.push({
      id,
      from,
      to,
      path,
      distanceMeters: +(distLen * METERS_PER_UNIT).toFixed(3),
      bidirectional: true,
      accessible: true,
      active: true,
      level: "L00",
      zone,
      type: zone === "indoor" ? "corridor" : "outdoor_path",
      parkingLot: /estacionamento|parking/i.test(id) || false,
    });
  }
  return edges;
}

function dist(a, b) {
  const dx = a.x - b.x;
  const dy = a.y - b.y;
  return Math.sqrt(dx * dx + dy * dy);
}

function poiCenter(gInner) {
  const m = gInner.match(/<(?:circle|ellipse)[^>]*cx="([^"]+)"[^>]*cy="([^"]+)"/);
  if (m) return { x: +m[1], y: +m[2] };
  const pathM = gInner.match(/d="M\s*([\d.+-]+)[,\s]+([\d.+-]+)/);
  if (pathM) return { x: +pathM[1], y: +pathM[2] };
  return null;
}

function parsePois(svgText, nodes) {
  const pois = [];
  const re = /<g id="(P\d+[^"]*)">([\s\S]*?)<\/g>/g;
  let m;
  while ((m = re.exec(svgText))) {
    const rawId = m[1].replace(/\s+/g, "_").replace(/-/g, "_");
    const center = poiCenter(m[2]);
    if (!center) continue;
    let nearest = nodes[0];
    let best = Infinity;
    for (const n of nodes) {
      const d = dist(center, n);
      if (d < best) {
        best = d;
        nearest = n;
      }
    }
    const name = rawId.replace(/^P\d+_/, "").replace(/_/g, " ").toUpperCase();
    pois.push({
      id: `L00_P_${rawId}`,
      rawId,
      name,
      level: "L00",
      mapLevel: "L00",
      nodeIds: [nearest.id],
      active: true,
      cat: /estacionamento/i.test(rawId) ? "estacionamento" : "geral",
    });
  }
  return pois;
}

function main() {
  const nodesSvg = read("mapa-nodes.svg");
  const indoorSvg = read("mapa-edge-indoor.svg");
  const outdoorSvg = read("mapa-edge-outdoor.svg");
  const poisSvg = read("mapa-pois.svg");

  const nodes = parseNodes(nodesSvg);
  const byNum = buildNodeIndex(nodes);
  const nodesById = new Map(nodes.map((n) => [n.id, n]));
  const edgesIndoor = parseEdges(indoorSvg, "indoor", byNum, nodesById);
  const edgesOutdoor = parseEdges(outdoorSvg, "outdoor", byNum, nodesById);
  const edges = [...edgesIndoor, ...edgesOutdoor];
  const pois = parsePois(poisSvg, nodes);

  const l00 = { level: "L00", nodes, edges, pois };
  const outDir = path.join(ROOT, "data", "navigation", "floors");
  fs.mkdirSync(outDir, { recursive: true });
  fs.writeFileSync(path.join(outDir, "L00.json"), JSON.stringify(l00));

  console.log(`L00.json: ${nodes.length} nodes, ${edges.length} edges, ${pois.length} pois`);
}

main();
