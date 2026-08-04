const fs = require("fs");
const path = require("path");

const base = path.join(__dirname, "..", "..");
const src = fs.readFileSync(path.join(base, "2026 mapa pib_pois_tech.svg"), "utf8");
const app = fs.readFileSync(path.join(__dirname, "..", "assets", "mapa-pois.svg"), "utf8");

function ids(s) {
  return [...s.matchAll(/id="(L00_poi[^"]+)"/g)].map((m) => m[1]);
}

const si = ids(src);
const ai = ids(app);
console.log("src only:", si.filter((x) => !ai.includes(x)));
console.log("app only:", ai.filter((x) => !si.includes(x)));

for (const id of [...new Set([...si, ...ai])]) {
  const esc = id.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
  const reG = new RegExp(`<g id="${esc}"[\\s\\S]*?</g>`);
  const reP = new RegExp(`<path id="${esc}"[^>]*/>`);
  const sm = src.match(reG) || src.match(reP);
  const am = app.match(reG) || app.match(reP);
  if (!sm && am) console.log("MISSING in src:", id);
  else if (sm && !am) console.log("MISSING in app:", id);
  else if (sm && am && sm[0] !== am[0]) console.log("DIFF:", id);
}

// search for P000 / entrada / templo extras
for (const pat of [/P000[^"]*/g, /entrada[^"]*/gi, /0033/g, /248[^"]*658/g]) {
  const srcM = [...src.matchAll(pat)].map((m) => m[0]);
  const appM = [...app.matchAll(pat)].map((m) => m[0]);
  if (srcM.length || appM.length) {
    console.log(`\nPattern ${pat}: src=${srcM.length} app=${appM.length}`);
    const onlySrc = srcM.filter((x) => !appM.includes(x));
    const onlyApp = appM.filter((x) => !srcM.includes(x));
    if (onlySrc.length) console.log("  only src:", onlySrc.slice(0, 10));
    if (onlyApp.length) console.log("  only app:", onlyApp.slice(0, 10));
  }
}
