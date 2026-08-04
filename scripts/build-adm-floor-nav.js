/**
 * Reconstrói paths das edges de andares ADM (L01–L06) a partir do SVG local,
 * convertendo para coordenadas campus via localAdmToCampus.
 * Uso: node scripts/build-adm-floor-nav.js L02
 */
const fs = require("fs");
const path = require("path");

const ROOT = path.join(__dirname, "..");
const METERS_PER_UNIT = 0.35;
const TX = 37.53;
const TY = 401.3;
const SCALE = 1.57;

function localAdmToCampus(local) {
  return {
    x: +(TX + local.x * SCALE).toFixed(3),
    y: +(TY + local.y * SCALE).toFixed(3),
  };
}

function dist(a, b) {
  return Math.hypot(a.x - b.x, a.y - b.y);
}

function orientPath(pathPts, fromNode, toNode) {
  if (!pathPts?.length || pathPts.length < 2 || !fromNode || !toNode) return pathPts;
  const start = pathPts[0];
  const end = pathPts[pathPts.length - 1];
  const forward = dist(start, fromNode) + dist(end, toNode);
  const reverse = dist(end, fromNode) + dist(start, toNode);
  return reverse < forward ? [...pathPts].reverse() : pathPts;
}

function cubicPoint(t, p0, p1, p2, p3) {
  const mt = 1 - t;
  return {
    x: mt * mt * mt * p0.x + 3 * mt * mt * t * p1.x + 3 * mt * t * t * p2.x + t * t * t * p3.x,
    y: mt * mt * mt * p0.y + 3 * mt * mt * t * p1.y + 3 * mt * t * t * p2.y + t * t * t * p3.y,
  };
}

/** Extrai vértices de path SVG (M/L/H/V/C relativos e absolutos). */
function parseSvgPath(d) {
  const pts = [];
  if (!d) return pts;
  const re = /([MmLlHhVvCcZz])|(-?\d*\.?\d+(?:e[-+]?\d+)?)/g;
  let cmd = "M";
  let x = 0;
  let y = 0;
  let start = null;
  const nums = [];

  const push = (px, py) => {
    x = px;
    y = py;
    pts.push({ x, y });
    if (!start) start = { x, y };
  };

  const flush = () => {
    while (nums.length) {
      const up = cmd.toUpperCase();
      const rel = cmd === cmd.toLowerCase();
      if (up === "H") {
        const nx = rel ? x + nums.shift() : nums.shift();
        push(nx, y);
      } else if (up === "V") {
        const ny = rel ? y + nums.shift() : nums.shift();
        push(x, ny);
      } else if (up === "L" || up === "M") {
        if (nums.length < 2) break;
        let nx = nums.shift();
        let ny = nums.shift();
        if (rel) {
          nx += x;
          ny += y;
        }
        push(nx, ny);
        if (up === "M") cmd = rel ? "l" : "L";
      } else if (up === "C") {
        if (nums.length < 6) break;
        const x1 = nums.shift();
        const y1 = nums.shift();
        const x2 = nums.shift();
        const y2 = nums.shift();
        let x3 = nums.shift();
        let y3 = nums.shift();
        const p0 = { x, y };
        let cp1;
        let cp2;
        let p3;
        if (rel) {
          cp1 = { x: x + x1, y: y + y1 };
          cp2 = { x: x + x2, y: y + y2 };
          p3 = { x: x + x3, y: y + y3 };
        } else {
          cp1 = { x: x1, y: y1 };
          cp2 = { x: x2, y: y2 };
          p3 = { x: x3, y: y3 };
        }
        for (const t of [0.33, 0.66, 1]) {
          pts.push(cubicPoint(t, p0, cp1, cp2, p3));
        }
        x = p3.x;
        y = p3.y;
      } else {
        nums.shift();
      }
    }
  };

  let m;
  while ((m = re.exec(d))) {
    if (m[1]) {
      flush();
      cmd = m[1];
      if (cmd === "Z" || cmd === "z") {
        if (start) push(start.x, start.y);
        start = null;
      }
    } else {
      nums.push(+m[2]);
    }
  }
  flush();
  return pts;
}

function parsePoints(el) {
  const tag = el.match(/^<(line|polyline|path)/)?.[1];
  if (tag === "line") {
    const x1 = el.match(/x1="([^"]+)"/);
    const y1 = el.match(/y1="([^"]+)"/);
    const x2 = el.match(/x2="([^"]+)"/);
    const y2 = el.match(/y2="([^"]+)"/);
    if (x1 && y1 && x2 && y2) {
      return [{ x: +x1[1], y: +y1[1] }, { x: +x2[1], y: +y2[1] }];
    }
  }
  if (tag === "polyline") {
    const points = el.match(/points="([^"]+)"/);
    if (points) {
      const nums = points[1].trim().split(/[\s,]+/).map(Number);
      const pts = [];
      for (let i = 0; i < nums.length - 1; i += 2) pts.push({ x: nums[i], y: nums[i + 1] });
      return pts;
    }
  }
  if (tag === "path") {
    const d = el.match(/\sd="([^"]+)"/);
    return parseSvgPath(d?.[1] || "");
  }
  return [];
}

function resolveNodeId(levelId, num, nodesById) {
  const padded = String(num).padStart(4, "0");
  const plain = String(+num);
  for (const id of nodesById.keys()) {
    if (!id.startsWith(`${levelId}_node_`)) continue;
    if (id === `${levelId}_node_${padded}`) return id;
    if (id === `${levelId}_node_${plain}`) return id;
    const tail = id.slice(`${levelId}_node_`.length);
    if (tail === padded || tail === plain || tail.startsWith(`${padded}_`) || tail.startsWith(`${plain}_`)) {
      return id;
    }
  }
  return null;
}

function parseEdgesFromSvg(svgText, levelId, nodesById) {
  const edges = new Map();
  const re = /<(line|polyline|path)[^>]*id="([^"]+)"[^>]*\/?>/g;
  let m;
  while ((m = re.exec(svgText))) {
    const el = m[0];
    const id = m[2];
    if (!/edge/i.test(id)) continue;
    let localPath = parsePoints(el);
    if (localPath.length < 2) continue;

    const nums = [...id.matchAll(/node_(\d+)/g)].map((x) => x[1]);
    if (nums.length < 2) continue;
    const from = resolveNodeId(levelId, nums[0], nodesById);
    const to = resolveNodeId(levelId, nums[nums.length - 1], nodesById);

    if (!from || !to) continue;

    const fromNode = nodesById.get(from);
    const toNode = nodesById.get(to);
    localPath = orientPath(
      localPath,
      campusToLocal(fromNode),
      campusToLocal(toNode),
    );

    let campusPath = localPath.map((p) => localAdmToCampus(p));
    campusPath = orientPath(campusPath, fromNode, toNode);

    let distLen = 0;
    for (let i = 1; i < campusPath.length; i++) distLen += dist(campusPath[i - 1], campusPath[i]);

    edges.set(`${from}|${to}`, {
      from,
      to,
      path: campusPath,
      distanceMeters: +(distLen * METERS_PER_UNIT).toFixed(3),
    });
  }
  return edges;
}

function campusToLocal(node) {
  return { x: (node.x - TX) / SCALE, y: (node.y - TY) / SCALE };
}

function rebuildFloor(levelId) {
  const jsonPath = path.join(ROOT, "data/navigation/floors", `${levelId}.json`);
  const svgPath = path.join(ROOT, "assets", `mapa-${levelId}.svg`);
  if (!fs.existsSync(jsonPath) || !fs.existsSync(svgPath)) {
    console.error("Arquivos não encontrados:", jsonPath, svgPath);
    process.exit(1);
  }

  const floor = JSON.parse(fs.readFileSync(jsonPath, "utf8"));
  const svgText = fs.readFileSync(svgPath, "utf8");
  const nodesById = new Map(floor.nodes.map((n) => [n.id, n]));
  const svgEdges = parseEdgesFromSvg(svgText, levelId, nodesById);

  let updated = 0;
  for (const edge of floor.edges) {
    const key = `${edge.from}|${edge.to}`;
    const rev = `${edge.to}|${edge.from}`;
    const src = svgEdges.get(key) || svgEdges.get(rev);
    if (!src) continue;

    const hadBad = (edge.path || []).some((p) => p.x < 0 || p.y < 350);
    edge.path = src.path;
    edge.distanceMeters = src.distanceMeters;
    if (hadBad) {
      updated++;
      console.log("  fixed", edge.id, edge.from.split("_").pop(), "->", edge.to.split("_").pop(), "pts", edge.path.length);
    }
  }

  floor.generatedAt = new Date().toISOString();
  fs.writeFileSync(jsonPath, JSON.stringify(floor));
  console.log(`${levelId}: ${updated} edge(s) atualizada(s)`);
}

const level = process.argv[2] || "L02";
rebuildFloor(level);
