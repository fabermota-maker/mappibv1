/**
 * Bootstrap — lê appBuild em config.js (sem cache) e carrega CSS/JS com a versão correta.
 * Evita depender de ?v= manual no index.html (F5 com HTML antigo em cache).
 */
(function (global) {
  "use strict";

  const STYLES = ["styles.css"];
  const SCRIPTS = [
    "js/app/config.js",
    "js/app/l00PoiLayerIndex.js",
    "js/app/groundFloorRouteMap.js",
    "js/app/moduleRegistry.js",
    "js/app/deferredLoader.js",
    "js/route-animation-config.js",
    "js/map-nav-icons.js",
    "js/calibration.js",
    "js/navigation-router.js",
    "js/navigation/graphLoader.js",
    "js/navigation/pathfinding.js",
    "js/calibration/calibrationController.js",
    "js/accessibility/accessibilityController.js",
    "js/app/mapController.js",
    "js/app/floorController.js",
    "js/app/poiController.js",
    "js/app/routeController.js",
    "js/app/interfaceController.js",
    "js/app/mapPickController.js",
    "js/geo-transform.js",
    "js/pib-curitiba-location-config.js",
    "js/geofence-service.js",
    "js/gps-reading-collector.js",
    "js/nearest-graph-point.js",
    "js/route-snap-service.js",
    "js/route-tracking-service.js",
    "js/gps-route-orientation.js",
    "js/gps-orientation.js",
    "app.js",
  ];

  const BUILD_KEY = "pibMapBuild";

  function assetUrl(path, build) {
    if (!path) return path;
    const sep = path.includes("?") ? "&" : "?";
    return `${path}${sep}v=${encodeURIComponent(build)}`;
  }

  async function readBuildFromConfig() {
    const res = await fetch(`js/app/config.js?_=${Date.now()}`, { cache: "no-store" });
    if (!res.ok) throw new Error(`config.js HTTP ${res.status}`);
    const text = await res.text();
    const m = text.match(/appBuild:\s*["']([^"']+)["']/);
    if (!m) throw new Error("appBuild não encontrado em config.js");
    return m[1];
  }

  function loadStyle(href, build) {
    return new Promise((resolve, reject) => {
      const link = document.createElement("link");
      link.rel = "stylesheet";
      link.href = assetUrl(href, build);
      link.onload = () => resolve();
      link.onerror = () => reject(new Error(`CSS ${href}`));
      document.head.appendChild(link);
    });
  }

  function loadScript(src, build) {
    return new Promise((resolve, reject) => {
      const s = document.createElement("script");
      s.src = assetUrl(src, build);
      s.async = false;
      s.onload = () => resolve();
      s.onerror = () => reject(new Error(`JS ${src}`));
      document.body.appendChild(s);
    });
  }

  function patchDomAssets(build) {
    document.querySelectorAll("[data-build-src]").forEach((el) => {
      const base = el.getAttribute("data-build-src");
      if (base) el.setAttribute("src", assetUrl(base, build));
    });
  }

  function showBootError(msg) {
    const box = document.createElement("div");
    box.setAttribute("role", "alert");
    box.style.cssText = "position:fixed;inset:0;z-index:99999;display:flex;align-items:center;justify-content:center;padding:24px;background:#0a1220;color:#fff;font:500 16px/1.5 Outfit,sans-serif;text-align:center";
    box.innerHTML = `<div><p>${msg}</p><p style="margin-top:12px;opacity:.75">Use <strong>Ctrl+F5</strong> ou feche e abra a aba novamente.</p></div>`;
    document.body.appendChild(box);
  }

  async function boot() {
    const build = await readBuildFromConfig();
    global.__PIB_BUILD__ = build;
    document.documentElement.dataset.build = build;

    const prev = sessionStorage.getItem(BUILD_KEY);
    sessionStorage.setItem(BUILD_KEY, build);
    if (prev && prev !== build && !sessionStorage.getItem("pibMapBuildReload")) {
      sessionStorage.setItem("pibMapBuildReload", "1");
      location.replace(`${location.pathname}?v=${encodeURIComponent(build)}`);
      return;
    }
    sessionStorage.removeItem("pibMapBuildReload");

    for (const href of STYLES) await loadStyle(href, build);
    patchDomAssets(build);
    for (const src of SCRIPTS) await loadScript(src, build);
  }

  boot().catch((err) => {
    console.error("[PIB boot]", err);
    showBootError("Não foi possível carregar o mapa atualizado.");
  });
})(typeof window !== "undefined" ? window : globalThis);
