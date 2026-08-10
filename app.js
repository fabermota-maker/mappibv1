(() => {
  "use strict";

  const CONFIG = globalThis.PIBMapConfig;
  if (CONFIG?.appBuild) document.documentElement.dataset.build = CONFIG.appBuild;
  if (CONFIG?.isDev) document.documentElement.dataset.dev = "1";

  function appAssetUrl(path) {
    if (CONFIG?.appAssetUrl) return CONFIG.appAssetUrl(path);
    const v = CONFIG?.appBuild || globalThis.__PIB_BUILD__ || "0";
    const sep = String(path).includes("?") ? "&" : "?";
    return `${path}${sep}v=${encodeURIComponent(v)}`;
  }

  /** Detecta nova versão em config.js e recarrega (ex.: após sync no Drive). */
  function watchBuildUpdates() {
    if (!CONFIG?.appBuild) return;
    const check = async () => {
      try {
        const res = await fetch(`js/app/config.js?_=${Date.now()}`, { cache: "no-store" });
        if (!res.ok) return;
        const text = await res.text();
        const m = text.match(/appBuild:\s*["']([^"']+)["']/);
        const remote = m?.[1];
        if (remote && remote !== CONFIG.appBuild) {
          sessionStorage.setItem("pibMapBuild", remote);
          toast(CONFIG?.isDev ? `Nova versão (v${remote}) — recarregando…` : "Atualizando mapa…");
          setTimeout(() => location.reload(), 700);
        }
      } catch { /* offline */ }
    };
    document.addEventListener("visibilitychange", () => {
      if (document.visibilityState === "visible") check();
    });
    window.addEventListener("focus", check);
  }

  function showBuildBadge() {
    if (!el.floorHint) return;
    const tag = el.floorHint.querySelector(".build-tag");
    if (!CONFIG?.isDev) {
      tag?.remove();
      delete el.floorHint.dataset.build;
      return;
    }
    if (!CONFIG?.appBuild) return;
    el.floorHint.dataset.build = CONFIG.appBuild;
    let badge = tag;
    if (!badge) {
      badge = document.createElement("span");
      badge.className = "build-tag";
      badge.title = "Versão do mapa — confirme se as atualizações foram aplicadas";
      el.floorHint.appendChild(badge);
    }
    badge.textContent = ` · v${CONFIG.appBuild}`;
  }
  /* ============================================================ ELEMENTOS */
  const $ = (id) => document.getElementById(id);
  const el = {
    app: $("app"), panel: $("panel"), panelToggle: $("panelToggle"),
    originInput: $("originInput"), destInput: $("destInput"),
    originList: $("originList"), destList: $("destList"),
    virtualKeyboard: $("virtualKeyboard"),
    swapBtn: $("swapBtn"), hereBtn: $("hereBtn"), routeBtn: $("routeBtn"),
    summary: $("summary"), summaryDist: $("summaryDist"), summaryMeta: $("summaryMeta"),
    summaryTime: $("summaryTime"),
    routeOptions: $("routeOptions"), routePick: $("routePick"),
    routePickLabel: $("routePickLabel"),
    routePickCount: $("routePickCount"), themeBtn: $("themeBtn"),
    floorBtn: $("floorBtn"), floorMenu: $("floorMenu"), floorPicker: $("floorPicker"),
    areaBtn: $("areaBtn"), areaMenu: $("areaMenu"), areaPicker: $("areaPicker"),
    areaBadge: $("areaBadge"),
    roomSelectModal: $("roomSelectModal"), roomModalClose: $("roomModalClose"),
    roomModalCancel: $("roomModalCancel"), roomModalSearch: $("roomModalSearch"),
    roomModalFloors: $("roomModalFloors"), roomModalRooms: $("roomModalRooms"),
    roomModalGo: $("roomModalGo"),
    floorHint: $("floorHint"), floorBanner: $("floorBanner"),
    floorBannerTitle: $("floorBannerTitle"), floorBannerMsg: $("floorBannerMsg"),
    mapTools: $("mapTools"), mapToolsExtras: $("mapToolsExtras"),
    panelActionsHost: $("panelActionsHost"), panelGrab: $("panelGrab"),
    searchLevelSelect: $("searchLevelSelect"),
    browseBar: $("browseBar"),
    steps: $("steps"), clearBtn: $("clearBtn"), navBtn: $("navBtn"), navBtnLabel: $("navBtnLabel"),
    summaryTop: $("summaryTop"), summaryStats: $("summaryStats"), summaryBody: $("summaryBody"),
    summaryRoutePath: $("summaryRoutePath"), routeGuide: $("routeGuide"),
    summaryNav: $("summaryNav"), summaryNavPrev: $("summaryNavPrev"), summaryNavNext: $("summaryNavNext"),
    statusHint: $("statusHint"), scaleHint: $("scaleHint"), svgName: $("svgName"),
    calibBtn: $("calibBtn"), calibPanel: $("calibPanel"), calibHelp: $("calibHelp"),
    calibRealInput: $("calibRealInput"), calibResult: $("calibResult"),
    calibCancel: $("calibCancel"), calibSave: $("calibSave"),
    stage: $("stage"), viewport: $("viewport"), canvas: $("canvas"),
    svgHost: $("svgHost"), overlay: $("overlay"),
    routeLayer: $("routeLayer"),
    routePathBase: $("routePathBase"),
    routePathGlow: $("routePathGlow"),
    routeStart: $("routeStart"), routeEnd: $("routeEnd"), hereMarker: $("hereMarker"),
    mapPickPinPreview: $("mapPickPinPreview"), mapPickPinOrigin: $("mapPickPinOrigin"),
    mapPickPinDest: $("mapPickPinDest"), mapPickMenu: $("mapPickMenu"),
    mapPickBtnOrigin: $("mapPickBtnOrigin"), mapPickBtnDest: $("mapPickBtnDest"),
    mapPickActions: $("mapPickActions"), mapPickLoading: $("mapPickLoading"),
    zoomIn: $("zoomIn"), zoomOut: $("zoomOut"), fitBtn: $("fitBtn"), locBtn: $("locBtn"),
    gpsOrientBtn: $("gpsOrientBtn"), gpsOrientCancel: $("gpsOrientCancel"),
    gpsAccuracyHint: $("gpsAccuracyHint"),
    gpsConfirmModal: $("gpsConfirmModal"), gpsConfirmTitle: $("gpsConfirmTitle"),
    gpsConfirmActions: $("gpsConfirmActions"), gpsConfirmDismiss: $("gpsConfirmDismiss"),
    gpsCompass: $("gpsCompass"), gpsCompassArrow: $("gpsCompassArrow"),
    navOverlay: $("navOverlay"), compassArrow: $("compassArrow"),
    navStepText: $("navStepText"), navDistText: $("navDistText"),
    navDirArrow: $("navDirArrow"), navProgressFill: $("navProgressFill"),
    navTimeRemain: $("navTimeRemain"), navDistRemain: $("navDistRemain"),
    navPrev: $("navPrev"), navNext: $("navNext"), navExit: $("navExit"), navHint: $("navHint"),
    toast: $("toast"),
  };

  /* ============================================================ ESTADO */
  const G = {
    nodes: {},
    adj: {},
    pois: [],
    poisById: new Map(),
    walls: [],
    main: null,
    vbW: 1000,
    vbH: 720,
    autoN: 0,
  };
  const state = {
    origin: null, dest: null, route: null, routeOptions: [], routeIdx: 0, routePickOpen: false,
    scale: 1, minScale: 0.2, maxScale: 8, panX: 0, panY: 0,
    drag: false, sx: 0, sy: 0, px: 0, py: 0, moved: false,
    placingHere: false, placingHereField: "origin", here: null,
    mapPickPreview: null, mapPickOrigin: null, mapPickDest: null, mapPickMenuAnchor: null,
    activeField: null, navIdx: 0, guideStepIdx: 0, heading: 0,
    calibration: null,
    navGraph: null,
    navGraphError: null,
    navLoader: null,
    routeOptionsCache: new Map(),
    navGraphCacheSignature: "",
    graphNodeIdsByBase: new Map(),
    l00PoiIndexSvg: null,
    l00PoiIndexGraphSignature: "",
    calibMode: false, calibStep: 0, calibPoints: [],
    walkingSpeedMps: CONFIG.walkingSpeedMps || 1.2,
    activeLevel: "L00",
    floorMenuOpen: false,
    areaMenuOpen: false,
    searchGroup: "all",
    searchLevel: "all", // padrão: todos os níveis
    floorViews: {}, // { L00: SVGElement, L01: SVGElement, ... }
    floorMeta: {},  // { L00: { vbW, vbH }, ... }
    floorWalls: {}, // { B01: [poly[]], B02: [poly[]], L01: ... }
    userNav: null,
    userLocation: null,
    gpsOrientation: null,
    liveNav: null,
    liveMapMatchEnhancer: null,
    roomModalFloor: null,
    roomModalOrigin: null,
    roomModalDest: null,
  };

  const CAT_LABEL = {
    acesso: "Entrada/Acesso", apoio: "Apoio", servico: "Serviço",
    ambiente: "Ambiente", alimentacao: "Alimentação", estacionamento: "Estacionamento",
  };

  /* ============================================================ UTIL */
  const dist = (a, b) => Math.hypot(a.x - b.x, a.y - b.y);
  const norm = (s = "") => s.toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "");
  /** Normaliza texto de busca (sem acentos, pontuação vira espaço). */
  const normSearch = (s = "") => norm(s).replace(/[.\-_/]+/g, " ").replace(/\s+/g, " ").trim();

  /** Correções ortográficas comuns (chave sem acento → forma correta). */
  const PT_SPELLING = {
    oracao: "oração",
    formacao: "formação",
    comunicacao: "comunicação",
    transmicao: "transmissão",
    transmissao: "transmissão",
    ministerio: "ministério",
    espaco: "espaço",
    recepcao: "recepção",
    refeitorio: "refeitório",
    ginasio: "ginásio",
    auditorio: "auditório",
    banisterio: "batistério",
    batisterio: "batistério",
    conexao: "conexão",
    elevacao: "elevação",
    estacao: "estação",
    acolher: "acolher",
    jardim: "jardim",
    bebedouduro: "bebedouro",
    agua: "água",
    esportes: "esportes",
    albert: "Albert",
    encomun: "Encomun",
  };

  const POI_ACRONYMS = new Set(["cf", "rgo", "abasc", "wc", "ti", "rh", "adm"]);

  const PT_LOWER_WORDS = new Set([
    "de", "da", "do", "das", "dos", "e", "em", "na", "no", "nas", "nos",
    "a", "o", "as", "os", "por", "com", "sem",
  ]);

  function editDistance(a, b) {
    if (a === b) return 0;
    if (!a?.length) return b?.length || 0;
    if (!b?.length) return a.length;
    let prev = Array.from({ length: b.length + 1 }, (_, i) => i);
    for (let i = 1; i <= a.length; i++) {
      const cur = [i];
      for (let j = 1; j <= b.length; j++) {
        cur[j] = a[i - 1] === b[j - 1]
          ? prev[j - 1]
          : 1 + Math.min(prev[j], cur[j - 1], prev[j - 1]);
      }
      prev = cur;
    }
    return prev[b.length];
  }

  function formatPoiWord(word, isFirst) {
    if (word === "·" || word === "|") return word;
    const bare = word.replace(/([.,;:!?]+)$/, "");
    const punct = word.slice(bare.length);
    const lower = bare.toLowerCase();
    if (POI_ACRONYMS.has(lower)) return lower.toUpperCase() + punct;
    if (PT_SPELLING[lower]) {
      const fixed = PT_SPELLING[lower];
      if (isFirst) return fixed.charAt(0).toUpperCase() + fixed.slice(1) + punct;
      return fixed + punct;
    }
    if (!isFirst && PT_LOWER_WORDS.has(lower)) return lower + punct;
    if (/^[A-ZÁÉÍÓÚÂÊÔÃÕÇ]{2,}$/.test(bare) && !POI_ACRONYMS.has(lower)) {
      const cased = lower.charAt(0).toUpperCase() + lower.slice(1);
      return (isFirst ? cased : lower) + punct;
    }
    if (!isFirst) return lower + punct;
    return lower.charAt(0).toUpperCase() + lower.slice(1) + punct;
  }

  function formatPoiDisplayName(text) {
    if (!text) return text;
    const parts = String(text).trim().split(/\s+/).filter(Boolean);
    return parts.map((w, i) => formatPoiWord(w, i === 0)).join(" ");
  }

  function fixPortugueseAccents(text) {
    if (!text) return text;
    return String(text).replace(/\b([A-Za-zÀ-ÿ]+)\b/g, (word) => {
      const key = norm(word);
      const fix = PT_SPELLING[key];
      if (!fix) return word;
      if (word === word.toUpperCase() && word.length > 2) {
        return fix.charAt(0).toUpperCase() + fix.slice(1);
      }
      if (word[0] === word[0].toUpperCase()) {
        return fix.charAt(0).toUpperCase() + fix.slice(1);
      }
      return fix;
    });
  }

  function searchQueryCorrection(query) {
    const q = normSearch(query);
    if (q.length < 3) return null;
    let best = null;
    let bestDist = Infinity;
    for (const [key, value] of Object.entries(PT_SPELLING)) {
      if (key === q) return value;
      const d = editDistance(q, key);
      const maxLen = Math.max(q.length, key.length);
      if (maxLen < 4) continue;
      if (d <= 1 && d < bestDist) {
        bestDist = d;
        best = value;
      } else if (d <= 2 && maxLen >= 6 && d / maxLen <= 0.34 && d < bestDist) {
        bestDist = d;
        best = value;
      }
    }
    return best;
  }

  const Cal = () => (typeof MapCalibration !== "undefined" ? MapCalibration : null);

  function poiSearchHaystacks(poi) {
    if (!poi) return [];
    if (poi._searchHaystacks) return poi._searchHaystacks;
    const raw = poiRawKey(poi);
    const aliases = (CONFIG.poiSearchAliases || {})[raw]
      || (CONFIG.poiSearchAliases || {})[poi.rawId]
      || [];
    const layerTerms = poi.layerSearchTerms || [];
    poi._searchHaystacks = [
      poi.name,
      poi.searchLabel,
      poi.building,
      poi.level,
      poi.code,
      raw,
      poi.rawId,
      CAT_LABEL[poi.cat] || "",
      ...aliases,
      ...layerTerms,
    ].filter(Boolean).map((s) => normSearch(String(s)));
    return poi._searchHaystacks;
  }

  function poiSearchScore(poi, query, normalizedQuery = null) {
    const q = normalizedQuery ?? normSearch(String(query || "").trim());
    if (!q) return 1;
    let best = 0;
    for (const h of poiSearchHaystacks(poi)) {
      if (!h) continue;
      if (h === q) best = Math.max(best, 100);
      else if (h.startsWith(q)) best = Math.max(best, 85);
      else if (h.split(/\s+/).some((w) => w === q)) best = Math.max(best, 78);
      else if (h.split(/\s+/).some((w) => w.startsWith(q))) best = Math.max(best, 68);
      else if (h.includes(q)) best = Math.max(best, 50);
      else {
        for (const w of h.split(/\s+/)) {
          if (w.length < 3 || q.length < 3) continue;
          const d = editDistance(q, w);
          const maxLen = Math.max(q.length, w.length);
          if (d <= 1 && q.length >= 4) best = Math.max(best, 72);
          else if (d <= 2 && q.length >= 5 && d / maxLen <= 0.35) best = Math.max(best, 58);
        }
      }
    }
    return best;
  }

  function poiMatchesSearch(poi, query) {
    return poiSearchScore(poi, query) > 0;
  }

  function applyPoiDisplayName(poi) {
    if (!poi) return poi;
    const raw = poiRawKey(poi);
    const display = (CONFIG.poiDisplayNames || {})[raw]
      || (CONFIG.poiDisplayNames || {})[poi.rawId];
    if (display) poi.name = display;
    poi.name = fixPortugueseAccents(formatPoiDisplayName(poi.name || ""));
    return poi;
  }

  function getMetersPerUnit() {
    if (state.calibration?.metersPerUnit > 0) return state.calibration.metersPerUnit;
    return CONFIG.metersPerUnit;
  }

  const fmtMeters = (u) => {
    const m = u * getMetersPerUnit();
    return m < 1000 ? `${Math.round(m)} m` : `${(m / 1000).toFixed(1)} km`;
  };

  function fmtRouteTime(lengthUnits) {
    const cal = Cal();
    const meters = lengthUnits * getMetersPerUnit();
    const secs = cal
      ? cal.calculateWalkingTimeSeconds(meters, state.walkingSpeedMps)
      : meters / state.walkingSpeedMps;
    const label = cal ? cal.formatWalkingTime(secs) : `${Math.max(1, Math.round(secs / 60))} min`;
    const accuracy = state.calibration?.accuracy === "confirmed" ? "" : " · estimado";
    return `≈ ${label}${accuracy}`;
  }

  function fmtNavTimeShort(lengthUnits) {
    const meters = lengthUnits * getMetersPerUnit();
    const cal = Cal();
    const secs = cal
      ? cal.calculateWalkingTimeSeconds(meters, state.walkingSpeedMps)
      : meters / state.walkingSpeedMps;
    return `${Math.max(1, Math.round(secs / 60))} min`;
  }

  function navRemainingLength(fromIdx) {
    const route = state.route;
    const p = navViewPoints(route);
    if (!p || p.length < 2) return 0;
    let len = 0;
    const start = Math.max(0, Math.min(fromIdx, p.length - 2));
    for (let j = start; j < p.length - 1; j++) len += dist(p[j], p[j + 1]);
    const legs = route?.legs || [];
    if (legs.length > 1) {
      const cur = navLegIndex(route);
      for (let i = cur + 1; i < legs.length; i++) {
        const pts = legs[i].points || [];
        for (let j = 1; j < pts.length; j++) len += dist(pts[j - 1], pts[j]);
      }
    }
    return len;
  }

  function toast(msg) {
    if (/nenhuma rota dispon/i.test(String(msg || ""))) return;
    clearTimeout(toast._t);
    el.toast.textContent = msg;
    el.toast.classList.add("show");
    toast._t = setTimeout(() => el.toast.classList.remove("show"), 2400);
  }

  function updateScaleHint() {
    if (!el.scaleHint) return;
    const c = state.calibration;
    if (!CONFIG.isDev || !c) {
      el.scaleHint.hidden = true;
      el.scaleHint.textContent = "";
      return;
    }
    el.scaleHint.hidden = false;
    const kind = c.accuracy === "confirmed" ? "confirmada" : "estimada (escala gráfica)";
    el.scaleHint.textContent =
      `Escala ${kind}: ${c.unitsPerMeter.toFixed(2)} un/m · ${c.metersPerUnit.toFixed(4)} m/un` +
      ` · ref. ${c.referenceName} (${c.realDistanceMeters.toFixed(2)} m)`;
  }

  function setupDevUi() {
    if (CONFIG.isDev) document.body.classList.add("is-dev");
    else document.body.classList.remove("is-dev");
    const box = $("calibBox");
    const foot = $("devFoot");
    if (box) box.hidden = !CONFIG.isDev;
    if (foot) foot.hidden = !CONFIG.isDev;
  }

  function applyCalibration(calibration, { persist = false } = {}) {
    if (!calibration) return;
    const vb = { x: 0, y: 0, width: G.vbW, height: G.vbH };
    const cal = Cal();
    if (cal) {
      const check = cal.validateCalibration(calibration, vb);
      if (!check.ok) {
        console.warn("Calibração com avisos:", check.issues);
      }
    }
    state.calibration = calibration;
    CONFIG.metersPerUnit = calibration.metersPerUnit;
    updateScaleHint();
    if (state.route) {
      el.summaryDist.textContent = fmtMeters(state.route.length);
      if (el.summaryTime) el.summaryTime.textContent = fmtRouteTime(state.route.length);
    }
    if (persist) saveCalibrationPayload();
  }

  function buildCalibrationPayload() {
    return {
      map: {
        id: "pib-curitiba",
        version: "1.0.0",
        viewBox: { x: 0, y: 0, width: G.vbW, height: G.vbH },
      },
      calibration: state.calibration,
      references: state.calibration ? [{
        id: state.calibration.referenceId,
        name: state.calibration.referenceName,
        pointA: state.calibration.startPoint,
        pointB: state.calibration.endPoint,
        realDistanceMeters: state.calibration.realDistanceMeters,
        digitalDistance: state.calibration.digitalDistance,
        unitsPerMeter: state.calibration.unitsPerMeter,
      }] : [],
      walkingSpeedMetersPerSecond: state.walkingSpeedMps,
      notes: "Medidas estimadas por escala gráfica (Batistério 6,80 m) até múltiplas referências confirmadas.",
    };
  }

  async function saveCalibrationPayload() {
    const payload = buildCalibrationPayload();
    try {
      localStorage.setItem("pib-map-calibration", JSON.stringify(payload));
    } catch { /* ignore */ }
    try {
      const res = await fetch("/api/calibration", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      if (res.ok) toast("Calibração salva.");
      else toast("Calibração aplicada (salvamento local).");
    } catch {
      toast("Calibração aplicada (navegador).");
    }
  }

  async function loadCalibration() {
    // 1) localStorage
    try {
      const raw = localStorage.getItem("pib-map-calibration");
      if (raw) {
        const data = JSON.parse(raw);
        if (data?.calibration?.metersPerUnit) {
          if (data.walkingSpeedMetersPerSecond) state.walkingSpeedMps = data.walkingSpeedMetersPerSecond;
          applyCalibration(data.calibration);
          return true;
        }
      }
    } catch { /* ignore */ }

    // 2) arquivo JSON
    try {
      const res = await fetch(CONFIG.calibrationUrl, { cache: "no-store" });
      if (res.ok) {
        const data = await res.json();
        if (data?.walkingSpeedMetersPerSecond) state.walkingSpeedMps = data.walkingSpeedMetersPerSecond;
        if (data?.calibration?.metersPerUnit) {
          applyCalibration(data.calibration);
          return true;
        }
      }
    } catch { /* ignore */ }
    return false;
  }

  async function loadNavigation() {
    state.navGraph = null;
    state.navGraphError = null;
    if (!globalThis.NavigationRouter) {
      console.warn("NavigationRouter não carregado");
      return false;
    }

    function getNavLoader() {
      if (!state.navLoader && globalThis.NavigationGraphLoader) {
        state.navLoader = NavigationGraphLoader.create({ baseUrl: "data/navigation/" });
      }
      return state.navLoader;
    }

    async function ensureNavGraphFloors(...levels) {
      const loader = getNavLoader();
      const ids = [...new Set(levels.filter(Boolean))];
      if (!loader || !ids.length) return state.navGraph;
      try {
        await loader.ensureFloors(ids);
        state.navGraph = loader.getGraph();
        refreshNavigationCaches();
        invalidateTempleEntranceCache();
        syncPoisFromNavigation(loader.getMeta()?.poiCatalog || [], { injectAllFloors: true });
        rebuildL00PoiIndex();
        injectHiddenRoutePois();
        injectHiddenSearchPois();
      } catch (err) {
        console.error("ensureNavGraphFloors:", err);
        state.navGraphError = String(err.message || err);
      }
      return state.navGraph;
    }
    state.ensureNavGraphFloors = ensureNavGraphFloors;
    state.ensureNavGraphForTrip = ensureNavGraphForTrip;

    function syncPoisFromNavigation(poiSource, { injectAllFloors = false } = {}) {
      const list = poiSource || [];
      for (const poi of G.pois) {
        const match = list.find((p) =>
          p.rawId === poi.rawId
          || p.id === poi.rawId
          || (p.id && poi.rawId && p.id.endsWith(poi.rawId))
        );
        if (match?.nodeIds?.length) {
          const raw = poi.rawId || poiRawKey(poi);
          const preferred = CONFIG.poiAnchors?.[raw];
          const legacyMap = {
            L00_N0030: "L00_node_0037_jardim",
            L00_N0028: "L00_node_0035_espaco_servir",
            L00_N0034: "L00_node_0042_cf",
            L00_N0038: "L00_node_0045_rgo",
            L00_N0051: "L00_node_0001_area_kids_t",
            L00_N0007_estacionamento_motos: "L00_node_0002",
            L00_N0084: "L00_node_0084",
            L00_N0068: "L00_node_0072_entrada_templo_02",
            L00_N0088: "L00_node_0088__entrada_templo_01",
            L00_N0072: "L00_node_0072_entrada_templo_02",
            L00_N0033: "L00_node_0033_corredor_servir",
            L00_N0016_entrada_lateral_templo_02: "L00_node_0072_entrada_templo_02",
            L00_N0013_entrada_lateral_templo_01: "L00_node_0088__entrada_templo_01",
            L00_N0029: "L00_node_0035_espaco_servir",
          };
          let nodeIds = match.nodeIds.map((id) => legacyMap[id] || id);
          if (preferred) nodeIds = [preferred, ...nodeIds.filter((id) => id !== preferred)];
          poi.navNodeIds = [...new Set(nodeIds)];
          poi.navId = match.id;
          const ov = poiLevelOverride(poi.rawId || poi.id);
          if (match.level && !ov?.level) poi.level = match.level;
          if (match.mapLevel && !ov?.mapLevel) poi.mapLevel = match.mapLevel;
          if (match.building) poi.building = match.building;
          if (match.accessNote) poi.accessNote = match.accessNote;
          const nid = poi.navNodeIds[0];
          const node = state.navGraph?.nodesById?.get(nid);
          if (node) {
            poi.anchor = nid;
            poi.snap = { x: node.x, y: node.y };
            const campus = CONFIG.poiIconCampus?.[raw];
            if (campus) {
              poi.iconX = campus.x;
              poi.iconY = campus.y;
              poi.x = campus.x;
              poi.y = campus.y;
            } else if (poi.iconX == null && poi.iconY == null) {
              poi.iconX = node.x;
              poi.iconY = node.y;
            }
          } else if (nid && G.nodes[nid]) {
            poi.anchor = nid;
            poi.snap = { x: G.nodes[nid].x, y: G.nodes[nid].y };
          }
        }
        delete poi._searchHaystacks;
        enrichPoiMeta(poi);
        applyInjectedPoiIcon(poi);
      }

      for (const jp of list) {
        const already = G.pois.some((p) =>
          p.navId === jp.id || p.rawId === jp.rawId || p.id === jp.rawId
        );
        if (already || !jp.nodeIds?.length) continue;
        if (jp.rawId === "P020_espaco_servir" && jp.level === "B01") {
          const onCampus = G.pois.some((p) => {
            const parsed = l00()?.parsePoiLayerName(p.rawId || p.id || "");
            return parsed?.rawName === "espaco_servir";
          });
          if (onCampus) continue;
        }
        const nid = jp.nodeIds[0];
        const node = state.navGraph?.nodesById?.get(nid);
        const lvl = jp.level || node?.level || "L00";
        const isOtherFloor = lvl !== "L00";
        if (!node && !injectAllFloors) continue;
        if (!node && injectAllFloors) {
          const raw = jp.rawId || jp.id;
          G.pois.push(enrichPoiMeta({
            id: String(raw).startsWith(lvl) ? raw : (isOtherFloor ? `${lvl}_${raw}` : raw),
            rawId: raw,
            name: jp.name || decodePoiName(jp.rawId || jp.id),
            x: 0,
            y: 0,
            level: lvl,
            mapLevel: jp.mapLevel,
            building: jp.building,
            group: jp.group,
            cat: jp.cat || "acesso",
            accessNote: jp.accessNote || null,
            navNodeIds: jp.nodeIds.slice(),
            navId: jp.id,
            anchor: nid,
            iconHidden: true,
          }));
          continue;
        }
        if (!node) continue;
        if (!isOtherFloor && !jp.inject) continue;
        const raw = jp.rawId || jp.id;
        const poi = enrichPoiMeta({
          id: String(raw).startsWith(node.level) ? raw : (isOtherFloor ? `${node.level}_${raw}` : raw),
          rawId: raw,
          name: jp.name || decodePoiName(jp.rawId || jp.id),
          x: node.x,
          y: node.y,
          iconX: node.x,
          iconY: node.y,
          level: jp.level || node.level || "L00",
          mapLevel: jp.mapLevel || (floorById(jp.level || node.level)?.mapUrl ? (jp.level || node.level) : undefined),
          building: jp.building,
          group: jp.group,
          cat: jp.cat || "acesso",
          accessNote: jp.accessNote || null,
          navNodeIds: jp.nodeIds.slice(),
          navId: jp.id,
          anchor: nid,
          snap: { x: node.x, y: node.y },
          iconHidden: true,
        });
        G.pois.push(poi);
        applyInjectedPoiIcon(poi);
      }
      // L06: normaliza exclusivamente os POIs das salas da ala direita e cria
      // a representação da Sala 21 usando a mesma porta navegável da sala vizinha.
      G.pois.forEach((poi) => {
        if (!L06_EAST_ROOM_OVERRIDES[poi?.rawId]) return;
        enrichPoiMeta(poi);
        applyL06EastRoomOverride(poi);
      });
      if (!G.pois.some((poi) => poi.id === L06_SALA_21_POI.id)) {
        const node = state.navGraph?.nodesById?.get(L06_SALA_21_POI.nodeId);
        if (node && graphNodeHasEdges(L06_SALA_21_POI.nodeId)) {
          G.pois.push(enrichPoiMeta({
            ...L06_SALA_21_POI,
            x: node.x,
            y: node.y,
            iconX: node.x,
            iconY: node.y,
            level: "L06",
            mapLevel: "L06",
            building: "Administrativo",
            group: "salas",
            cat: "geral",
            navNodeIds: [L06_SALA_21_POI.nodeId],
            graphNodeId: L06_SALA_21_POI.nodeId,
            anchor: L06_SALA_21_POI.nodeId,
            snap: { x: node.x, y: node.y },
          }));
        }
      }
      G.pois.forEach((p) => applyInjectedPoiIcon(p));
      G.pois.sort((a, b) => (a.searchLabel || a.name).localeCompare(b.searchLabel || b.name, "pt-BR"));
      rebuildPoiCaches();
      syncPoiHitAreas(state.floorViews?.L00);
    }

    try {
      const loader = getNavLoader();
      let result;
      try {
        result = await loader.loadInitialLevel();
      } catch (lazyErr) {
        console.warn("Navigation lazy load — fallback monolito:", lazyErr.message);
        result = await loader.loadMonolith(CONFIG.navigationUrl);
      }

      state.navGraph = result.graph;
        refreshNavigationCaches();
      invalidateTempleEntranceCache();
      validatedTempleEntrances();
      if (globalThis.GroundFloorRouteMap) {
        const rep = GroundFloorRouteMap.validateAll(state.navGraph, G.nodes, G.adj);
        console.info("[GroundFloorRoute] Validação L00:", rep);
      }
      const meta = result.meta || {};
      if (meta.metersPerUnit > 0 && !state.calibration) {
        CONFIG.metersPerUnit = meta.metersPerUnit;
      }
      if (meta.walkingSpeedMetersPerSecond) {
        state.walkingSpeedMps = meta.walkingSpeedMetersPerSecond;
      }

      syncPoisFromNavigation(result.poiCatalog || result.graph?.raw?.pois || [], {
        injectAllFloors: !!result.poiCatalog,
      });
      try {
        await globalThis.PIBMapDeferred?.loadLiveNavStack?.();
      } catch (liveErr) {
        console.warn("Live nav defer:", liveErr);
      }
      initLiveNavigation();
      return true;
    } catch (err) {
      state.navGraphError = err;
      console.error("Falha ao carregar navegação:", err);
      return false;
    }
  }

  /** Navegação ao vivo — map matching sobre o grafo (outdoor na fase inicial). */
  function initLiveNavigation() {
    if (state.liveNav || typeof LiveNavigationController === "undefined") return null;
    if (!state.navGraph) return null;

    state.liveNav = LiveNavigationController.create({
      getMetersPerUnit,
      onRouteReplace: (route) => {
        if (!route) return;
        state.route = route;
        paintActiveRouteLeg();
        updateNav();
      },
      onStatusMessage: (msg) => {
        if (el.navHint && state.userNav) el.navHint.textContent = msg;
        if (LiveNavigationConfig?.isDebugNavigation?.() && el.gpsAccuracyHint) {
          el.gpsAccuracyHint.textContent = `[debug] ${msg}`;
        }
      },
    });
    state.liveNav.init({ navGraph: state.navGraph, level: state.activeLevel });
    state.liveMapMatchEnhancer = state.liveNav.createMapMatchEnhancer();
    return state.liveNav;
  }

  async function rerouteFromVirtualNode(matchResult) {
    if (
      !matchResult?.matchedEdgeId ||
      !state.navGraph ||
      !state.dest ||
      typeof LiveVirtualNode === "undefined"
    ) {
      return false;
    }
    const destIds = resolveNavNodeIds(state.dest);
    if (!destIds.length) return false;

    const edgeCache = LiveEdgeCache.buildEdgeCache(state.navGraph, {
      level: state.activeLevel,
      metersPerUnit: getMetersPerUnit(),
    });

    const route = LiveVirtualNode.calculateRouteFromVirtualNode({
      baseGraph: state.navGraph,
      matchResult,
      destinationNodeIds: destIds,
      routePreferences: routeOptionsFromJson(),
      edgeCache,
    });

    if (!route) return false;
    state.route = route;
    paintActiveRouteLeg();
    updateNav();
    return true;
  }

  /** Contagem de locais pesquisáveis por andar (após navigation.json). */
  function countLocaisForFloor(floorId) {
    return (G.pois || []).filter((p) => {
      enrichPoiMeta(p);
      return isSearchablePoi(p) && (p.level || "L00") === floorId;
    }).length;
  }

  /** Código curto na UI: L00→T, L01→L1, B01→B1 (ids internos permanecem L01/B01). */
  function formatFloorTag(levelId) {
    return CONFIG.formatFloorTag(levelId);
  }

  /** Indicador por área: T | N locais · L1 | … · L5 | em breve */
  function renderFloorLocaisHint(overrideText) {
    if (!el.statusHint) return;
    if (overrideText) {
      el.statusHint.classList.remove("hint--floors");
      el.statusHint.textContent = overrideText;
      return;
    }
    el.statusHint.classList.add("hint--floors");
    const rows = visibleFloors().map((f) => {
      const tag = formatFloorTag(f.id);
      const n = countLocaisForFloor(f.id);
      const ready = !!f.ready && n > 0;
      const val = ready ? `${n} ${n === 1 ? "local" : "locais"}` : "em breve";
      return `<div class="floor-stat"><span class="floor-stat__id">${tag}</span><span class="floor-stat__sep">|</span><span class="floor-stat__val">${val}</span></div>`;
    });
    el.statusHint.innerHTML = rows.join("");
  }

  function poiLevel(poi) {
    if (!poi) return "L00";
    // Roteamento: nível do grafo (B01/B02/L01…), não o mapa onde o ícone aparece (mapLevel)
    if (poi.level) return poi.level;
    if (poi.anchor && state.navGraph?.nodesById.has(poi.anchor)) {
      return state.navGraph.nodesById.get(poi.anchor).level || "L00";
    }
    const fromId = levelFromId(poi.rawId || poi.id);
    if (fromId) return fromId;
    if (poi.mapLevel) return poi.mapLevel;
    return "L00";
  }

  /** Nível exibido ao usuário (ex.: B01 Subsolo), independente do mapa L00. */
  function poiDisplayLevel(poi) {
    if (!poi) return "L00";
    return poi.level || poi.mapLevel || poiLevel(poi);
  }

  /** Título curto na lista/campo: "Área Kids · L1" (sem "2º andar · ADM — Administrativo"). */
  function poiSuggestTitle(poi) {
    if (!poi) return "";
    if (poi.id === "__here__") return poi.searchLabel || poi.name || "Estou aqui";
    if (poi.startKidsGuide) return poi.searchLabel || poi.name;
    const name = poi.name || "Local";
    const lvl = poiDisplayLevel(poi);
    if (!lvl || lvl === "L00") return name;
    return `${name} · ${formatFloorTag(lvl)}`;
  }

  /** Área Kids T (térreo) — origem/destino no L00. */
  function isAreaKidsTerracoPoi(poi) {
    if (!poi) return false;
    const id = norm(poi.rawId || poi.id || "");
    const n = norm(poi.name || "");
    return /area_kids_t|area kids t|^p007t_/.test(id) || n === "area kids t";
  }

  /** Área Kids é destino só no L01 (demais andares / L00 não entram na busca). */
  function isAreaKidsDestination(poi) {
    if (!poi || isAreaKidsTerracoPoi(poi)) return false;
    const id = norm(poi.rawId || poi.id || "");
    const n = norm(poi.name || "");
    return /area[_ ]?kids/.test(id) || n === "area kids";
  }

  /** Elevador ginásio (ícone no mapa) — busca usa “Min. Esportes” na entrada lateral. */
  function isElevadorGinasioSearchHidden(poi) {
    if (!poi) return false;
    const id = norm(poi.rawId || poi.id || "");
    return id === "p026_elevador_ginasio";
  }

  function isSearchablePoi(poi) {
    if (!poi || poi.active === false) return false;
    if (poi.routeOnly) return false;
    const raw = poiRawKey(poi);
    if ((CONFIG.hiddenPoiRawIds || []).includes(raw)) return false;
    if (isElevadorGinasioSearchHidden(poi)) return false;
    if (isAreaKidsDestination(poi) && (poi.level || "L00") !== "L01") return false;
    return true;
  }

  /** Nó da malha → POI oficial (ex.: corredor do Espaço Servir). */
  function poiForNavNode(nodeId) {
    const raw = (CONFIG.navNodePoiMap || {})[nodeId];
    if (!raw) return null;
    const indexed = G.poisById?.get(raw);
    if (indexed && isSearchablePoi(indexed)) return indexed;
    return (G.pois || []).find((p) => poiRawKey(p) === raw && isSearchablePoi(p)) || null;
  }

  /** Linha secundária da lista: só o código do andar. */
  function poiSuggestMeta(poi) {
    if (!poi) return "";
    if (poi.startKidsMeta) return poi.startKidsMeta;
    const lvl = poiDisplayLevel(poi);
    const tag = formatFloorTag(lvl);
    if (poi.accessNote) return `${tag} · acesso pelo ${formatFloorTag("L00")}`;
    return tag;
  }

  function poiLevelOverride(rawId) {
    if (!rawId) return null;
    const s = String(rawId);
    const key = s.replace(/^L00_P_/i, "").replace(/^B0\d_P_/i, "");
    const direct = (CONFIG.poiLevels || {})[key] || (CONFIG.poiLevels || {})[s];
    if (direct) return direct;
    if (/espaco_servir/i.test(s)) return CONFIG.poiLevels?.P020_espaco_servir || null;
    if (/jardim/i.test(s) && /L00_poi/i.test(s)) return CONFIG.poiLevels?.P016_jardim || null;
    return null;
  }

  /** Andar do mapa a exibir ao selecionar/clicar no POI (prioriza mapLevel). */
  function poiMapViewLevel(poi) {
    if (!poi) return "L00";
    if (poi.mapLevel) return poi.mapLevel;
    const ov = poiLevelOverride(poi.rawId || poi.id);
    if (ov?.mapLevel) return ov.mapLevel;
    return poiLevel(poi);
  }

  /** POI canônico no térreo (ícone L00_poi_*), quando catálogo legado apontava para B01. */
  function resolveCampusPoiForUi(poi) {
    if (!poi) return poi;
    const key = poiRawKey(poi);
    const isServir = key === "P020_espaco_servir"
      || /espaco_servir/i.test(String(poi.rawId || poi.id || ""));
    if (!isServir) return poi;
    const layer = (G.pois || []).find((p) => {
      const parsed = l00()?.parsePoiLayerName(p.rawId || p.id || "");
      return parsed?.rawName === "espaco_servir";
    });
    if (!layer) return poi;
    const note = poi.accessNote
      || layer.accessNote
      || CONFIG.poiLevels?.P020_espaco_servir?.accessNote
      || null;
    return { ...layer, accessNote: note };
  }

  // Salas na ala direita do L06: o SVG usa rótulos "Sala NN", enquanto o
  // catálogo legado contém nomes de ministérios/recepções. Mantém a malha
  // intacta e vincula cada sala ao acesso navegável já existente.
  const L06_EAST_ROOM_OVERRIDES = Object.freeze({
    L06_poi_0007: { name: "Sala 07", nodeId: "L06_node_0040_entrada_corredor_d" },
    L06_poi_0021: { name: "Sala 08", nodeId: "L06_node_0040_entrada_corredor_d" },
    L06_poi_0040: { name: "Sala 08", nodeId: "L06_node_0040_entrada_corredor_d" },
    L06_poi_0031: { name: "Sala 09", nodeId: "L06_node_0031" },
    L06_poi_0030: { name: "Sala 10", nodeId: "L06_node_0030" },
    L06_poi_0029: { name: "Sala 11", nodeId: "L06_node_0029" },
    L06_poi_0037: { name: "Sala 12", nodeId: "L06_node_0037_auditorio_L05" },
    L06_poi_0023: { name: "Sala 13", nodeId: "L06_node_0023" },
    L06_poi_0008: { name: "Sala 14", nodeId: "L06_node_0008" },
    "L06_poi_0017-2": { name: "Sala 15", nodeId: "L06_node_0017" },
    L06_poi_0001: { name: "Sala 16", nodeId: "L06_node_0001" },
    L06_poi_0020: { name: "Sala 17", nodeId: "L06_node_0001" },
    L06_poi_0009: { name: "Sala 18", nodeId: "L06_node_0009" },
    L06_poi_0039: { name: "Sala 19", nodeId: "L06_node_0019" },
    L06_poi_0018: { name: "Sala 20", nodeId: "L06_node_0018" },
  });

  const L06_SALA_21_POI = Object.freeze({
    id: "L06_virtual_sala_21",
    rawId: "L06_virtual_sala_21",
    name: "Sala 21",
    nodeId: "L06_node_0018",
  });

  function applyL06EastRoomOverride(poi) {
    const spec = L06_EAST_ROOM_OVERRIDES[poi?.rawId];
    if (!spec) return poi;
    const node = state.navGraph?.nodesById?.get(spec.nodeId);
    if (!node || !graphNodeHasEdges(spec.nodeId)) return poi;
    poi.name = spec.name;
    poi.searchLabel = spec.name;
    poi.navNodeIds = [spec.nodeId];
    poi.graphNodeId = spec.nodeId;
    poi.anchor = spec.nodeId;
    poi.snap = { x: node.x, y: node.y };
    delete poi._searchHaystacks;
    return poi;
  }

  /** Pesquisa direta das salas numeradas da ala direita do L06. */
  function searchL06EastRooms(query, floorId = state.activeLevel) {
    if (floorId !== "L06") return [];
    const q = normSearch(query);
    if (!q || !/^sala\b/.test(q)) return [];
    const rooms = [
      ...Object.entries(L06_EAST_ROOM_OVERRIDES).map(([rawId, spec]) => ({ rawId, ...spec })),
      L06_SALA_21_POI,
    ];
    const seen = new Set();
    return rooms
      .filter((room) => {
        const name = normSearch(room.name);
        if (seen.has(name)) return false;
        if (!(name === q || name.startsWith(q) || name.includes(q))) return false;
        seen.add(name);
        return true;
      })
      .map((room) => {
        const nodeId = room.nodeId;
        const node = state.navGraph?.nodesById?.get(nodeId);
        return {
          id: room.rawId,
          rawId: room.rawId,
          name: room.name,
          searchLabel: room.name,
          level: "L06",
          mapLevel: "L06",
          building: "Administrativo",
          group: "salas",
          cat: "geral",
          navNodeIds: [nodeId],
          graphNodeId: nodeId,
          anchor: nodeId,
          x: node?.x || 0,
          y: node?.y || 0,
          iconX: node?.x || 0,
          iconY: node?.y || 0,
          snap: node ? { x: node.x, y: node.y } : null,
        };
      });
  }

  function floorTitle(levelId) {
    const f = floorById(levelId);
    if (!f) return formatFloorTag(levelId) || "andar";
    return `${formatFloorTag(f.id)} — ${f.title}`;
  }

  function floorMenuMeta(f) {
    if (f.mapUrl || (f.ready && countLocaisForFloor(f.id) > 0)) return "";
    if (f.ready) return "";
    return "em breve";
  }

  function elevatorHub(levelId) {
    return (CONFIG.elevatorHubs || {})[levelId] || null;
  }

  function stairHub(levelId) {
    return (CONFIG.stairHubs || {})[levelId] || null;
  }

  /** POI de entrada + nó de transferência vertical (ex.: 0081 → 0077 no T). */
  function appendHubWaypoints(ids, hub, includePoiEntry) {
    if (!hub?.nodeId) return false;
    const transfer = hub.transferNodeId || hub.nodeId;
    let ok = false;
    if (includePoiEntry && hub.nodeId !== transfer && state.navGraph?.nodesById?.has(hub.nodeId)) {
      ids.push(hub.nodeId);
      ok = true;
    }
    if (state.navGraph?.nodesById?.has(transfer)) {
      if (ids[ids.length - 1] !== transfer) ids.push(transfer);
      ok = true;
    }
    return ok;
  }

  function isAdmFloor(levelId) {
    return /^L0[1-6]$/.test(String(levelId || ""));
  }

  /** Andares com mapa publicado T (L00) … L06 e subsolos B01/B02. */
  function isCampusFloor(levelId) {
    return /^(L0[0-6]|B0[12])$/.test(String(levelId || ""));
  }

  function isCrossCampusFloorPair(oLvl, dLvl) {
    return isCampusFloor(oLvl) && isCampusFloor(dLvl) && oLvl !== dLvl;
  }

  /** Campus L00 mesmo andar: malha por edges (evita spurs visuais). ADM/subsolo: idem. */
  function preferGraphRoutePaint(levelId, oLvl, dLvl) {
    if (isAdmFloor(levelId) || isBasementFloor(levelId)) return true;
    if (levelId === "L00" && oLvl === dLvl && oLvl === "L00") return true;
    if (oLvl !== dLvl) return true;
    return false;
  }

  /** Só o campus L00 usa polyline completa de route.points na pintura (malha outdoor). */
  function shouldUseFullRoutePolyline(levelId, oLvl, dLvl) {
    return levelId === "L00" && oLvl === dLvl && oLvl === "L00";
  }

  /** Nós do elevador ADM entre dois andares (inclui origem e destino). */
  function elevatorHubWaypoints(fromLvl, toLvl) {
    const order = ["L00", "L01", "L02", "L03", "L04", "L05", "L06"];
    const i = order.indexOf(fromLvl);
    const j = order.indexOf(toLvl);
    if (i < 0 || j < 0 || i === j) return [];
    const lo = Math.min(i, j);
    const hi = Math.max(i, j);
    const ids = [];
    for (let k = lo; k <= hi; k++) {
      if (!appendHubWaypoints(ids, elevatorHub(order[k]), k === lo)) return [];
    }
    if (i > j) ids.reverse();
    return ids;
  }

  /** Corredor interno do estabelecimento (CF/RGO → hall do templo / elevador T). */
  const L00_INTERIOR_APPROACH = [
    "L00_node_0046",
    "L00_node_0031",
    "L00_node_0065",
    "L00_node_0067",
    "L00_node_0073",
  ];

  const ELEVATOR_T_LABEL = "Elevador T";
  const STAIRS_T_LABEL = "Escadas laterais T";

  function l00InteriorApproachWaypoints() {
    return L00_INTERIOR_APPROACH.filter((id) => state.navGraph?.nodesById?.has(id));
  }

  /** Evita contorno pela Av. Batel no trecho L00 de rotas verticais. */
  function augmentHubWaypointsForL00(oLvl, dLvl, hubWaypoints) {
    const approach = l00InteriorApproachWaypoints();
    if (!approach.length || !hubWaypoints?.length) return hubWaypoints || [];
    if (oLvl === "L00" && isAdmFloor(dLvl)) {
      return mergeWaypointIds(approach, hubWaypoints);
    }
    if (isAdmFloor(oLvl) && dLvl === "L00") {
      return mergeWaypointIds(hubWaypoints, approach.slice().reverse());
    }
    return hubWaypoints;
  }

  /** Viagem envolvendo andares L01–L06 (T↔L1…L6 ou entre andares ADM). */
  function involvesAdmFloorCross(oLvl, dLvl) {
    if (!oLvl || !dLvl || oLvl === dLvl) return false;
    if (oLvl === "L00" && isAdmFloor(dLvl)) return true;
    if (isAdmFloor(oLvl) && dLvl === "L00") return true;
    return isAdmFloor(oLvl) && isAdmFloor(dLvl);
  }

  /** Rotas entre andares T…L06: elevador T ou escada lateral do andar de origem. */
  function buildCrossCampusFloorRoutes(NR, startIds, endIds, origin, dest) {
    const oLvl = poiLevel(origin);
    const dLvl = poiLevel(dest);
    if (!isCrossCampusFloorPair(oLvl, dLvl)) return [];

    const out = [];
    let elevVia = elevatorHubWaypoints(oLvl, dLvl);
    elevVia = augmentHubWaypointsForL00(oLvl, dLvl, elevVia);
    if (elevVia.length >= 2) {
      const elevRoute = buildNamedExternalRoute(NR, startIds, endIds, origin, dest, {
        via: elevVia,
        label: ELEVATOR_T_LABEL,
        avoidParking: false,
        allowParking: true,
        bannedTypes: ["stairs"],
        slot: 1,
      });
      if (elevRoute) {
        elevRoute.kind = "elevator";
        elevRoute.label = ELEVATOR_T_LABEL;
        elevRoute.forceInclude = true;
        pushUniqueRoute(out, elevRoute, MAX_ROUTE_OPTIONS);
      }
    }

    if (isStairRoutePair(oLvl, dLvl)) {
      let stairVia = stairHubWaypoints(oLvl, dLvl);
      stairVia = augmentHubWaypointsForL00(oLvl, dLvl, stairVia);
      if (stairVia.length >= 2) {
        const stairRoute = buildNamedExternalRoute(NR, startIds, endIds, origin, dest, {
          via: stairVia,
          label: STAIRS_T_LABEL,
          avoidParking: false,
          allowParking: true,
          bannedTypes: ["elevator"],
          slot: 2,
        });
        if (stairRoute) {
          stairRoute.viaStairs = true;
          stairRoute.kind = "stairs";
          stairRoute.label = STAIRS_T_LABEL;
          stairRoute.namedExternal = true;
          stairRoute.forceInclude = true;
          pushUniqueRoute(out, stairRoute, MAX_ROUTE_OPTIONS);
        }
      }
    }

    return out;
  }

  /** Par elegível à alternativa “Pela escada lateral” (L00↔L01…L06). */
  function isStairRoutePair(oLvl, dLvl) {
    if (!oLvl || !dLvl || oLvl === dLvl) return false;
    const oOk = oLvl === "L00" || isAdmFloor(oLvl);
    const dOk = dLvl === "L00" || isAdmFloor(dLvl);
    return oOk && dOk && (isAdmFloor(oLvl) || isAdmFloor(dLvl));
  }

  /** Nós da escada lateral entre dois andares (inclui L00 e destino). */
  function stairHubWaypoints(fromLvl, toLvl) {
    const order = ["L00", "L01", "L02", "L03", "L04", "L05", "L06"];
    const i = order.indexOf(fromLvl);
    const j = order.indexOf(toLvl);
    if (i < 0 || j < 0 || i === j) return [];
    const lo = Math.min(i, j);
    const hi = Math.max(i, j);
    const ids = [];
    for (let k = lo; k <= hi; k++) {
      if (!appendHubWaypoints(ids, stairHub(order[k]), k === lo)) return [];
    }
    if (i > j) ids.reverse();
    return ids;
  }

  function isBasementFloor(levelId) {
    return /^B0[12]$/.test(String(levelId || ""));
  }

  /** Rota envolve subsolo B01 e/ou B02 em andares diferentes. */
  function routeInvolvesBasementTransfer(oLvl, dLvl) {
    if (!oLvl || !dLvl || oLvl === dLvl) return false;
    return isBasementFloor(oLvl) || isBasementFloor(dLvl);
  }

  function narniaHubNode(levelId) {
    return (CONFIG.narniaHub || {})[levelId] || null;
  }

  function narniaGateIcon(levelId) {
    return (CONFIG.narniaGateIcons || {})[levelId] || null;
  }

  function encomunHubNode(levelId) {
    return CONFIG.encomunTransfer?.[levelId]?.nodeId || null;
  }

  function encomunGateIcon(levelId) {
    const cfg = CONFIG.encomunTransfer?.[levelId];
    if (!cfg) return null;
    if (cfg.gateIcon) return { ...cfg.gateIcon, nodeId: cfg.nodeId };
    const n = cfg.nodeId && state.navGraph?.nodesById?.get(cfg.nodeId);
    return n ? { x: n.x, y: n.y, nodeId: cfg.nodeId } : null;
  }

  function isBasementEncomunTrip(oLvl, dLvl) {
    return (oLvl === "B01" && dLvl === "B02") || (oLvl === "B02" && dLvl === "B01");
  }

  function isBasementEncomunExitLeg(levelId, oLvl, dLvl) {
    return isBasementEncomunTrip(oLvl, dLvl) && levelId === oLvl;
  }

  function isBasementEncomunEntryLeg(levelId, oLvl, dLvl) {
    return isBasementEncomunTrip(oLvl, dLvl) && levelId === dLvl;
  }

  function isBasementEncomunExitActiveLeg(levelId, oLvl, dLvl) {
    return isBasementEncomunExitLeg(levelId, oLvl, dLvl);
  }

  /** Waypoints obrigatórios B1 ↔ B2 pelo Encomun (não pela escada de Nárnia). */
  function encomunBasementWaypoints(fromLvl, toLvl) {
    const cfg = CONFIG.encomunTransfer || {};
    const b01En = cfg.B01?.nodeId;
    const b01Bridge = cfg.b01BridgeNode;
    const b02En = cfg.B02?.nodeId;
    const b02Bridge = cfg.b02BridgeNode;
    if (fromLvl === "B01" && toLvl === "B02" && b01En && b01Bridge && b02En) {
      return [b01En, b01Bridge, b02Bridge, b02En].filter(Boolean);
    }
    if (fromLvl === "B02" && toLvl === "B01" && b02En && b02Bridge && b01Bridge && b01En) {
      return [b02En, b02Bridge, b01Bridge, b01En].filter(Boolean);
    }
    return [];
  }

  /** Malha + corredor do Espaço Servir quando a origem é B2. */
  function basementTripWaypoints(oLvl, dLvl, dest) {
    if (isBasementEncomunTrip(oLvl, dLvl)) {
      return encomunBasementWaypoints(oLvl, dLvl);
    }
    let via = narniaHubWaypoints(oLvl, dLvl);
    if (oLvl === "B02" && !isBasementFloor(dLvl) && poiRawKey(dest) === "P020_espaco_servir") {
      via = mergeWaypointIds(via, CONFIG.basementServirL00Via || []);
    }
    return via;
  }

  function narniaForbiddenEdgeSetForTrip(oLvl, dLvl) {
    const blocked = narniaForbiddenEdgeSet();
    if (isBasementEncomunTrip(oLvl, dLvl)) {
      const allow = CONFIG.encomunTransfer?.verticalEdgeId || "B01_B02_E_batisterio";
      blocked.delete(allow);
    }
    return blocked;
  }

  function isNarniaEntrancePoi(poi) {
    if (!poi) return false;
    const raw = norm(poi.rawId || poi.id || "");
    const name = norm(poi.name || "");
    const ids = CONFIG.narniaPoiRawIds || [];
    if (ids.some((id) => raw === norm(id))) return true;
    return /entrada.*narnia|narnia.*entrada|porta.*narnia/.test(raw + name);
  }

  /** Andar do ícone da Porta de Nárnia para este POI. */
  function narniaLevelForPoi(poi) {
    if (!poi || !isNarniaEntrancePoi(poi)) return null;
    const raw = norm(poi.rawId || poi.id || "");
    if (raw === "b01_entrada_narnia") return "B01";
    if (raw === "b02_entrada_narnia_map") return "B02";
    if (/b02_entrada_narnia|p028_b02_entrada_narnia/.test(raw)) return "L00";
    return poiLevel(poi);
  }

  function applyNarniaGateIconToPoi(poi) {
    if (!isNarniaEntrancePoi(poi)) return poi;
    const lvl = narniaLevelForPoi(poi) || poiLevel(poi);
    const gate = narniaGateIcon(isBasementFloor(lvl) ? lvl : "L00");
    if (!gate) return poi;
    poi.iconX = gate.x;
    poi.iconY = gate.y;
    poi.x = gate.x;
    poi.y = gate.y;
    return poi;
  }

  /** Quebra um segmento diagonal em L (horizontal + vertical), evitando paredes. */
  function appendOrthogonalSegment(a, b, levelId) {
    const dx = Math.abs(a.x - b.x);
    const dy = Math.abs(a.y - b.y);
    if (dx <= 2.5 || dy <= 2.5) return [a, b];
    const midA = { x: a.x, y: b.y };
    const midB = { x: b.x, y: a.y };
    const crossA = crossesWall(a, midA, levelId) || crossesWall(midA, b, levelId);
    const crossB = crossesWall(a, midB, levelId) || crossesWall(midB, b, levelId);
    let mid = midA;
    if (!crossA && crossB) mid = midA;
    else if (crossA && !crossB) mid = midB;
    else if (!crossA && !crossB) mid = dx >= dy ? midB : midA;
    else mid = dx >= dy ? midB : midA;
    return [a, mid, b];
  }

  /** Converte diagonais longas da polyline em trechos ortogonais (sem atravessar paredes). */
  function orthogonalizeRoutePolyline(points, levelId, eps = 3, minLen = 12) {
    const pts = (points || []).map((p) => ({ x: p.x, y: p.y }));
    if (pts.length < 2) return pts;
    const out = [pts[0]];
    for (let i = 1; i < pts.length; i++) {
      const a = out[out.length - 1];
      const b = pts[i];
      const dx = Math.abs(a.x - b.x);
      const dy = Math.abs(a.y - b.y);
      if (dx > eps && dy > eps && dist(a, b) >= minLen) {
        const segs = appendOrthogonalSegment(a, b, levelId);
        for (let j = 1; j < segs.length; j++) {
          const p = segs[j];
          const last = out[out.length - 1];
          if (!last || dist(last, p) > 0.05) out.push(p);
        }
      } else {
        const last = out[out.length - 1];
        if (!last || dist(last, b) > 0.05) out.push(b);
      }
    }
    return out.length >= 2 ? out : pts;
  }

  /** Spur curto ortogonal até o alvo (ex.: lampião da Porta de Nárnia). */
  function appendOrthogonalEndpoint(points, target, levelId, which) {
    const out = (points || []).map((p) => ({ x: p.x, y: p.y }));
    if (!out.length || !target) return out;
    const idx = which === "start" ? 0 : out.length - 1;
    const tip = out[idx];
    const t = { x: target.x, y: target.y };
    if (dist(tip, t) <= 0.8) {
      out[idx] = t;
      return out;
    }
    const segs = appendOrthogonalSegment(tip, t, levelId);
    if (which === "start") {
      out.splice(0, 1, ...segs);
    } else {
      out.pop();
      out.push(...segs.slice(1));
    }
    return out;
  }

  /** Ajusta o fim/início da polyline ao nó oficial — nunca diagonal longa até o lampião. */
  function refineNarniaEndpoint(pts, levelId, which) {
    const gate = narniaGateIcon(levelId);
    const hub = narniaHubNode(levelId);
    if (!gate || !hub || !pts?.length) return pts;
    const out = pts.map((p) => ({ x: p.x, y: p.y }));
    const hubNode = state.navGraph?.nodesById?.get(hub);
    const hubPt = hubNode ? { x: hubNode.x, y: hubNode.y } : { x: gate.x, y: gate.y };
    const g = { x: gate.x, y: gate.y };
    const idx = which === "start" ? 0 : out.length - 1;
    const tip = out[idx];
    const nearHub = dist(tip, hubPt) <= 48 || dist(tip, g) <= 48;
    if (!nearHub) return out;

    if (dist(tip, hubPt) <= 1.5) {
      if (which === "end" && dist(tip, g) > 0.8 && dist(tip, g) <= 14) {
        return appendOrthogonalEndpoint(out, g, levelId, "end");
      }
      if (which === "start" && dist(tip, g) > 0.8 && dist(tip, g) <= 14) {
        return appendOrthogonalEndpoint(out, g, levelId, "start");
      }
      return out;
    }

    if (dist(tip, hubPt) <= 55) {
      if (which === "end") {
        out.push(...appendOrthogonalSegment(tip, hubPt, levelId).slice(1));
        if (dist(out[out.length - 1], g) > 0.8 && dist(out[out.length - 1], g) <= 14) {
          return appendOrthogonalEndpoint(out, g, levelId, "end");
        }
      } else {
        const segs = appendOrthogonalSegment(tip, hubPt, levelId);
        out.splice(0, 1, ...segs);
        if (dist(out[0], g) > 0.8 && dist(out[0], g) <= 14) {
          return appendOrthogonalEndpoint(out, g, levelId, "start");
        }
      }
    }
    return out;
  }

  function basementExitLegEnd(levelId, oLvl, dLvl) {
    if (!isBasementFloor(oLvl) || isBasementFloor(dLvl)) return false;
    if (levelId === oLvl) return true;
    if (oLvl === "B02" && levelId === "B01") return true;
    return false;
  }

  function basementEntryLegStart(levelId, oLvl, dLvl) {
    if (!isBasementFloor(dLvl) || isBasementFloor(oLvl)) return false;
    if (levelId === dLvl) return true;
    if (dLvl === "B02" && levelId === "B01" && oLvl !== "B01") return true;
    return false;
  }

  function shouldRefineNarniaAtBasementGate(levelId, oLvl, dLvl, which) {
    if (!routeInvolvesBasementTransfer(oLvl, dLvl)) return false;
    if (levelId === "L00") {
      if (which === "end") return isBasementFloor(dLvl) && !isBasementFloor(oLvl);
      if (which === "start") return isBasementFloor(oLvl) && !isBasementFloor(dLvl);
    }
    if (isBasementFloor(levelId)) {
      if (which === "end") return basementExitLegEnd(levelId, oLvl, dLvl);
      if (which === "start") return basementEntryLegStart(levelId, oLvl, dLvl);
    }
    return false;
  }

  function isCrossFloorTrip(oLvl, dLvl) {
    return !!(oLvl && dLvl && oLvl !== dLvl);
  }

  /** Nó do elevador ou escada lateral no andar, conforme a rota escolhida. */
  function verticalHubNodeForLevel(levelId, route = state.route) {
    if (!levelId) return null;
    const useStairs = !!(route?.viaStairs || route?.kind === "stairs");
    const cfg = useStairs ? stairHub(levelId) : elevatorHub(levelId);
    const id = cfg?.nodeId;
    return id && state.navGraph?.nodesById?.has(id) ? id : null;
  }

  function crossFloorExitLeg(levelId, oLvl, dLvl) {
    return isCrossFloorTrip(oLvl, dLvl) && levelId === oLvl && !routeInvolvesBasementTransfer(oLvl, dLvl);
  }

  function crossFloorEntryLeg(levelId, oLvl, dLvl) {
    return isCrossFloorTrip(oLvl, dLvl) && levelId === dLvl && !routeInvolvesBasementTransfer(oLvl, dLvl);
  }

  function crossFloorTransitLeg(levelId, oLvl, dLvl) {
    if (!isCrossFloorTrip(oLvl, dLvl) || routeInvolvesBasementTransfer(oLvl, dLvl)) return false;
    if (levelId === oLvl || levelId === dLvl) return false;
    return isAdmFloor(levelId) || levelId === "L00";
  }

  function refineVerticalHubEndpoint(pts, levelId, route, which) {
    const hubId = verticalHubNodeForLevel(levelId, route);
    if (!hubId || !pts?.length || !state.navGraph) return pts;
    const n = state.navGraph.nodesById.get(hubId);
    if (!n) return pts;
    const out = pts.map((p) => ({ x: p.x, y: p.y }));
    const hubPt = { x: n.x, y: n.y };
    const idx = which === "start" ? 0 : out.length - 1;
    if (dist(out[idx], hubPt) <= 55) out[idx] = hubPt;
    return out;
  }

  /** Ícone oficial do hub vertical (Elevador T / Escadas laterais T) no campus. */
  function verticalHubIconPoint(levelId, route = state.route) {
    const useStairs = !!(route?.viaStairs || route?.kind === "stairs");
    const hub = useStairs ? stairHub(levelId) : elevatorHub(levelId);
    if (!hub?.nodeId) return null;
    const n = state.navGraph?.nodesById?.get(hub.nodeId);
    if (n) return { x: n.x, y: n.y, nodeId: hub.nodeId };
    const raw = useStairs ? "L00_escadas_laterais_t" : "P027_elevador_templo";
    const icon = CONFIG.poiIconCampus?.[raw] || CONFIG.poiRouteEdges?.[raw]?.icon;
    return icon ? { x: icon.x, y: icon.y, nodeId: hub.nodeId } : null;
  }

  function crossFloorExitLegIncomplete(points, levelId, route) {
    const hub = verticalHubIconPoint(levelId, route);
    if (!hub || !points?.length) return true;
    const tip = points[points.length - 1];
    return dist(tip, hub) > 55;
  }

  function poiAnchorsVerticalHub(poi, levelId, route = state.route) {
    const hubId = verticalHubNodeForLevel(levelId, route);
    if (!hubId || !poi) return false;
    return resolveNavNodeIds(poi, "origin").includes(hubId);
  }

  /** Trecho mínimo visível no hub vertical quando origem/destino já está no elevador/escada. */
  function verticalHubSpurPoints(levelId, route = state.route) {
    const hubId = verticalHubNodeForLevel(levelId, route);
    const n = hubId && state.navGraph?.nodesById?.get(hubId);
    if (!n) return null;
    const hubPt = { x: n.x, y: n.y };

    const NR = globalThis.NavigationRouter;
    if (NR?.astar && state.navGraph && hubId) {
      const neighbors = (state.navGraph.adjacency?.get(hubId) || [])
        .map((e) => (e.from === hubId ? e.to : e.from))
        .filter((id) => state.navGraph.nodesById.get(id)?.level === levelId);
      let best = null;
      for (const nid of neighbors) {
        const leg = NR.astar(hubId, [nid], state.navGraph, { avoidParking: false });
        if (leg?.points?.length >= 2) {
          const pts = leg.points.map((p) => ({ x: p.x, y: p.y }));
          const span = dist(pts[0], pts[pts.length - 1]);
          if (span >= 8 && (!best || span > best.span)) {
            best = { points: pts, nodeIds: leg.nodeIds || [hubId, nid], edgeIds: leg.edgeIds || [], span };
          }
        }
      }
      if (best) return best;
    }

    const icon = verticalHubIconPoint(levelId, route);
    const tip = icon && dist(hubPt, icon) > 8
      ? { x: icon.x, y: icon.y }
      : { x: hubPt.x - 18, y: hubPt.y + 10 };
    return {
      points: [hubPt, tip],
      nodeIds: [hubId],
      edgeIds: [],
    };
  }

  /** Prolonga o trecho de saída L00 até o ícone do elevador ou das escadas laterais. */
  function appendVerticalHubExitLeg(pts, levelId, route = state.route) {
    const hub = verticalHubIconPoint(levelId, route);
    if (!hub || !pts?.length) return pts;
    let out = pts.map((p) => ({ x: p.x, y: p.y }));
    const hubPt = { x: hub.x, y: hub.y };
    const tip = out[out.length - 1];
    if (dist(tip, hubPt) <= 0.8) return out;

    const NR = globalThis.NavigationRouter;
    if (NR?.astar && state.navGraph && hub.nodeId) {
      const startId = NR.nearestNodeId(tip, state.navGraph, { level: levelId })
        || (out.length >= 2 ? NR.nearestNodeId(out[out.length - 2], state.navGraph, { level: levelId }) : null);
      if (startId && startId !== hub.nodeId) {
        const mesh = NR.astar(startId, [hub.nodeId], state.navGraph, { avoidParking: false });
        if (mesh?.points?.length >= 2) {
          out = out.concat(mesh.points.slice(1).map((p) => ({ x: p.x, y: p.y })));
          return out;
        }
      }
    }

    const spurMax = Math.max(tol("spurTol", 48), 120);
    const mid = { x: hubPt.x, y: tip.y };
    if (dist(tip, mid) > 0.8 && dist(tip, mid) <= spurMax && !crossesWall(tip, mid, levelId)) {
      out.push(mid);
    }
    const tip2 = out[out.length - 1];
    if (dist(tip2, hubPt) > 0.8 && dist(tip2, hubPt) <= spurMax && !crossesWall(tip2, hubPt, levelId)) {
      out.push(hubPt);
    }
    return out;
  }

  /** Corrige trecho L00 truncado antes do hub vertical (elevador / escadas). */
  function repairCrossFloorExitLegPoints(points, route, levelId) {
    const oLvl = poiLevel(state.origin);
    const dLvl = poiLevel(state.dest);
    if (!crossFloorExitLeg(levelId, oLvl, dLvl) || !crossFloorExitLegIncomplete(points, levelId, route)) {
      return points;
    }

    const sliced = sliceRoutePointsForLevel(route, levelId);
    if (sliced?.length >= 2 && !crossFloorExitLegIncomplete(sliced, levelId, route)) {
      return sliced.map((p) => ({ x: p.x, y: p.y }));
    }

    const fb = buildFloorLegFallbackPoints(levelId, state.origin, state.dest);
    if (fb?.points?.length >= 2 && !isSyntheticStraightSpur(fb.points, fb, route)) {
      return fb.points.map((p) => ({ x: p.x, y: p.y }));
    }
    return appendVerticalHubExitLeg(points, levelId, route);
  }

  /** Trecho de saída do subsolo: completa malha até o nó Nárnia e spur ortogonal ao lampião. */
  function finalizeBasementExitLegPoints(pts, levelId) {
    let out = (pts || []).map((p) => ({ x: p.x, y: p.y }));
    if (out.length < 2) return out;

    const hub = narniaHubNode(levelId);
    const hubNode = hub && state.navGraph?.nodesById?.get(hub);
    const hubPt = hubNode ? { x: hubNode.x, y: hubNode.y } : null;

    if (hub && state.route?.nodeIds?.includes(hub)) {
      const tailed = appendRouteMeshTail(out, state.route, hub, levelId);
      if (tailed?.length >= 2) out = tailed;
    }

    if (hubPt) {
      const tip = out[out.length - 1];
      if (dist(tip, hubPt) > 1.5 && dist(tip, hubPt) <= 55) {
        out.push(...appendOrthogonalSegment(tip, hubPt, levelId).slice(1));
      } else if (dist(tip, hubPt) <= 1.5) {
        out[out.length - 1] = hubPt;
      }
    }

    out = refineNarniaEndpoint(out, levelId, "end");
    return orthogonalizeRoutePolyline(out, levelId);
  }

  /** Trecho B1 → B2: fim no acesso Encomun (linha azul no mapa B1). */
  function finalizeEncomunExitLegPoints(pts, levelId) {
    let out = (pts || []).map((p) => ({ x: p.x, y: p.y }));
    if (out.length < 2) return out;
    const gate = encomunGateIcon(levelId);
    if (gate && out.length >= 1) {
      out[out.length - 1] = { x: gate.x, y: gate.y };
    }
    return out;
  }

  function isBasementExitActiveLeg(levelId, oLvl, dLvl) {
    return isBasementFloor(oLvl) && !isBasementFloor(dLvl) && basementExitLegEnd(levelId, oLvl, dLvl);
  }

  /** Trecho no Térreo ao descer para B1/B2 — termina na Porta de Nárnia (área laranja). */
  function isBasementEntryActiveLeg(levelId, oLvl, dLvl) {
    return levelId === "L00" && !isBasementFloor(oLvl) && isBasementFloor(dLvl);
  }

  function basementExitLegIncomplete(points, levelId, oLvl, dLvl) {
    if (isBasementEncomunExitLeg(levelId, oLvl, dLvl)) {
      const gate = encomunGateIcon(levelId);
      if (!gate || !points?.length) return true;
      return dist(points[points.length - 1], gate) > 55;
    }
    if (isBasementExitActiveLeg(levelId, oLvl, dLvl) || isBasementEntryActiveLeg(levelId, oLvl, dLvl)) {
      const gateLvl = isBasementFloor(levelId) ? levelId : "L00";
      const gate = narniaGateIcon(gateLvl);
      if (!gate || !points?.length) return true;
      return dist(points[points.length - 1], gate) > 55;
    }
    return false;
  }

  /** Reconstrói polyline do trecho no andar quando legs/points falham (lazy load, etc.). */
  function buildFloorLegFallbackPoints(levelId, origin, dest) {
    const NR = globalThis.NavigationRouter;
    if (!NR || !state.navGraph || !origin || !dest) return null;
    const oLvl = poiLevel(origin);
    const dLvl = poiLevel(dest);
    const opts = { blockedEdges: narniaForbiddenEdgeSetForTrip(oLvl, dLvl) };

    const astarLeg = (startId, endId) => {
      if (!startId || !endId || !state.navGraph.nodesById.has(startId) || !state.navGraph.nodesById.has(endId)) {
        return null;
      }
      const leg = NR.astar(startId, [endId], state.navGraph, opts);
      if (!leg?.points?.length) return null;
      return {
        points: leg.points.map((p) => ({ x: p.x, y: p.y })),
        edgeIds: leg.edgeIds || [],
        nodeIds: leg.nodeIds || [],
      };
    };

    const astarThrough = (ids) => {
      if (!ids || ids.length < 2) return null;
      const mergedLegs = [];
      for (let i = 0; i < ids.length - 1; i++) {
        const leg = astarLeg(ids[i], ids[i + 1]);
        if (!leg) return null;
        mergedLegs.push(leg);
      }
      const outPts = [];
      const outEdges = [];
      const outNodes = [];
      mergedLegs.forEach((leg, idx) => {
        if (idx === 0) {
          outPts.push(...leg.points);
          outNodes.push(...leg.nodeIds);
        } else {
          outPts.push(...leg.points.slice(1));
          outNodes.push(...leg.nodeIds.slice(1));
        }
        outEdges.push(...leg.edgeIds);
      });
      return { points: outPts, edgeIds: outEdges, nodeIds: outNodes };
    };

    if (isBasementEncomunExitLeg(levelId, oLvl, dLvl)) {
      const hub = encomunHubNode(levelId);
      const startIds = resolveNavNodeIds(origin, "origin");
      const mesh = hub && startIds[0] ? astarLeg(startIds[0], hub) : null;
      if (mesh?.points?.length >= 2) {
        return { ...mesh, points: finalizeEncomunExitLegPoints(mesh.points, levelId) };
      }
    }

    if (isBasementEncomunEntryLeg(levelId, oLvl, dLvl)) {
      const startIds = [encomunHubNode(levelId)].filter(Boolean);
      const endIds = resolveNavNodeIds(dest, "dest");
      for (const startId of startIds) {
        if (!startId || !endIds[0]) continue;
        const mesh = astarLeg(startId, endIds[0]);
        if (mesh?.points?.length >= 2) return mesh;
      }
    }

    if (isBasementExitActiveLeg(levelId, oLvl, dLvl)) {
      const hub = narniaHubNode(levelId);
      const startIds = resolveNavNodeIds(origin, "origin");
      const mesh = hub && startIds[0] ? astarLeg(startIds[0], hub) : null;
      if (mesh?.points?.length >= 2) {
        return { ...mesh, points: finalizeBasementExitLegPoints(mesh.points, levelId) };
      }
    }

    if (isBasementEntryActiveLeg(levelId, oLvl, dLvl)) {
      const hub = narniaHubNode("L00");
      const startIds = resolveNavNodeIds(origin, "origin");
      const mesh = hub && startIds[0] ? astarLeg(startIds[0], hub) : null;
      if (mesh?.points?.length >= 2) {
        return { ...mesh, points: finalizeBasementExitLegPoints(mesh.points, "L00") };
      }
    }

    if (isBasementFloor(dLvl) && !isBasementFloor(oLvl) && basementEntryLegStart(levelId, oLvl, dLvl)) {
      const hub = narniaHubNode(levelId);
      const endIds = resolveNavNodeIds(dest, "dest");
      const mesh = hub && endIds[0] ? astarLeg(hub, endIds[0]) : null;
      if (mesh?.points?.length >= 2) return mesh;
    }

    if (levelId === "L00" && routeInvolvesBasementTransfer(oLvl, dLvl)) {
      const hub = narniaHubNode("L00");
      if (isBasementFloor(oLvl) && !isBasementFloor(dLvl) && hub) {
        const endIds = resolveNavNodeIds(dest, "dest");
        let mesh = null;
        if (oLvl === "B02" && poiRawKey(dest) === "P020_espaco_servir") {
          const via = CONFIG.basementServirL00Via || [];
          if (via.length && endIds[0]) mesh = astarThrough([hub, ...via, endIds[0]]);
        }
        if (!mesh?.points?.length && endIds[0]) mesh = astarLeg(hub, endIds[0]);
        if (mesh?.points?.length >= 2) {
          return { ...mesh, points: refineNarniaEndpoint(mesh.points, "L00", "start") };
        }
      }
      if (isBasementFloor(dLvl) && !isBasementFloor(oLvl) && hub) {
        const startIds = resolveNavNodeIds(origin, "origin");
        const mesh = startIds[0] ? astarLeg(startIds[0], hub) : null;
        if (mesh?.points?.length >= 2) {
          return { ...mesh, points: finalizeBasementExitLegPoints(mesh.points, "L00") };
        }
      }
    }

    if (levelId === oLvl && oLvl === dLvl) {
      const startIds = resolveNavNodeIds(origin, "origin");
      const endIds = resolveNavNodeIds(dest, "dest");
      return astarLeg(startIds[0], endIds[0]);
    }

    if (crossFloorExitLeg(levelId, oLvl, dLvl)) {
      const hubId = verticalHubNodeForLevel(levelId, state.route);
      const startIds = resolveNavNodeIds(origin, "origin");
      if (!hubId || !startIds[0]) return null;
      if (startIds.includes(hubId)) {
        return verticalHubSpurPoints(levelId, state.route);
      }
      let mesh = null;
      if (levelId === "L00" && oLvl === "L00" && isAdmFloor(dLvl)) {
        const via = l00InteriorApproachWaypoints();
        if (via.length) mesh = astarThrough([startIds[0], ...via, hubId]);
      }
      if (!mesh?.points?.length) mesh = astarLeg(startIds[0], hubId);
      if (mesh?.points?.length >= 2) return mesh;
    }

    if (crossFloorEntryLeg(levelId, oLvl, dLvl)) {
      const hubId = verticalHubNodeForLevel(levelId, state.route);
      const endIds = resolveNavNodeIds(dest, "dest");
      if (hubId && endIds.includes(hubId)) {
        return verticalHubSpurPoints(levelId, state.route);
      }
      const mesh = hubId && endIds[0] ? astarLeg(hubId, endIds[0]) : null;
      if (mesh?.points?.length >= 2) return mesh;
    }

    if (crossFloorTransitLeg(levelId, oLvl, dLvl)) {
      return verticalHubSpurPoints(levelId, state.route);
    }

    return null;
  }

  /** Ponto no grafo ou ícone do POI para desenhar rota. */
  function poiGraphPoint(poi) {
    if (!poi) return null;
    const ids = resolveNavNodeIds(poi, "origin");
    if (ids[0] && state.navGraph?.nodesById?.has(ids[0])) {
      const n = state.navGraph.nodesById.get(ids[0]);
      return { x: n.x, y: n.y };
    }
    const icon = poiIcon(poi) || poi.snap;
    if (icon && isFinite(icon.x) && isFinite(icon.y)) return { x: icon.x, y: icon.y };
    if (isFinite(poi.x) && isFinite(poi.y)) return { x: poi.x, y: poi.y };
    return null;
  }

  function syncMapViewBeforeRoutePaint() {
    const lvl = state.activeLevel || "L00";
    const meta = state.floorMeta[lvl] || state.floorMeta.L00;
    const svg = el.svgHost?.querySelector("svg");
    if (svg) {
      const vb = (svg.getAttribute("viewBox") || "").split(/[\s,]+/).map(Number);
      if (vb.length >= 4 && vb[2] > 0 && vb[3] > 0) {
        setMapViewBox(vb[2], vb[3], vb[0] || 0, vb[1] || 0);
        apply();
        return;
      }
    }
    if (meta?.vbW) {
      setMapViewBox(meta.vbW, meta.vbH, meta.vbX || 0, meta.vbY || 0);
    }
    apply();
  }

  /** Pontos para pintar — ADM/subsolo/multi-andar: malha; L00 campus: polyline global. */
  function collectRoutePaintPoints(route, levelId) {
    if (!route) return { leg: null, points: [] };
    const oLvl = poiLevel(state.origin);
    const dLvl = poiLevel(state.dest);

    if (route.kind === "templo" && route.fromJson && levelId === "L00" && oLvl === dLvl && oLvl === "L00") {
      const meshEdges = route.edgeIds || [];
      const meshNodes = route.nodeIds || [];
      if (meshEdges.length >= 1 && meshNodes.length === meshEdges.length + 1) {
        const mesh = buildMeshPaintPoints(meshEdges, meshNodes);
        if (mesh?.length >= 2) return { leg: null, points: mesh };
      }
    }

    if (preferGraphRoutePaint(levelId, oLvl, dLvl)) {
      const view = resolveRoutePaintPoints(route, levelId);
      if (view.points?.length >= 2) return view;
    }

    if (shouldUseFullRoutePolyline(levelId, oLvl, dLvl) && route.points?.length >= 2) {
      const direct = route.points
        .map((p) => ({ x: p.x, y: p.y }))
        .filter((p) => isFinite(p.x) && isFinite(p.y));
      if (direct.length >= 2) return { leg: null, points: direct };
    }

    return resolveRoutePaintPoints(route, levelId);
  }

  /** Pontos finais para pintar no andar — nunca aborta se a rota calculada tem geometria. */
  function resolveRoutePaintPoints(route, levelId) {
    if (!route) return { leg: null, points: [] };

    let { leg, points: pts } = routePointsForLevel(route, levelId);
    if (!pts?.length || pts.length < 2) {
      rebuildRouteLegs(route);
      hydrateRouteLegPoints(route, levelId);
      ({ leg, points: pts } = routePointsForLevel(route, levelId));
    }
    if (!pts?.length || pts.length < 2) {
      const fb = buildFloorLegFallbackPoints(levelId, state.origin, state.dest);
      if (fb?.points?.length >= 2) {
        pts = fb.points.map((p) => ({ x: p.x, y: p.y }));
        if (!leg) {
          leg = {
            level: levelId,
            nodeIds: fb.nodeIds || [],
            edgeIds: fb.edgeIds || [],
            points: pts,
          };
        }
      }
    }

    const oLvl = poiLevel(state.origin);
    const dLvl = poiLevel(state.dest);
    if ((!pts?.length || pts.length < 2) && route.points?.length >= 2) {
      const sliced = sliceRoutePointsForLevel(route, levelId);
      if (sliced?.length >= 2) {
        pts = sliced.map((p) => ({ x: p.x, y: p.y }));
      } else if (shouldUseFullRoutePolyline(levelId, oLvl, dLvl)) {
        const candidate = route.points
          .map((p) => ({ x: p.x, y: p.y }))
          .filter((p) => isFinite(p.x) && isFinite(p.y));
        if (candidate.length >= 2 && !routePolylineCrossesWall(candidate, levelId)) {
          pts = candidate;
        }
      }
    }

    return { leg, points: pts?.length >= 2 ? pts : [] };
  }

  function getMapRoutePaintTargets(svg) {
    if (!svg) return { layer: null, base: null, glow: null };
    const layer = svg.querySelector("#mapRouteLayer");
    if (!layer) return { layer: null, base: null, glow: null };
    return {
      layer,
      base: layer.querySelector("#mapRoutePathBase"),
      glow: layer.querySelector("#mapRoutePathGlow"),
    };
  }

  /** Garante camada + paths no SVG do mapa (campus L00 ou andar). */
  function resolveMapRoutePaintTargets(svg) {
    if (!svg) return { layer: null, base: null, glow: null };
    const layer = ensureRouteLayer(svg);
    return {
      layer,
      base: layer.querySelector("#mapRoutePathBase"),
      glow: layer.querySelector("#mapRoutePathGlow"),
    };
  }

  function forceRoutePathVisible(baseNode, glowNode, pathD) {
    if (!pathD) return;
    const stroke = "#00AEEF";
    [baseNode, glowNode].forEach((node) => {
      if (!node) return;
      node.setAttribute("fill", "none");
      node.style.fill = "none";
      node.style.visibility = "visible";
      node.style.display = "";
      node.removeAttribute("hidden");
    });
    if (baseNode) {
      baseNode.setAttribute("stroke", stroke);
      baseNode.setAttribute("stroke-width", "10");
      baseNode.style.stroke = stroke;
      baseNode.style.strokeWidth = "10";
      baseNode.style.opacity = "1";
    }
    /* Brilho animado: fluxo origem → destino (WAAPI em route-animation-config.js) */
    if (glowNode) {
      globalThis.RouteAnimation?.startRouteGlowFlow?.(glowNode);
    }
  }

  /** Reidrata pernas vazias (lazy load / legs obsoletos) antes de pintar. */
  function hydrateRouteLegPoints(route, levelId) {
    if (!route?.nodeIds?.length || !state.navGraph) return route?.legs || [];
    let legs = route.legs;
    const stale = !legs?.length || legs.some((l) =>
      l.level === levelId
      && (l.edgeIds?.length || 0) >= 1
      && (l.points?.length || 0) < 2,
    );
    if (stale) {
      route.legs = routeLegsFromGraph(route);
      patchBasementLegPoints(route);
      patchCrossFloorLegPoints(route);
      legs = route.legs;
    }
    for (const leg of legs || []) {
      if ((leg.points?.length || 0) >= 2 || !(leg.edgeIds?.length || 0)) continue;
      const stitched = buildMeshPaintPoints(leg.edgeIds, leg.nodeIds);
      if (stitched?.length >= 2) leg.points = stitched;
    }
    return legs;
  }

  /** Trecho de saída/entrada entre andares: liga ícone do POI ao hub vertical. */
  function extendCrossFloorLegPoints(pts, levelId, oLvl, dLvl, route = state.route) {
    let out = (pts || []).map((p) => ({ x: p.x, y: p.y }));
    if (out.length < 2) return out;

    if (crossFloorExitLeg(levelId, oLvl, dLvl)) {
      if (poiAnchorsVerticalHub(state.origin, levelId, route)) return out;
      out = refineVerticalHubEndpoint(out, levelId, route, "end");
      out = appendVerticalHubExitLeg(out, levelId, route);
      if (!poiUsesOfficialRouteAnchor(state.origin)) {
        const o = poiIcon(state.origin);
        const maxSpur = tol("spurTol", poiToleranceZone(state.origin));
        if (o && dist(o, out[0]) > 0.8 && dist(o, out[0]) <= maxSpur && !crossesWall(o, out[0], levelId)) {
          out.unshift({ x: o.x, y: o.y });
        }
      }
      return out;
    }

    if (crossFloorEntryLeg(levelId, oLvl, dLvl)) {
      if (poiAnchorsVerticalHub(state.dest, levelId, route)) return out;
      out = refineVerticalHubEndpoint(out, levelId, route, "start");
      if (!poiUsesOfficialRouteAnchor(state.dest)) {
        const d = poiIcon(state.dest);
        const maxSpur = tol("spurTol", poiToleranceZone(state.dest));
        const tip = out[out.length - 1];
        if (d && dist(tip, d) > 0.8 && dist(tip, d) <= maxSpur && !crossesWall(tip, d, levelId)) {
          out.push({ x: d.x, y: d.y });
        }
      }
      return out;
    }

    return out;
  }

  function wallsForLevel(levelId) {
    if (levelId && state.floorWalls?.[levelId]?.length) return state.floorWalls[levelId];
    return G.walls || [];
  }

  function routePolylineCrossesWall(pts, levelId) {
    if (!pts || pts.length < 2) return false;
    for (let i = 1; i < pts.length; i++) {
      if (crossesWall(pts[i - 1], pts[i], levelId)) return true;
    }
    return false;
  }

  /** Spur sintético: 2 pontos longos sem nenhuma edge do grafo. */
  function isSyntheticStraightSpur(pts, leg, route) {
    if (!pts || pts.length !== 2) return false;
    const edges = (leg?.edgeIds?.length || 0) + (route?.edgeIds?.length || 0);
    if (edges >= 1) return false;
    return dist(pts[0], pts[1]) > 25;
  }

  /** Monta polyline pelos paths oficiais — orienta cada edge pelos nodeIds (sem saltos diagonais). */
  function buildMeshPaintPoints(edgeIds, nodeIds) {
    if (!edgeIds?.length || !state.navGraph) return null;
    const NR = globalThis.NavigationRouter;
    if (NR?.buildRoutePoints && nodeIds?.length === edgeIds.length + 1) {
      try {
        const built = NR.buildRoutePoints(
          edgeIds,
          nodeIds,
          state.navGraph.edgesById,
          state.navGraph.nodesById,
        );
        if (built?.length >= 2) return built.map((p) => ({ x: p.x, y: p.y }));
      } catch { /* fallback abaixo */ }
    }
    return stitchEdgePaths(edgeIds);
  }

  /** Monta polyline só pelos paths das edges (fallback sem nodeIds — evitar na pintura). */
  function stitchEdgePaths(edgeIds) {
    if (!edgeIds?.length || !state.navGraph) return null;
    const stitched = [];
    for (const eid of edgeIds) {
      const edge = state.navGraph.edgesById.get(eid);
      for (const p of edge?.path || []) {
        const pt = { x: p.x, y: p.y };
        const last = stitched[stitched.length - 1];
        if (!last || dist(last, pt) > 0.05) stitched.push(pt);
      }
    }
    return stitched.length >= 2 ? stitched : null;
  }

  /** Pontos do trecho no andar — prioriza malha (edges/nodes), nunca diagonal artificial. */
  function routePointsForLevel(route, levelId) {
    if (!route) return { leg: null, points: [] };

    const legs = hydrateRouteLegPoints(route, levelId);

    let leg = pickBestRouteLeg(legs.filter((l) => l.level === levelId));
    if (!leg && legs.length === 1 && legs[0]?.level === levelId) leg = legs[0];

    let points = (leg?.points || [])
      .map((p) => ({ x: p.x, y: p.y }))
      .filter((p) => isFinite(p.x) && isFinite(p.y));

    if (leg?.edgeIds?.length >= 1) {
      const mesh = buildMeshPaintPoints(leg.edgeIds, leg.nodeIds);
      if (mesh?.length >= 2) {
        points = mesh;
        leg.points = mesh.map((p) => ({ x: p.x, y: p.y }));
      }
    }

    if (points.length < 2) {
      const sliced = sliceRoutePointsForLevel(route, levelId);
      if (sliced?.length >= 2) points = sliced;
    }

    const oLvl = poiLevel(state.origin);
    const dLvl = poiLevel(state.dest);
    if (
      basementExitLegIncomplete(points, levelId, oLvl, dLvl)
      || (points.length < 2 && oLvl !== dLvl && (levelId === oLvl || levelId === dLvl))
    ) {
      const fb = buildFloorLegFallbackPoints(levelId, state.origin, state.dest);
      if (fb?.points?.length >= 2) {
        points = fb.points.map((p) => ({ x: p.x, y: p.y }));
        if (!leg) {
          leg = {
            level: levelId,
            nodeIds: fb.nodeIds || [],
            edgeIds: fb.edgeIds || [],
            points,
          };
        } else {
          leg.points = points.map((p) => ({ x: p.x, y: p.y }));
          if (fb.edgeIds?.length) leg.edgeIds = fb.edgeIds.slice();
          if (fb.nodeIds?.length) leg.nodeIds = fb.nodeIds.slice();
        }
      }
    }
    if (points.length < 2 && shouldUseFullRoutePolyline(levelId, oLvl, dLvl) && route.points?.length >= 2) {
      const candidate = route.points
        .map((p) => ({ x: p.x, y: p.y }))
        .filter((p) => isFinite(p.x) && isFinite(p.y));
      if (candidate.length >= 2 && !routePolylineCrossesWall(candidate, levelId)) {
        points = candidate;
      }
    }

    if (points.length < 2 && state.origin && state.dest) {
      const fb = buildFloorLegFallbackPoints(levelId, state.origin, state.dest);
      if (fb?.points?.length >= 2) {
        points = fb.points.map((p) => ({ x: p.x, y: p.y }));
        if (!leg) {
          leg = {
            level: levelId,
            nodeIds: fb.nodeIds || [],
            edgeIds: fb.edgeIds || [],
            points,
          };
        } else {
          if (fb.edgeIds?.length) leg.edgeIds = fb.edgeIds.slice();
          if (fb.nodeIds?.length) leg.nodeIds = fb.nodeIds.slice();
        }
      }
    }

    if (points.length < 2 && route.nodeIds?.length >= 2 && state.navGraph) {
      let start = -1;
      let end = -1;
      for (let i = 0; i < route.nodeIds.length; i++) {
        const lvl = state.navGraph.nodesById.get(route.nodeIds[i])?.level;
        if (lvl !== levelId) continue;
        if (start < 0) start = i;
        end = i;
      }
      if (start >= 0 && end > start) {
        const mesh = buildMeshPaintPoints(
          (route.edgeIds || []).slice(start, end),
          (route.nodeIds || []).slice(start, end + 1),
        );
        if (mesh) points = mesh;
      }
    }

    if (points.length < 2 && route.points?.length >= 2) {
      const sliced = sliceRoutePointsForLevel(route, levelId);
      if (sliced?.length >= 2) {
        points = sliced.map((p) => ({ x: p.x, y: p.y }));
      } else if (oLvl === dLvl && oLvl === levelId) {
        const candidate = route.points
          .map((p) => ({ x: p.x, y: p.y }))
          .filter((p) => isFinite(p.x) && isFinite(p.y));
        if (candidate.length >= 2 && !routePolylineCrossesWall(candidate, levelId)) {
          points = candidate;
        }
      }
    }

    if (points.length >= 2) {
      points = repairCrossFloorExitLegPoints(points, route, levelId);
    }

    return { leg, points };
  }

  /** Pontos do trecho no andar ativo. */
  function ensureActiveFloorRoutePoints() {
    if (!state.route || !state.origin || !state.dest) return [];
    const { points } = routePointsForLevel(state.route, state.activeLevel);
    return points.length >= 2 ? points : [];
  }

  function patchCrossFloorLegPoints(route) {
    if (!route?.legs?.length || !state.origin || !state.dest) return;
    const oLvl = poiLevel(state.origin);
    const dLvl = poiLevel(state.dest);
    if (!isCrossFloorTrip(oLvl, dLvl)) return;
    for (const leg of route.legs) {
      if (crossFloorExitLeg(leg.level, oLvl, dLvl)) {
        const fb = buildFloorLegFallbackPoints(leg.level, state.origin, state.dest);
        if (fb?.points?.length >= 2 && !isSyntheticStraightSpur(fb.points, fb, route)) {
          leg.points = fb.points.map((p) => ({ x: p.x, y: p.y }));
          if (fb.edgeIds?.length) leg.edgeIds = fb.edgeIds.slice();
          if (fb.nodeIds?.length) leg.nodeIds = fb.nodeIds.slice();
          continue;
        }
      }
      if ((leg.points?.length || 0) >= 2) continue;
      const fb = buildFloorLegFallbackPoints(leg.level, state.origin, state.dest);
      if (!fb?.points?.length || fb.points.length < 2) continue;
      if (isSyntheticStraightSpur(fb.points, fb, route)) continue;
      leg.points = fb.points.map((p) => ({ x: p.x, y: p.y }));
      if (fb.edgeIds?.length) leg.edgeIds = fb.edgeIds.slice();
      if (fb.nodeIds?.length) leg.nodeIds = fb.nodeIds.slice();
    }
  }

  function patchBasementLegPoints(route) {
    if (!route?.legs?.length || !state.origin || !state.dest) return;
    const oLvl = poiLevel(state.origin);
    const dLvl = poiLevel(state.dest);
    for (const leg of route.legs) {
      if ((leg.points?.length || 0) >= 2 && (leg.edgeIds?.length || 0) >= 1) {
        const mesh = buildMeshPaintPoints(leg.edgeIds, leg.nodeIds);
        if (mesh?.length >= 2) {
          leg.points = mesh.map((p) => ({ x: p.x, y: p.y }));
        }
        continue;
      }
      const fb = buildFloorLegFallbackPoints(leg.level, state.origin, state.dest);
      if (!fb?.points?.length || fb.points.length < 2) continue;
      if (isSyntheticStraightSpur(fb.points, fb, route)) continue;
      leg.points = fb.points.map((p) => ({ x: p.x, y: p.y }));
      if (fb.edgeIds?.length) leg.edgeIds = fb.edgeIds.slice();
      if (fb.nodeIds?.length) leg.nodeIds = fb.nodeIds.slice();
    }
  }

  function mergeWaypointIds(...chains) {
    const out = [];
    for (const chain of chains) {
      for (const id of chain || []) {
        if (!id) continue;
        if (out.length && out[out.length - 1] === id) continue;
        out.push(id);
      }
    }
    return out;
  }

  /** Cadeia obrigatória pela entrada de Nárnia (T → B01 → B02). B1↔B2 usa Encomun (ver encomunBasementWaypoints). */
  function narniaBasementChain(fromLvl, toLvl) {
    const L00 = narniaHubNode("L00");
    const B01 = narniaHubNode("B01");
    const B02 = narniaHubNode("B02");
    if (!L00 || !B01 || !B02) return [];
    if (fromLvl === "B01" && toLvl === "B02") return [];
    if (fromLvl === "B02" && toLvl === "B01") return [];
    if (fromLvl === "B01" && toLvl === "L00") return [B01, L00];
    if (fromLvl === "L00" && toLvl === "B01") return [L00, B01];
    if (fromLvl === "B02" && toLvl === "L00") return [B02, B01, L00];
    if (fromLvl === "L00" && toLvl === "B02") return [L00, B01, B02];
    return [];
  }

  /** Waypoints entre andares quando B01/B02 participam — sempre pelo poste/T (L00_N0014). */
  function narniaHubWaypoints(fromLvl, toLvl) {
    if (!fromLvl || !toLvl || fromLvl === toLvl) return [];

    const direct = narniaBasementChain(fromLvl, toLvl);
    if (direct.length >= 2) return direct;

    if (isBasementFloor(fromLvl) && isAdmFloor(toLvl)) {
      const down = narniaBasementChain(fromLvl, "L00");
      const up = elevatorHubWaypoints("L00", toLvl);
      if (down.length < 2 || up.length < 2) return [];
      return mergeWaypointIds(down, up);
    }

    if (isAdmFloor(fromLvl) && isBasementFloor(toLvl)) {
      const down = elevatorHubWaypoints(fromLvl, "L00");
      const basement = narniaBasementChain("L00", toLvl);
      if (down.length < 2 || basement.length < 2) return [];
      return mergeWaypointIds(down, basement);
    }

    if (fromLvl === "L00" && isBasementFloor(toLvl)) {
      return narniaBasementChain("L00", toLvl);
    }
    if (isBasementFloor(fromLvl) && toLvl === "L00") {
      return narniaBasementChain(fromLvl, "L00");
    }

    return [];
  }

  function narniaForbiddenEdgeSet() {
    const ids = CONFIG.narniaForbiddenEdges || [];
    const blocked = new Set();
    for (const id of ids) {
      if (state.navGraph?.edgesById?.has(id)) blocked.add(id);
    }
    return blocked;
  }

  /** Rotas B01/B02: Nárnia no T ou Encomun entre B1 e B2. */
  function buildBasementNarniaRoutes(NR, startIds, endIds, origin, dest) {
    const oLvl = poiLevel(origin);
    const dLvl = poiLevel(dest);
    if (!routeInvolvesBasementTransfer(oLvl, dLvl)) return [];

    const via = basementTripWaypoints(oLvl, dLvl, dest).filter((id) => state.navGraph?.nodesById?.has(id));
    if (via.length < 2) return [];

    const encomun = isBasementEncomunTrip(oLvl, dLvl);
    const label = encomun ? "Pelo Encomun" : "Pela entrada de Nárnia";

    const route = buildNamedExternalRoute(NR, startIds, endIds, origin, dest, {
      via,
      label,
      avoidParking: false,
      allowParking: true,
      blockedEdges: narniaForbiddenEdgeSetForTrip(oLvl, dLvl),
    });
    if (!route) return [];

    route.kind = encomun ? "encomun" : "narnia";
    route.label = label;
    route.namedExternal = true;
    return [route];
  }

  function routeUsesLateralStairs(route) {
    if (!route?.edgeIds?.length || !state.navGraph) return false;
    return route.edgeIds.some((id) => {
      if (/escada_lateral/i.test(id)) return true;
      const e = state.navGraph.edgesById.get(id);
      return e && e.type === "stairs" && /L0[0-6]-L0[1-6]|L00-L01/.test(e.level || "");
    });
  }

  function narniaGateLabel(levelId) {
    const labels = CONFIG.narniaGateLabels || {};
    if (labels[levelId]) return labels[levelId];
    return `Porta de Nárnia (${floorTitle(levelId)})`;
  }

  function narniaFloorLabel(levelId) {
    if (levelId === "L00") return "Térreo";
    const f = floorById(levelId);
    return f?.title || levelId;
  }

  function basementLevelRank(levelId) {
    return ({ L00: 0, B01: 1, B02: 2 })[levelId] ?? -1;
  }

  /** Sequência L00 ↔ B01 ↔ B02 entre origem e destino (inclusive). */
  function basementLevelsBetween(fromLvl, toLvl) {
    const order = ["L00", "B01", "B02"];
    const from = isBasementFloor(fromLvl) ? fromLvl : "L00";
    const to = isBasementFloor(toLvl) ? toLvl : "L00";
    const i = order.indexOf(from);
    const j = order.indexOf(to);
    if (i < 0 || j < 0) return [];
    if (i === j) return [from];
    if (i < j) return order.slice(i, j + 1);
    return order.slice(j, i + 1).reverse();
  }

  function campusLevelsBetween(oLvl, dLvl) {
    const order = ["L00", "L01", "L02", "L03", "L04", "L05", "L06"];
    const i = order.indexOf(oLvl);
    const j = order.indexOf(dLvl);
    const out = new Set([oLvl, dLvl].filter(Boolean));
    if (i < 0 || j < 0) return [...out];
    const lo = Math.min(i, j);
    const hi = Math.max(i, j);
    for (let k = lo; k <= hi; k++) out.add(order[k]);
    return [...out];
  }

  /** Andares do grafo necessários para rotas entre origem e destino. */
  function floorsRequiredForTrip(oLvl, dLvl) {
    const required = new Set([oLvl, dLvl].filter(Boolean));
    if (isCrossCampusFloorPair(oLvl, dLvl) || (isAdmFloor(oLvl) && isAdmFloor(dLvl))) {
      for (const id of campusLevelsBetween(oLvl, dLvl)) required.add(id);
    }
    if (routeInvolvesBasementTransfer(oLvl, dLvl)) {
      required.add("L00");
      required.add("B01");
      if (isBasementFloor(oLvl) || isBasementFloor(dLvl) || oLvl === "B02" || dLvl === "B02") {
        required.add("B02");
      }
    }
    return [...required];
  }

  async function ensureNavGraphForTrip(oLvl, dLvl) {
    if (!state.ensureNavGraphFloors) return state.navGraph;
    const levels = floorsRequiredForTrip(oLvl, dLvl);
    await state.ensureNavGraphFloors(...levels);
    return state.navGraph;
  }

  function rebuildRouteLegs(route = state.route) {
    if (!route?.nodeIds?.length || !state.navGraph) return route?.legs || [];
    route.legs = routeLegsFromGraph(route);
    patchBasementLegPoints(route);
    patchCrossFloorLegPoints(route);
    return route.legs;
  }

  function routeViaLabel(route, oLvl, dLvl) {
    if (isBasementEncomunTrip(oLvl, dLvl)) return "via Encomun";
    if (routeInvolvesBasementTransfer(oLvl, dLvl)) return "via Porta de Nárnia";
    if (routeUsesLateralStairs(route)) return "via escada lateral";
    return "via elevador";
  }

  /** Andar exibido ao traçar rota — subsolo→campus abre no mapa do subsolo de origem. */
  function routeInitialViewLevel(route, oLvl, dLvl) {
    if (oLvl === dLvl) return oLvl;

    if (routeInvolvesBasementTransfer(oLvl, dLvl)) {
      if (isBasementFloor(oLvl)) return oLvl;
      if (isAdmFloor(oLvl)) return oLvl;
      return "L00";
    }

    return oLvl;
  }

  /** Trecho da rota no andar ativo (navegação passo a passo). */
  function activeRouteLeg(route = state.route) {
    if (!route) return null;
    return resolveRouteLegForView(route, state.activeLevel).leg;
  }

  /** Pontos da rota visíveis no andar atual — evita misturar coordenadas B01/B02/L00. */
  function navViewPoints(route = state.route) {
    if (!route) return [];
    const { points } = routePointsForLevel(route, state.activeLevel);
    return points.length >= 2 ? points : [];
  }

  function navLegIndex(route = state.route) {
    const legs = route?.legs || [];
    if (!legs.length) return 0;
    const idx = legs.findIndex((l) => l.level === state.activeLevel);
    return idx >= 0 ? idx : 0;
  }

  /** Trecho da rota correspondente ao índice de navegação (por perna/andar). */
  function routeLegForNavIdx(route, navIdx) {
    const legs = route?.legs || [];
    if (!legs.length) return null;
    let offset = 0;
    for (const leg of legs) {
      const segs = Math.max(0, (leg.points?.length || 0) - 1);
      if (segs <= 0) continue;
      if (navIdx < offset + segs) return leg;
      offset += segs;
    }
    return legs[legs.length - 1];
  }

  /** Ao avançar na navegação, troca o mapa para o andar do trecho (L00 → L05, subsolo, etc.). */
  function syncRouteFloorToNavProgress(navIdx) {
    const route = state.route;
    if (!route) return;
    const oLvl = poiLevel(state.origin);
    const dLvl = poiLevel(state.dest);
    if (oLvl === dLvl) return;

    const leg = routeLegForNavIdx(route, navIdx);
    if (!leg?.level || leg.level === state.activeLevel) return;

    setActiveLevel(leg.level, { silent: true, keepTrip: true }).then(() => {
      state.navIdx = 0;
      paintActiveRouteLeg();
      fitRouteInView(route, {
        navMode: document.body.classList.contains("is-navigating"),
        preferActiveLeg: true,
        fillWidth: isMobileLayout(),
      });
    });
  }

  /** Avança para a próxima perna da rota (troca de andar), pulando trechos só de elevador. */
  function advanceToNextRouteLeg() {
    const route = state.route;
    if (!route) return false;
    const legs = route.legs || routeLegsFromGraph(route);
    route.legs = legs;
    let idx = navLegIndex(route) + 1;
    while (idx < legs.length) {
      const next = legs[idx];
      const drawable = (next?.edgeIds?.length || 0) > 0 || (next?.points?.length || 0) >= 2;
      if (next?.level && drawable) {
        state.navIdx = 0;
        setActiveLevel(next.level, { silent: true, keepTrip: true }).then(() => {
          paintActiveRouteLeg();
          updateNav({ fitCamera: true, fitFullRoute: isMobileLayout() });
        });
        return true;
      }
      idx += 1;
    }
    return false;
  }

  /** Passos explícitos pela Porta de Nárnia ou Encomun entre Térreo, B01 e B02. */
  function buildBasementNarniaSteps(oLvl, dLvl) {
    const steps = [];
    steps.push({ ico: "P", txt: `Início: ${state.origin.name}`, dist: "" });

    if (isBasementEncomunTrip(oLvl, dLvl)) {
      const enLabel = CONFIG.encomunTransfer?.[oLvl]?.label || "Encomun";
      steps.push({
        ico: "W",
        txt: `Dirija-se ao ${enLabel} — ligação entre ${narniaFloorLabel(oLvl)} e ${narniaFloorLabel(dLvl)}`,
        dist: "",
      });
      steps.push({
        ico: "W",
        txt: `Use o ${enLabel} para chegar ao ${narniaFloorLabel(dLvl)}`,
        dist: "",
      });
      steps.push({
        ico: "W",
        txt: `Siga até ${state.dest.name}`,
        dist: "",
      });
      steps.push({ ico: "F", txt: `Chegada: ${state.dest.name}`, dist: "" });
      return steps;
    }

    const origBasement = isBasementFloor(oLvl);
    const destBasement = isBasementFloor(dLvl);
    const servirTrip = oLvl === "B02" && poiRawKey(state.dest) === "P020_espaco_servir";

    if (isAdmFloor(oLvl) && routeInvolvesBasementTransfer(oLvl, dLvl)) {
      const hub = elevatorHub(oLvl);
      steps.push({
        ico: "W",
        txt: `Siga ao elevador${hub ? ` (${hub.label})` : ""} e desça ao Térreo`,
        dist: "",
      });
    }

    const chain = basementLevelsBetween(
      origBasement ? oLvl : "L00",
      destBasement ? dLvl : "L00",
    );

    if (!origBasement && chain.includes("L00")) {
      steps.push({
        ico: "W",
        txt: `Siga até a ${narniaGateLabel("L00")}`,
        dist: "",
      });
    }

    if (origBasement) {
      steps.push({
        ico: "W",
        txt: `Dirija-se à ${narniaGateLabel(oLvl)} — saída do ${narniaFloorLabel(oLvl)}`,
        dist: "",
      });
      if (oLvl === "B02" && !destBasement) {
        steps.push({
          ico: "W",
          txt: "Suba pela Porta de Nárnia até o Térreo",
          dist: "",
        });
      }
    }

    for (let i = 0; i < chain.length - 1; i++) {
      const from = chain[i];
      const to = chain[i + 1];
      const descending = basementLevelRank(to) > basementLevelRank(from);
      steps.push({
        ico: "W",
        txt: descending
          ? `Desça pela ${narniaGateLabel(from)} e entre na ${narniaGateLabel(to)}`
          : `Suba pela ${narniaGateLabel(from)} e saia na ${narniaGateLabel(to)}`,
        dist: "",
      });
    }

    if (destBasement) {
      steps.push({
        ico: "W",
        txt: `Da ${narniaGateLabel(dLvl)}, siga até ${state.dest.name}`,
        dist: "",
      });
    } else if (isAdmFloor(dLvl)) {
      const hub = elevatorHub(dLvl);
      steps.push({
        ico: "E",
        txt: `Use o elevador${hub ? ` (${hub.label})` : ""} até ${floorTitle(dLvl)}`,
        dist: "",
      });
      steps.push({
        ico: "W",
        txt: `Do elevador, siga até ${state.dest.name}`,
        dist: "",
      });
    } else if (dLvl === "L00") {
      if (servirTrip) {
        steps.push({
          ico: "W",
          txt: "No Térreo, siga pelo corredor oeste até o Espaço Servir",
          dist: "",
        });
      } else {
        steps.push({
          ico: "W",
          txt: `Siga até ${state.dest.name}`,
          dist: "",
        });
      }
    }

    steps.push({ ico: "F", txt: `Chegada: ${state.dest.name}`, dist: "" });
    return steps;
  }

  /** POI virtual do elevador do andar (para origem automática / busca). */
  function elevatorPoiForLevel(levelId) {
    const hub = elevatorHub(levelId);
    if (!hub || !state.navGraph?.nodesById.has(hub.nodeId)) return null;
    const node = state.navGraph.nodesById.get(hub.nodeId);
    const existing = G.pois.find((p) =>
      p.navNodeIds?.includes(hub.nodeId) || p.anchor === hub.nodeId || p.rawId === hub.nodeId
    );
    if (existing) return enrichPoiMeta(existing);
    return enrichPoiMeta({
      id: hub.nodeId,
      rawId: hub.nodeId,
      name: hub.label,
      x: node.x,
      y: node.y,
      iconX: node.x,
      iconY: node.y,
      level: levelId,
      cat: "acesso",
      group: "elevadores",
      navNodeIds: [hub.nodeId],
      anchor: hub.nodeId,
      snap: { x: node.x, y: node.y },
      iconHidden: true,
    });
  }

  /** Ancora origem/destino na entrada oficial do CONFIG (ícone visual separado). */
  function applyRoutePoiAnchor(poi) {
    if (!poi || poi.id === "__here__" || poi.isGenericGroundDestination || poi.isGenericTemple) return;
    if (poi.fromLayerIndex || l00()?.hasOfficialLayerNode(poi)) return;
    const raw = poiRawKey(poi);
    const anchor = CONFIG.poiAnchors?.[raw] || poi.graphNodeId || poi.navNodeIds?.[0];
    const resolved = anchor ? (resolveGraphNodeId(anchor) || anchor) : null;
    const node = resolved && (state.navGraph?.nodesById?.get(resolved) || G.nodes?.[resolved]);
    if (!node) return;
    poi.anchor = resolved;
    poi.snap = { x: node.x, y: node.y };
    poi.navNodeIds = [resolved];
  }

  function gfr() {
    return globalThis.GroundFloorRouteMap || null;
  }

  function l00() {
    return globalThis.L00PoiLayerIndex || null;
  }

  function rebuildPoiCaches() {
    G.poisById = new Map();
    for (const poi of G.pois || []) {
      if (poi?.id) G.poisById.set(poi.id, poi);
      if (poi?.rawId) G.poisById.set(poi.rawId, poi);
      poiSearchHaystacks(poi);
    }
  }

  function refreshNavigationCaches() {
    const graph = state.navGraph;
    const signature = graph
      ? `${graph.nodesById?.size || 0}|${graph.edgesById?.size || 0}`
      : "";
    if (signature !== state.navGraphCacheSignature) {
      state.navGraphCacheSignature = signature;
      state.routeOptionsCache.clear();
      state.graphNodeIdsByBase = new Map();
      for (const id of graph?.nodesById?.keys?.() || []) {
        const base = nodeIdBase(id);
        if (!state.graphNodeIdsByBase.has(base)) state.graphNodeIdsByBase.set(base, id);
      }
    }
  }

  function rebuildL00PoiIndex() {
    const L00I = l00();
    const svg = state.floorViews?.L00;
    if (!L00I || !svg) return null;
    if (state.l00PoiIndexSvg === svg
      && state.l00PoiIndexGraphSignature === state.navGraphCacheSignature) {
      return L00I.getValidationReport();
    }
    const report = L00I.buildSearchIndex(svg, state.navGraph, G.nodes, G.adj);
    state.l00PoiIndexSvg = svg;
    state.l00PoiIndexGraphSignature = state.navGraphCacheSignature;
    return report;
  }

  /** POIs ocultos injetados — ancora rotas na malha (sem ícone no mapa). */
  function injectHiddenRoutePois() {
    for (const spec of CONFIG.hiddenRoutePois || []) {
      if (!spec?.rawId) continue;
      if ((G.pois || []).some((p) => poiRawKey(p) === spec.rawId)) continue;
      const resolved = resolveGraphNodeId(spec.anchor) || spec.anchor;
      const node = state.navGraph?.nodesById?.get(resolved) || G.nodes?.[resolved];
      if (!node) continue;
      const icon = spec.iconCampus || { x: node.x, y: node.y };
      const poi = enrichPoiMeta({
        id: spec.rawId,
        rawId: spec.rawId,
        name: spec.name || spec.rawId,
        searchLabel: spec.name || spec.rawId,
        x: icon.x,
        y: icon.y,
        iconX: icon.x,
        iconY: icon.y,
        level: spec.level || node.level || "L00",
        mapLevel: "L00",
        cat: "acesso",
        group: "auditorios",
        building: "Templo",
        navNodeIds: [resolved],
        anchor: resolved,
        snap: { x: node.x, y: node.y },
        graphNodeId: resolved,
        templeEntranceNodeId: spec.templeEntranceNodeId || nodeIdBase(resolved),
        isTempleEntrance: true,
        iconHidden: true,
        routeOnly: true,
        active: true,
      });
      applyInjectedPoiIcon(poi);
      G.pois.push(poi);
    }
    G.pois.sort((a, b) => (a.searchLabel || a.name).localeCompare(b.searchLabel || b.name, "pt-BR"));
  }

  /** POIs ocultos pesquisáveis — sem ícone no mapa, rota na malha oficial. */
  function injectHiddenSearchPois() {
    const specs = CONFIG.hiddenSearchPois || [];
    const specKeys = new Set(specs.map((s) => poiRawKey({ rawId: s.rawId })).filter(Boolean));
    if (specKeys.size) {
      G.pois = (G.pois || []).filter((p) => !specKeys.has(poiRawKey(p)));
    }
    for (const spec of specs) {
      if (!spec?.rawId) continue;
      const key = poiRawKey({ rawId: spec.rawId });
      if ((G.pois || []).some((p) => poiRawKey(p) === key)) continue;
      const resolved = resolveGraphNodeId(spec.anchor) || spec.anchor;
      const node = state.navGraph?.nodesById?.get(resolved) || G.nodes?.[resolved];
      if (!node) continue;
      const icon = spec.iconCampus || { x: node.x, y: node.y };
      const poi = enrichPoiMeta({
        id: spec.rawId,
        rawId: spec.rawId,
        name: spec.name || "Bebedouro",
        searchLabel: spec.searchLabel || spec.name || "Bebedouro",
        x: icon.x,
        y: icon.y,
        iconX: icon.x,
        iconY: icon.y,
        level: spec.level || node.level || "L00",
        mapLevel: spec.level || "L00",
        cat: spec.cat || "apoio",
        group: "apoio",
        building: "Templo",
        navNodeIds: [resolved],
        anchor: resolved,
        snap: { x: node.x, y: node.y },
        graphNodeId: resolved,
        iconHidden: true,
        hiddenOnMap: true,
        active: true,
      });
      applyInjectedPoiIcon(poi);
      G.pois.push(poi);
    }
    G.pois.sort((a, b) => (a.searchLabel || a.name).localeCompare(b.searchLabel || b.name, "pt-BR"));
  }

  /** Resolve IDs de nós de origem/destino a partir do JSON de navegação. */
  function resolveNavNodeIds(poi, role) {
    if (!poi) return [];
    const GFRM = gfr();
    if (GFRM?.isGenericGroundDestination(poi)) return [];

    // Em "Estou aqui", um POI clicado pode fornecer o acesso já resolvido.
    // Este node tem precedência sobre qualquer aproximação geométrica.
    if (poi.startNodeId && state.navGraph?.nodesById.has(poi.startNodeId)
      && graphNodeHasEdges(poi.startNodeId)) {
      return [poi.startNodeId];
    }

    const enriched = GFRM
      ? GFRM.enrichPoiWithOfficialNode({ ...poi }, state.navGraph, G.nodes, G.adj, poiRawKey)
      : poi;

    const official = GFRM?.resolveOfficialNodeId(enriched, state.navGraph, G.nodes, G.adj);
    if (official?.graphNodeId) return [official.graphNodeId];
    if (official?.unavailable && NavigationRouter && state.navGraph) {
      const lvl = poiLevel(enriched) || state.activeLevel || "L00";
      const snap = isGardenAccessPoi(enriched)
        ? (poiRouteAnchor(enriched) || enriched)
        : (poiIcon(enriched) || enriched);
      const id = NavigationRouter.nearestNodeId(snap, state.navGraph, {
        level: lvl,
        avoidParking: role === "here" || role === "origin",
      });
      if (id) return [id];
    }

    if (poi.templeEntranceNodeId || poi.graphNodeId || poi.officialAccessNodeId) {
      const base = poi.officialAccessNodeId || poi.templeEntranceNodeId || nodeIdBase(poi.graphNodeId);
      const resolved = poi.graphNodeId || resolveGraphNodeId(base);
      if (resolved && state.navGraph?.nodesById.has(resolved) && graphNodeHasEdges(resolved)) {
        return [resolved];
      }
      console.warn(`Entrada do Templo indisponível: node ${base} não encontrado ou sem conexão válida.`);
      return [];
    }

    const raw = poiRawKey(enriched);
    if (GFRM?.isMappedL00Poi(enriched, poiRawKey)) {
      const area = GFRM.areaForPoiRaw(raw);
      if (area?.requiresAccessSelection) return [];
      if (area?.nodeId) {
        const v = GFRM.validateAccess({ nodeId: area.nodeId, label: area.label }, state.navGraph, G.nodes, G.adj);
        if (v?.graphNodeId) return [v.graphNodeId];
        if (NavigationRouter && state.navGraph) {
          const lvl = poiLevel(enriched) || state.activeLevel || "L00";
          const id = NavigationRouter.nearestNodeId(poiIcon(enriched) || enriched, state.navGraph, { level: lvl });
          if (id) return [id];
        }
        return [];
      }
    }

    const cfgAnchor = CONFIG.poiAnchors?.[raw] || CONFIG.poiAnchors?.[enriched.rawId];
    if (cfgAnchor) {
      const resolvedCfg = resolveGraphNodeId(cfgAnchor);
      if (resolvedCfg && state.navGraph?.nodesById.has(resolvedCfg) && graphNodeHasEdges(resolvedCfg)) {
        return [resolvedCfg];
      }
    }
    if (enriched.navNodeIds?.length) {
      const ids = enriched.navNodeIds
        .map((id) => resolveGraphNodeId(id) || id)
        .filter((id) => state.navGraph?.nodesById.has(id) && graphNodeHasEdges(id));
      if (ids.length) return ids;
    }
    if (enriched.anchor && state.navGraph?.nodesById.has(enriched.anchor)) {
      if (graphNodeHasEdges(enriched.anchor)) return [enriched.anchor];
    }
    const lvl = poiLevel(enriched) || state.activeLevel || "L00";
    if (enriched.id === "__here__" || role === "here") {
      if (enriched.nearPoiId) {
        const nearPoi = (G.pois || []).find((p) => poiRawKey(p) === enriched.nearPoiId);
        const nearIds = nearPoi ? resolveNavNodeIds(nearPoi, role) : [];
        if (nearIds.length) return nearIds;
      }
      const id = NavigationRouter.nearestNodeId(enriched, state.navGraph, {
        avoidParking: true,
        level: lvl,
      });
      return id ? [id] : [];
    }
    if (GFRM?.isMappedL00Poi(enriched, poiRawKey)) return [];
    if (isGardenAccessPoi(enriched)) {
      const gardenEnd = gardenOfficialEndNodeId(enriched);
      if (gardenEnd) return [gardenEnd];
    }
    const id = NavigationRouter.nearestNodeId(poiRouteAnchor(enriched) || poiIcon(enriched) || enriched, state.navGraph, { level: lvl });
    return id ? [id] : [];
  }

  /** Coordenadas do ícone do POI (nunca o nó da malha). */
  function poiIcon(poi) {
    if (!poi) return null;
    if (poi.iconX != null && poi.iconY != null) return { x: poi.iconX, y: poi.iconY };
    if (poi.x != null && poi.y != null) return { x: poi.x, y: poi.y };
    return null;
  }

  /** POI com node oficial de rota (térreo mapeado / CONFIG / entrada Templo / layer L00). */
  function poiUsesOfficialRouteAnchor(poi) {
    if (!poi) return false;
    if (poi.fromLayerIndex || l00()?.hasOfficialLayerNode(poi)) return true;
    if (poi.officialAccessNodeId || poi.templeEntranceNodeId || poi.groundFloorAreaId) return true;
    if (isTempleEntrancePoi(poi)) return true;
    const raw = poiRawKey(poi);
    if (CONFIG.poiAnchors?.[raw]) return true;
    return !!gfr()?.isMappedL00Poi(poi, poiRawKey);
  }

  /** Ponto de ancoragem da rota — node oficial da malha, não o ícone decorativo. */
  function poiRouteAnchor(poi) {
    if (!poi) return null;
    if (poi.snap?.x != null && poi.snap?.y != null) return { x: poi.snap.x, y: poi.snap.y };
    const anchorId = poi.anchor || poi.navNodeIds?.[0];
    if (anchorId) {
      const n = state.navGraph?.nodesById?.get(anchorId) || G.nodes?.[anchorId];
      if (n) return { x: n.x, y: n.y };
    }
    const GFRM = gfr();
    if (GFRM && poiUsesOfficialRouteAnchor(poi)) {
      const official = GFRM.resolveOfficialNodeId(poi, state.navGraph, G.nodes, G.adj);
      if (official?.graphNodeId) {
        const n = state.navGraph?.nodesById?.get(official.graphNodeId) || G.nodes?.[official.graphNodeId];
        if (n) return { x: n.x, y: n.y };
      }
    }
    const raw = poiRawKey(poi);
    const cfg = CONFIG.poiAnchors?.[raw];
    if (cfg) {
      const resolved = resolveGraphNodeId(cfg);
      const n = state.navGraph?.nodesById?.get(resolved) || G.nodes?.[resolved];
      if (n) return { x: n.x, y: n.y };
    }
    return poiIcon(poi);
  }

  /** Enriquece origem/destino com node oficial e snap antes do cálculo/pintura. */
  function enrichTripPoi(poi) {
    if (!poi || poi.id === "__here__") return poi;
    const L00I = l00();
    if (L00I) L00I.enrichPoi(poi, state.navGraph, G.nodes, G.adj);
    const GFRM = gfr();
    if (GFRM) {
      GFRM.enrichPoiWithOfficialNode(poi, state.navGraph, G.nodes, G.adj, poiRawKey);
    }
    applyRoutePoiAnchor(poi);
    if (poiUsesOfficialRouteAnchor(poi)) {
      const anchor = poiRouteAnchor(poi);
      if (anchor) {
        poi.snap = { x: anchor.x, y: anchor.y };
        const raw = poiRawKey(poi);
        const campus = resolvePoiIconCampus(poi) || CONFIG.poiIconCampus?.[raw];
        if (campus) {
          poi.iconX = campus.x;
          poi.iconY = campus.y;
          poi.x = campus.x;
          poi.y = campus.y;
        } else {
          poi.iconX = anchor.x;
          poi.iconY = anchor.y;
        }
      }
    } else {
      applyInjectedPoiIcon(poi);
    }
    return poi;
  }

  /** Planta ADM (L01–L07): coordenada local → campus (viewBox do mapa de andar). */
  const ADM_FLOOR_TX = { tx: 37.53, ty: 401.3, scale: 1.57 };

  function localAdmToCampus(local) {
    const { tx, ty, scale } = ADM_FLOOR_TX;
    return {
      x: +(tx + local.x * scale).toFixed(3),
      y: +(ty + local.y * scale).toFixed(3),
    };
  }

  /** Campus → coordenada local do SVG do andar ADM (inverso de localAdmToCampus). */
  function campusAdmToLocal(campus) {
    const { tx, ty, scale } = ADM_FLOOR_TX;
    return {
      x: +((campus.x - tx) / scale).toFixed(3),
      y: +((campus.y - ty) / scale).toFixed(3),
    };
  }

  /** Mapas L01–L06 usam viewBox local; malha de navegação fica em campus. */
  function usesAdmLocalViewCoords(levelId) {
    return isAdmFloor(levelId);
  }

  /** Mapas L01–L06: paredes no SVG estão em coords locais (dentro do grupo transformado). */
  function navPointToWallSpace(p, levelId) {
    if (!p || !isFinite(p.x) || !isFinite(p.y)) return p;
    return usesAdmLocalViewCoords(levelId) ? campusAdmToLocal(p) : { x: p.x, y: p.y };
  }

  /** POI edge / ícone oficial no campus (inclui layers L00_poi_* → P020). */
  function poiRouteEdgeSpec(poi) {
    const raw = poiRawKey(poi);
    return CONFIG.poiRouteEdges?.[raw] || null;
  }

  function resolvePoiIconCampus(poi) {
    if (!poi) return null;
    if (poi.iconX != null && poi.iconY != null && (poi.entranceLabel || poi.templeEntranceNodeId)) {
      return { x: poi.iconX, y: poi.iconY };
    }
    const raw = poiRawKey(poi);
    const layerRaw = String(poi.rawId || poi.id || "");
    const parsed = l00()?.parsePoiLayerName(layerRaw);
    if (parsed?.rawName === "espaco_servir") {
      return CONFIG.poiRouteEdges?.P020_espaco_servir?.icon
        || CONFIG.poiIconCampus?.P020_espaco_servir
        || null;
    }
    if (parsed?.rawName === "jardim") {
      return CONFIG.poiRouteEdges?.P016_jardim?.icon
        || CONFIG.poiIconCampus?.P016_jardim
        || null;
    }
    return poiRouteEdgeSpec(poi)?.icon
      || CONFIG.poiIconCampus?.[raw]
      || CONFIG.poiIconCampus?.[layerRaw]
      || null;
  }

  /** Prolonga a rota até o ícone oficial (POI edge) sem atravessar paredes. */
  function appendPoiRouteEdgeIcon(pts, dest, levelId) {
    const icon = resolvePoiIconCampus(dest);
    if (!icon || !pts?.length) return pts;
    let out = pts.map((p) => ({ x: p.x, y: p.y }));
    const spurMax = Math.max(tol("spurTol", poiToleranceZone(dest)), 110);
    const tip = out[out.length - 1];
    if (dist(tip, icon) <= 0.8) return out;
    const mid = { x: icon.x, y: tip.y };
    if (dist(tip, mid) > 0.8 && dist(tip, mid) <= spurMax && !crossesWall(tip, mid, levelId)) {
      out.push(mid);
    }
    const tip2 = out[out.length - 1];
    if (dist(tip2, icon) > 0.8 && dist(tip2, icon) <= spurMax && !crossesWall(tip2, icon, levelId)) {
      out.push({ x: icon.x, y: icon.y });
    }
    return out;
  }

  /** Pin visual de POIs injetados (rota continua ancorada no nodeIds). */
  function applyInjectedPoiIcon(poi) {
    if (!poi) return poi;
    const campus = resolvePoiIconCampus(poi);
    if (campus) {
      poi.iconX = campus.x;
      poi.iconY = campus.y;
      poi.x = campus.x;
      poi.y = campus.y;
      return poi;
    }
    const raw = poi.rawId || poi.id || "";
    const local = CONFIG.poiIconLocal?.[raw];
    if (!local) return poi;
    const c = localAdmToCampus(local);
    poi.iconX = c.x;
    poi.iconY = c.y;
    poi.x = c.x;
    poi.y = c.y;
    return poi;
  }

  function syncFloorPoiIconsFromSvg(svg, iconMap, floorId) {
    if (!svg || !iconMap) return;
    const useLocal = floorId === "B01" || floorId === "B02";
    Object.entries(iconMap).forEach(([elId, rawId]) => {
      const el = svg.getElementById(elId);
      const poi = (G.pois || []).find((p) => p.rawId === rawId);
      if (!el || !poi) return;
      if (CONFIG.poiIconCampus?.[rawId] || CONFIG.poiAnchors?.[rawId]) return;
      const c = poiCenter(el);
      if (!isFinite(c.x) || !isFinite(c.y)) return;
      const pos = useLocal ? c : localAdmToCampus(c);
      poi.iconX = pos.x;
      poi.iconY = pos.y;
      poi.x = pos.x;
      poi.y = pos.y;
    });
  }

  function isTempleEntrancePoi(poi) {
    if (!poi) return false;
    if (poi.isGenericTemple || poi.isGenericGroundDestination) return false;
    if (poi.isMultiAccessOption && poi.multiAccessAreaId === "templo") return true;
    if (poi.isTempleEntrance || poi.templeEntranceNodeId) return true;
    const id = norm(poi.rawId || poi.id || "");
    if (/^l00-multi-templo-/i.test(id)) return true;
    if (/^gfr-templo-/i.test(id)) return true;
    if (/^p000e[1-5]_entrada_/.test(id) || /^templo-entrada-l00_node_\d{4}$/.test(id)) return true;
    const label = String(poi.searchLabel || poi.name || "");
    return /^templo\s*[-—]\s*entrada\s*\d/i.test(label);
  }

  function isTempleDestination(poi) {
    return isTemplePoi(poi) || isTempleEntrancePoi(poi);
  }

  function isTemplePoi(poi) {
    if (!poi || isTempleEntrancePoi(poi)) return false;
    if (poi.isGenericGroundDestination || poi.isGenericTemple) return true;
    const raw = poi.rawId || "";
    const name = poi.name || "";
    if (/elevador|estacionamento|toldo|narnia/i.test(raw + name)) return false;
    return raw === "P000_templo" || /^templo$/i.test(name.trim());
  }

  function buildGenericTemplePoi() {
    const GFRM = gfr();
    if (GFRM) return GFRM.buildGenericAreaPoi(GFRM.areaById("templo"));
    const base = (G.pois || []).find((p) => poiRawKey(p) === "P000_templo");
    return {
      id: "P000_templo",
      rawId: "P000_templo",
      name: "Templo",
      searchLabel: "Templo",
      level: "L00",
      mapLevel: "L00",
      building: "Templo",
      group: "auditorios",
      cat: "geral",
      active: true,
      isGenericTemple: true,
      x: base?.x,
      y: base?.y,
      iconX: base?.iconX,
      iconY: base?.iconY,
    };
  }

  /** ID-base de node (L00_node_NNNN) — ignora sufixo descritivo. */
  function nodeIdBase(id) {
    const m = String(id || "").match(/^(L\d{2}_node_\d{4})/);
    return m ? m[1] : String(id || "");
  }

  /** Resolve ID-base → ID real no grafo (ex.: L00_node_0088 → L00_node_0088__entrada_templo_01). */
  function resolveGraphNodeId(baseId) {
    const base = nodeIdBase(baseId);
    if (!base) return null;
    if (state.navGraph?.nodesById?.has(base)) return base;
    if (G.nodes?.[base]) return base;
    const cached = state.graphNodeIdsByBase?.get(base);
    if (cached) return cached;
    const prefix = base + "_";
    if (state.navGraph?.nodesById) {
      for (const id of state.navGraph.nodesById.keys()) {
        if (id === base || id.startsWith(prefix)) return id;
      }
    }
    if (G.nodes) {
      for (const id of Object.keys(G.nodes)) {
        if (id === base || id.startsWith(prefix)) return id;
      }
    }
    return null;
  }

  function graphNodeHasEdges(resolvedId) {
    if (!resolvedId) return false;
    if ((state.navGraph?.adjacency?.get(resolvedId) || []).length) return true;
    return ((G.adj?.[resolvedId] || []).length > 0);
  }

  function validateTempleEntranceEntry(spec, num) {
    const baseId = nodeIdBase(spec.nodeId || spec.id);
    const label = spec.label || `Templo — Entrada ${num}`;
    const resolved = resolveGraphNodeId(baseId);
    if (!resolved || !graphNodeHasEdges(resolved)) {
      console.warn(`Entrada do Templo indisponível: node ${baseId} não encontrado ou sem conexão válida.`);
      return null;
    }
    const node = state.navGraph?.nodesById?.get(resolved) || G.nodes?.[resolved];
    const campus = CONFIG.templeEntranceIconCampus?.[baseId]
      || CONFIG.templeEntranceIconCampus?.[resolved];
    return {
      nodeId: baseId,
      graphNodeId: resolved,
      label,
      x: node?.x,
      y: node?.y,
      routeIconX: campus?.x,
      routeIconY: campus?.y,
    };
  }

  let _validatedTempleEntrancesCache = null;

  function invalidateTempleEntranceCache() {
    _validatedTempleEntrancesCache = null;
  }

  function validatedTempleEntrances() {
    if (!_validatedTempleEntrancesCache) {
      _validatedTempleEntrancesCache = (CONFIG.templeEntrances || [])
        .map((spec, i) => validateTempleEntranceEntry(spec, i + 1))
        .filter(Boolean);
    }
    return _validatedTempleEntrancesCache;
  }

  function buildTempleEntrancePoi(entry) {
    const id = `templo-entrada-${entry.nodeId}`;
    const iconX = entry.routeIconX ?? entry.x;
    const iconY = entry.routeIconY ?? entry.y;
    return {
      id,
      rawId: id,
      name: entry.label,
      searchLabel: entry.label,
      level: "L00",
      mapLevel: "L00",
      building: "Templo",
      group: "auditorios",
      cat: "geral",
      active: true,
      templeEntranceNodeId: entry.nodeId,
      graphNodeId: entry.graphNodeId,
      anchor: entry.graphNodeId,
      navNodeIds: [entry.graphNodeId],
      snap: { x: entry.x, y: entry.y },
      x: iconX,
      y: iconY,
      iconX,
      iconY,
    };
  }

  function isTempleSearchQuery(query) {
    const q = normSearch(String(query || "").trim());
    if (!q) return false;
    if (isSpecificTempleEntranceQuery(query)) return false;
    if (q === "templo" || q === "igreja") return true;
    if ("templo".startsWith(q) && q.length >= 2) return true;
    if ("igreja".startsWith(q) && q.length >= 2) return true;
    const aliases = CONFIG.poiSearchAliases?.P000_templo || [];
    return aliases.some((a) => {
      const na = normSearch(a);
      return na === q || na.startsWith(q) || q.includes(na);
    });
  }

  /** Busca explícita por entrada do Templo (ex.: "Templo — Entrada 3"). */
  function isSpecificTempleEntranceQuery(query) {
    const q = normSearch(String(query || "").trim());
    return /entrada\s*\d/.test(q) || /^templo\s*[-—]\s*entrada/.test(q);
  }

  function collapseTempleSearchResults(items, query) {
    if (!isTempleSearchQuery(query)) return items || [];
    return [buildGenericTemplePoi()];
  }

  function isStartKidsSearchQuery(query) {
    const q = normSearch(String(query || "").trim());
    if (!q) return false;
    const triggers = CONFIG.startKidsSearch?.triggers || ["start", "crianca"];
    if (triggers.some((t) => {
      const nt = normSearch(t);
      if (!nt) return false;
      return q === nt || q.includes(nt) || (q.length >= 3 && nt.startsWith(q));
    })) return true;
    // "salas" + "start" em qualquer ordem
    if (/\bstart\b/.test(q) && /\bsala/.test(q)) return true;
    return false;
  }

  function findPoiByRawId(rawId) {
    if (!rawId) return null;
    return (G.pois || []).find((p) => {
      if (!isSearchablePoi(p)) return false;
      const key = poiRawKey(p);
      return key === rawId || p.rawId === rawId || String(p.id || "").includes(rawId);
    }) || null;
  }

  function buildStartKidsTransitPoi(hub) {
    if (!hub?.rawId) return null;
    const transitMeta = "T · Hall do Templo — suba ou desça daqui";
    const existing = findPoiByRawId(hub.rawId);
    if (existing) {
      return {
        ...existing,
        id: `startkids-hub-${hub.rawId}`,
        searchLabel: hub.label,
        name: hub.label,
        startKidsGuide: true,
        startKidsMeta: transitMeta,
      };
    }
    const anchorId = CONFIG.poiAnchors?.[hub.rawId];
    const icon = CONFIG.poiIconCampus?.[hub.rawId];
    const node = anchorId && (state.navGraph?.nodesById?.get(anchorId) || G.nodes?.[anchorId]);
    if (!anchorId && !icon) return null;
    return {
      id: `startkids-hub-${hub.rawId}`,
      rawId: hub.rawId,
      name: hub.label,
      searchLabel: hub.label,
      level: "L00",
      mapLevel: "L00",
      building: "Templo",
      group: "elevadores",
      cat: "acesso",
      active: true,
      anchor: anchorId || null,
      navNodeIds: anchorId ? [anchorId] : [],
      snap: node ? { x: node.x, y: node.y } : null,
      x: icon?.x ?? node?.x,
      y: icon?.y ?? node?.y,
      iconX: icon?.x ?? node?.x,
      iconY: icon?.y ?? node?.y,
      startKidsGuide: true,
      startKidsMeta: transitMeta,
    };
  }

  function buildStartKidsAgeBandPoi(band) {
    const floorTag = band.floorTag || formatFloorTag(band.level || band.mapLevel);
    const meta = band.meta
      || (band.floorTag === "CF" || band.destRawId === "P005_centro_de_formacao"
        ? "CF · Centro de Formação"
        : `${floorTag} · via elevador ou escadas laterais (T)`);
    const existing = findPoiByRawId(band.destRawId);
    if (existing) {
      return {
        ...existing,
        id: band.id,
        searchLabel: band.label,
        name: band.label,
        level: existing.level || band.level,
        mapLevel: existing.mapLevel || existing.level || band.mapLevel || band.level,
        startKidsGuide: true,
        startKidsMeta: meta,
      };
    }
    const anchorId = CONFIG.poiAnchors?.[band.destRawId];
    const icon = CONFIG.poiIconCampus?.[band.destRawId];
    const node = anchorId && (state.navGraph?.nodesById?.get(anchorId) || G.nodes?.[anchorId]);
    return {
      id: band.id,
      rawId: band.destRawId,
      name: band.label,
      searchLabel: band.label,
      level: band.level || "L00",
      mapLevel: band.mapLevel || band.level || "L00",
      building: "Start",
      group: "salas",
      cat: "ambiente",
      active: true,
      anchor: anchorId || null,
      navNodeIds: anchorId ? [anchorId] : [],
      snap: node ? { x: node.x, y: node.y } : null,
      x: icon?.x ?? node?.x,
      y: icon?.y ?? node?.y,
      iconX: icon?.x ?? node?.x,
      iconY: icon?.y ?? node?.y,
      startKidsGuide: true,
      startKidsMeta: meta,
    };
  }

  function buildStartKidsSearchResults() {
    const cfg = CONFIG.startKidsSearch || {};
    return (cfg.ageBands || []).map(buildStartKidsAgeBandPoi);
  }

  function collapseStartKidsSearchResults(query) {
    if (!isStartKidsSearchQuery(query)) return null;
    return buildStartKidsSearchResults();
  }

  function isBebedouroSearchQuery(query) {
    const q = normSearch(String(query || "").trim());
    if (!q) return false;
    return q === "bebedouro" || q === "bebedouduro" || q === "agua"
      || q === "agua potavel" || q.includes("bebedouro") || q.includes("agua");
  }

  function collapseBebedouroSearchResults() {
    const order = (CONFIG.hiddenSearchPois || []).map((s) => poiRawKey({ rawId: s.rawId }));
    const items = (G.pois || []).filter((p) => {
      if (!isSearchablePoi(p)) return false;
      return order.includes(poiRawKey(p));
    });
    items.sort((a, b) => order.indexOf(poiRawKey(a)) - order.indexOf(poiRawKey(b)));
    return items.length ? items : null;
  }

  function dedupeSearchPoiResults(items) {
    const seen = new Set();
    const out = [];
    for (const p of items || []) {
      const k = poiRawKey(p) || p.id;
      if (seen.has(k)) continue;
      seen.add(k);
      out.push(p);
    }
    return out;
  }

  /** Após escolher rota do Templo, fixa destino/origem na entrada correspondente. */
  function syncTripPoiFromTempleRoute(route) {
    if (!route?.entranceId || route.kind !== "templo") return;
    const entry = validatedTempleEntrances().find((e) =>
      e.graphNodeId === route.entranceId || nodeIdBase(e.graphNodeId) === nodeIdBase(route.entranceId)
    );
    if (!entry) return;
    const poi = buildTempleEntrancePoi(entry);
    if (isTempleDestination(state.dest)) {
      state.dest = poi;
      if (el.destInput) el.destInput.value = "Templo";
    } else if (isTempleDestination(state.origin)) {
      state.origin = poi;
      if (el.originInput) el.originInput.value = "Templo";
    }
    highlightSelected();
  }

  function poiRawKey(poi) {
    if (!poi) return "";
    if (poi.id === "__here__" && poi.nearPoiId) return poi.nearPoiId;
    let s = String(poi.rawId || poi.id || "")
      .replace(/_x5F_/g, "_")
      .replace(/^poi-\d+-/i, "");
    // nós já canônicos (não stripar L01_node_0001_elevador → "elevador")
    if (/^(escada_mesanino_|L0[0-7]_elevador)/i.test(s)) return s;
    // L00_P_P027_… / L00_P027_… → P027_…
    s = s.replace(/^L0[0-7]_P_/i, "").replace(/^L0[0-7]_/i, "");
    return s;
  }

  function isTempleHubPoi(poi) {
    if (!poi) return false;
    const k = poiRawKey(poi);
    return /P027_elevador_templo|P000_templo|escada_mesanino|L01_node_0001_elevador|L02_node_0001_elevador|L03_node_0001|L04_node_0001_elevador|L05_node_0001_elevador|L06_node_0033_elevador/i.test(k);
  }

  /** CF / RGO → Templo: só entradas do estabelecimento (sem Av. Batel / jardim). */
  function isCfToTemplePair(origin, dest) {
    if (!origin || !dest) return false;
    const keys = [poiRawKey(origin), poiRawKey(dest)];
    const isCfKey = (k) => /P005_centro_de_formacao|P004_sala_de_oracao_RGO|centro_de_formacao|formacao_cf/i.test(k);
    const toTemple = (poi) => isTempleEntrancePoi(poi) || isTemplePoi(poi) || isTempleHubPoi(poi);
    if ((isCfKey(keys[0]) && toTemple(dest)) || (isCfKey(keys[1]) && toTemple(origin))) return true;
    const oName = normSearch(origin.searchLabel || origin.name || "");
    const dName = normSearch(dest.searchLabel || dest.name || "");
    const cfName = /centro de formacao|formacao cf|^cf$|centro formacao|sala de oracao rgo/.test(oName)
      || /centro de formacao|formacao cf|^cf$|centro formacao|sala de oracao rgo/.test(dName);
    const templeName = /^(templo|igreja)$/.test(oName) || /^(templo|igreja)$/.test(dName)
      || /\btemplo\b/.test(oName) || /\btemplo\b/.test(dName)
      || /^templo\s*[-—]\s*entrada\s*\d/.test(oName) || /^templo\s*[-—]\s*entrada\s*\d/.test(dName);
    return cfName && templeName;
  }

  function namedExternalSpecsForPair(origin, dest) {
    if (isCfToTemplePair(origin, dest)) return [];
    const a = poiRawKey(origin);
    const b = poiRawKey(dest);
    const matchSide = (spec, key) => {
      if (Array.isArray(spec)) {
        return spec.some((item) => {
          const t = String(item);
          return t === key || t.toLowerCase() === key.toLowerCase()
            || key.endsWith(t) || t.endsWith(key);
        });
      }
      return spec === key;
    };
    const matched = (CONFIG.namedExternalRoutes || []).filter((r) =>
      (matchSide(r.a, a) && matchSide(r.b, b)) ||
      (matchSide(r.a, b) && matchSide(r.b, a))
    );
    // Se envolve elevador/templo/mezanino e ainda não há "pelo jardim", força a opção
    if ((isTempleHubPoi(origin) || isTempleHubPoi(dest))
      && !matched.some((r) => /pelo jardim|fora do templo/i.test(r.label || ""))) {
      matched.push({
        via: ["L00_N0027", "L00_N0030"],
        endNodes: ["L00_node_0035_espaco_servir"],
        label: "Pelo jardim",
        avoidParking: false,
      });
    }
    return matched;
  }

  function namedExternalForPair(origin, dest) {
    return namedExternalSpecsForPair(origin, dest)[0] || null;
  }

  const MAX_ROUTE_OPTIONS = 5;
  const DEFAULT_ROUTE_OPTIONS = 3;

  function normRouteLabel(label) {
    return normSearch(String(label || "").replace(/^rota\s+\d+\s*[—–-]\s*/i, ""));
  }

  /** Máx. rotas exibidas para um par (CONFIG.routeOptionCaps). */
  function maxRouteOptionsForPair(origin, dest) {
    const specs = CONFIG.routeOptionCaps || [];
    const a = poiRawKey(origin);
    const b = poiRawKey(dest);
    const matchSide = (spec, key) => {
      if (Array.isArray(spec)) {
        return spec.some((item) => {
          const t = String(item);
          return t === key || t.toLowerCase() === key.toLowerCase()
            || key.endsWith(t) || t.endsWith(key);
        });
      }
      return spec === key;
    };
    for (const spec of specs) {
      if ((matchSide(spec.a, a) && matchSide(spec.b, b))
        || (matchSide(spec.a, b) && matchSide(spec.b, a))) {
        return Math.max(1, Math.min(MAX_ROUTE_OPTIONS, spec.max || DEFAULT_ROUTE_OPTIONS));
      }
    }
    if (isTempleDestination(origin) || isTempleDestination(dest)) return MAX_ROUTE_OPTIONS;
    const oLvl = poiLevel(origin);
    const dLvl = poiLevel(dest);
    if (isCfToJardimPair(origin, dest)) return 3;
    if (isToCfPair(origin, dest)) return Math.max(2, MAX_ROUTE_OPTIONS);
    if (isL00InteriorTerrainPair(origin, dest)) return Math.max(3, MAX_ROUTE_OPTIONS);
    if (oLvl === "L00" && isAdmFloor(dLvl)) return Math.max(2, MAX_ROUTE_OPTIONS);
    if (isAdmFloor(oLvl) && dLvl === "L00") return Math.max(2, MAX_ROUTE_OPTIONS);
    if (isCrossCampusFloorPair(oLvl, dLvl)) return 2;
    return DEFAULT_ROUTE_OPTIONS;
  }

  /** Mínimo de opções exibidas — sempre pelo menos 2 rotas para escolher. */
  function minRouteOptionsForPair(origin, dest) {
    return Math.max(2, CONFIG.minRouteOptions ?? 2);
  }

  function effectiveMaxRouteOptionsForPair(origin, dest) {
    return Math.max(minRouteOptionsForPair(origin, dest), maxRouteOptionsForPair(origin, dest));
  }

  function packSingleNavLegRoute(leg, origin, dest, kind = "alt") {
    if (!leg?.points?.length) return null;
    const points = appendPoiEndpoints(leg.points, origin, dest);
    if (points.length < 2) return null;
    const mpu = getMetersPerUnit();
    const meshLen = (leg.points || []).reduce((s, p, i, a) => (i ? s + dist(a[i - 1], p) : 0), 0);
    const spurExtra = Math.max(0, polylineLength(points) - meshLen);
    return {
      points,
      nodeIds: leg.nodeIds,
      edgeIds: leg.edgeIds,
      length: (mpu > 0 ? leg.distanceMeters / mpu : meshLen) + spurExtra,
      distanceMeters: (leg.distanceMeters || 0) + spurExtra * mpu,
      kind,
      fromJson: true,
    };
  }

  function tryPushRouteOption(list, route, origin, dest, max) {
    if (!route?.points || route.points.length < 2) return false;
    if ((list || []).length >= max) return false;
    if (list.some((r) => !r.syntheticAlternative && isDuplicateRoute(r, route))) return false;
    if (!isRouteWallSafe(route, origin, dest)) return false;
    list.push(route);
    return true;
  }

  /** Busca alternativas reais (A*, zonas, bloqueio parcial) até atingir o mínimo. */
  function appendRouteAlternativesUntilMin(list, NR, origin, dest, min, max) {
    let out = (list || []).slice();
    if (out.length >= min || !NR || !state.navGraph || !origin || !dest) return out;

    const startIds = resolveTripNodeIds(origin, origin?.id === "__here__" ? "here" : "origin");
    const endIds = resolveTripNodeIds(dest, "dest");
    if (!startIds.length || !endIds.length) return out;

    const searches = [
      { preference: "shortest", avoidParking: false },
      { preference: "shortest", avoidParking: true },
      { preference: "shortest", avoidParking: true, preferZone: "indoor" },
      { preference: "shortest", avoidParking: true, preferZone: "outdoor" },
    ];

    for (const searchOpts of searches) {
      if (out.length >= min) break;
      const found = NR.findRoutesForPoiPair(startIds, endIds, state.navGraph, {
        ...searchOpts,
        walkingSpeedMps: state.walkingSpeedMps || 1.2,
      });
      for (const leg of found) {
        if (out.length >= min) break;
        tryPushRouteOption(out, packSingleNavLegRoute(leg, origin, dest, "alt"), origin, dest, max);
      }
    }

    if (out.length < min && out[0]?.edgeIds?.length) {
      const blocked = new Set();
      const edges = out[0].edgeIds;
      const mid = Math.floor(edges.length / 2);
      for (let i = Math.max(0, mid - 1); i <= Math.min(edges.length - 1, mid + 1); i++) {
        if (edges[i]) blocked.add(edges[i]);
      }
      for (const startId of startIds) {
        if (out.length >= min) break;
        const leg = NR.astar(startId, endIds, state.navGraph, {
          blockedEdges: blocked,
          avoidParking: false,
          walkingSpeedMps: state.walkingSpeedMps || 1.2,
        });
        tryPushRouteOption(out, packSingleNavLegRoute(leg, origin, dest, "alt"), origin, dest, max);
      }
    }

    if (out.length < min) {
      out = ensureCrossFloorRouteOptions(out, NR, origin, dest);
    }
    if (out.length < min) {
      out = ensureJardimRouteOptions(out, NR, origin, dest);
    }

    return out.slice(0, max);
  }

  /** Último recurso: busca caminho distinto; só espelha se o grafo não tiver alternativa. */
  function appendSyntheticRouteAlternatives(list, min, NR, origin, dest) {
    const out = (list || []).slice();
    const base = out[0];
    if (!base || out.length >= min) return out;

    if (NR && state.navGraph && origin && dest) {
      const startIds = resolveTripNodeIds(origin, origin?.id === "__here__" ? "here" : "origin");
      const endIds = resolveTripNodeIds(dest, "dest");
      const blocked = new Set(base.edgeIds || []);
      for (const startId of startIds) {
        if (out.length >= min) break;
        const leg = NR.astar(startId, endIds, state.navGraph, {
          blockedEdges: blocked,
          avoidParking: false,
          walkingSpeedMps: state.walkingSpeedMps || 1.2,
        });
        const packed = packSingleNavLegRoute(leg, origin, dest, "alt");
        if (packed) tryPushRouteOption(out, packed, origin, dest, MAX_ROUTE_OPTIONS);
      }
    }

    while (out.length < min && base) {
      const idx = out.length;
      out.push({
        ...base,
        points: (base.points || []).map((p) => ({ x: p.x, y: p.y })),
        nodeIds: base.nodeIds?.slice(),
        edgeIds: base.edgeIds?.slice(),
        rank: idx + 1,
        kind: idx === 0 ? "best" : "alt",
        label: idx === 0 ? base.label : `Rota ${idx + 1} — Alternativa`,
        syntheticAlternative: idx > 0,
      });
    }
    return out;
  }

  /** Garante no mínimo 2 opções distintas (ou espelhadas) antes de exibir ao usuário. */
  function enforceMinimumRouteOptions(options, NR, origin, dest) {
    const min = minRouteOptionsForPair(origin, dest);
    const max = effectiveMaxRouteOptionsForPair(origin, dest);
    let list = (options || []).filter((r) => r?.points?.length >= 2).slice(0, max);

    if (list.length >= min) {
      return relabelRouteOptions(list, NR);
    }

    list = ensureMinimumRouteOptions(list, NR, origin, dest);
    list = (list || []).filter((r) => r?.points?.length >= 2).slice(0, max);

    if (list.length < min) {
      list = appendRouteAlternativesUntilMin(list, NR, origin, dest, min, max);
    }
    if (list.length < min) {
      list = appendSyntheticRouteAlternatives(list, min, NR, origin, dest);
    }

    return relabelRouteOptions(list.slice(0, max), NR);
  }

  /** Bloqueia atalho inválido quando origem é “Estou aqui” genérico → Jardim. */
  function filterInvalidHereJardimRoutes(routes, origin, dest) {
    if (!routes?.length || origin?.id !== "__here__") return routes || [];
    const dKey = poiRawKey(dest);
    if (dKey !== "P016_jardim" && dKey !== "P020_espaco_servir") return routes;
    if (origin.nearPoiId) return routes;

    const badPatterns = [
      "corredor_central_leste",
      "corredor_sul_oeste",
      "L00_E0035",
      "L00_E0039",
      "L00_E0038",
      "L00_E0051",
    ];
    return routes.filter((r) => {
      const blob = (r.edgeIds || []).join(" ");
      if (badPatterns.some((p) => blob.includes(p))) return false;
      if (r.namedExternal) return true;
      return /lateral_batel|batel_oeste|L00_E0096|L00_E0054/.test(blob);
    });
  }

  function isRouteWallSafe(route, origin, dest) {
    if (!route) return false;
    if (route.namedExternal && route.forceInclude) return true;
    const oLvl = poiLevel(origin);
    const dLvl = poiLevel(dest);
    const checkLeg = (edgeIds, nodeIds, lvl) => {
      if (!wallsForLevel(lvl).length) return true;
      let pts = (edgeIds?.length >= 1 && nodeIds?.length === edgeIds.length + 1 && state.navGraph)
        ? buildMeshPaintPoints(edgeIds, nodeIds)
        : null;
      if (!pts || pts.length < 2) pts = buildMeshPaintPoints(route.edgeIds, route.nodeIds);
      if (!pts || pts.length < 2) return true;
      return !routePolylineCrossesWall(pts, lvl);
    };
    if (oLvl && dLvl && oLvl !== dLvl && route.nodeIds?.length >= 2 && state.navGraph) {
      const legs = route.legs?.length ? route.legs : routeLegsFromGraph(route);
      for (const leg of legs) {
        if ((leg.edgeIds?.length || 0) < 1) continue;
        if (!checkLeg(leg.edgeIds, leg.nodeIds, leg.level)) return false;
      }
      return true;
    }
    const lvl = oLvl === dLvl ? (oLvl || "L00") : (oLvl || dLvl || "L00");
    if (!wallsForLevel(lvl).length) return true;
    let pts = (route.edgeIds?.length >= 1 && route.nodeIds?.length === route.edgeIds.length + 1 && state.navGraph)
      ? buildMeshPaintPoints(route.edgeIds, route.nodeIds)
      : null;
    if (!pts || pts.length < 2) {
      pts = route.points?.length >= 2 ? route.points : buildMeshPaintPoints(route.edgeIds, route.nodeIds);
    }
    if (!pts || pts.length < 2) return true;
    return !routePolylineCrossesWall(pts, lvl);
  }

  /** Completa até o mínimo de opções com rotas nomeadas ou A*. */
  function ensureMinimumRouteOptions(options, NR, origin, dest) {
    const min = minRouteOptionsForPair(origin, dest);
    const max = effectiveMaxRouteOptionsForPair(origin, dest);
    let list = (options || []).slice();
    if (list.length >= min) return list.slice(0, max);
    if (!NR || !state.navGraph) return list;

    const startIds = resolveNavNodeIds(origin, origin?.id === "__here__" ? "here" : "origin");
    const endIds = resolveNavNodeIds(dest, "dest");
    if (!startIds.length || !endIds.length) return list;

    const specs = namedExternalSpecsForPair(origin, dest)
      .filter((s) => s.slot != null)
      .sort((a, b) => a.slot - b.slot);

    for (const spec of specs) {
      if (list.length >= min) break;
      const external = buildNamedExternalRoute(NR, startIds, endIds, origin, dest, spec);
      if (!external) continue;
      external.slot = spec.slot;
      external.label = spec.label || external.label;
      external.forceInclude = true;
      if (listHasDuplicateRoute(list, external)) continue;
      if (!isRouteWallSafe(external, origin, dest)) continue;
      list.push(external);
    }

    if (list.length < min) {
      const allowParking = tripAllowsParking(origin, dest);
      let astar = NR.findRoutesForPoiPair(startIds, endIds, state.navGraph, {
        preference: "shortest",
        avoidParking: !allowParking,
        walkingSpeedMps: state.walkingSpeedMps || 1.2,
      });
      if (!astar.length && !allowParking) {
        astar = NR.findRoutesForPoiPair(startIds, endIds, state.navGraph, {
          preference: "shortest",
          avoidParking: false,
          walkingSpeedMps: state.walkingSpeedMps || 1.2,
        });
      }
      const mpu = getMetersPerUnit();
      for (const r of astar) {
        if (list.length >= min) break;
        const packed = {
          points: r.points,
          length: mpu > 0 ? r.distanceMeters / mpu : 0,
          distanceMeters: r.distanceMeters,
          nodeIds: r.nodeIds,
          edgeIds: r.edgeIds,
          fromJson: true,
          kind: list.length === 0 ? "best" : "alt",
        };
        if (listHasDuplicateRoute(list, packed)) continue;
        if (!isRouteWallSafe(packed, origin, dest)) continue;
        list.push(packed);
      }
    }

    return finalizePackedRoutes(list, NR, origin, dest);
  }

  /** Remove alternativas absurdamente longas no mesmo andar (ex.: desvio pelo jardim). */
  function pruneAbsurdSameFloorRoutes(routes, origin, dest) {
    const list = (routes || []).filter((r) => r?.points?.length >= 2);
    if (list.length < 2) return list;
    if (poiLevel(origin) !== poiLevel(dest)) return list;
    const mpu = getMetersPerUnit();
    const meters = (r) => r.distanceMeters || (r.length || 0) * mpu;
    const sorted = [...list].sort((a, b) => meters(a) - meters(b));
    const best = meters(sorted[0]);
    if (best <= 0) return list;
    const maxRatio = 2.35;
    const cap = maxRouteOptionsForPair(origin, dest);
    // Rotas nomeadas (ex.: contorno pelo estacionamento) são intencionalmente mais longas
    return sorted.filter((r, i) =>
      r.namedExternal
      || r.forceInclude
      || (r.kind === "templo" && r.fromJson && r.entranceId)
      || i === 0
      || meters(r) <= best * maxRatio
    ).slice(0, cap);
  }
  const ROUTE_DUPE_EDGE = 0.72;
  const ROUTE_DUPE_POINTS = 0.78;

  function polylineLength(pts) {
    let total = 0;
    for (let i = 1; i < (pts || []).length; i++) total += dist(pts[i - 1], pts[i]);
    return total;
  }

  function isJardimDestination(poi) {
    if (!poi) return false;
    const k = poiRawKey(poi);
    if (/P016_jardim|P020_espaco_servir|(?:^|_)jardim$/i.test(k)) return true;
    return /\bjardim\b/.test(normSearch(poi.searchLabel || poi.name || ""));
  }

  /** Jardim / Espaço Servir — entrada visual na área verde (malha fica no corredor). */
  function isGardenAccessPoi(poi) {
    const k = poiRawKey(poi);
    return k === "P016_jardim" || k === "P020_espaco_servir";
  }

  /** Nó oficial de chegada (Jardim ≠ Espaço Servir — nunca escolher o mais curto entre os dois). */
  function gardenOfficialEndNodeId(poi) {
    if (!poi) return null;
    const raw = poiRawKey(poi);
    const cfg = CONFIG.poiAnchors?.[raw];
    if (!cfg) return null;
    const resolved = resolveGraphNodeId(cfg) || cfg;
    if (state.navGraph?.nodesById?.has(resolved)) return resolved;
    if (G.nodes?.[resolved]) return resolved;
    return null;
  }

  function jardimRouteCornerIcon() {
    return CONFIG.poiRouteEdges?.P016_jardim?.icon || { x: 133.83, y: 768.84 };
  }

  function jardimRouteBlockedEdgeSet() {
    return new Set(CONFIG.jardimRouteBlockedEdges || ["L00_edge_0038_node_0036_node_0037"]);
  }

  function withJardimRouteOpts(dest, opts = {}) {
    if (poiRawKey(dest) !== "P016_jardim") return opts;
    const blocked = jardimRouteBlockedEdgeSet();
    const merged = opts.blockedEdges instanceof Set
      ? new Set([...opts.blockedEdges, ...blocked])
      : new Set([...(opts.blockedEdges || []), ...blocked]);
    return { ...opts, blockedEdges: merged };
  }

  /** Corta trecho horizontal leste (0037→0036) — rota para no ponto amarelo da curva. */
  function truncateRouteAtJardimCorner(route, dest) {
    if (!route || poiRawKey(dest) !== "P016_jardim") return route;
    const corner = jardimRouteCornerIcon();
    const cornerId = gardenOfficialEndNodeId(dest) || "L00_node_0037_jardim";
    if (route.nodeIds?.length) {
      const idx = route.nodeIds.findIndex((id) => nodeIdBase(id) === nodeIdBase(cornerId));
      if (idx >= 0 && idx < route.nodeIds.length - 1) {
        route.nodeIds = route.nodeIds.slice(0, idx + 1);
        if (route.edgeIds?.length > idx) route.edgeIds = route.edgeIds.slice(0, idx);
      }
    }
    if (route.points?.length >= 2) {
      const out = [];
      for (let i = 0; i < route.points.length; i++) {
        const p = route.points[i];
        if (i > 0) {
          const prev = out[out.length - 1];
          const onBottom = Math.abs(p.y - corner.y) <= 6 && Math.abs(prev.y - corner.y) <= 6;
          if (onBottom && prev.x <= corner.x + 4 && p.x > corner.x + 12) {
            out.push({ x: corner.x, y: corner.y });
            break;
          }
        }
        out.push({ x: p.x, y: p.y });
        if (dist(p, corner) <= 2.5) break;
      }
      if (out.length >= 2) route.points = out;
    }
    return route;
  }

  /** Nós + edges usados na pintura — sempre do trecho do andar ativo, nunca da rota global. */
  function sliceRouteMeshForLevel(route, levelId) {
    if (!route?.nodeIds?.length || !state.navGraph || !levelId) return null;
    let start = -1;
    let end = -1;
    for (let i = 0; i < route.nodeIds.length; i++) {
      const lvl = state.navGraph.nodesById.get(route.nodeIds[i])?.level;
      if (lvl !== levelId) continue;
      if (start < 0) start = i;
      end = i;
    }
    if (start < 0 || end <= start) return null;
    const nodeIds = route.nodeIds.slice(start, end + 1);
    const edgeIds = (route.edgeIds || []).slice(start, end);
    if (nodeIds.length >= 2 && edgeIds.length >= 1) {
      return { nodeIds, edgeIds };
    }
    return null;
  }

  function routePaintMesh(leg, route, levelId) {
    const legNodes = leg?.nodeIds || [];
    const legEdges = leg?.edgeIds || [];
    const routeNodes = route?.nodeIds || [];
    const routeEdges = route?.edgeIds || [];
    const legOk = legEdges.length >= 1 && legNodes.length === legEdges.length + 1;

    if (legOk && (!levelId || leg.level === levelId)) {
      return { nodeIds: legNodes, edgeIds: legEdges };
    }

    if (levelId) {
      const sliced = sliceRouteMeshForLevel(route, levelId);
      if (sliced?.edgeIds?.length >= 1) return sliced;
    }

    const routeOk = routeEdges.length >= 1 && routeNodes.length === routeEdges.length + 1;
    if (legOk) return { nodeIds: legNodes, edgeIds: legEdges };
    if (routeOk) return { nodeIds: routeNodes, edgeIds: routeEdges };
    return { nodeIds: legNodes.length ? legNodes : routeNodes, edgeIds: legEdges.length ? legEdges : routeEdges };
  }

  /** Polyline oficial pelos paths das edges — nunca diagonal entre nós distantes. */
  function officialMeshPaintPoints(leg, route, levelId) {
    const { nodeIds, edgeIds } = routePaintMesh(leg, route, levelId);
    if (edgeIds.length < 1 || nodeIds.length !== edgeIds.length + 1) return null;
    const mesh = buildMeshPaintPoints(edgeIds, nodeIds);
    if (!mesh || mesh.length < 2) return null;
    const outdoor = isOutdoorMeshEdgeIds(edgeIds);
    if (!outdoor && routePolylineCrossesWall(mesh, levelId)) return null;
    return removePointBacktracks(mesh);
  }

  /** Trecho outdoor oficial (Jardim/Servir) — paths do SVG, sem heurística de parede indoor. */
  function isOutdoorMeshEdgeIds(edgeIds) {
    if (!edgeIds?.length || !state.navGraph) return false;
    return edgeIds.every((eid) => {
      const e = state.navGraph.edgesById.get(eid);
      return e && (e.type === "outdoor_path" || e.zone === "outdoor");
    });
  }

  /** Remove laços visuais (ponto que repete posição mais adiante na polyline). */
  function removePointBacktracks(points, eps = 2.5) {
    const pts = (points || []).map((p) => ({ x: p.x, y: p.y }));
    if (pts.length < 3) return pts;
    let changed = true;
    while (changed && pts.length >= 3) {
      changed = false;
      for (let i = 0; i < pts.length - 2; i++) {
        for (let j = i + 2; j < pts.length; j++) {
          if (dist(pts[i], pts[j]) <= eps) {
            pts.splice(i + 1, j - i);
            changed = true;
            break;
          }
        }
        if (changed) break;
      }
    }
    return pts.length >= 2 ? pts : points;
  }

  function resolveRouteMeshEndIndex(nodeIds, endNodeId) {
    if (!nodeIds?.length || !endNodeId) return -1;
    let endIdx = nodeIds.lastIndexOf(endNodeId);
    if (endIdx >= 1) return endIdx;
    const base = nodeIdBase(endNodeId);
    for (let i = nodeIds.length - 1; i >= 1; i--) {
      if (nodeIdBase(nodeIds[i]) === base) return i;
    }
    return -1;
  }

  /** Anexa trecho final da malha (ex.: 0085 → Jardim → entrada) sem substituir a rota inteira. */
  function appendRouteMeshTail(pts, route, endNodeId, levelId, joinRadius = 18) {
    if (!pts?.length || !route?.nodeIds?.length || !endNodeId) return pts;
    const tip = pts[pts.length - 1];
    const nodeIds = route.nodeIds;
    const edgeIds = route.edgeIds || [];
    const endIdx = resolveRouteMeshEndIndex(nodeIds, endNodeId);
    if (endIdx < 1) return pts;

    const endNode = state.navGraph?.nodesById?.get(nodeIds[endIdx]);
    if (endNode && dist(tip, endNode) <= 1.2) return pts;

    let joinIdx = -1;
    for (let i = endIdx; i >= 0; i--) {
      const n = state.navGraph?.nodesById?.get(nodeIds[i]);
      if (n && dist(tip, n) <= joinRadius) { joinIdx = i; break; }
    }
    if (joinIdx < 0 || joinIdx >= endIdx) return pts;

    const tailNodes = nodeIds.slice(joinIdx, endIdx + 1);
    const tailEdges = edgeIds.slice(joinIdx, endIdx);
    const tail = buildMeshPaintPoints(tailEdges, tailNodes);
    if (!tail?.length || tail.length < 2) return pts;
    if (!isOutdoorMeshEdgeIds(tailEdges) && routePolylineCrossesWall(tail, levelId)) return pts;

    const out = pts.map((p) => ({ x: p.x, y: p.y }));
    for (let i = 0; i < tail.length; i++) {
      if (i === 0 && dist(out[out.length - 1], tail[0]) <= 1.2) continue;
      out.push(tail[i]);
    }
    return out;
  }

  /** Anexa trecho final da malha (0085 → Jardim/Servir) sem substituir a rota inteira. */
  function appendGardenMeshTail(pts, route, leg, dest, levelId) {
    if (!pts?.length || !isGardenAccessPoi(dest) || !route?.nodeIds?.length) return pts;
    const anchor = poiRouteAnchor(dest);
    const endNode = gardenOfficialEndNodeId(dest);
    if (!anchor || !endNode) return pts;
    const tip = pts[pts.length - 1];
    if (dist(tip, anchor) <= 1.2) return pts;
    return appendRouteMeshTail(pts, route, endNode, levelId);
  }

  /** Prolonga rota até a entrada lateral do Templo (malha outdoor + ícone da porta). */
  function ensureTempleEntranceRouteEndpoint(pts, route, levelId) {
    if (!pts?.length || route?.kind !== "templo") return pts;
    const endNode = route.entranceId || route.viaEndNode;
    if (!endNode) return pts;
    let out = appendRouteMeshTail(pts, route, endNode, levelId, 22);
    const base = nodeIdBase(endNode);
    const campus = CONFIG.templeEntranceIconCampus?.[base]
      || CONFIG.templeEntranceIconCampus?.[endNode];
    if (!campus) return out;
    const tip = out[out.length - 1];
    if (dist(tip, campus) <= 0.8) return out;
    const spurMax = 140;
    const mid = { x: campus.x, y: tip.y };
    if (dist(tip, mid) > 0.8 && dist(tip, mid) <= spurMax) {
      out = out.concat([mid]);
    }
    const tip2 = out[out.length - 1];
    if (dist(tip2, campus) > 0.8 && dist(tip2, campus) <= spurMax) {
      out = out.concat([{ x: campus.x, y: campus.y }]);
    }
    return out;
  }

  /** Prolonga a polyline até o nó da malha (corredor L00), sem desviar ao ícone decorativo. */
  function ensureGardenRouteNodeEndpoint(pts, dest, levelId, route, leg) {
    if (!pts?.length || !isGardenAccessPoi(dest)) return pts;
    let out = appendGardenMeshTail(pts, route, leg, dest, levelId);
    const dKey = poiRawKey(dest);
    const routeEdge = poiRouteEdgeSpec(dest);
    if (dKey === "P016_jardim" && routeEdge?.icon) {
      const tip = out[out.length - 1];
      if (dist(tip, routeEdge.icon) <= 0.8) return out;
      const spurMax = Math.max(tol("spurTol", poiToleranceZone(dest)), 80);
      const mid = { x: routeEdge.icon.x, y: tip.y };
      if (dist(tip, mid) > 0.8 && dist(tip, mid) <= spurMax && !crossesWall(tip, mid, levelId)) {
        out = out.concat([mid]);
      }
      const tip2 = out[out.length - 1];
      if (dist(tip2, routeEdge.icon) > 0.8 && dist(tip2, routeEdge.icon) <= spurMax
        && !crossesWall(tip2, routeEdge.icon, levelId)) {
        out = out.concat([{ x: routeEdge.icon.x, y: routeEdge.icon.y }]);
      }
      return out;
    }
    const anchor = poiRouteAnchor(dest);
    if (!anchor) return out;
    const tip = out[out.length - 1];
    if (dist(tip, anchor) <= 1.2) return out;
    const spurMax = Math.max(tol("spurTol", poiToleranceZone(dest)), 120);
    const mid = { x: anchor.x, y: tip.y };
    if (dist(tip, mid) > 0.8 && dist(tip, mid) <= spurMax && !crossesWall(tip, mid, levelId)) {
      out = out.concat([mid]);
    }
    const tip2 = out[out.length - 1];
    if (dist(tip2, anchor) > 0.8 && dist(tip2, anchor) <= spurMax && !crossesWall(tip2, anchor, levelId)) {
      out = out.concat([{ x: anchor.x, y: anchor.y }]);
    }
    return appendPoiRouteEdgeIcon(out, dest, levelId);
  }

  /** Remove vértices colineares (micro-zig-zags visuais). */
  function removeCollinearRoutePoints(points, eps = 1.15) {
    const pts = (points || []).map((p) => ({ x: p.x, y: p.y }));
    if (pts.length < 3) return pts;
    const out = [pts[0]];
    for (let i = 1; i < pts.length - 1; i++) {
      const a = out[out.length - 1];
      const b = pts[i];
      const c = pts[i + 1];
      const cross = Math.abs((b.x - a.x) * (c.y - a.y) - (b.y - a.y) * (c.x - a.x));
      if (cross > eps) out.push(b);
    }
    out.push(pts[pts.length - 1]);
    return out.length >= 2 ? out : pts;
  }

  /** Atalho visível entre pontos distantes quando não há parede no meio. */
  function shortcutRoutePoints(points, levelId) {
    const pts = (points || []).map((p) => ({ x: p.x, y: p.y }));
    if (pts.length < 3) return pts;
    // Indoor: atalhos diagonais podem cortar paredes (especialmente L00/ADM com falso negativo)
    if (levelId === "L00" || isAdmFloor(levelId) || isBasementFloor(levelId)) return pts;
    const lvl = levelId || "L00";
    const out = [pts[0]];
    let i = 0;
    while (i < pts.length - 1) {
      let best = i + 1;
      for (let j = pts.length - 1; j > i + 1; j--) {
        if (!crossesWall(pts[i], pts[j], lvl)) { best = j; break; }
      }
      out.push(pts[best]);
      i = best;
    }
    return out.length >= 2 ? out : pts;
  }

  /** Prioriza malha oficial (paths das edges) — nunca polyline diagonal fora do grafo. */
  function sanitizeRoutePaintPoints(points, leg, route, levelId) {
    const meshPts = officialMeshPaintPoints(leg, route, levelId);
    if (meshPts?.length >= 2) {
      return orthogonalizeRoutePolyline(removePointBacktracks(meshPts), levelId);
    }

    let pts = (points || []).map((p) => ({ x: p.x, y: p.y }));
    if (pts.length < 2) return pts;

    if (routePolylineCrossesWall(pts, levelId)) {
      while (pts.length >= 2 && crossesWall(pts[0], pts[1], levelId)) pts.shift();
      while (pts.length >= 2 && crossesWall(pts[pts.length - 2], pts[pts.length - 1], levelId)) pts.pop();
    }
    pts = removePointBacktracks(pts.length >= 2 ? pts : (points || []));
    return orthogonalizeRoutePolyline(pts, levelId);
  }

  function refineRoutePolyline(points, levelId) {
    if (!points || points.length < 3) return points || [];
    let pts = removeCollinearRoutePoints(points);
    pts = shortcutRoutePoints(pts, levelId);
    pts = removeCollinearRoutePoints(pts);
    return pts.length >= 2 ? pts : points;
  }

  /** Elimina laços A→…→A no percurso de nós. */
  function removeNodeBacktracks(nodeIds, edgeIds) {
    let nodes = (nodeIds || []).slice();
    let edges = (edgeIds || []).slice();
    let changed = true;
    while (changed && nodes.length >= 2) {
      changed = false;
      const seen = new Map();
      for (let i = 0; i < nodes.length; i++) {
        const id = nodes[i];
        if (seen.has(id)) {
          const j = seen.get(id);
          nodes = nodes.slice(0, j + 1).concat(nodes.slice(i + 1));
          edges = edges.slice(0, j).concat(edges.slice(i));
          changed = true;
          break;
        }
        seen.set(id, i);
      }
    }
    return { nodeIds: nodes, edgeIds: edges };
  }

  /** Reconecta nós consecutivos via A* quando edgeIds ficam inconsistentes. */
  function restitchRouteFromNodes(nodeIds, NR, opts = {}) {
    if (!nodeIds || nodeIds.length < 2 || !NR || !state.navGraph) return null;
    const walkOpts = { preference: "shortest", avoidParking: false, walkingSpeedMps: state.walkingSpeedMps || 1.2, ...opts };
    const legs = [];
    for (let i = 0; i < nodeIds.length - 1; i++) {
      const leg = NR.astar(nodeIds[i], [nodeIds[i + 1]], state.navGraph, walkOpts);
      if (!leg) return null;
      legs.push(leg);
    }
    let merged = {
      nodeIds: legs[0].nodeIds.slice(),
      edgeIds: legs[0].edgeIds.slice(),
      points: (legs[0].points || []).slice(),
      distanceMeters: legs[0].distanceMeters || 0,
    };
    for (let i = 1; i < legs.length; i++) {
      const leg = legs[i];
      merged.nodeIds = merged.nodeIds.concat(leg.nodeIds.slice(1));
      merged.edgeIds = merged.edgeIds.concat(leg.edgeIds);
      merged.points = merged.points.concat((leg.points || []).slice(1));
      merged.distanceMeters += leg.distanceMeters || 0;
    }
    return merged;
  }

  function rebuildMergedRouteGeometry(merged, NR) {
    if (!merged?.nodeIds?.length || !NR || !state.navGraph) return merged;
    const cleaned = removeNodeBacktracks(merged.nodeIds, merged.edgeIds || []);
    merged.nodeIds = cleaned.nodeIds;
    merged.edgeIds = cleaned.edgeIds;
    if (merged.edgeIds.length !== Math.max(0, merged.nodeIds.length - 1)) {
      const restitched = restitchRouteFromNodes(merged.nodeIds, NR);
      if (restitched) {
        merged.nodeIds = restitched.nodeIds;
        merged.edgeIds = restitched.edgeIds;
        merged.points = restitched.points;
        merged.distanceMeters = restitched.distanceMeters;
      }
    } else if (merged.edgeIds.length >= 1 && NR.buildRoutePoints) {
      try {
        const rebuilt = NR.buildRoutePoints(
          merged.edgeIds,
          merged.nodeIds,
          state.navGraph.edgesById,
          state.navGraph.nodesById
        );
        if (rebuilt?.length >= 2) merged.points = rebuilt;
      } catch { /* mantém points concatenados */ }
    }
    return merged;
  }

  function applyRoutePolylineRefinement(route, origin, dest) {
    if (route?.kind === "templo" && route.fromJson) return route;
    if (!route?.points || route.points.length < 3) return route;
    const oLvl = poiLevel(origin);
    const dLvl = poiLevel(dest);
    // Rotas multi-andar: nunca encurtar polyline global (evita diagonal entre andares)
    if (oLvl && dLvl && oLvl !== dLvl) return route;
    const lvl = oLvl === dLvl ? (oLvl || "L00") : (oLvl || dLvl || "L00");
    const refined = refineRoutePolyline(route.points, lvl);
    if (refined.length < 2) return route;
    if (routePolylineCrossesWall(refined, lvl)) return route;
    const mpu = getMetersPerUnit();
    let length = 0;
    for (let i = 1; i < refined.length; i++) length += dist(refined[i - 1], refined[i]);
    route.points = refined;
    route.length = length;
    if (mpu > 0) route.distanceMeters = length * mpu;
    return route;
  }

  function samplePolyline(pts, count) {
    if (!pts?.length) return [];
    if (pts.length === 1) return Array(count).fill({ x: pts[0].x, y: pts[0].y });
    const total = polylineLength(pts);
    if (total < 0.01) return Array(count).fill({ x: pts[0].x, y: pts[0].y });
    const out = [];
    let seg = 0;
    let acc = 0;
    let segLen = dist(pts[0], pts[1]);
    const n = Math.max(2, count);
    for (let i = 0; i < n; i++) {
      const target = (total * i) / (n - 1);
      while (seg < pts.length - 2 && acc + segLen < target - 1e-6) {
        acc += segLen;
        seg++;
        segLen = dist(pts[seg], pts[seg + 1]);
      }
      const t = segLen > 1e-6 ? Math.min(1, Math.max(0, (target - acc) / segLen)) : 0;
      out.push({
        x: pts[seg].x + (pts[seg + 1].x - pts[seg].x) * t,
        y: pts[seg].y + (pts[seg + 1].y - pts[seg].y) * t,
      });
    }
    return out;
  }

  function routePointSimilarity(ptsA, ptsB) {
    if (!ptsA?.length || !ptsB?.length) return 0;
    const lenA = polylineLength(ptsA);
    const lenB = polylineLength(ptsB);
    if (lenA < 1 || lenB < 1) return ptsA.length === ptsB.length ? 1 : 0;
    const lenRatio = Math.min(lenA, lenB) / Math.max(lenA, lenB);
    if (lenRatio < 0.82) return 0;
    const sa = samplePolyline(ptsA, 20);
    const sb = samplePolyline(ptsB, 20);
    let sum = 0;
    for (let i = 0; i < sa.length; i++) sum += dist(sa[i], sb[i]);
    const avg = sum / sa.length;
    return Math.max(0, 1 - avg / 22) * lenRatio;
  }

  function routeEdgeSimilarity(a, b) {
    const NR = globalThis.NavigationRouter;
    if (NR?.calculateEdgeSimilarity && a?.edgeIds?.length && b?.edgeIds?.length) {
      return NR.calculateEdgeSimilarity(a, b);
    }
    const sigA = (a?.edgeIds || []).join(">") || String(a?.sig || "");
    const sigB = (b?.edgeIds || []).join(">") || String(b?.sig || "");
    if (sigA && sigA === sigB) return 1;
    return 0;
  }

  function nodeSetSimilarity(a, b) {
    const na = a?.nodeIds || [];
    const nb = b?.nodeIds || [];
    if (!na.length || !nb.length) return 0;
    const setA = new Set(na);
    const setB = new Set(nb);
    let inter = 0;
    for (const id of setA) if (setB.has(id)) inter++;
    const union = new Set([...na, ...nb]).size;
    return union ? inter / union : 0;
  }

  /** Pontos usados para comparar rotas (perna do andar ativo quando disponível). */
  function routeComparePoints(route) {
    if (!route) return [];
    const legs = route.legs;
    if (legs?.length) {
      const leg = legs.find((l) => l.level === state.activeLevel) || legs[0];
      if (leg?.points?.length >= 2) return leg.points;
    }
    if (route.nodeIds?.length && state.navGraph && globalThis.NavigationRouter) {
      try {
        const built = routeLegsFromGraph(route);
        route.legs = built;
        const leg = built.find((l) => l.level === state.activeLevel) || built[0];
        if (leg?.points?.length >= 2) return leg.points;
      } catch { /* usa pontos completos */ }
    }
    return route.points || [];
  }

  /** Rotas visualmente iguais ou quase iguais (edgeIds diferentes mas mesmo caminho). */
  function isCfToJardimPair(origin, dest) {
    if (!origin || !dest) return false;
    const keys = [poiRawKey(origin), poiRawKey(dest)];
    const isJardimKey = (k) => /P016_jardim|P020_espaco_servir|(?:^|_)jardim$/i.test(k);
    const dName = normSearch(dest.searchLabel || dest.name || "");
    const jardimDest = isJardimKey(keys[1]) || /\bjardim\b/.test(dName);
    if (!jardimDest) return false;
    if (poiLevel(origin) === "L00") return true;
    const isCfKey = (k) => /P005_centro_de_formacao|P004_sala_de_oracao_RGO|centro_de_formacao|formacao_cf/i.test(k);
    if (isCfKey(keys[0]) || isCfKey(keys[1])) return true;
    const oName = normSearch(origin.searchLabel || origin.name || "");
    const cfName = /centro de formacao|formacao cf|^cf$|centro formacao/.test(oName)
      || /centro de formacao|formacao cf|^cf$|centro formacao/.test(dName);
    return cfName;
  }

  const CF_JARDIM_NAMED_LABELS = [
    "Corredor oeste · Jardim/Servir",
    "Pelo jardim (vertical)",
    "Pelo estacionamento (leste)",
    "Pelo estabelecimento (RGO)",
  ];

  /* Alternativas obrigatórias para chegadas no Jardim/Espaço Servir.
     Reutilizam os waypoints oficiais já cadastrados em namedExternalRoutes. */
  const GARDEN_WEST_ROUTE = {
    sourceLabel: "Corredor oeste · Jardim/Servir",
    label: "Direcionado pelo oeste do terreno",
    slot: 1,
  };
  const GARDEN_EAST_ROUTE = {
    sourceLabel: "Pelo estabelecimento (interior)",
    label: "Direcionado pelo lado leste do terreno",
    slot: 2,
  };
  const GARDEN_SOUTH_ROUTE = {
    sourceLabel: "Por fora da igreja",
    label: "Direcionado pelo corredor sul",
    slot: 3,
    onlyGroundFloor: true,
    // Prefixo leste até a recepção + corredor inferior externo até Jardim/Servir.
    via: [
      "L00_node_0043",
      "L00_node_0044",
      "L00_node_0046",
      "L00_node_0048",
      "L00_node_0031",
      "L00_node_0065",
      "L00_node_0029_recepcao",
      "L00_node_0027",
      "L00_node_0008",
      "L00_node_0009",
    ],
  };

  function gardenRequiredRouteLabels(origin, dest) {
    const labels = [GARDEN_WEST_ROUTE.label, GARDEN_EAST_ROUTE.label];
    if (poiLevel(origin) === "L00" && poiLevel(dest) === "L00") {
      labels.push(GARDEN_SOUTH_ROUTE.label);
    }
    return labels;
  }

  const CF_SERVIR_NAMED_LABELS = [
    "Corredor oeste · Jardim/Servir",
    "Pelo estabelecimento (interior)",
    "Pelo estacionamento (leste)",
    "Entrada/saída · Av. Batel",
    "Pelo estabelecimento (RGO)",
  ];

  const RGO_CONEXAO_NAMED_LABEL = "Pelo corredor interno";

  const TO_CF_INTERIOR_LABEL = "Pelo corredor do estabelecimento";
  const TO_CF_WEST_LABEL = "Corredor oeste · CF";
  const TO_CF_NAMED_LABELS = [TO_CF_INTERIOR_LABEL, TO_CF_WEST_LABEL];

  const L00_INTERIOR_TERRAIN_LABEL = "Pela área interna do térreo";

  function matchPoiKeySide(side, key) {
    if (!key) return false;
    if (Array.isArray(side)) {
      return side.some((item) => {
        const t = String(item);
        return t === key || t.toLowerCase() === key.toLowerCase()
          || key.endsWith(t) || t.endsWith(key);
      });
    }
    return side === key;
  }

  function l00TerrainZone(poi) {
    const cfg = CONFIG.l00InteriorTerrain;
    if (!cfg || !poi) return null;
    const key = poiRawKey(poi);
    if (matchPoiKeySide(cfg.northKeys, key)) return "north";
    if (matchPoiKeySide(cfg.southKeys, key)) return "south";
    if (matchPoiKeySide(cfg.westKeys, key)) return "west";
    return null;
  }

  /** Par L00 entre extremos do terreno (CF/RGO ↔ hall/conexão/elevador ou jardim). */
  function isL00InteriorTerrainPair(origin, dest) {
    if (!origin || !dest) return false;
    if (poiLevel(origin) !== "L00" || poiLevel(dest) !== "L00") return false;
    if (isBasementFloor(poiLevel(origin)) || isBasementFloor(poiLevel(dest))) return false;
    const oz = l00TerrainZone(origin);
    const dz = l00TerrainZone(dest);
    if (!oz || !dz || oz === dz) return false;
    return true;
  }

  function buildL00InteriorTerrainSpec(origin, dest) {
    const cfg = CONFIG.l00InteriorTerrain;
    if (!cfg) return null;
    const oz = l00TerrainZone(origin);
    const dz = l00TerrainZone(dest);
    if (!oz || !dz || oz === dz) return null;
    const pairKey = `${oz}-${dz}`;
    const viaMap = {
      "north-south": cfg.northToSouthVia,
      "south-north": cfg.southToNorthVia,
      "west-north": cfg.westToNorthVia,
      "north-west": cfg.westToNorthVia?.slice?.().reverse(),
      "west-south": cfg.westToSouthVia,
      "south-west": cfg.westToSouthVia?.slice?.().reverse(),
    };
    let via = viaMap[pairKey];
    if (!via?.length) {
      if (oz === "north" || dz === "north") via = oz === "north" ? cfg.northToSouthVia : cfg.southToNorthVia;
      else via = cfg.westToSouthVia;
    }
    if (!via?.length) return null;
    const endNodes = dz === "north" ? cfg.northEndNodes
      : dz === "south" ? cfg.southEndNodes
        : cfg.westEndNodes;
    return {
      via: via.slice(),
      endNodes: (endNodes || []).slice(),
      label: cfg.label || L00_INTERIOR_TERRAIN_LABEL,
      avoidParking: false,
      allowParking: true,
      slot: cfg.slot ?? 1,
    };
  }

  function isCfDestinationKey(key) {
    return /P005_centro_de_formacao|P004_sala_de_oracao_RGO|centro_de_formacao|formacao_cf|startkids-10-12/i.test(String(key || ""));
  }

  function isToCfPair(origin, dest) {
    if (!origin || !dest) return false;
    const oKey = poiRawKey(origin);
    const dKey = poiRawKey(dest);
    if (isCfDestinationKey(oKey) && isCfDestinationKey(dKey)) return false;
    if (isCfDestinationKey(dKey)) return true;
    const dName = normSearch(dest.searchLabel || dest.name || "");
    if (!/salas start \(10 a 12|centro de formacao|formacao cf|^cf$/.test(dName)) return false;
    const oName = normSearch(origin.searchLabel || origin.name || "");
    return !/salas start \(10 a 12|centro de formacao|formacao cf|^cf$/.test(oName);
  }

  function isRgoToConexaoPair(origin, dest) {
    if (!origin || !dest) return false;
    const keys = [poiRawKey(origin), poiRawKey(dest)];
    const isRgo = (k) => /P004_sala_de_oracao_RGO/i.test(k);
    const isConexao = (k) => /P010_espaco_conexao/i.test(k);
    if ((isRgo(keys[0]) && isConexao(keys[1])) || (isRgo(keys[1]) && isConexao(keys[0]))) return true;
    const oName = normSearch(origin.searchLabel || origin.name || "");
    const dName = normSearch(dest.searchLabel || dest.name || "");
    const rgoName = /sala de oracao rgo|\brgo\b/.test(oName) || /sala de oracao rgo|\brgo\b/.test(dName);
    const conexaoName = /espaco conexao|espaço conexão|conexao servir|conexão servir/.test(oName)
      || /espaco conexao|espaço conexão|conexao servir|conexão servir/.test(dName);
    return rgoName && conexaoName;
  }

  function resolveTripNodeIds(poi, role) {
    let ids = resolveNavNodeIds(poi, role);
    if (ids.length) return ids;
    const raw = poiRawKey(poi);
    const anchor = CONFIG.poiAnchors?.[raw];
    if (anchor) {
      const resolved = resolveGraphNodeId(anchor) || anchor;
      if (state.navGraph?.nodesById?.has(resolved)) return [resolved];
    }
    const NR = globalThis.NavigationRouter;
    if (NR && state.navGraph && poi) {
      const lvl = poiLevel(poi) || state.activeLevel || "L00";
      const snap = isGardenAccessPoi(poi)
        ? (poiRouteAnchor(poi) || poi)
        : (poiIcon(poi) || poi);
      const id = NR.nearestNodeId(snap, state.navGraph, {
        level: lvl,
        avoidParking: role === "here" || role === "origin",
      });
      if (id) return [id];
    }
    return [];
  }

  /** Empacota pernas A* do JSON numa rota exibível. */
  function packNavLegRoutes(NR, legs, origin, dest) {
    if (!legs?.length) return [];
    const mpu = getMetersPerUnit();
    return legs.map((leg, i) => {
      const points = appendPoiEndpoints(leg.points || [], origin, dest);
      if (points.length < 2) return null;
      let length = 0;
      for (let j = 1; j < points.length; j++) length += dist(points[j - 1], points[j]);
      const meshLen = (leg.points || []).reduce((s, p, k, a) => (k ? s + dist(a[k - 1], p) : 0), 0);
      const spurExtra = Math.max(0, length - meshLen);
      return {
        points,
        length: (mpu > 0 ? leg.distanceMeters / mpu : length) + (mpu > 0 ? spurExtra : 0),
        distanceMeters: (leg.distanceMeters || 0) + spurExtra * mpu,
        nodeIds: leg.nodeIds,
        edgeIds: leg.edgeIds,
        rank: i + 1,
        label: (NR && NR.rankLabel) ? NR.rankLabel(i + 1, legs.length) : `Rota ${i + 1}`,
        kind: i === 0 ? "best" : "alt",
        fromJson: true,
      };
    }).filter(Boolean);
  }

  /** Garante ao menos uma rota utilizável — nunca deixa o usuário sem alternativa. */
  function buildGuaranteedRouteOptions(origin, dest, NR) {
    origin = enrichTripPoi(origin);
    dest = enrichTripPoi(dest);
    if (isTempleDestination(dest) && NR && state.navGraph) {
      const temple = buildTempleDestinationRouteOptions(NR, origin, dest);
      if (temple.length) return temple;
    }
    const startIds = resolveTripNodeIds(origin, origin?.id === "__here__" ? "here" : "origin");
    const endIds = resolveTripNodeIds(dest, "dest");
    if (NR && state.navGraph && startIds.length && endIds.length) {
      const allowParking = tripAllowsParking(origin, dest);
      let found = NR.findRoutesForPoiPair(startIds, endIds, state.navGraph, {
        preference: "shortest",
        avoidParking: !allowParking,
        walkingSpeedMps: state.walkingSpeedMps || 1.2,
      });
      if (!found.length) {
        found = NR.findRoutesForPoiPair(startIds, endIds, state.navGraph, {
          preference: "shortest",
          avoidParking: false,
          walkingSpeedMps: state.walkingSpeedMps || 1.2,
        });
      }
      const packed = packNavLegRoutes(NR, found.slice(0, MAX_ROUTE_OPTIONS), origin, dest);
      if (packed.length) return packed;
    }
    const er = emergencyRoute(origin, dest);
    if (er?.points?.length >= 2) {
      er.label = er.label || "Rota mais próxima";
      er.kind = "best";
      return [er];
    }
    const o = poiRouteAnchor(origin) || poiIcon(origin);
    const d = poiRouteAnchor(dest) || poiIcon(dest);
    if (o && d && dist(o, d) > 0.01) {
      const len = dist(o, d);
      const mpu = getMetersPerUnit();
      return [{
        points: [o, d],
        length: len,
        distanceMeters: len * mpu,
        nodeIds: [...startIds, ...endIds].filter(Boolean),
        edgeIds: [],
        rank: 1,
        label: "Rota aproximada",
        kind: "best",
        approximate: true,
      }];
    }
    return [];
  }

  /** Térreo ↔ L1…L6 (e entre andares ADM): sempre elevador T + escadas laterais T. */
  function ensureCrossFloorRouteOptions(options, NR, origin, dest) {
    const oLvl = poiLevel(origin);
    const dLvl = poiLevel(dest);
    if (!NR || !state.navGraph) return options || [];
    if (!involvesAdmFloorCross(oLvl, dLvl)) return options || [];
    let list = (options || []).slice();
    const hasElev = list.some((r) => r.kind === "elevator" || /elevador/i.test(r.label || ""));
    const hasStair = list.some((r) => r.viaStairs || r.kind === "stairs" || /escada lateral/i.test(r.label || ""));
    if (hasElev && hasStair) return list;
    const startIds = resolveTripNodeIds(origin, origin?.id === "__here__" ? "here" : "origin");
    const endIds = resolveTripNodeIds(dest, "dest");
    if (!startIds.length || !endIds.length) return list;
    const cross = buildCrossCampusFloorRoutes(NR, startIds, endIds, origin, dest);
    for (const r of cross) {
      if (list.some((x) => isDuplicateRoute(x, r) || x.label === r.label)) continue;
      list.push(r);
    }
    return list.sort((a, b) => (a.slot ?? 99) - (b.slot ?? 99));
  }

  /** Térreo → Jardim: garante contorno do templo + rota pelo estabelecimento. */
  function ensureJardimRouteOptions(options, NR, origin, dest) {
    if (!NR || !state.navGraph || !isCfToJardimPair(origin, dest)) return options || [];
    let list = (options || []).slice();
    const hasContour = list.some((r) => /corredor oeste|estacionamento \(leste\)|contorno leste/i.test(r.label || ""));
    const hasIndoor = list.some((r) => /estabelecimento|rgo|corredor/i.test(r.label || ""));
    if (hasContour && hasIndoor) return list;
    const extra = buildCfJardimRouteOptions(NR, origin, dest);
    for (const r of extra) {
      if (r.slot === 1) continue;
      if (list.some((x) => isDuplicateRoute(x, r) || x.label === r.label)) continue;
      list.push(r);
    }
    return list.sort((a, b) => (a.slot ?? 99) - (b.slot ?? 99));
  }

  /** Em qualquer origem, Jardim/Espaço Servir sempre expõe caminhos pelo oeste e pelo leste. */
  function ensureGardenWestEastRouteOptions(NR, startIds, endIds, origin, dest, packed) {
    if (!NR || !state.navGraph || !isJardimDestination(dest)) return packed || [];
    let list = (packed || []).slice();
    for (const routeDef of [GARDEN_WEST_ROUTE, GARDEN_EAST_ROUTE, GARDEN_SOUTH_ROUTE]) {
      if (routeDef.onlyGroundFloor && (poiLevel(origin) !== "L00" || poiLevel(dest) !== "L00")) continue;
      if (list.some((r) => r.label === routeDef.label)) continue;
      // Uma rota equivalente já pode ter sido criada pelo pipeline antigo:
      // preserva sua geometria e apenas expõe o rótulo obrigatório ao usuário.
      const existing = list.find((r) => r.label === routeDef.sourceLabel);
      if (existing) {
        existing.label = routeDef.label;
        existing.forceInclude = true;
        existing.slot = routeDef.slot;
        continue;
      }
      const sourceSpec = (CONFIG.namedExternalRoutes || [])
        .find((r) => r.label === routeDef.sourceLabel);
      if (!sourceSpec) continue;
      const external = buildNamedExternalRoute(NR, startIds, endIds, origin, dest, {
        ...sourceSpec,
        ...(routeDef.via ? { via: routeDef.via } : {}),
        label: routeDef.label,
        slot: routeDef.slot,
      });
      if (!external) continue;
      external.forceInclude = true;
      external.slot = routeDef.slot;
      // As alternativas oeste/leste compartilham parte do trajeto; a semelhança
      // geométrica não pode ocultar uma delas. Só descarta caminho idêntico.
      const exactDuplicate = list.some((r) => {
        const a = (r.edgeIds || []).join(">");
        const b = (external.edgeIds || []).join(">");
        return !!a && a === b;
      });
      if (!exactDuplicate) {
        list.push(external);
      }
    }
    return list.sort((a, b) => (a.slot ?? 99) - (b.slot ?? 99));
  }

  /** Aplicado após a compactação genérica: Jardim/Servir sempre mostra os dois lados do terreno. */
  function enforceGardenWestEastRouteOptions(NR, origin, dest, packed) {
    if (!NR || !state.navGraph || !isJardimDestination(dest)) return packed || [];
    const startIds = resolveTripNodeIds(origin, origin?.id === "__here__" ? "here" : "origin");
    const endIds = resolveTripNodeIds(dest, "dest");
    if (!startIds.length || !endIds.length) return packed || [];
    const list = ensureGardenWestEastRouteOptions(NR, startIds, endIds, origin, dest, packed);
    const requiredLabels = gardenRequiredRouteLabels(origin, dest);
    const required = list.filter((r) => requiredLabels.includes(r.label));
    // Mantém somente as alternativas oficiais quando todas puderem ser montadas.
    return required.length === requiredLabels.length ? required.sort((a, b) => a.slot - b.slot) : list;
  }

  /** Coleta rotas pelo pipeline completo e garante fallback final. */
  function collectRouteOptionsForTrip(origin, dest) {
    const NR = globalThis.NavigationRouter;
    let options = routeOptions(origin, dest) || [];

    if (state.navGraph && NR) {
      const startIds = resolveTripNodeIds(origin, origin?.id === "__here__" ? "here" : "origin");
      const endIds = resolveTripNodeIds(dest, "dest");
      if (startIds.length && endIds.length) {
        options = appendNamedExternalOptions(NR, startIds, endIds, origin, dest, options);
        options = ensureCfJardimNamedRoutes(NR, startIds, endIds, origin, dest, options);
        options = ensureGardenWestEastRouteOptions(NR, startIds, endIds, origin, dest, options);
        options = ensureRgoConexaoNamedRoutes(NR, startIds, endIds, origin, dest, options);
      }
    }

    options = dedupeRouteOptionsStrict(
      finalizePackedRoutes(options, NR, origin, dest),
      NR,
      origin,
      dest
    );
    options = ensureMinimumRouteOptions(options, NR, origin, dest);
    options = ensureCrossFloorRouteOptions(options, NR, origin, dest);
    if (state.navGraph && NR && involvesAdmFloorCross(poiLevel(origin), poiLevel(dest))) {
      const startIds = resolveTripNodeIds(origin, "origin");
      const endIds = resolveTripNodeIds(dest, "dest");
      if (startIds.length && endIds.length) {
        const cross = buildCrossCampusFloorRoutes(NR, startIds, endIds, origin, dest);
        for (const r of cross) {
          if (options.some((x) => isDuplicateRoute(x, r) || x.label === r.label)) continue;
          options.push(r);
        }
        options.sort((a, b) => (a.slot ?? 99) - (b.slot ?? 99));
      }
    }
    options = ensureJardimRouteOptions(options, NR, origin, dest);
    if (state.navGraph && NR && isRgoToConexaoPair(origin, dest)) {
      const startIds = resolveTripNodeIds(origin, "origin");
      const endIds = resolveTripNodeIds(dest, "dest");
      if (startIds.length && endIds.length) {
        options = ensureRgoConexaoNamedRoutes(NR, startIds, endIds, origin, dest, options);
      }
    }
    options = dedupeRouteOptionsStrict(options, NR, origin, dest);
    options.sort((a, b) => (a.length || 0) - (b.length || 0));
    options.forEach((r, i) => { r.rank = i + 1; });
    options = filterInvalidHereJardimRoutes(options, origin, dest);

    if (!options.length && NR && state.navGraph && isTempleDestination(dest)) {
      options = buildTempleDestinationRouteOptions(NR, origin, dest);
    }

    if (!options.length) {
      const er = emergencyRoute(origin, dest);
      if (er?.points?.length >= 2) {
        er.label = er.label || "Rota 1 — Mais curta";
        er.kind = "best";
        options = [er];
      }
    }

    if (!options.length) {
      options = buildGuaranteedRouteOptions(origin, dest, NR);
    }

    options = enforceMinimumRouteOptions(options, NR, origin, dest);
    options = enforceGardenWestEastRouteOptions(NR, origin, dest, options);

    return options.filter((r) => r?.points?.length >= 2);
  }

  /** Monta rota CF → Jardim forçando contorno + corredor (ignora deduplicação genérica). */
  function buildCfJardimRouteOptions(NR, origin, dest) {
    if (!NR || !state.navGraph) return [];
    const startRole = origin?.id === "__here__" ? "here" : "origin";
    const startIds = resolveTripNodeIds(origin, startRole);
    const endIds = resolveTripNodeIds(dest, "dest");
    if (!startIds.length || !endIds.length) return [];

    const allowParking = tripAllowsParking(origin, dest);
    const walkOpts = {
      preference: "shortest",
      avoidParking: !allowParking,
      walkingSpeedMps: state.walkingSpeedMps || 1.2,
    };

    const wrapLeg = (leg, label, slot, namedExternal) => {
      if (!leg?.points?.length) return null;
      const points = appendPoiEndpoints(leg.points, origin, dest);
      if (points.length < 2) return null;
      const mpu = getMetersPerUnit();
      let meshLen = 0;
      for (let i = 1; i < leg.points.length; i++) meshLen += dist(leg.points[i - 1], leg.points[i]);
      const spurExtra = Math.max(0, points.reduce((s, p, i, a) => (i ? s + dist(a[i - 1], p) : 0), 0) - meshLen);
      return {
        points,
        nodeIds: leg.nodeIds,
        edgeIds: leg.edgeIds,
        length: (mpu > 0 ? leg.distanceMeters / mpu : meshLen) + spurExtra,
        distanceMeters: (leg.distanceMeters || 0) + spurExtra * mpu,
        label,
        slot,
        kind: namedExternal ? "fora" : "best",
        namedExternal: !!namedExternal,
        forceInclude: true,
        fromJson: true,
      };
    };

    const dKey = poiRawKey(dest);
    const isGardenDest = isGardenAccessPoi(dest) || dKey === "P016_jardim" || dKey === "P020_espaco_servir";
    const out = [];

    {
      const jardimOpts = withJardimRouteOpts(dest, walkOpts);
      let shortest = NR.findRoutesForPoiPair(startIds, endIds, state.navGraph, jardimOpts);
      if (!shortest.length && walkOpts.avoidParking) {
        shortest = NR.findRoutesForPoiPair(startIds, endIds, state.navGraph, { ...jardimOpts, avoidParking: false });
      }
      const best = truncateRouteAtJardimCorner(wrapLeg(shortest[0], "Rota 1 — Mais curta", 0, false), dest);
      if (best) out.push(best);
    }

    const labelList = isGardenDest && dKey === "P020_espaco_servir"
      ? CF_SERVIR_NAMED_LABELS
      : CF_JARDIM_NAMED_LABELS;
    const specs = (CONFIG.namedExternalRoutes || [])
      .filter((r) => labelList.includes(r.label))
      .sort((a, b) => (a.slot ?? 99) - (b.slot ?? 99));

    for (const cfgSpec of specs) {
      const route = buildNamedExternalRoute(NR, startIds, endIds, origin, dest, cfgSpec);
      if (!route) continue;
      route.forceInclude = true;
      route.slot = cfgSpec.slot;
      route.label = cfgSpec.label || route.label;
      out.push(route);
    }

    return out
      .map((r) => truncateRouteAtJardimCorner(r, dest))
      .sort((a, b) => (a.slot ?? 99) - (b.slot ?? 99));
  }

  function isDuplicateRoute(a, b) {
    if (!a || !b || a === b) return !!a && a === b;
    const la = normRouteLabel(a.label);
    const lb = normRouteLabel(b.label);
    const sigA = (a.edgeIds || []).join(">");
    const sigB = (b.edgeIds || []).join(">");
    // rotas nomeadas com labels distintos só duplicam se forem o mesmo caminho exato
    if (la && lb && la !== lb && (a.namedExternal || b.namedExternal)) {
      if (sigA && sigA === sigB) return true;
      return false;
    }
    if (la && lb && la === lb && la.length > 4) return true;
    if (a.entranceId && b.entranceId && a.entranceId === b.entranceId) return true;
    if (sigA && sigA === sigB) return true;
    const NR = globalThis.NavigationRouter;
    if (NR?.isTooSimilarRoute?.(a, b)) return true;
    const nodeA = (a.nodeIds || []).join(">");
    const nodeB = (b.nodeIds || []).join(">");
    if (nodeA && nodeA === nodeB) return true;
    if (routeEdgeSimilarity(a, b) >= ROUTE_DUPE_EDGE) return true;
    const ptsA = routeComparePoints(a);
    const ptsB = routeComparePoints(b);
    if (routePointSimilarity(ptsA, ptsB) >= ROUTE_DUPE_POINTS) return true;
    if (routePointSimilarity(a.points, b.points) >= ROUTE_DUPE_POINTS) return true;
    if (nodeSetSimilarity(a, b) >= 0.88) return true;
    const lenA = a.length || polylineLength(a.points);
    const lenB = b.length || polylineLength(b.points);
    if (lenA > 0 && lenB > 0) {
      const lenRatio = Math.min(lenA, lenB) / Math.max(lenA, lenB);
      const ptSim = routePointSimilarity(ptsA, ptsB);
      if (lenRatio >= 0.9 && ptSim >= 0.68) return true;
      if (lenRatio >= 0.94 && routeEdgeSimilarity(a, b) >= 0.62) return true;
    }
    return false;
  }

  function listHasDuplicateRoute(list, candidate) {
    return (list || []).some((r) => isDuplicateRoute(r, candidate));
  }

  function pushUniqueRoute(list, route, max = MAX_ROUTE_OPTIONS) {
    if (!route?.points || route.points.length < 2) return false;
    if (list.length >= max) return false;
    if (listHasDuplicateRoute(list, route)) return false;
    list.push(route);
    return true;
  }

  function relabelRouteOptions(routes, NR) {
    const isStair = (r) => !!r.viaStairs;
    routes.forEach((r, i) => {
      r.rank = i + 1;
      if (isStair(r)) {
        r.kind = "stairs";
        r.namedExternal = true;
        r.viaStairs = true;
        r.label = STAIRS_T_LABEL;
      } else if (r.kind === "elevator") {
        r.label = r.label || ELEVATOR_T_LABEL;
      } else if (r.viaStairs || r.kind === "stairs") {
        r.label = r.label || STAIRS_T_LABEL;
      } else if (r.namedExternal) {
        r.kind = "fora";
        r.label = r.label || "Por fora da igreja";
      } else if (r.forceInclude && r.label) {
        r.kind = r.kind || (i === 0 ? "best" : "fora");
      } else if (!r.entranceId) {
        r.label = (NR && NR.rankLabel) ? NR.rankLabel(i + 1, routes.length) : `Rota ${i + 1}`;
        r.kind = i === 0 ? "best" : "alt";
      }
    });
    return routes;
  }

  /** Remove duplicatas preservando ordem; nunca menos que minRouteOptionsForPair. */
  function dedupeRouteOptionsStrict(routes, NR, origin, dest) {
    const cap = origin && dest ? effectiveMaxRouteOptionsForPair(origin, dest) : MAX_ROUTE_OPTIONS;
    const isStair = (r) => !!r.viaStairs;
    const forced = (routes || []).filter((r) => r?.forceInclude && r.points?.length >= 2);
    const unique = [];
    for (const r of forced) {
      if (unique.length >= cap) break;
      unique.push(r);
    }
    for (const r of (routes || [])) {
      if (!r?.points || r.points.length < 2) continue;
      if (r.forceInclude) continue;
      if (unique.length >= cap) break;
      if (listHasDuplicateRoute(unique, r)) continue;
      unique.push(r);
    }
    const stair = unique.find(isStair) || (routes || []).find(isStair);
    let core = unique.filter((r) => !isStair(r));
    if (stair) {
      core = core.filter((r) => !isDuplicateRoute(r, stair));
      if (!core.some(isStair) && !listHasDuplicateRoute(core, stair)) {
        if (core.length >= cap) core = core.slice(0, cap - 1);
        core.push(stair);
      }
    }
    const final = [];
    for (const r of core) {
      if (final.length >= cap) break;
      if (listHasDuplicateRoute(final, r)) continue;
      final.push(r);
    }
    return relabelRouteOptions(final, NR);
  }

  /** Garante rotas distintas (máx. 4) — sem alternativas repetidas. */
  function finalizePackedRoutes(packed, NR, origin, dest) {
    let list = (packed || []).filter((r) => r && r.points && r.points.length >= 2);
    if (origin && dest) {
      list = list.filter((r) => {
        if (r.kind === "templo" && r.fromJson && (r.edgeIds?.length >= 1)) return true;
        if (r.namedExternal && r.forceInclude) return true;
        if (!isRouteWallSafe(r, origin, dest)) return false;
        const lvl = poiLevel(origin) === poiLevel(dest) ? (poiLevel(origin) || "L00") : "L00";
        const pts = r.points || [];
        if (isSyntheticStraightSpur(pts, null, r) && routePolylineCrossesWall(pts, lvl)) return false;
        return true;
      });
      list = pruneAbsurdSameFloorRoutes(list, origin, dest);
    }
    list.sort((a, b) => (a.length || 0) - (b.length || 0));
    const isStair = (r) => !!r.viaStairs;
    const stair = list.find(isStair) || null;
    const named = list.filter((r) => r.namedExternal && !isStair(r))
      .sort((a, b) => (a.slot ?? 99) - (b.slot ?? 99));
    const rest = list.filter((r) => !r.namedExternal && !isStair(r));
    const maxRoutes = origin && dest ? maxRouteOptionsForPair(origin, dest) : MAX_ROUTE_OPTIONS;

    const out = [];
    if (rest[0]) out.push(rest[0]);

    const namedBudget = Math.max(0, maxRoutes - out.length - (stair ? 1 : 0));
    let namedAdded = 0;
    for (const n of named) {
      if (namedAdded >= namedBudget) break;
      if (pushUniqueRoute(out, n, maxRoutes)) namedAdded++;
    }

    for (const r of rest.slice(1)) {
      const room = maxRoutes - out.length - (stair ? 1 : 0);
      if (room <= 0) break;
      pushUniqueRoute(out, r, maxRoutes);
    }

    if (stair && !out.some((r) => isStair(r) || isDuplicateRoute(r, stair))) {
      if (out.length >= maxRoutes) out[maxRoutes - 1] = stair;
      else out.push(stair);
    } else if (stair && out.some(isStair)) {
      const idx = out.findIndex(isStair);
      if (idx >= 0 && idx < out.length - 1) {
        const [s] = out.splice(idx, 1);
        out.push(s);
      }
    }

    const deduped = [];
    for (const r of out) {
      if (deduped.length >= maxRoutes) break;
      pushUniqueRoute(deduped, r, maxRoutes);
    }

    if (origin && dest) {
      for (let i = 0; i < deduped.length; i++) {
        deduped[i] = applyRoutePolylineRefinement(deduped[i], origin, dest);
        deduped[i] = truncateRouteAtJardimCorner(deduped[i], dest);
      }
    }

    return dedupeRouteOptionsStrict(deduped, NR, origin, dest);
  }

  /** Concatena pernas A* (via um ou mais nós) numa única rota. */
  function concatNavLegs(...legs) {
    const list = legs.filter(Boolean);
    if (list.length < 2) return list[0] || null;
    let merged = {
      nodeIds: list[0].nodeIds.slice(),
      edgeIds: list[0].edgeIds.slice(),
      points: (list[0].points || []).slice(),
      distanceMeters: list[0].distanceMeters || 0,
    };
    for (let i = 1; i < list.length; i++) {
      const leg = list[i];
      merged.nodeIds = merged.nodeIds.concat(leg.nodeIds.slice(1));
      merged.edgeIds = merged.edgeIds.concat(leg.edgeIds);
      merged.points = merged.points.concat((leg.points || []).slice(1));
      merged.distanceMeters += leg.distanceMeters || 0;
    }
    const NR = globalThis.NavigationRouter;
    return rebuildMergedRouteGeometry(merged, NR);
  }

  /** Rota opcional externa forçada por via (string ou lista de waypoints). */
  function buildNamedExternalRoute(NR, startIds, endIds, origin, dest, spec) {
    if (!NR?.astar || !state.navGraph || !spec?.via) return null;
    let vias = (Array.isArray(spec.via) ? spec.via : [spec.via])
      .filter((id) => state.navGraph.nodesById.has(id));
    if (!vias.length) return null;
    const preferredEnds = (Array.isArray(spec.endNodes) ? spec.endNodes : [])
      .filter((id) => state.navGraph.nodesById.has(id));
    const gardenEnd = gardenOfficialEndNodeId(dest);
    let ends = gardenEnd ? [gardenEnd] : (preferredEnds.length ? preferredEnds : endIds);
    const allowPark = spec.allowParking === true || spec.avoidParking === false;

    // Inverte waypoints quando origem/destino estão na ordem b→a do spec
    const aKey = poiRawKey(origin);
    const bKey = poiRawKey(dest);
    const sideMatch = (side, key) => {
      if (Array.isArray(side)) {
        return side.some((item) => {
          const t = String(item);
          return t === key || t.toLowerCase() === key.toLowerCase()
            || key.endsWith(t) || t.endsWith(key);
        });
      }
      return side === key;
    };
    const forward = sideMatch(spec.a, aKey) && sideMatch(spec.b, bKey);
    const reverse = sideMatch(spec.a, bKey) && sideMatch(spec.b, aKey);
    if (reverse && !forward) {
      vias = vias.slice().reverse();
      ends = endIds.filter((id) => state.navGraph.nodesById.has(id));
      if (!ends.length) return null;
    }

    const tryBuild = (avoidParking) => {
      const opts = {
        preference: "shortest",
        avoidParking: !!avoidParking,
        walkingSpeedMps: state.walkingSpeedMps || 1.2,
      };
      if (Array.isArray(spec.bannedTypes) && spec.bannedTypes.length) {
        opts.bannedTypes = spec.bannedTypes;
      }
      if (spec.blockedEdges instanceof Set) {
        opts.blockedEdges = spec.blockedEdges;
      } else if (Array.isArray(spec.blockedEdges) && spec.blockedEdges.length) {
        opts.blockedEdges = new Set(spec.blockedEdges);
      }
      const routeOpts = withJardimRouteOpts(dest, opts);
      let best = null;
      for (const s of startIds) {
        if (!s || !state.navGraph.nodesById.has(s)) continue;
        for (const e of ends) {
          if (!e || !state.navGraph.nodesById.has(e)) continue;
          const waypoints = [s, ...vias, e];
          const legs = [];
          let ok = true;
          for (let i = 0; i < waypoints.length - 1; i++) {
            const leg = NR.astar(waypoints[i], [waypoints[i + 1]], state.navGraph, routeOpts);
            if (!leg) { ok = false; break; }
            legs.push(leg);
          }
          if (!ok) continue;
          const merged = concatNavLegs(...legs);
          if (!merged || !(merged.points || []).length) continue;
          if (!best || merged.distanceMeters < best.distanceMeters) {
            best = merged;
            best._endNode = e;
          }
        }
      }
      return best;
    };

    let best = allowPark ? tryBuild(false) : tryBuild(spec.avoidParking === true);
    if (!best) best = tryBuild(false);
    if (!best) return null;

    const points = appendPoiEndpoints(best.points, origin, dest);
    if (points.length < 2) return null;
    let length = 0;
    for (let i = 1; i < points.length; i++) length += dist(points[i - 1], points[i]);
    const mpu = getMetersPerUnit();
    const endGate = (CONFIG.templeEntrances || []).find((g) => g.id === best._endNode);
    return truncateRouteAtJardimCorner({
      points,
      length: mpu > 0 ? best.distanceMeters / mpu : length,
      distanceMeters: best.distanceMeters,
      nodeIds: best.nodeIds,
      edgeIds: best.edgeIds,
      label: spec.label || "Por fora (externa)",
      kind: "fora",
      fromJson: true,
      namedExternal: true,
      viaEndNode: best._endNode || null,
      entranceLabel: endGate?.label || null,
      slot: spec.slot,
    }, dest);
  }

  function appendNamedExternalOptions(NR, startIds, endIds, origin, dest, packed) {
    const specs = namedExternalSpecsForPair(origin, dest);
    const list = packed ? packed.slice() : [];
    for (const spec of specs) {
      const external = buildNamedExternalRoute(NR, startIds, endIds, origin, dest, spec);
      if (!external) continue;
      const sig = (external.edgeIds || []).join(">");
      const dup = list.some((r) => {
        if (external.namedExternal && r.label && external.label && r.label !== external.label) {
          return sig && (r.edgeIds || []).join(">") === sig;
        }
        return (r.edgeIds || []).join(">") === sig || isDuplicateRoute(r, external);
      });
      if (!dup) list.push(external);
    }
    return appendAdmStairOption(NR, startIds, endIds, origin, dest, list);
  }

  /** Garante as rotas de campus CF/RGO → Jardim / Espaço Servir. */
  function ensureCfJardimNamedRoutes(NR, startIds, endIds, origin, dest, packed) {
    if (!isCfToJardimPair(origin, dest)) return packed;
    let list = packed ? packed.slice() : [];
    const labelList = poiRawKey(dest) === "P020_espaco_servir"
      ? CF_SERVIR_NAMED_LABELS
      : CF_JARDIM_NAMED_LABELS;
    for (const label of labelList) {
      if (list.some((r) => r.label === label)) continue;
      const spec = (CONFIG.namedExternalRoutes || []).find((r) => r.label === label);
      if (!spec) continue;
      const external = buildNamedExternalRoute(NR, startIds, endIds, origin, dest, spec);
      if (!external) continue;
      external.slot = spec.slot;
      list.push(external);
    }
    list.sort((a, b) => {
      const sa = a.slot ?? (a.namedExternal ? 50 : 0);
      const sb = b.slot ?? (b.namedExternal ? 50 : 0);
      if (sa !== sb) return sa - sb;
      return (a.length || 0) - (b.length || 0);
    });
    return list;
  }

  /** Garante RGO → Espaço conexão: corredor interno (linha vermelha). */
  function ensureRgoConexaoNamedRoutes(NR, startIds, endIds, origin, dest, packed) {
    if (!isRgoToConexaoPair(origin, dest)) return packed;
    let list = packed ? packed.slice() : [];
    if (list.some((r) => r.label === RGO_CONEXAO_NAMED_LABEL)) return list;
    const spec = (CONFIG.namedExternalRoutes || []).find((r) => r.label === RGO_CONEXAO_NAMED_LABEL);
    if (!spec) return list;
    const external = buildNamedExternalRoute(NR, startIds, endIds, origin, dest, spec);
    if (!external) return list;
    external.slot = spec.slot;
    external.forceInclude = true;
    external.label = spec.label;
    if (!list.some((r) => isDuplicateRoute(r, external) || r.label === external.label)) {
      list.push(external);
    }
    list.sort((a, b) => {
      const sa = a.slot ?? (a.namedExternal ? 50 : 0);
      const sb = b.slot ?? (b.namedExternal ? 50 : 0);
      if (sa !== sb) return sa - sb;
      return (a.length || 0) - (b.length || 0);
    });
    return list;
  }

  /** Garante rotas L00 → CF com alternativa pelo corredor interno do estabelecimento. */
  function ensureToCfNamedRoutes(NR, startIds, endIds, origin, dest, packed) {
    if (!isToCfPair(origin, dest)) return packed;
    let list = packed ? packed.slice() : [];
    for (const label of TO_CF_NAMED_LABELS) {
      if (list.some((r) => r.label === label)) continue;
      const spec = (CONFIG.namedExternalRoutes || []).find((r) => r.label === label);
      if (!spec) continue;
      const external = buildNamedExternalRoute(NR, startIds, endIds, origin, dest, spec);
      if (!external) continue;
      external.slot = spec.slot;
      external.label = spec.label;
      if (label === TO_CF_INTERIOR_LABEL) external.forceInclude = true;
      if (!list.some((r) => isDuplicateRoute(r, external) || r.label === external.label)) {
        list.push(external);
      }
    }
    list.sort((a, b) => {
      const sa = a.slot ?? (a.namedExternal ? 50 : 0);
      const sb = b.slot ?? (b.namedExternal ? 50 : 0);
      if (sa !== sb) return sa - sb;
      return (a.length || 0) - (b.length || 0);
    });
    return list;
  }

  /** Alternativa pelo corredor interno do térreo (conexão Templo/Jardim). */
  function ensureL00InteriorTerrainRoutes(NR, startIds, endIds, origin, dest, packed) {
    if (!isL00InteriorTerrainPair(origin, dest)) return packed;
    const spec = buildL00InteriorTerrainSpec(origin, dest);
    if (!spec?.via?.length) return packed;
    let list = packed ? packed.slice() : [];
    const label = spec.label || L00_INTERIOR_TERRAIN_LABEL;
    if (list.some((r) => r.label === label)) return list;
    const external = buildNamedExternalRoute(NR, startIds, endIds, origin, dest, spec);
    if (!external) return list;
    external.slot = spec.slot;
    external.label = label;
    external.forceInclude = true;
    if (!list.some((r) => isDuplicateRoute(r, external) || r.label === external.label)) {
      list.push(external);
    }
    list.sort((a, b) => {
      const sa = a.slot ?? (a.namedExternal ? 50 : 0);
      const sb = b.slot ?? (b.namedExternal ? 50 : 0);
      if (sa !== sb) return sa - sb;
      return (a.length || 0) - (b.length || 0);
    });
    return list;
  }

  /** 4ª alternativa: sobe/desce pela escada lateral (L00 ↔ L01…L06). */
  function appendAdmStairOption(NR, startIds, endIds, origin, dest, packed) {
    const oLvl = poiLevel(origin);
    const dLvl = poiLevel(dest);
    if (!isStairRoutePair(oLvl, dLvl)) return packed;
    const via = stairHubWaypoints(oLvl, dLvl);
    if (via.length < 2) return packed;

    const stairRoute = buildNamedExternalRoute(NR, startIds, endIds, origin, dest, {
      via,
      label: STAIRS_T_LABEL,
      avoidParking: false,
      allowParking: true,
      bannedTypes: ["elevator"],
      slot: 2,
    });
    if (!stairRoute) return packed;

    stairRoute.viaStairs = true;
    stairRoute.kind = "stairs";
    stairRoute.label = STAIRS_T_LABEL;
    stairRoute.namedExternal = true;

    const list = packed ? packed.slice() : [];
    const sig = (stairRoute.edgeIds || []).join(">");
    if (!list.some((r) => (r.edgeIds || []).join(">") === sig || isDuplicateRoute(r, stairRoute))) list.push(stairRoute);
    return list;
  }

  /** Extende até o ícone só se o trecho for curto e NÃO atravessar parede. */
  function appendPoiEndpoints(points, origin, dest) {
    const pts = (points || []).map((p) => ({ x: p.x, y: p.y }));
    if (!pts.length) return pts;

    const maxSpurO = tol("spurTol", poiToleranceZone(origin));
    const maxSpurD = tol("spurTol", poiToleranceZone(dest));
    const oOfficial = poiUsesOfficialRouteAnchor(origin);
    const dOfficial = poiUsesOfficialRouteAnchor(dest);
    const destCampus = CONFIG.poiIconCampus?.[poiRawKey(dest)];
    const o = oOfficial ? poiRouteAnchor(origin) : poiIcon(origin);
    const d = ((dOfficial && !destCampus) || isTemplePoi(dest)) ? poiRouteAnchor(dest) : poiIcon(dest);
    const oLvl = origin?.level || poiLevel(origin);
    const dLvl = dest?.level || poiLevel(dest);
    const sameFloor = oLvl && dLvl && oLvl === dLvl;

    if (isNarniaEntrancePoi(origin)) {
      const gateLvl = isBasementFloor(narniaLevelForPoi(origin) || oLvl) ? (narniaLevelForPoi(origin) || oLvl) : "L00";
      let out = refineNarniaEndpoint(pts, gateLvl, "start");
      if (sameFloor && d && !isNarniaEntrancePoi(dest)) {
        const tip = out[out.length - 1];
        if (dist(tip, d) > 0.8 && dist(tip, d) <= maxSpurD && !crossesWall(tip, d, dLvl)) {
          out.push({ x: d.x, y: d.y });
        }
      }
      return out;
    }
    if (isNarniaEntrancePoi(dest)) {
      const gateLvl = isBasementFloor(narniaLevelForPoi(dest) || dLvl) ? (narniaLevelForPoi(dest) || dLvl) : "L00";
      let out = pts;
      if (sameFloor && o && dist(o, out[0]) > 0.8 && dist(o, out[0]) <= maxSpurO && !crossesWall(o, out[0], oLvl)) {
        out = [{ x: o.x, y: o.y }, ...out];
      }
      return refineNarniaEndpoint(out, gateLvl, "end");
    }

    // "Estou aqui" em um POI começa no node navegável resolvido; nunca no centro
    // visual do local, evitando um segmento artificial através de paredes.
    const startsAtResolvedNode = !!origin?.startNodeId;
    if (sameFloor && o && !oOfficial && !startsAtResolvedNode
      && dist(o, pts[0]) > 0.8 && dist(o, pts[0]) <= maxSpurO) {
      if (!crossesWall(o, pts[0], oLvl)) pts.unshift({ x: o.x, y: o.y });
    }
    const dSpurToIcon = !dOfficial || !!destCampus || isGardenAccessPoi(dest);
    const gardenDest = isGardenAccessPoi(dest);
    const spurMaxD = gardenDest ? Math.max(maxSpurD, 95) : maxSpurD;
    if (sameFloor && d && dSpurToIcon && !gardenDest && dist(pts[pts.length - 1], d) > 0.8) {
      if (isTemplePoi(dest) || isTempleEntrancePoi(dest)) return pts;
      const tip = pts[pts.length - 1];
      if (dist(tip, d) <= spurMaxD && !crossesWall(tip, d, dLvl)) {
        pts.push({ x: d.x, y: d.y });
      }
    }
    if (sameFloor && routePolylineCrossesWall(pts, oLvl || dLvl || "L00")) {
      while (pts.length >= 2 && crossesWall(pts[0], pts[1], oLvl || dLvl)) pts.shift();
      while (pts.length >= 2 && crossesWall(pts[pts.length - 2], pts[pts.length - 1], dLvl || oLvl)) pts.pop();
    }
    if (sameFloor && gardenDest) {
      const anchor = poiRouteAnchor(dest);
      if (anchor) {
        const tip = pts[pts.length - 1];
        if (dist(tip, anchor) > 0.8 && dist(tip, anchor) <= spurMaxD && !crossesWall(tip, anchor, dLvl)) {
          pts.push({ x: anchor.x, y: anchor.y });
        }
      }
      return appendPoiRouteEdgeIcon(pts, dest, dLvl);
    }
    return pts;
  }

  /** Divide a rota em trechos por andar (corta em edges de elevador/escada). */
  function routeLegsFromGraph(route) {
    const NR = globalThis.NavigationRouter;
    if (!route?.nodeIds?.length || !state.navGraph || !NR) {
      return [{
        level: poiLevel(state.origin) || state.activeLevel || "L00",
        nodeIds: route?.nodeIds || [],
        edgeIds: route?.edgeIds || [],
        points: route?.points || [],
      }];
    }
    const TRANS = new Set(["elevator", "stairs", "ramp", "level_transition"]);
    const legs = [];
    let curLevel = state.navGraph.nodesById.get(route.nodeIds[0])?.level || "L00";
    let legNodes = [route.nodeIds[0]];
    let legEdges = [];

    for (let i = 0; i < (route.edgeIds || []).length; i++) {
      const eid = route.edgeIds[i];
      const edge = state.navGraph.edgesById.get(eid);
      const nextId = route.nodeIds[i + 1];
      const nextLevel = state.navGraph.nodesById.get(nextId)?.level || curLevel;
      const isVertical = edge && TRANS.has(edge.type) && nextLevel !== curLevel;

      if (isVertical) {
        legs.push({
          level: curLevel,
          nodeIds: legNodes.slice(),
          edgeIds: legEdges.slice(),
          transition: edge.type,
          toLevel: nextLevel,
        });
        curLevel = nextLevel;
        legNodes = [nextId];
        legEdges = [];
      } else {
        legEdges.push(eid);
        legNodes.push(nextId);
      }
    }
    legs.push({ level: curLevel, nodeIds: legNodes.slice(), edgeIds: legEdges.slice() });

    for (const leg of legs) {
      leg.points = [];
      if (leg.edgeIds.length >= 1 && leg.nodeIds.length >= 2 && NR?.buildRoutePoints) {
        try {
          const built = NR.buildRoutePoints(
            leg.edgeIds,
            leg.nodeIds,
            state.navGraph.edgesById,
            state.navGraph.nodesById,
          );
          if (built?.length >= 2) leg.points = built;
        } catch { /* tenta montar pelos paths das edges */ }
        if ((leg.points?.length || 0) < 2) {
          const stitched = buildMeshPaintPoints(leg.edgeIds, leg.nodeIds);
          if (stitched) leg.points = stitched;
        }
      }
      if ((leg.points?.length || 0) < 2) {
        const sliced = sliceRoutePointsForLevel(route, leg.level);
        if (sliced?.length >= 2) leg.points = sliced;
      }
    }
    return legs;
  }

  /** Escolhe a perna desenhável do andar (evita stub vazio quando há várias pernas no mesmo nível). */
  function sliceRoutePointsForLevel(route, levelId) {
    if (!route?.nodeIds?.length || !state.navGraph) return null;
    const NR = globalThis.NavigationRouter;
    let start = -1;
    let end = -1;
    for (let i = 0; i < route.nodeIds.length; i++) {
      const lvl = state.navGraph.nodesById.get(route.nodeIds[i])?.level;
      if (lvl !== levelId) continue;
      if (start < 0) start = i;
      end = i;
    }
    if (start < 0 || end <= start) return null;
    const nodeIds = route.nodeIds.slice(start, end + 1);
    const edgeIds = (route.edgeIds || []).slice(start, end);
    if (nodeIds.length >= 2 && edgeIds.length >= 1 && NR?.buildRoutePoints) {
      try {
        const built = NR.buildRoutePoints(
          edgeIds,
          nodeIds,
          state.navGraph.edgesById,
          state.navGraph.nodesById,
        );
        if (built?.length >= 2) return built;
      } catch { /* tenta montar pelos paths das edges */ }
      const stitched = buildMeshPaintPoints(edgeIds, nodeIds);
      if (stitched) return stitched;
    }
    return null;
  }

  function pickBestRouteLeg(candidates) {
    if (!candidates?.length) return null;
    const drawable = candidates.filter((l) => (l.points?.length || 0) >= 2 || (l.edgeIds?.length || 0) > 0);
    const pool = drawable.length ? drawable : candidates;
    return pool.slice().sort((a, b) => {
      const ap = a.points?.length || 0;
      const bp = b.points?.length || 0;
      if (bp !== ap) return bp - ap;
      const ae = a.edgeIds?.length || 0;
      const be = b.edgeIds?.length || 0;
      return be - ae;
    })[0];
  }

  /** Perna + pontos para pintar/navegar no andar ativo. */
  function resolveRouteLegForView(route, activeLevel) {
    if (!route) return { leg: null, points: [] };

    let view = routePointsForLevel(route, activeLevel);
    if (view.points.length < 2 && route.nodeIds?.length >= 2 && state.navGraph) {
      rebuildRouteLegs(route);
      view = routePointsForLevel(route, activeLevel);
    }
    return view;
  }

  function paintActiveRouteLeg() {
    if (!state.route) {
      clearRoutePaint();
      return;
    }
    syncMapViewBeforeRoutePaint();
    const oLvl = poiLevel(state.origin);
    const dLvl = poiLevel(state.dest);
    const lvl = state.activeLevel;

    let { leg, points: pts } = collectRoutePaintPoints(state.route, lvl);

    if ((!pts?.length || pts.length < 2) && state.route) {
      rebuildRouteLegs(state.route);
      hydrateRouteLegPoints(state.route, lvl);
      ({ leg, points: pts } = routePointsForLevel(state.route, lvl));
    }

    if ((!pts?.length || pts.length < 2) && state.route?.points?.length >= 2) {
      const sliced = sliceRoutePointsForLevel(state.route, lvl);
      if (sliced?.length >= 2) {
        pts = sliced.map((p) => ({ x: p.x, y: p.y }));
      } else if (shouldUseFullRoutePolyline(lvl, oLvl, dLvl)) {
        const candidate = state.route.points
          .map((p) => ({ x: p.x, y: p.y }))
          .filter((p) => isFinite(p.x) && isFinite(p.y));
        if (candidate.length >= 2 && !routePolylineCrossesWall(candidate, lvl)) {
          pts = candidate;
        }
      } else {
        const fb = buildFloorLegFallbackPoints(lvl, state.origin, state.dest);
        if (fb?.points?.length >= 2) {
          pts = fb.points.map((p) => ({ x: p.x, y: p.y }));
        }
      }
    }
    if ((!pts?.length || pts.length < 2) && isCrossFloorTrip(oLvl, dLvl)) {
      // Quando a rota entre andares foi calculada mas a segmentação por piso
      // não trouxe pontos (caso recorrente no L06), remonta somente o trecho
      // local usando a malha existente até o elevador/escada.
      const meshFallback = buildFloorLegFallbackPoints(lvl, state.origin, state.dest);
      if (meshFallback?.points?.length >= 2) {
        pts = meshFallback.points.map((p) => ({ x: p.x, y: p.y }));
      } else if (crossFloorExitLeg(lvl, oLvl, dLvl) && poiAnchorsVerticalHub(state.origin, lvl, state.route)) {
        const spur = verticalHubSpurPoints(lvl, state.route);
        if (spur?.points?.length >= 2) pts = spur.points.map((p) => ({ x: p.x, y: p.y }));
      } else if (crossFloorEntryLeg(lvl, oLvl, dLvl) && poiAnchorsVerticalHub(state.dest, lvl, state.route)) {
        const spur = verticalHubSpurPoints(lvl, state.route);
        if (spur?.points?.length >= 2) pts = spur.points.map((p) => ({ x: p.x, y: p.y }));
      } else if (crossFloorTransitLeg(lvl, oLvl, dLvl)) {
        const spur = verticalHubSpurPoints(lvl, state.route);
        if (spur?.points?.length >= 2) pts = spur.points.map((p) => ({ x: p.x, y: p.y }));
      }
    }
    if (!pts?.length || pts.length < 2) {
      clearRoutePaint();
      return;
    }
    if (pts.length === 1) {
      pts = [pts[0], { x: pts[0].x + 0.5, y: pts[0].y }];
    }

    if (crossFloorExitLeg(lvl, oLvl, dLvl) || crossFloorEntryLeg(lvl, oLvl, dLvl)) {
      pts = extendCrossFloorLegPoints(pts, lvl, oLvl, dLvl, state.route);
    } else if (isBasementEntryActiveLeg(lvl, oLvl, dLvl) || isBasementExitActiveLeg(lvl, oLvl, dLvl)
      || isBasementEncomunExitActiveLeg(lvl, oLvl, dLvl)) {
      /* malha oficial — sem spur diagonal até ícone de outro andar */
    } else if (oLvl === dLvl && oLvl === lvl) {
      pts = appendPoiEndpoints(pts, state.origin, state.dest);
    } else if (oLvl === lvl || (isNarniaEntrancePoi(state.origin) && narniaLevelForPoi(state.origin) === lvl)) {
      pts = appendPoiEndpoints(pts, state.origin, {
        ...state.dest,
        level: dLvl,
        iconX: undefined,
        iconY: undefined,
        x: pts[pts.length - 1].x,
        y: pts[pts.length - 1].y,
      });
    } else if (dLvl === lvl || (isNarniaEntrancePoi(state.dest) && narniaLevelForPoi(state.dest) === lvl)) {
      pts = appendPoiEndpoints(pts, {
        ...state.origin,
        level: lvl,
        iconX: undefined,
        iconY: undefined,
        x: pts[0].x,
        y: pts[0].y,
      }, state.dest);
    }

    const hub = narniaHubNode(lvl);
    if (hub && leg?.nodeIds?.includes(hub)) {
      if (shouldRefineNarniaAtBasementGate(lvl, oLvl, dLvl, "start")) {
        pts = refineNarniaEndpoint(pts, lvl, "start");
      }
      if (shouldRefineNarniaAtBasementGate(lvl, oLvl, dLvl, "end")) {
        pts = refineNarniaEndpoint(pts, lvl, "end");
      }
    }
    if (isNarniaEntrancePoi(state.origin) && narniaLevelForPoi(state.origin) === lvl) {
      const gateLvl = isBasementFloor(lvl) ? lvl : "L00";
      pts = refineNarniaEndpoint(pts, gateLvl, "start");
    }
    if (isNarniaEntrancePoi(state.dest) && narniaLevelForPoi(state.dest) === lvl) {
      const gateLvl = isBasementFloor(lvl) ? lvl : "L00";
      pts = refineNarniaEndpoint(pts, gateLvl, "end");
    }

    pts = sanitizeRoutePaintPoints(pts, leg, state.route, lvl);
    if (isBasementExitActiveLeg(lvl, oLvl, dLvl)) {
      pts = finalizeBasementExitLegPoints(pts, lvl);
    } else if (isBasementEncomunExitActiveLeg(lvl, oLvl, dLvl)) {
      pts = finalizeEncomunExitLegPoints(pts, lvl);
    } else if (isBasementEntryActiveLeg(lvl, oLvl, dLvl)) {
      pts = finalizeBasementExitLegPoints(pts, "L00");
    }
    if (state.route?.kind === "templo" && oLvl === dLvl && dLvl === lvl) {
      pts = ensureTempleEntranceRouteEndpoint(pts, state.route, lvl);
    }
    if (isGardenAccessPoi(state.dest) && oLvl === dLvl && dLvl === lvl) {
      pts = ensureGardenRouteNodeEndpoint(pts, state.dest, lvl, state.route, leg);
    }
    pts = removePointBacktracks(pts);
    pts = orthogonalizeRoutePolyline(pts, lvl);

    const a = pts[0];
    const b = pts[pts.length - 1];
    paintRouteOnMap(pts.map((p) => `${p.x},${p.y}`).join(" "), a, b, pts);
    apply();
  }

  function templeEntranceList() {
    return validatedTempleEntrances().map((e) => ({
      id: e.graphNodeId,
      nodeId: e.nodeId,
      label: e.label,
    }));
  }

  function matchRouteSide(side, key) {
    if (Array.isArray(side)) {
      return side.some((item) => {
        const t = String(item);
        return t === key || t.toLowerCase() === key.toLowerCase()
          || key.endsWith(t) || t.endsWith(key);
      });
    }
    return side === key;
  }

  /** Percurso fixo (POI edge) para uma entrada do Templo — ex.: CF → Entrada 4 pelo jardim. */
  function templeEntranceRouteSpec(origin, gate) {
    const aKey = poiRawKey(origin);
    const gateBase = nodeIdBase(gate.nodeId || gate.id);
    for (const spec of CONFIG.templeEntranceRoutes || []) {
      if (!matchRouteSide(spec.a, aKey)) continue;
      const specGate = nodeIdBase(spec.entranceNodeId || spec.endNode || "");
      if (specGate && specGate !== gateBase) continue;
      return spec;
    }
    return null;
  }

  /** Rota única com início/fim exatamente no node da entrada oficial do Templo. */
  function buildExactTempleEntranceRoute(NR, startIds, endIds, origin, dest, role) {
    const gateId = role === "origin" ? startIds[0] : endIds[0];
    if (!gateId) return [];
    const node = state.navGraph.nodesById.get(gateId);
    if (!node) return [];

    const allowParking = tripAllowsParking(origin, dest);
    const fromIds = role === "origin" ? [gateId] : startIds;
    const toIds = role === "dest" ? [gateId] : endIds;

    const originAtGate = role === "origin" ? {
      ...origin,
      anchor: gateId,
      snap: { x: node.x, y: node.y },
      x: node.x,
      y: node.y,
      iconX: node.x,
      iconY: node.y,
    } : origin;

    const destAtGate = role === "dest" ? {
      ...dest,
      anchor: gateId,
      snap: { x: node.x, y: node.y },
      x: node.x,
      y: node.y,
      iconX: node.x,
      iconY: node.y,
    } : dest;

    let found = NR.findRoutesForPoiPair(fromIds, toIds, state.navGraph, {
      preference: "shortest",
      avoidParking: !allowParking,
      walkingSpeedMps: state.walkingSpeedMps || 1.2,
    });
    if (!found.length) {
      found = NR.findRoutesForPoiPair(fromIds, toIds, state.navGraph, {
        preference: "shortest",
        avoidParking: false,
        walkingSpeedMps: state.walkingSpeedMps || 1.2,
      });
    }
    if (!found.length) return [];

    const best = found[0];
    const nodeIds = best.nodeIds || [];
    if (role === "origin" && nodeIdBase(nodeIds[0]) !== nodeIdBase(gateId)) return [];
    if (role === "dest" && nodeIdBase(nodeIds[nodeIds.length - 1]) !== nodeIdBase(gateId)) return [];

    const points = appendPoiEndpoints(
      best.points?.length ? best.points : [{ x: node.x, y: node.y }],
      originAtGate,
      destAtGate
    );
    if (points.length < 2) return [];

    let length = 0;
    for (let i = 1; i < points.length; i++) length += dist(points[i - 1], points[i]);
    const mpu = getMetersPerUnit();
    const meshLen = (best.points || []).reduce((s, p, i, a) => (i ? s + dist(a[i - 1], p) : 0), 0);
    const spurExtra = Math.max(0, length - meshLen);

    return [{
      points,
      length: mpu > 0 ? (best.distanceMeters / mpu) + spurExtra : length,
      distanceMeters: (best.distanceMeters || 0) + spurExtra * mpu,
      nodeIds: best.nodeIds,
      edgeIds: best.edgeIds,
      rank: 1,
      label: role === "origin"
        ? `Saindo: ${originAtGate.searchLabel || originAtGate.name}`
        : (destAtGate.searchLabel || destAtGate.name),
      kind: "templo",
      entranceId: gateId,
      fromJson: true,
    }];
  }

  /** Rotas genéricas Templo → uma opção por entrada (máx. 5). */
  function routesForGenericTemple(NR, startIds, endIds, origin, dest, allowParking, role) {
    if (role === "dest") {
      return routesViaTempleEntrances(NR, startIds, origin, dest, allowParking);
    }
    const gates = templeEntranceList();
    const collected = [];
    for (const gate of gates) {
      if (!state.navGraph.nodesById.has(gate.id)) continue;
      const node = state.navGraph.nodesById.get(gate.id);
      const originAtGate = {
        ...origin,
        anchor: gate.id,
        snap: { x: node.x, y: node.y },
        x: node.x,
        y: node.y,
        iconX: node.x,
        iconY: node.y,
      };
      let found = NR.findRoutesForPoiPair([gate.id], endIds, state.navGraph, {
        preference: "shortest",
        avoidParking: !allowParking,
        walkingSpeedMps: state.walkingSpeedMps || 1.2,
      });
      if (!found.length) {
        found = NR.findRoutesForPoiPair([gate.id], endIds, state.navGraph, {
          preference: "shortest",
          avoidParking: false,
          walkingSpeedMps: state.walkingSpeedMps || 1.2,
        });
      }
      if (!found.length) continue;
      const best = found[0];
      if ((best.nodeIds || [])[0] !== gate.id) continue;
      const points = appendPoiEndpoints(best.points, originAtGate, dest);
      if (points.length < 2) continue;
      let length = 0;
      for (let i = 1; i < points.length; i++) length += dist(points[i - 1], points[i]);
      const mpu = getMetersPerUnit();
      collected.push({
        points,
        length: mpu > 0 ? best.distanceMeters / mpu : length,
        distanceMeters: best.distanceMeters,
        nodeIds: best.nodeIds,
        edgeIds: best.edgeIds,
        rank: collected.length + 1,
        label: `Saindo: ${gate.label}`,
        kind: "templo",
        entranceId: gate.id,
        fromJson: true,
      });
    }
    collected.sort((a, b) => a.length - b.length);
    collected.forEach((r, i) => { r.rank = i + 1; });
    return collected.slice(0, 5);
  }

  /** Rotas até o templo: uma opção por entrada do estabelecimento. */
  function routesViaTempleEntrances(NR, startIds, origin, dest, allowParking) {
    const gates = templeEntranceList();
    if (!gates.length) return [];
    const collected = [];
    const seenSig = new Set();

    for (const gate of gates) {
      const node = state.navGraph.nodesById.get(gate.id);
      if (!node) continue;
      const campus = CONFIG.templeEntranceIconCampus?.[gate.nodeId]
        || CONFIG.templeEntranceIconCampus?.[nodeIdBase(gate.nodeId)];
      const destAtGate = {
        ...dest,
        anchor: gate.id,
        snap: { x: node.x, y: node.y },
        x: campus?.x ?? node.x,
        y: campus?.y ?? node.y,
        iconX: campus?.x ?? node.x,
        iconY: campus?.y ?? node.y,
        entranceLabel: gate.label,
      };

      const customSpec = templeEntranceRouteSpec(origin, gate);
      if (customSpec?.via?.length) {
        const endResolved = resolveGraphNodeId(customSpec.endNode || gate.id) || gate.id;
        const built = buildNamedExternalRoute(NR, startIds, [endResolved], origin, destAtGate, {
          a: customSpec.a,
          b: ["P000_templo"],
          via: customSpec.via,
          endNodes: [endResolved],
          label: gate.label,
          allowParking: customSpec.allowParking !== false,
          avoidParking: customSpec.avoidParking,
        });
        if (built?.points?.length >= 2) {
          built.points = appendPoiRouteEdgeIcon(built.points, destAtGate, "L00");
          built.kind = "templo";
          built.entranceId = endResolved;
          built.label = gate.label;
          built.namedExternal = false;
          built.fromJson = true;
          const sig = (built.edgeIds || []).join(">");
          if (sig) seenSig.add(sig);
          collected.push({
            ...built,
            rank: collected.length + 1,
          });
          continue;
        }
      }

      let found = NR.findRoutesForPoiPair(startIds, [gate.id], state.navGraph, {
        preference: "shortest",
        avoidParking: !allowParking,
        walkingSpeedMps: state.walkingSpeedMps || 1.2,
      });
      if (!found.length) {
        found = NR.findRoutesForPoiPair(startIds, [gate.id], state.navGraph, {
          preference: "shortest",
          avoidParking: false,
          walkingSpeedMps: state.walkingSpeedMps || 1.2,
        });
      }
      if (!found.length) continue;

      const best = found[0];
      const nodeIds = best.nodeIds || [];
      if (nodeIdBase(nodeIds[nodeIds.length - 1]) !== nodeIdBase(gate.id)) continue;

      const sig = (best.edgeIds || []).join(">");
      if (sig && seenSig.has(sig)) continue;
      if (sig) seenSig.add(sig);

      const points = appendPoiEndpoints(best.points?.length ? best.points : [{ x: node.x, y: node.y }], origin, destAtGate);
      if (points.length < 2) {
        const o = poiIcon(origin) || origin.snap || points[0];
        points.length = 0;
        if (o) points.push({ x: o.x, y: o.y });
        points.push({ x: node.x, y: node.y });
      }
      let length = 0;
      for (let i = 1; i < points.length; i++) length += dist(points[i - 1], points[i]);
      const mpu = getMetersPerUnit();
      collected.push({
        points,
        length: mpu > 0 ? (best.distanceMeters / mpu) + Math.max(0, length - (best.points || []).reduce((s, p, i, a) => (i ? s + dist(a[i - 1], p) : 0), 0)) : length,
        distanceMeters: best.distanceMeters,
        nodeIds: best.nodeIds,
        edgeIds: best.edgeIds,
        rank: collected.length + 1,
        label: gate.label,
        kind: "templo",
        entranceId: gate.id,
        fromJson: true,
      });
    }

    collected.sort((a, b) => a.length - b.length);
    collected.forEach((r, i) => { r.rank = i + 1; });
    return collected.slice(0, 5);
  }

  function prioritizeTempleEntranceRoute(routes, preferredGateId) {
    if (!routes?.length || !preferredGateId) return routes || [];
    const base = nodeIdBase(preferredGateId);
    const idx = routes.findIndex((r) =>
      r.entranceId === preferredGateId || nodeIdBase(r.entranceId) === base
    );
    if (idx <= 0) return routes;
    const out = routes.slice();
    const [pick] = out.splice(idx, 1);
    out.unshift(pick);
    out.forEach((r, i) => { r.rank = i + 1; });
    return out;
  }

  function buildTempleDestinationRouteOptions(NR, origin, dest) {
    if (!NR || !state.navGraph || !isTempleDestination(dest)) return [];
    origin = enrichTripPoi(origin);
    dest = enrichTripPoi(dest);
    let startIds = resolveNavNodeIds(origin, origin.id === "__here__" ? "here" : "origin");
    const GFRM = gfr();
    if (!startIds.length && !GFRM?.isMappedL00Poi(origin, poiRawKey)) {
      const id = NR.nearestNodeId(poiIcon(origin) || origin, state.navGraph, { level: poiLevel(origin) });
      if (id) startIds = [id];
    }
    if (!startIds.length) return [];
    const endIds = resolveNavNodeIds(dest, "dest");
    const allowParking = tripAllowsParking(origin, dest);
    let routes = routesViaTempleEntrances(NR, startIds, origin, dest, allowParking);
    if (isTempleEntrancePoi(dest) && endIds.length) {
      routes = prioritizeTempleEntranceRoute(routes, endIds[0]);
    }
    return routes.length ? finalizePackedRoutes(routes, NR, origin, dest) : [];
  }

  function preferredTempleRouteIndex(options, dest) {
    if (!options?.length || !isTempleEntrancePoi(dest)) return 0;
    const endIds = resolveTripNodeIds(dest, "dest");
    const preferred = endIds[0];
    if (!preferred) return 0;
    const base = nodeIdBase(preferred);
    const idx = options.findIndex((r) =>
      r.entranceId === preferred || nodeIdBase(r.entranceId) === base
    );
    return idx >= 0 ? idx : 0;
  }

  function routeOptionsFromJson(origin, dest) {
    const NR = globalThis.NavigationRouter;
    if (!NR || !state.navGraph) return null;

    origin = enrichTripPoi(origin);
    dest = enrichTripPoi(dest);
    let startIds = resolveNavNodeIds(origin, origin.id === "__here__" ? "here" : "origin");
    let endIds = resolveNavNodeIds(dest, "dest");
    const GFRM = gfr();

    if (GFRM?.isGenericGroundDestination(dest) && !isTempleDestination(dest)) return [];
    if (GFRM?.isGenericGroundDestination(origin) && !isTempleDestination(origin)) return [];

    if (isTempleDestination(dest)) {
      if (!startIds.length && !GFRM?.isMappedL00Poi(origin, poiRawKey)) {
        const id = NR.nearestNodeId(poiIcon(origin) || origin, state.navGraph, { level: poiLevel(origin) });
        if (id) startIds = [id];
      }
      if (!startIds.length) return [];
      const allowParking = tripAllowsParking(origin, dest);
      let routes = routesViaTempleEntrances(NR, startIds, origin, dest, allowParking);
      if (isTempleEntrancePoi(dest) && endIds.length) {
        routes = prioritizeTempleEntranceRoute(routes, endIds[0]);
      }
      if (routes.length) return finalizePackedRoutes(routes, NR, origin, dest);
      if (isTempleEntrancePoi(dest) && endIds.length) {
        const exact = buildExactTempleEntranceRoute(NR, startIds, endIds, origin, dest, "dest");
        if (exact.length) return finalizePackedRoutes(exact, NR, origin, dest);
      }
      return [];
    }
    if (isTempleEntrancePoi(origin)) {
      if (!endIds.length && !GFRM?.isMappedL00Poi(dest, poiRawKey)) {
        const id = NR.nearestNodeId(poiIcon(dest) || dest, state.navGraph, { level: poiLevel(dest) });
        if (id) endIds = [id];
      }
      if (!startIds.length || !endIds.length) return [];
      const routes = buildExactTempleEntranceRoute(NR, startIds, endIds, origin, dest, "origin");
      if (routes.length) return finalizePackedRoutes(routes, NR, origin, dest);
      return [];
    }

    if (!startIds.length) {
      startIds = resolveTripNodeIds(origin, origin.id === "__here__" ? "here" : "origin");
    }
    if (!endIds.length) {
      endIds = resolveTripNodeIds(dest, "dest");
    }
    if (!startIds.length || !endIds.length) return [];

    // sincroniza âncoras na UI
    if (startIds[0] && state.navGraph.nodesById.get(startIds[0])) {
      const n = state.navGraph.nodesById.get(startIds[0]);
      origin.anchor = startIds[0];
      origin.snap = { x: n.x, y: n.y };
    }
    if (endIds[0] && state.navGraph.nodesById.get(endIds[0])) {
      const n = state.navGraph.nodesById.get(endIds[0]);
      dest.anchor = endIds[0];
      dest.snap = { x: n.x, y: n.y };
    }

    const oLvl = poiLevel(origin);
    const dLvl = poiLevel(dest);
    const allowParking = tripAllowsParking(origin, dest);

    if (routeInvolvesBasementTransfer(oLvl, dLvl) && !isTemplePoi(dest) && !isTemplePoi(origin)) {
      const narnia = buildBasementNarniaRoutes(NR, startIds, endIds, origin, dest);
      if (narnia.length) return finalizePackedRoutes(narnia, NR, origin, dest);
    }

    if (isCrossCampusFloorPair(oLvl, dLvl)) {
      const cross = buildCrossCampusFloorRoutes(NR, startIds, endIds, origin, dest);
      if (cross.length) return finalizePackedRoutes(cross, NR, origin, dest);
    }

    if (isCfToJardimPair(origin, dest)) {
      const cfRoutes = buildCfJardimRouteOptions(NR, origin, dest);
      if (cfRoutes.length) return cfRoutes;
    }

    const pack = (routes) => {
      const mpu = getMetersPerUnit();
      return routes.map((r) => {
        const points = appendPoiEndpoints(
          (r.points && r.points.length)
            ? r.points
            : [poiRouteAnchor(origin), poiRouteAnchor(dest)].filter(Boolean),
          origin,
          dest
        );
        let length = 0;
        for (let i = 1; i < points.length; i++) length += dist(points[i - 1], points[i]);
        const lengthUnits = mpu > 0 ? (r.distanceMeters / mpu) : length;
        const meshLen = (r.points && r.points.length >= 2)
          ? r.points.reduce((s, p, i, a) => (i ? s + dist(a[i - 1], p) : 0), 0)
          : 0;
        const spurExtra = Math.max(0, length - meshLen);
        return {
          points,
          length: lengthUnits + (mpu > 0 ? spurExtra : 0),
          distanceMeters: (r.distanceMeters || 0) + spurExtra * mpu,
          nodeIds: r.nodeIds,
          edgeIds: r.edgeIds,
          rank: r.rank,
          label: NR.rankLabel(r.rank || 1, routes.length),
          kind: (r.rank || 1) === 1 ? "best" : "alt",
          fromJson: true,
        };
      }).filter((r) => {
        if (!r.points || r.points.length < 2) return false;
        if (r.edgeIds?.length >= 1) return true;
        if (r.nodeIds?.length === 1 && startIds[0] === endIds[0]) return true;
        return false;
      });
    };

    // mesmo nó de malha (POIs vizinhos): ainda assim mostra ícone→ícone
    if (startIds[0] === endIds[0]) {
      const n = state.navGraph.nodesById.get(startIds[0]);
      if (n) {
        return pack([{
          points: [{ x: n.x, y: n.y }],
          distanceMeters: 0,
          nodeIds: [startIds[0]],
          edgeIds: [],
          rank: 1,
        }]);
      }
    }

    let routes = NR.findRoutesForPoiPair(startIds, endIds, state.navGraph, {
      preference: "shortest",
      avoidParking: !allowParking,
      walkingSpeedMps: state.walkingSpeedMps || 1.2,
    });

    if (!routes.length && !allowParking) {
      routes = NR.findRoutesForPoiPair(startIds, endIds, state.navGraph, {
        preference: "shortest",
        avoidParking: false,
        walkingSpeedMps: state.walkingSpeedMps || 1.2,
      });
    }

    let packed = pack(routes);
    packed = appendNamedExternalOptions(NR, startIds, endIds, origin, dest, packed);
    packed = ensureCfJardimNamedRoutes(NR, startIds, endIds, origin, dest, packed);
    packed = ensureToCfNamedRoutes(NR, startIds, endIds, origin, dest, packed);
    packed = ensureL00InteriorTerrainRoutes(NR, startIds, endIds, origin, dest, packed);
    packed = ensureRgoConexaoNamedRoutes(NR, startIds, endIds, origin, dest, packed);
    return finalizePackedRoutes(packed, NR, origin, dest);
  }

  function autoCalibrateFromSvg(svg) {
    const cal = Cal();
    if (!cal) return;
    // se já tem calibração confirmada manualmente, não sobrescreve
    if (state.calibration?.accuracy === "confirmed") return;
    const detected = cal.detectBatisterioWidth(svg);
    if (!detected) return;
    applyCalibration(detected);
    if (CONFIG.isDev) drawCalibrationMarks(detected.startPoint, detected.endPoint);
  }

  function ensureCalibOverlay() {
    let g = el.overlay.querySelector("#calibOverlay");
    if (g) return g;
    g = document.createElementNS(NS, "g");
    g.setAttribute("id", "calibOverlay");
    g.setAttribute("pointer-events", "none");
    el.overlay.appendChild(g);
    return g;
  }

  function drawCalibrationMarks(a, b) {
    if (!CONFIG.isDev && !state.calibMode) {
      clearCalibrationMarks();
      return;
    }
    const g = ensureCalibOverlay();
    g.innerHTML = "";
    if (!a && !b) return;
    if (a && b) {
      const line = document.createElementNS(NS, "line");
      line.setAttribute("class", "calib-mark-line");
      line.setAttribute("x1", a.x); line.setAttribute("y1", a.y);
      line.setAttribute("x2", b.x); line.setAttribute("y2", b.y);
      g.appendChild(line);
    }
    [a, b].forEach((p) => {
      if (!p) return;
      const c = document.createElementNS(NS, "circle");
      c.setAttribute("class", "calib-mark");
      c.setAttribute("cx", p.x); c.setAttribute("cy", p.y); c.setAttribute("r", "5");
      g.appendChild(c);
    });
  }

  function clearCalibrationMarks() {
    const g = el.overlay.querySelector("#calibOverlay");
    if (g) g.innerHTML = "";
  }

  function enterCalibMode() {
    state.calibMode = true;
    state.calibStep = 0;
    state.calibPoints = [];
    el.app.classList.add("is-calibrating");
    if (el.calibPanel) el.calibPanel.hidden = false;
    if (el.calibSave) el.calibSave.disabled = true;
    if (el.calibResult) el.calibResult.hidden = true;
    if (el.calibHelp) {
      el.calibHelp.innerHTML = "Clique no extremo <strong>esquerdo</strong> da largura do Batistério (face da parede).";
    }
    clearCalibrationMarks();
    toast("Modo calibração: clique na parede esquerda do Batistério.");
  }

  function exitCalibMode() {
    state.calibMode = false;
    state.calibStep = 0;
    state.calibPoints = [];
    el.app.classList.remove("is-calibrating");
    if (el.calibPanel) el.calibPanel.hidden = true;
  }

  function finishCalibPreview() {
    const cal = Cal();
    if (!cal || state.calibPoints.length < 2) return;
    const real = Math.max(0.01, parseFloat(el.calibRealInput?.value || "6.8") || 6.8);
    try {
      const draft = cal.createMapCalibration(
        "Largura do Batistério",
        state.calibPoints[0],
        state.calibPoints[1],
        real,
        { source: "manual", accuracy: "confirmed", criterion: "external-face" }
      );
      state._calibDraft = draft;
      drawCalibrationMarks(draft.startPoint, draft.endPoint);
      if (el.calibResult) {
        el.calibResult.hidden = false;
        el.calibResult.innerHTML =
          `<strong>Referência:</strong> ${draft.referenceName}<br/>` +
          `<strong>Distância real:</strong> ${draft.realDistanceMeters.toFixed(2)} m<br/>` +
          `<strong>Distância SVG:</strong> ${draft.digitalDistance.toFixed(2)} unidades<br/>` +
          `<strong>Escala:</strong> ${draft.unitsPerMeter.toFixed(2)} un/m<br/>` +
          `<strong>Conversão:</strong> ${draft.metersPerUnit.toFixed(4)} m/un<br/>` +
          `<em>Medida confirmada por marcação manual (face externa).</em>`;
      }
      if (el.calibSave) el.calibSave.disabled = false;
      if (el.calibHelp) el.calibHelp.textContent = "Revise o resultado e clique em Salvar escala.";
    } catch (err) {
      toast(err.message || "Falha na calibração.");
    }
  }

  const NS = "http://www.w3.org/2000/svg";
  const layerById = (svg, id) => svg.getElementById(id) || svg.querySelector(`[id="${id}"]`);

  /**
   * Prefixa classes .cls-* da camada para não colidir no SVG composto.
   * Sem isso, edges outdoor (.cls-1 { stroke:#00c980 }) vazam contorno verde
   * para os ícones dos POIs (mesmo seletor .cls-1).
   */
  function scopeLayerClasses(root, defsNode, prefix) {
    if (!prefix || !root) return defsNode;
    const rename = (name) => (/^cls-\d+$/i.test(name) ? `${prefix}-${name}` : name);
    const renameElClasses = (el) => {
      const raw = el.getAttribute("class");
      if (!raw) return;
      const next = raw.split(/\s+/).filter(Boolean).map(rename).join(" ");
      el.setAttribute("class", next);
    };
    root.querySelectorAll("[class]").forEach(renameElClasses);
    if (!defsNode) return null;
    const scoped = defsNode.cloneNode(true);
    scoped.querySelectorAll("style").forEach((styleEl) => {
      styleEl.textContent = String(styleEl.textContent || "").replace(
        /\.cls-(\d+)\b/g,
        `.${prefix}-cls-$1`
      );
    });
    // símbolos (<use href="#TEMPLO">) também precisam do prefixo — senão herdam .cls-* do background
    scoped.querySelectorAll("[class]").forEach(renameElClasses);
    return scoped;
  }

  /** Extrai camada: grupo interno OU o próprio <svg> raiz (arquivos 2026 limpos). */
  function extractLayer(sourceSvg, layerIds, classPrefix) {
    const ids = Array.isArray(layerIds) ? layerIds : [layerIds];
    for (const id of ids) {
      if (sourceSvg.getAttribute("id") === id) {
        const g = document.createElementNS(NS, "g");
        g.setAttribute("id", id);
        const dataName = sourceSvg.getAttribute("data-name");
        if (dataName) g.setAttribute("data-name", dataName);
        [...sourceSvg.children].forEach((child) => {
          if (child.tagName.toLowerCase() === "defs") return;
          g.appendChild(document.importNode(child, true));
        });
        const rawDefs = sourceSvg.querySelector("defs");
        g._sourceDefs = scopeLayerClasses(g, rawDefs, classPrefix);
        return g;
      }
      const found = layerById(sourceSvg, id);
      if (found) {
        const g = document.importNode(found, true);
        const rawDefs = sourceSvg.querySelector("defs");
        g._sourceDefs = scopeLayerClasses(g, rawDefs, classPrefix);
        return g;
      }
    }
    return null;
  }

  function mergeDefs(hostSvg, defsNode) {
    if (!defsNode) return;
    let hostDefs = hostSvg.querySelector("defs");
    if (!hostDefs) {
      hostDefs = document.createElementNS(NS, "defs");
      hostSvg.insertBefore(hostDefs, hostSvg.firstChild);
    }
    [...defsNode.children].forEach((c) => hostDefs.appendChild(document.importNode(c, true)));
  }

  /** Oculta nodes e edges (malha técnica) — o usuário não deve ver. */
  function hideTechnicalLayers(svg, { hard = true } = {}) {
    if (!svg) return;
    const ids = new Set([
      ...(CONFIG.layers.technical || []),
      CONFIG.replaceTargets.nodes,
      CONFIG.replaceTargets.edgeIndoor,
      CONFIG.replaceTargets.edgeOutdoor,
      ...(CONFIG.layers.nodes || []),
      ...(CONFIG.layers.edges || []),
    ]);
    ids.forEach((id) => {
      if (!id) return;
      const g = layerById(svg, id);
      if (!g) return;
      // soft: só visibility (permite getBBox no parse); hard: some de verdade
      if (hard) g.style.display = "none";
      else g.style.display = "";
      g.style.visibility = "hidden";
      g.style.pointerEvents = "none";
      g.setAttribute("aria-hidden", "true");
      if (hard) g.classList.add("layer-tech-hidden");
      else g.classList.remove("layer-tech-hidden");
    });
  }

  /* ============================================================ CARREGAR SVG */
  async function loadSVG() {
    try {
      const fileEntries = Object.entries(CONFIG.svgFiles);
      const loaded = await Promise.all(fileEntries.map(async ([key, url]) => {
        const bustUrl = appAssetUrl(url);
        const res = await fetch(bustUrl, { cache: "no-store" });
        if (!res.ok) throw new Error(`Falha ao carregar ${url}: HTTP ${res.status}`);
        const text = await res.text();
        const doc = new DOMParser().parseFromString(text, "image/svg+xml");
        if (doc.querySelector("parsererror") || !doc.documentElement.matches("svg")) {
          throw new Error(`SVG inválido: ${url}`);
        }
        return [key, doc.documentElement];
      }));
      const sources = Object.fromEntries(loaded);

      const expectedViewBox = sources.background.getAttribute("viewBox");
      for (const [key, source] of loaded) {
        if (source.getAttribute("viewBox") !== expectedViewBox) {
          throw new Error(`O viewBox de ${key} difere do background`);
        }
      }

      const svg = document.importNode(sources.background, true);
      const T = CONFIG.replaceTargets;
      const replacements = [
        { key: "wall", targetId: T.wall, sourceIds: [T.wall].concat(CONFIG.layerSourceAliases?.wall || []), classPrefix: "wall" },
        {
          key: "edgeIndoor",
          targetId: T.edgeIndoor,
          sourceIds: [CONFIG.layers.edges[0], T.edgeIndoor],
          classPrefix: "edge-in",
        },
        {
          key: "edgeOutdoor",
          targetId: T.edgeOutdoor,
          sourceIds: [CONFIG.layers.edges[1], T.edgeOutdoor],
          classPrefix: "edge-out",
        },
        { key: "nodes", targetId: T.nodes, sourceIds: CONFIG.layers.nodes.concat([T.nodes]), classPrefix: "node" },
        { key: "pois", targetId: T.pois, sourceIds: CONFIG.layers.pois.concat([T.pois]).concat(CONFIG.layerSourceAliases?.pois || []), classPrefix: "poi" },
        { key: "infoTextos", targetId: T.infoTextos, sourceIds: ["_07_txt_info", T.infoTextos], classPrefix: "info" },
      ];
      for (const { key, targetId, sourceIds, classPrefix } of replacements) {
        const replacement = extractLayer(sources[key], sourceIds, classPrefix);
        if (!replacement) {
          throw new Error(`Camada não encontrada: ${key} (fonte: ${sourceIds.join(", ")})`);
        }
        let current = layerById(svg, targetId);
        // background 2026 não inclui placeholders vazios — cria se necessário
        if (!current) {
          current = document.createElementNS(NS, "g");
          current.setAttribute("id", targetId);
          svg.appendChild(current);
        }
        // mantém o id esperado pelo host (compatível com layers.visible)
        replacement.setAttribute("id", targetId);
        if (replacement._sourceDefs) {
          mergeDefs(svg, replacement._sourceDefs);
          delete replacement._sourceDefs;
        }
        current.replaceWith(replacement);
      }

      const vbAttr = svg.getAttribute("viewBox") || "0 0 1011.56 862.63";
      const vb = vbAttr.split(/[\s,]+/).map(Number);
      G.vbW = vb[2] || 1000;
      G.vbH = vb[3] || 720;

      svg.querySelectorAll("symbol").forEach((sym) => {
        const svb = (sym.getAttribute("viewBox") || "").split(/[\s,]+/).map(Number);
        if (svb.some((n) => !isFinite(n) || n < 0)) sym.remove();
      });
      svg.querySelectorAll("use").forEach((u) => {
        const w = +u.getAttribute("width"), h = +u.getAttribute("height");
        if ((isFinite(w) && w < 0) || (isFinite(h) && h < 0)) u.remove();
      });

      svg.removeAttribute("width");
      svg.removeAttribute("height");
      svg.setAttribute("preserveAspectRatio", "xMidYMid meet");
      svg.style.display = "block";
      svg.style.shapeRendering = "geometricPrecision";
      svg.setAttribute("id", "mapaSVG");

      const L = CONFIG.layers;
      const setDisplay = (ids, value) => (ids || []).forEach((id) => {
        const g = layerById(svg, id);
        if (g) {
          g.style.display = value;
          g.classList.remove("st46");
        }
      });
      setDisplay(L.visible, "inline");
      // soft hide antes do parse (getBBox ainda funciona)
      hideTechnicalLayers(svg, { hard: false });

      el.svgHost.innerHTML = "";
      el.svgHost.appendChild(svg);
      el.svgHost.dataset.level = "L00";
      el.svgHost.classList.remove("svg-host--floor");
      state.floorViews.L00 = svg;
      state.floorMeta.L00 = { vbX: 0, vbY: 0, vbW: G.vbW, vbH: G.vbH };

      el.overlay.setAttribute("viewBox", `0 0 ${G.vbW} ${G.vbH}`);
      el.overlay.removeAttribute("width");
      el.overlay.removeAttribute("height");
      el.overlay.setAttribute("preserveAspectRatio", "xMidYMid meet");

      parseGraph(svg);
      bindPOIs(svg);
      syncPoiHitAreas(svg);
      hideNonPoiInfoTexts(svg);
      applyFloorVisibility();
      renderFloorMenu();
      updateFloorChrome();

      // nodes/edges ocultos de verdade para o usuário
      hideTechnicalLayers(svg, { hard: true });

      el.svgName.textContent = Object.values(CONFIG.svgFiles)
        .map((url) => url.split("/").pop())
        .join(" · ");
      el.statusHint.textContent = "Carregando locais por andar…";
      await loadCalibration();
      await loadNavigation();
      renderFloorLocaisHint();
      autoCalibrateFromSvg(svg);
      if (CONFIG.isDev && state.calibration) {
        drawCalibrationMarks(state.calibration.startPoint, state.calibration.endPoint);
      }
      fitSoon();
      syncGpsAvailability();
    } catch (err) {
      el.statusHint.textContent = `Não foi possível montar o mapa: ${err.message}`;
      console.error(err);
    }
  }

  function isGpsEnabled() {
    return isMobileLayout();
  }

  function syncGpsAvailability() {
    const on = isGpsEnabled();
    document.documentElement.dataset.gps = on ? "1" : "0";
    if (on) {
      initUserLocation();
      return;
    }
    state.gpsOrientation?.getTracking()?.stop();
    state.gpsOrientation?.setGpsButtonState?.("IDLE");
    state.userLocation?.stop?.();
    state.userLocation?.hidePuck?.();
    if (el.gpsCompass) {
      el.gpsCompass.hidden = true;
      el.gpsCompass.setAttribute("hidden", "");
      el.gpsCompass.setAttribute("aria-hidden", "true");
    }
  }

  async function initUserLocation() {
    if (state.userLocation || state._gpsInitPending) return;
    if (!isGpsEnabled()) return;
    state._gpsInitPending = true;
    try {
      try {
        await globalThis.PIBMapDeferred?.loadGpsStack?.();
      } catch (err) {
        console.warn("GPS stack defer:", err);
      }
      if (typeof UserLocationSystem === "undefined") {
        console.warn("UserLocationSystem não carregou (scripts js/ ausentes no deploy?).");
        if (el.locBtn && !el.locBtn._bound) {
          el.locBtn._bound = true;
          el.locBtn.addEventListener("click", (e) => {
            e.preventDefault();
            toast("Localização GPS não disponível neste deploy. Verifique se os arquivos js/ foram publicados.");
          });
        }
        initGpsOrientation();
        return;
      }
      initLiveNavigation();
      state.userLocation = UserLocationSystem.create({
        overlay: el.overlay,
        getOverlay: () => el.overlay,
        viewport: el.viewport,
        canvas: el.canvas,
        locBtn: el.locBtn,
        gpsCompass: el.gpsCompass,
        gpsCompassArrow: el.gpsCompassArrow,
        getState: () => state,
        setState: (patch) => { Object.assign(state, patch); },
        apply,
        clamp,
        getViewBox: () => ({ w: G.vbW, h: G.vbH }),
        getMetersPerUnit,
        getMapScale: () => state.scale || 1,
        toast,
        ensureCampusView: () => {
          if (state.activeLevel === "L00") return;
          // GPS / puck usam coordenadas do campus — força L00 sem limpar a viagem
          return setActiveLevel("L00", { keepTrip: true, silent: true });
        },
      });
      // Não auto-inicia: permissão de GPS/bússola precisa de gesto do usuário (clique no botão).
      initGpsOrientation();
    } finally {
      state._gpsInitPending = false;
    }
  }

  function initGpsOrientation() {
    if (!isGpsEnabled()) return;
    if (state.gpsOrientation || typeof GpsOrientation === "undefined") return;

    let cachedGeo = null;
    let cachedGeofence = null;

    async function ensureGeoTransform() {
      if (cachedGeo?.latLngToSvg) return cachedGeo;
      let data = null;
      try {
        const res = await fetch("data/geo-reference.json", { cache: "no-store" });
        if (res.ok) data = await res.json();
      } catch (err) {
        console.warn("geo-reference:", err);
      }
      if (!data) {
        data = {
          mapCenter: { latitude: -25.442099, longitude: -49.284715 },
          controlPoints: [
            { id: "C", latitude: -25.441556, longitude: -49.284917, svgX: 21.5, svgY: 347, weight: 1.4 },
            { id: "N", latitude: -25.442469, longitude: -49.285246, svgX: 591.08, svgY: 826.85, weight: 1.4 },
            { id: "A", latitude: -25.441694, longitude: -49.285528, svgX: 40, svgY: 780, weight: 1 },
            { id: "M", latitude: -25.443038, longitude: -49.284959, svgX: 940.95, svgY: 830, weight: 1 },
          ],
        };
      }
      cachedGeo = globalThis.GeoTransform?.createFromGeoReference?.(data) || null;
      return cachedGeo;
    }

    function ensureGeofence() {
      if (cachedGeofence) return cachedGeofence;
      if (typeof GeofenceService !== "undefined" && globalThis.PIB_CURITIBA_LOCATION_CONFIG) {
        cachedGeofence = GeofenceService.createFromPibConfig(
          globalThis.PIB_CURITIBA_LOCATION_CONFIG,
        );
      }
      return cachedGeofence;
    }

    function askAmbiguousEntrances(options, title) {
      return new Promise((resolve) => {
        const modal = el.gpsConfirmModal;
        const actions = el.gpsConfirmActions;
        if (!modal || !actions) {
          resolve(options[0] || null);
          return;
        }
        if (el.gpsConfirmTitle) el.gpsConfirmTitle.textContent = title;
        actions.innerHTML = "";
        options.forEach((opt) => {
          const btn = document.createElement("button");
          btn.type = "button";
          btn.className = "btn btn--primary btn--block";
          btn.textContent = opt.name || opt.id;
          btn.addEventListener("click", () => {
            modal.hidden = true;
            modal.setAttribute("aria-hidden", "true");
            resolve(opt);
          });
          actions.appendChild(btn);
        });
        const done = (val) => {
          modal.hidden = true;
          modal.setAttribute("aria-hidden", "true");
          resolve(val);
        };
        if (el.gpsConfirmDismiss) {
          el.gpsConfirmDismiss.onclick = () => done(null);
        }
        modal.hidden = false;
        modal.setAttribute("aria-hidden", "false");
      });
    }

    state.gpsOrientation = GpsOrientation.create({
      buttonEl: el.gpsOrientBtn,
      cancelEl: el.gpsOrientCancel,
      accuracyEl: el.gpsAccuracyHint,
      toast,
      getState: () => state,
      setField: (which, poi) => {
        setField(which, poi);
        // LP: não exibe o pin “Estou aqui” (ponto azul) — o puck GPS cuida da posição
        if (which === "origin" && poi?.id === "__here__" && el.hereMarker) {
          state.here = poi;
          el.hereMarker.hidden = true;
          el.hereMarker.setAttribute("hidden", "");
          el.hereMarker.setAttribute("visibility", "hidden");
          el.hereMarker.style.display = "none";
        }
      },
      drawRoute,
      enterNav,
      exitNav: (msg) => {
        state.gpsOrientation?.getTracking()?.stop();
        exitNav(msg);
      },
      getMetersPerUnit,
      ensureGeoTransform,
      ensureGeofence,
      ensureUserLocationStarted: async () => {
        if (!state.userLocation) return false;
        if (state.activeLevel !== "L00") {
          await setActiveLevel("L00", { keepTrip: true, silent: true });
        }
        if (state.userLocation.startFollowing) {
          return !!(await state.userLocation.startFollowing());
        }
        return !!(await state.userLocation.start?.({ silent: true }));
      },
      onTrackingSnap: (valid, snap) => {
        // LP: não desenha o ponto azul “hereMarker”; puck GPS com posição ajustada ao grafo
        if (el.hereMarker) {
          el.hereMarker.hidden = true;
          el.hereMarker.setAttribute("hidden", "");
          el.hereMarker.setAttribute("visibility", "hidden");
          el.hereMarker.style.display = "none";
        }
        const pt = valid?.svg || snap?.snappedPosition;
        if (pt && state.userLocation?.updateTrackedPosition) {
          state.userLocation.updateTrackedPosition(pt.x, pt.y, valid?.accuracy);
        }
        if (el.navHint && state.userNav) {
          const pct = isFinite(valid?.routeProgress)
            ? Math.round(valid.routeProgress * 100)
            : null;
          const acc = Math.round(valid?.accuracy || 0);
          const liveMsg = state.liveNav?.getState?.()?.status;
          const hint =
            liveMsg === "low_accuracy"
              ? `Precisão reduzida · ±${acc} m`
              : liveMsg === "rerouting"
                ? "Recalculando rota..."
                : pct != null
                  ? `Você está na rota · ~${pct}% · ±${acc} m`
                  : `±${acc} m`;
          el.navHint.textContent = hint;
        }
        if (LiveNavigationConfig?.isDebugNavigation?.() && valid?.mapMatch) {
          console.debug("[live-nav]", valid.mapMatch);
        }
      },
      onNeedManualEntrance: () => {
        toast(
          "Localização aproximada encontrada.\nSelecione a entrada mais próxima para continuar.",
        );
        startPlacingHere();
      },
      onAmbiguousEntrances: askAmbiguousEntrances,
      getLiveMapMatchEnhancer: () => state.liveMapMatchEnhancer,
      rerouteFromVirtualNode,
      getSelectedDestinationNodeId: () => {
        const ids = resolveNavNodeIds(state.dest, "dest");
        return ids[0] || null;
      },
      convertGpsToMapCoordinates: (latitude, longitude) => {
        const geoRef = cachedGeo || null;
        return geoRef?.latLngToSvg?.(latitude, longitude) || null;
      },
      updateGpsMarker: (pos) => {
        if (pos?.latitude != null && pos?.longitude != null) {
          state.userLocation?.showAtLatLng?.(pos.latitude, pos.longitude, pos.accuracy);
        } else if (pos?.x != null && pos?.y != null) {
          state.userLocation?.updateTrackedPosition?.(pos.x, pos.y, pos.accuracy);
        }
      },
      drawCalculatedRoute: async () => {
        await drawRoute();
      },
      applyGpsOrientedRoute: async (result) => {
        if (!result?.points?.length || !result.nodeIds?.length) return false;
        const route = {
          id: `gps-route-${result.destinationNodeId}`,
          nodeIds: result.nodeIds,
          edgeIds: result.edgeIds || [],
          points: result.points,
          length: result.lengthMeters || 0,
          label: "Rota 1 — Mais curta",
          kind: "best",
          fromJson: true,
        };
        route.legs = routeLegsFromGraph(route);
        state.routeOptions = [route];
        state.routeIdx = 0;
        state.route = route;
        state.routePickOpen = true;
        selectRoute(0, true);
        updateSummaryChrome();
        return !!state.route;
      },
      waitForDeviceHeading: (timeout = 1500) =>
        new Promise((resolve) => {
          const nav = state.userNav || {};
          if (nav.deviceHeading != null && isFinite(nav.deviceHeading)) {
            resolve(nav.deviceHeading);
            return;
          }
          const startedAt = Date.now();
          const tick = () => {
            const h = state.userNav?.deviceHeading;
            if (h != null && isFinite(h)) {
              resolve(h);
              return;
            }
            if (Date.now() - startedAt >= timeout) {
              resolve(null);
              return;
            }
            requestAnimationFrame(tick);
          };
          tick();
        }),
      ensureDeviceOrientation: async () => {
        await state.userLocation?.startFollowing?.({ silent: true })
          || state.userLocation?.start?.({ silent: true });
      },
      getMapNorthOffsetDeg: () => cachedGeo?.transform?.mapNorthOffset || 0,
      getActiveLevel: () => state.activeLevel || "L00",
    });
  }

  // centro geometrico de um elemento SVG (usa bbox quando disponivel)
  function centerOf(node) {
    const tag = node.tagName.toLowerCase();
    if (tag === "circle" || tag === "ellipse")
      return { x: +node.getAttribute("cx"), y: +node.getAttribute("cy") };
    if (tag === "rect")
      return { x: +node.getAttribute("x") + +node.getAttribute("width") / 2,
               y: +node.getAttribute("y") + +node.getAttribute("height") / 2 };
    try { const b = node.getBBox(); return { x: b.x + b.width / 2, y: b.y + b.height / 2 }; }
    catch { return { x: 0, y: 0 }; }
  }

  function edgeEndpoints(node) {
    const tag = node.tagName.toLowerCase();
    if (tag === "line")
      return [{ x: +node.getAttribute("x1"), y: +node.getAttribute("y1") },
              { x: +node.getAttribute("x2"), y: +node.getAttribute("y2") }];
    if (tag === "polyline" || tag === "polygon") {
      // Illustrator exporta "x y x y…" (espaços) OU "x,y x,y" — ambos válidos
      const nums = (node.getAttribute("points") || "")
        .trim()
        .split(/[\s,]+/)
        .map(Number)
        .filter((n) => isFinite(n));
      const pts = [];
      for (let i = 0; i + 1 < nums.length; i += 2) pts.push({ x: nums[i], y: nums[i + 1] });
      return pts;
    }
    if (tag === "path") {
      const len = node.getTotalLength ? node.getTotalLength() : 0;
      if (len) { const a = node.getPointAtLength(0), b = node.getPointAtLength(len); return [{ x: a.x, y: a.y }, { x: b.x, y: b.y }]; }
    }
    return [];
  }

  function nearestNode(p, tol = Infinity) {
    let best = null, d = Infinity;
    for (const id in G.nodes) {
      const nd = dist(p, G.nodes[id]);
      if (nd < d) { d = nd; best = id; }
    }
    return d <= tol ? best : null;
  }

  // cria nó no ponto exato da edge (ou reaproveita um já existente bem perto)
  function ensureNode(p, tol = CONFIG.snapTol) {
    const near = nearestNode(p, tol);
    if (near) return near;
    const id = `e${++G.autoN}`;
    G.nodes[id] = { id, x: p.x, y: p.y, official: false };
    G.adj[id] = [];
    return id;
  }

  /** Tolerância efetiva: zona (indoor/outdoor/parking) ou fallback global. */
  function tol(key, zone) {
    const z = zone && CONFIG.toleranceByZone?.[zone];
    if (z && z[key] != null) return z[key];
    return CONFIG[key];
  }

  /** Zona de tolerância do POI — indoor conservador; outdoor/parking mais folgado. */
  function poiToleranceZone(poi) {
    if (!poi) return "indoor";
    if (pointInParkingZone(poi) || isParkingPoi(poi)) return "parking";
    const id = norm(poi.rawId || poi.id || "");
    const n = norm(poi.name || "");
    const blob = `${id} ${n}`;
    if (/estacionamento|pedestre|batel|bento|patio|pátio|motos?/.test(blob)) return "parking";
    if (/jardim|externo|toldo|narnia|servir|refeitorio|capela|templo|batist|ginasio|seven_pass/.test(blob)) {
      return "outdoor";
    }
    return "indoor";
  }

  function edgeZonePenalty(poiZone, edgeZone) {
    if (!poiZone || !edgeZone || poiZone === edgeZone) return 0;
    if (poiZone === "indoor" && edgeZone === "outdoor") return 45;
    if (poiZone === "outdoor" && edgeZone === "indoor") return 22;
    if (poiZone === "parking") return edgeZone === "outdoor" ? 0 : 14;
    return 12;
  }

  // nó mais próximo que faça parte do grafo navegável (maior componente conectado)
  function nearestConnectedNode(p, officialOnly = false) {
    const pool = G.main && G.main.size
      ? G.main
      : new Set(Object.keys(G.nodes).filter((id) => (G.adj[id] || []).length));
    let best = null, d = Infinity;
    for (const id of pool) {
      if (!(G.adj[id] || []).length) continue;
      if (officialOnly && !(G.adj[id] || []).some((e) => e.official)) continue;
      const nd = dist(p, G.nodes[id]);
      if (nd < d) { d = nd; best = id; }
    }
    return best;
  }

  // identifica o maior componente conectado pela malha OFICIAL
  function computeMainComponent() {
    const seen = new Set();
    let best = new Set();
    for (const start in G.nodes) {
      if (seen.has(start)) continue;
      if (!(G.adj[start] || []).some((e) => e.official)) continue;
      const comp = new Set([start]);
      const stack = [start];
      seen.add(start);
      while (stack.length) {
        const cur = stack.pop();
        for (const nb of G.adj[cur] || []) {
          if (!nb.official) continue;
          if (seen.has(nb.id)) continue;
          seen.add(nb.id); comp.add(nb.id); stack.push(nb.id);
        }
      }
      if (comp.size > best.size) best = comp;
    }
    G.main = best;
  }

  /* ---------- geometria: paredes x trechos ---------- */
  function parsePointList(raw) {
    const nums = (raw || "").trim().split(/[\s,]+/).map(Number).filter((n) => isFinite(n));
    const pts = [];
    for (let i = 0; i + 1 < nums.length; i += 2) pts.push({ x: nums[i], y: nums[i + 1] });
    return pts;
  }

  function parsePathPoints(d) {
    // extrai vértices aproximados de um path (M/L/H/V/Z) — suficiente p/ paredes do AI
    const pts = [];
    if (!d) return pts;
    const re = /([MmLlHhVvZz])|(-?\d*\.?\d+(?:e[-+]?\d+)?)/g;
    let cmd = "M", x = 0, y = 0, start = null, m;
    const nums = [];
    const flush = () => {
      while (nums.length) {
        if (cmd === "H" || cmd === "h") {
          const nx = nums.shift();
          x = cmd === "h" ? x + nx : nx;
          pts.push({ x, y });
        } else if (cmd === "V" || cmd === "v") {
          const ny = nums.shift();
          y = cmd === "v" ? y + ny : ny;
          pts.push({ x, y });
        } else if ("ML".includes(cmd.toUpperCase())) {
          if (nums.length < 2) break;
          let nx = nums.shift(), ny = nums.shift();
          if (cmd === cmd.toLowerCase()) { nx += x; ny += y; }
          x = nx; y = ny;
          pts.push({ x, y });
          if (!start) start = { x, y };
          if (cmd.toUpperCase() === "M") cmd = cmd === "M" ? "L" : "l";
        } else {
          nums.shift(); // ignora comandos curvos complexos
        }
      }
    };
    while ((m = re.exec(d))) {
      if (m[1]) {
        flush();
        cmd = m[1];
        if (cmd === "Z" || cmd === "z") {
          if (start) { x = start.x; y = start.y; pts.push({ x, y }); start = null; }
        }
      } else nums.push(+m[2]);
    }
    flush();
    return pts;
  }

  function wallPolysFromEl(node) {
    const tag = node.tagName.toLowerCase();
    if (tag === "rect") {
      const x = +node.getAttribute("x") || 0, y = +node.getAttribute("y") || 0;
      const w = +node.getAttribute("width") || 0, h = +node.getAttribute("height") || 0;
      return [[{ x, y }, { x: x + w, y }, { x: x + w, y: y + h }, { x, y: y + h }]];
    }
    if (tag === "polygon" || tag === "polyline") {
      const pts = parsePointList(node.getAttribute("points"));
      return pts.length >= 2 ? [pts] : [];
    }
    if (tag === "path") {
      const pts = parsePathPoints(node.getAttribute("d") || "");
      return pts.length >= 2 ? [pts] : [];
    }
    if (tag === "line") {
      return [[{ x: +node.getAttribute("x1"), y: +node.getAttribute("y1") },
               { x: +node.getAttribute("x2"), y: +node.getAttribute("y2") }]];
    }
    return [];
  }

  function parseWalls(svg) {
    G.walls = [];
    const layerIds = [
      "_x30_4_x5F__x5F_background_x5F_wall_x5F_paredes_x5F_tech",
      ...(CONFIG.layerSourceAliases?.wall || []),
    ];
    let g = null;
    for (const id of layerIds) {
      g = layerById(svg, id);
      if (g) break;
    }
    if (!g) return;

    const pushPoly = (poly) => {
      if (poly.length >= 2) G.walls.push(poly);
    };

    g.querySelectorAll("rect, polygon, polyline, path, line").forEach((el) => {
      wallPolysFromEl(el).forEach(pushPoly);
    });

    g.querySelectorAll("use").forEach((el) => {
      const local = [];
      collectWallPolysFromNode(el, svg, local);
      if (!local.length) return;
      const ctm = typeof el.getCTM === "function" ? el.getCTM() : null;
      if (!ctm) {
        local.forEach(pushPoly);
        return;
      }
      local.forEach((poly) => {
        const transformed = poly.map((p) => {
          const pt = svg.createSVGPoint();
          pt.x = p.x;
          pt.y = p.y;
          const t = pt.matrixTransform(ctm);
          return { x: t.x, y: t.y };
        });
        pushPoly(transformed);
      });
    });
  }

  function collectWallPolysFromNode(node, svg, out) {
    if (!node) return;
    const tag = node.tagName?.toLowerCase();
    if (tag === "use") {
      const href = node.getAttribute("href")
        || node.getAttributeNS("http://www.w3.org/1999/xlink", "href")
        || "";
      const refId = href.replace(/^#/, "");
      if (!refId) return;
      const ref = svg.getElementById(refId);
      if (!ref) return;
      ref.querySelectorAll("rect, polygon, polyline, path, line").forEach((el) => {
        wallPolysFromEl(el).forEach((poly) => {
          if (poly.length >= 2) out.push(poly);
        });
      });
      return;
    }
    wallPolysFromEl(node).forEach((poly) => {
      if (poly.length >= 2) out.push(poly);
    });
  }

  function parseFloorWalls(svg, levelId) {
    const walls = [];
    const root = svg.getElementById(`${levelId}_WALL`);
    if (root) {
      root.querySelectorAll("rect, polygon, polyline, path, line, use").forEach((el) => {
        collectWallPolysFromNode(el, svg, walls);
      });
    }
    state.floorWalls[levelId] = walls;
    return walls;
  }

  function orient(a, b, c) {
    const v = (b.y - a.y) * (c.x - b.x) - (b.x - a.x) * (c.y - b.y);
    if (Math.abs(v) < 1e-9) return 0;
    return v > 0 ? 1 : 2;
  }
  function onSeg(a, b, c) {
    return c.x <= Math.max(a.x, b.x) + 1e-6 && c.x >= Math.min(a.x, b.x) - 1e-6
      && c.y <= Math.max(a.y, b.y) + 1e-6 && c.y >= Math.min(a.y, b.y) - 1e-6;
  }
  function segmentsIntersect(p1, q1, p2, q2) {
    const o1 = orient(p1, q1, p2), o2 = orient(p1, q1, q2);
    const o3 = orient(p2, q2, p1), o4 = orient(p2, q2, q1);
    if (o1 !== o2 && o3 !== o4) return true;
    if (o1 === 0 && onSeg(p1, q1, p2)) return true;
    if (o2 === 0 && onSeg(p1, q1, q2)) return true;
    if (o3 === 0 && onSeg(p2, q2, p1)) return true;
    if (o4 === 0 && onSeg(p2, q2, q1)) return true;
    return false;
  }

  function pointInPoly(p, poly) {
    // ray casting; poly aberto ou fechado
    let inside = false;
    for (let i = 0, j = poly.length - 1; i < poly.length; j = i++) {
      const a = poly[i], b = poly[j];
      const hit = ((a.y > p.y) !== (b.y > p.y))
        && (p.x < ((b.x - a.x) * (p.y - a.y)) / ((b.y - a.y) || 1e-12) + a.x);
      if (hit) inside = !inside;
    }
    return inside;
  }

  // um trecho “atravessa parede” se cruza aresta de parede ou passa por dentro dela
  function distToSeg(p, a, b) {
    const dx = b.x - a.x, dy = b.y - a.y;
    const len2 = dx * dx + dy * dy;
    if (len2 < 1e-8) return dist(p, a);
    let t = ((p.x - a.x) * dx + (p.y - a.y) * dy) / len2;
    t = Math.max(0, Math.min(1, t));
    return dist(p, { x: a.x + t * dx, y: a.y + t * dy });
  }

  function crossesWall(a, b, levelId) {
    const pa = navPointToWallSpace(a, levelId);
    const pb = navPointToWallSpace(b, levelId);
    const walls = wallsForLevel(levelId);
    if (!pa || !pb || !walls.length) return false;
    // amostras ao longo do segmento (pega atravessamento de paredes finas)
    const samples = 9;
    for (let s = 1; s < samples; s++) {
      const t = s / samples;
      const pt = { x: pa.x + (pb.x - pa.x) * t, y: pa.y + (pb.y - pa.y) * t };
      for (const poly of walls) {
        if (poly.length >= 3 && pointInPoly(pt, poly)) return true;
      }
    }
    for (const poly of walls) {
      const n = poly.length;
      for (let i = 0; i < n; i++) {
        const p = poly[i], q = poly[(i + 1) % n];
        if (n < 3 && i === n - 1) break;
        if (!segmentsIntersect(pa, pb, p, q)) continue;
        // permite raspar a parede; NÃO atravessar pelo meio
        if (distToSeg(pa, p, q) < 1.0 || distToSeg(pb, p, q) < 1.0) continue;
        return true;
      }
    }
    return false;
  }

  function addEdge(a, b, geom, trustEdge = false, meta = null) {
    if (!a || !b || a === b) return false;
    const points = geom && geom.length >= 2
      ? geom.map((p) => ({ x: p.x, y: p.y }))
      : [{ x: G.nodes[a].x, y: G.nodes[a].y }, { x: G.nodes[b].x, y: G.nodes[b].y }];
    // edges oficiais (trustEdge) do Illustrator já respeitam portas;
    // pontes/atalhos sintéticos NUNCA atravessam parede
    if (!trustEdge) {
      for (let i = 1; i < points.length; i++) {
        if (crossesWall(points[i - 1], points[i])) return false;
      }
    }
    let w = 0;
    for (let i = 1; i < points.length; i++) w += dist(points[i - 1], points[i]);
    if (w < 0.01) return false;
    const rev = points.slice().reverse();
    const zone = meta?.zone || null;
    const parking = !!meta?.parking;
    const existing = G.adj[a].find((e) => e.id === b);
    if (!existing) G.adj[a].push({ id: b, w, geom: points, official: !!trustEdge, zone, parking });
    else {
      if (w < existing.w) { existing.w = w; existing.geom = points; }
      existing.official = existing.official || !!trustEdge;
      if (zone && !existing.zone) existing.zone = zone;
      existing.parking = existing.parking || parking;
    }
    const existingR = G.adj[b].find((e) => e.id === a);
    if (!existingR) G.adj[b].push({ id: a, w, geom: rev, official: !!trustEdge, zone, parking });
    else {
      if (w < existingR.w) { existingR.w = w; existingR.geom = rev; }
      existingR.official = existingR.official || !!trustEdge;
      if (zone && !existingR.zone) existingR.zone = zone;
      existingR.parking = existingR.parking || parking;
    }
    return true;
  }

  // remove atalhos sintéticos (e edges oficiais que atravessem parede)
  function pruneIllegalEdges() {
    for (const a of Object.keys(G.adj)) {
      for (const e of [...(G.adj[a] || [])]) {
        const geom = e.geom && e.geom.length >= 2
          ? e.geom
          : [{ x: G.nodes[a].x, y: G.nodes[a].y }, { x: G.nodes[e.id].x, y: G.nodes[e.id].y }];
        let bad = false;
        for (let i = 1; i < geom.length; i++) {
          if (crossesWall(geom[i - 1], geom[i])) { bad = true; break; }
        }
        // oficiais: só remove se o segmento for longo E atravessar (ruído AI curto fica)
        if (e.official) {
          const span = geom.reduce((s, p, i) => (i ? s + dist(geom[i - 1], p) : 0), 0);
          if (!bad || span < 14) continue;
        } else if (!bad) continue;
        removeEdge(a, e.id);
      }
    }
  }

  /** Liga nodes oficiais órfãos à malha (porta sem edge colada). */
  function attachOrphanOfficialNodes() {
    for (const id of Object.keys(G.nodes)) {
      const n = G.nodes[id];
      if (!n?.official) continue;
      if ((G.adj[id] || []).length) continue;
      const hit = findNearestEdgeHit(n, CONFIG.snapTol * 3, false);
      if (!hit) continue;
      if (dist(n, G.nodes[hit.a]) <= CONFIG.snapTol) {
        addEdge(id, hit.a, null, true);
        continue;
      }
      if (dist(n, G.nodes[hit.b]) <= CONFIG.snapTol) {
        addEdge(id, hit.b, null, true);
        continue;
      }
      if (hit.d <= CONFIG.snapTol * 2) {
        splitEdgeAt(hit.a, hit.b, id, { x: n.x, y: n.y });
      }
    }
  }

  function poiSlug(poi) {
    const raw = String(poi.rawId || poi.id || "")
      .replace(/^poi-\d+-/i, "")
      .replace(/_x5F_/g, "_");
    const fromId = raw.replace(/^P\d+_?/i, "");
    const fromName = String(poi.name || "").replace(/\s+/g, "_");
    return norm(fromId || fromName);
  }

  function nodeSlug(id) {
    return norm(String(id || "").replace(/^L00_N\d+_?/i, "").replace(/^e\d+$/i, ""));
  }

  function nameMatchScore(poi, nodeId) {
    const STOP = new Set([
      "entrada", "intersection", "connection", "cintersection", "externo", "interno",
      "kids", "banheiro", "masculino", "feminino", "estacionamento", "templo",
      "principal", "lateral", "area", "espaco", "sala",
    ]);
    const ps = poiSlug(poi);
    const ns = nodeSlug(nodeId);
    if (!ps || !ns || ns.length < 5) return 0;
    if (ps === ns) return 120;
    if (ps.length >= 8 && (ps.includes(ns) || ns.includes(ps))) return 90;
    const pt = ps.split(/[_\s-]+/).filter((t) => t.length > 3 && !STOP.has(t));
    const nt = ns.split(/[_\s-]+/).filter((t) => t.length > 3 && !STOP.has(t));
    if (!pt.length || !nt.length) return 0;
    const hits = pt.filter((t) => nt.some((u) => u === t || (t.length > 5 && (u.includes(t) || t.includes(u)))));
    if (hits.length < 1) return 0;
    // exige pelo menos um token específico (não genérico)
    return 50 + hits.length * 20;
  }

  function configuredAnchor(poi) {
    const raw = String(poi.rawId || "").replace(/_x5F_/g, "_");
    const map = CONFIG.poiAnchors || {};
    const nodeId = map[raw] || map[raw.replace(/^poi-\d+-/i, "")];
    if (!nodeId || !G.nodes[nodeId]) return null;
    // garante que o node está ligado à malha
    if (!(G.adj[nodeId] || []).length) {
      const hit = findNearestEdgeHit(G.nodes[nodeId], CONFIG.snapTol * 4, false);
      if (hit) {
        if (dist(G.nodes[nodeId], G.nodes[hit.a]) <= CONFIG.snapTol) addEdge(nodeId, hit.a, null, true);
        else if (dist(G.nodes[nodeId], G.nodes[hit.b]) <= CONFIG.snapTol) addEdge(nodeId, hit.b, null, true);
        else if (hit.d <= CONFIG.snapTol * 2.5) splitEdgeAt(hit.a, hit.b, nodeId, { x: G.nodes[nodeId].x, y: G.nodes[nodeId].y });
      }
    }
    if (G.main) G.main.add(nodeId);
    return {
      id: nodeId,
      x: G.nodes[nodeId].x,
      y: G.nodes[nodeId].y,
      d: dist(poi, G.nodes[nodeId]),
      how: "config",
    };
  }

  /** Projeção na edge mais próxima (opcionalmente exigindo caminho livre de parede). */
  function findNearestEdgeHit(p, maxDist, requireClear, preferredZone) {
    let best = null;
    const seen = new Set();
    const lat = CONFIG.snapLateral || 0;
    for (const a of Object.keys(G.adj)) {
      for (const e of G.adj[a]) {
        if (!edgeInMain(a, e.id) && G.main && G.main.size) continue;
        const key = edgeKey(a, e.id);
        if (seen.has(key)) continue;
        seen.add(key);
        const geom = e.geom && e.geom.length >= 2
          ? e.geom
          : [{ x: G.nodes[a].x, y: G.nodes[a].y }, { x: G.nodes[e.id].x, y: G.nodes[e.id].y }];
        for (let i = 1; i < geom.length; i++) {
          const pr = projectOnSeg(p, geom[i - 1], geom[i]);
          if (pr.d > maxDist) continue;
          if (requireClear && crossesWall(p, { x: pr.x, y: pr.y })) continue;
          const score = pr.d
            + edgeZonePenalty(preferredZone, e.zone)
            + lat * Math.abs(pr.x - p.x)
            + lat * 0.25 * Math.abs(pr.y - p.y);
          if (!best || score < best.score) {
            best = { score, d: pr.d, proj: { x: pr.x, y: pr.y }, a, b: e.id, official: !!e.official };
          }
        }
      }
    }
    return best;
  }

  /**
   * Ancora o local na ENTRADA: mapa explícito → nome → node oficial livre → edge.
   */
  function snapToEntrance(p, excludeIds) {
    const GFRM = gfr();
    if (GFRM && (p?.officialAccessNodeId || p?.templeEntranceNodeId || p?.graphNodeId)) {
      const official = GFRM.resolveOfficialNodeId(p, state.navGraph, G.nodes, G.adj);
      if (official?.graphNodeId) {
        const node = state.navGraph?.nodesById?.get(official.graphNodeId) || G.nodes?.[official.graphNodeId];
        if (node) {
          return {
            id: official.graphNodeId,
            x: node.x,
            y: node.y,
            d: 0,
            how: "ground-floor-official",
          };
        }
      }
      if (official?.unavailable) {
        const NR = globalThis.NavigationRouter;
        if (NR && state.navGraph) {
          const lvl = poiLevel(p) || state.activeLevel || "L00";
          const near = NR.nearestNodeId(poiIcon(p) || p, state.navGraph, { level: lvl });
          if (near) {
            const node = state.navGraph.nodesById.get(near) || G.nodes?.[near];
            if (node) {
              return { id: near, x: node.x, y: node.y, d: dist(p, node), how: "nearest-fallback" };
            }
          }
        }
      }
      return { id: null };
    }
    if (p?.templeEntranceNodeId || p?.graphNodeId) {
      const base = p.templeEntranceNodeId || nodeIdBase(p.graphNodeId);
      const resolved = p.graphNodeId || resolveGraphNodeId(base);
      if (resolved && graphNodeHasEdges(resolved)) {
        const node = state.navGraph?.nodesById?.get(resolved) || G.nodes?.[resolved];
        if (node) {
          return {
            id: resolved,
            x: node.x,
            y: node.y,
            d: 0,
            how: "temple-entrance",
          };
        }
      }
      console.warn(`Entrada do Templo indisponível: node ${base} não encontrado ou sem conexão válida.`);
      return { id: null };
    }
    const banned = excludeIds instanceof Set ? excludeIds : new Set(excludeIds || []);
    const zone = poiToleranceZone(p);
    const maxD = tol("entranceTol", zone);

    const cfg = configuredAnchor(p);
    if (cfg && !banned.has(cfg.id)) return cfg;

    // 1) match por nome forte (ex.: banheiro_feminino_ginasio)
    if (p.rawId || p.name) {
      let named = null;
      for (const id of Object.keys(G.nodes)) {
        if (banned.has(id)) continue;
        const n = G.nodes[id];
        if (!n?.official) continue;
        const score = nameMatchScore(p, id);
        if (score < 70) continue;
        if (crossesWall(p, n)) continue;
        const d = dist(p, n);
        if (d > maxD * 1.25) continue;
        const rank = d - score;
        if (!named || rank < named.rank) named = { id, x: n.x, y: n.y, d, rank, how: "name" };
      }
      if (named) {
        if (G.main) G.main.add(named.id);
        return { id: named.id, x: named.x, y: named.y, d: named.d, how: named.how };
      }
    }

    // 2) node oficial mais próximo com segmento livre (entrada da sala)
    let bestNode = null;
    for (const id of Object.keys(G.nodes)) {
      if (banned.has(id)) continue;
      const n = G.nodes[id];
      if (!n?.official) continue;
      if (G.main && G.main.size && !G.main.has(id) && !(G.adj[id] || []).length) continue;
      const d = dist(p, n);
      if (d > maxD) continue;
      if (crossesWall(p, n)) continue;
      const linked = (G.adj[id] || []).length > 0 ? 0 : 18;
      const score = d + linked;
      if (!bestNode || score < bestNode.score) {
        bestNode = { score, id, x: n.x, y: n.y, d, how: "official" };
      }
    }
    if (bestNode) {
      if (G.main) G.main.add(bestNode.id);
      return { id: bestNode.id, x: bestNode.x, y: bestNode.y, d: bestNode.d, how: bestNode.how };
    }

    // 3) projeção na edge caminhável SEM atravessar parede
    const hit = findNearestEdgeHit(p, tol("edgeSnapTol", zone), true, zone);
    if (hit && !banned.has(hit.a) && !banned.has(hit.b)) {
      let door = null;
      for (const id of Object.keys(G.nodes)) {
        if (banned.has(id)) continue;
        const n = G.nodes[id];
        if (!n?.official) continue;
        const d = dist(hit.proj, n);
        if (d > CONFIG.snapTol * 2.5) continue;
        if (crossesWall(p, n)) continue;
        if (!door || d < door.d) door = { id, x: n.x, y: n.y, d };
      }
      if (door) {
        if (G.main) G.main.add(door.id);
        return { id: door.id, x: door.x, y: door.y, d: dist(p, door), how: "door-near-edge" };
      }

      const near = nearestNode(hit.proj, CONFIG.snapTol);
      if (near && !banned.has(near) && (near === hit.a || near === hit.b)) {
        if (G.main) G.main.add(near);
        return { id: near, x: hit.proj.x, y: hit.proj.y, d: hit.d, how: "edge-end" };
      }
      const snapId = ensureNode(hit.proj, 1.2);
      if (!banned.has(snapId)) {
        const linkedA = (G.adj[snapId] || []).some((e) => e.id === hit.a);
        const linkedB = (G.adj[snapId] || []).some((e) => e.id === hit.b);
        if (!(linkedA && linkedB) && snapId !== hit.a && snapId !== hit.b) {
          splitEdgeAt(hit.a, hit.b, snapId, hit.proj);
        }
        if (G.main) G.main.add(snapId);
        return { id: snapId, x: hit.proj.x, y: hit.proj.y, d: hit.d, how: "edge-split" };
      }
    }

    // 4) fallback
    let fallback = null;
    for (const id of Object.keys(G.nodes)) {
      if (banned.has(id)) continue;
      if (!(G.adj[id] || []).length) continue;
      if (G.main && G.main.size && !G.main.has(id)) continue;
      const n = G.nodes[id];
      if (crossesWall(p, n)) continue;
      const d = dist(p, n);
      if (!fallback || d < fallback.d) fallback = { id, x: n.x, y: n.y, d, how: "fallback" };
    }
    if (fallback) return fallback;

    const id = nearestConnectedNode(p);
    return { id, x: G.nodes[id]?.x, y: G.nodes[id]?.y, d: id ? dist(p, G.nodes[id]) : Infinity, how: "nearest" };
  }

  /** Dois locais não podem ficar no mesmo node se outro node livre estiver disponível. */
  function resolveAnchorConflicts() {
    const byAnchor = new Map();
    for (const poi of G.pois) {
      if (!poi.anchor) continue;
      if (!byAnchor.has(poi.anchor)) byAnchor.set(poi.anchor, []);
      byAnchor.get(poi.anchor).push(poi);
    }
    for (const [, group] of byAnchor) {
      if (group.length < 2) continue;
      group.sort((a, b) => dist(a, G.nodes[a.anchor] || a) - dist(b, G.nodes[b.anchor] || b));
      // o mais próximo fica; os demais reancora evitando os já usados
      const used = new Set([group[0].anchor]);
      for (let i = 1; i < group.length; i++) {
        const poi = group[i];
        if (poi.fromLayerIndex || l00()?.hasOfficialLayerNode(poi)) continue;
        const snap = snapToEntrance(poi, used);
        if (snap?.id) {
          poi.anchor = snap.id;
          poi.snap = { x: snap.x, y: snap.y };
          used.add(snap.id);
        }
      }
    }
  }

  // compat
  function snapToNetwork(p) {
    return snapToEntrance(p);
  }

  function titleCasePoiWords(text) {
    return formatPoiDisplayName(String(text || "").trim());
  }

  function applySlugAcronyms(text, rawId) {
    const m = String(rawId || "").match(/_([A-Z0-9]{2,})$/i);
    if (!m) return text;
    const ac = m[1].toUpperCase();
    const words = String(text || "").split(/\s+/);
    if (words.length && words[words.length - 1].toLowerCase() === ac.toLowerCase()) {
      words[words.length - 1] = ac;
      return words.join(" ");
    }
    return text;
  }

  // decodifica id: P002_capela / P002_x5F_capela -> "Capela"
  function decodePoiName(rawId, dataName) {
    let base;
    if (dataName && dataName.trim() && !/^P\d+/i.test(dataName) && !/^B\d+/i.test(dataName)) {
      base = applySlugAcronyms(formatPoiDisplayName(dataName.trim()), rawId);
    } else {
      let s = dataName || rawId || "";
      s = s.replace(/_x5F_/g, "_").replace(/_x([0-9a-fA-F]{2})_/g, (_, h) => String.fromCharCode(parseInt(h, 16)));
      s = s.replace(/^P\d+[_-]?/i, "").replace(/^B\d+[_-]?/i, "");
      s = s.replace(/[_-]+/g, " ").trim();
      if (!s) return rawId;
      base = applySlugAcronyms(formatPoiDisplayName(s), rawId);
    }
    return fixPortugueseAccents(base);
  }

  function guessCat(name) {
    const n = norm(name);
    if (/estacionamento|moto/.test(n)) return "estacionamento";
    if (/banheiro|wc|sanitario/.test(n)) return "servico";
    if (/entrada|acesso|portao|toldo|elevador|escada/.test(n)) return "acesso";
    if (/refeitorio|seven|pass|lanch|cafe|restaurante|aliment/.test(n)) return "alimentacao";
    if (/recepcao|livraria|bercario|bazar|abasc|apoio|conexao/.test(n)) return "apoio";
    return "ambiente";
  }

  /** Área / prédio do local (para searchLabel e desambiguação). */
  function buildingFromPoi(rawId, name) {
    const id = norm(rawId || "");
    const n = norm(name || "");
    if (/centro_de_formacao|formacao|sala_de_oracao_rgo|^p004_|^p005_/.test(id) || /centro de formacao|sala de oracao rgo/.test(n)) {
      return "Centro de Formação";
    }
    if (/^l01_|administrativo|1[ºo]\s*andar/.test(id) || /1[ºo]\s*andar|administrativo/.test(n)) {
      return "Administrativo";
    }
    if (/^p000e[1-5]_entrada_/.test(id) || /entrada (lateral|0[12] principal).*templo/.test(n)) {
      return "Templo";
    }
    if (/templo|capela|narnia|batister|^p000_|^p002_|^p027_|entrada_lateral_templo|entrada_0[12]_principal_templo/.test(id)
      || /templo|capela|narnia/.test(n)) {
      return "Templo";
    }
    if (/ginasio|seven_pass|^p014_|^p021_|^p022_|^p026_|elevador_ginasio|^min_esportes|min\. esportes|ministerio esportes|ministério esportes/.test(id)
      || /ginasio|seven pass|restaurante seven|min\. esportes|ministerio esportes|ministério esportes/.test(n)) {
      return "Ginásio";
    }
    if (/abasc|bazar|^p015_|^p018_/.test(id) || /abasc|bazar transforma/.test(n)) {
      return "ABASC";
    }
    if (/area_kids_t|area kids t|^p007t_/.test(id) || n === "area kids t") {
      return "Área Kids";
    }
    if (/area_kids|refeitorio_externo|^p007_|^p008_/.test(id) || /area kids|refeitorio externo/.test(n)) {
      return "Área Kids";
    }
    if (/espaco_servir|^p020_/.test(id) || /espaco servir|espaço servir/.test(n)) {
      return "Subsolo 01";
    }
    if (/jardim|^p016_/.test(id) || /jardim/.test(n)) {
      return "Jardim";
    }
    if (/estacionamento|pedestre|batel|bento|^p003_|^p006_|^p028_|^p029_|^p030_|^p031_/.test(id)
      || /estacionamento|pedestre|batel|bento/.test(n)) {
      return "Acessos / Estacionamento";
    }
    if (/livraria|conexao|bercario|recepcao|oracao_cleusa|acolher|^p009_|^p010_|^p011_|^p012_|^p013_|^p017_/.test(id)) {
      return "Hall / Apoio";
    }
    return "Campus";
  }

  /** Grupo de filtro (salas, auditórios, banheiros, elevadores, emergência). */
  function searchGroupFromPoi(rawId, name, cat) {
    const id = norm(rawId || "");
    const n = norm(name || "");
    if (/emerg|ambulatorio|primeirossocorros|saidadeemergencia/.test(id)
      || /emerg|ambulatorio|primeiros socorros|saida de emergencia/.test(n)) {
      return "emergencia";
    }
    if (/elevador/.test(id) || /elevador/.test(n)) return "elevadores";
    if (/banheiro|wc|sanitario/.test(id) || /banheiro|wc|sanitario/.test(n)) return "banheiros";
    if (/templo|capela|auditorio/.test(id) || /templo|capela|auditorio/.test(n)) return "auditorios";
    if (/sala|oracao|bercario|recepcao|conexao|livraria|kids|acolher|servir|abasc|bazar|formacao|refeitorio|seven|narnia|jardim/.test(id)
      || /sala|oracao|bercario|recepcao|conexao|livraria|kids|acolher|servir|abasc|bazar|formacao|refeitorio|seven|narnia|jardim/.test(n)
      || cat === "ambiente" || cat === "apoio" || cat === "alimentacao") {
      return "salas";
    }
    return "salas";
  }

  function enrichPoiMeta(poi) {
    if (poi.rawId || poi.id) {
      poi.name = decodePoiName(poi.rawId || poi.id, poi.name);
    }
    // IDs de camada seguem L00_poi_XXXX_nome_node_YYYY. Extrai a entrada oficial
    // uma única vez para evitar regex/resolução repetidas durante o roteamento.
    if (!poi.nodeId) {
      const match = String(poi.rawId || poi.id || "")
        .match(/^(L\d{2})_poi_\d+_.+_node_(\d{4})/i);
      if (match) poi.nodeId = `${match[1].toUpperCase()}_node_${match[2]}`;
    }
    applyPoiDisplayName(poi);
    const ov = poiLevelOverride(poi.rawId || poi.id);
    const level = ov?.level || poi.level || levelFromId(poi.rawId) || "L00";
    const floorForLevel = floorById(level);
    const mapLevel = ov?.mapLevel || poi.mapLevel
      || (floorForLevel?.mapUrl ? level : (level.startsWith("B") ? "L00" : level));
    const building = ov?.building || poi.building || buildingFromPoi(poi.rawId, poi.name);
    const group = poi.group || searchGroupFromPoi(poi.rawId, poi.name, poi.cat);
    const code = poi.code || `${level}_${poi.rawId || poi.id}`;
    const accessNote = ov?.accessNote || poi.accessNote || null;
    poi.level = level;
    poi.mapLevel = mapLevel;
    poi.building = building;
    poi.group = group;
    poi.code = code;
    poi.accessNote = accessNote;
    // Sempre rótulo curto (ignora searchLabel longo legado)
    poi.searchLabel = poiSuggestTitle(poi);
    applyNarniaGateIconToPoi(poi);
    applyInjectedPoiIcon(poi);
    return poi;
  }

  function parseGraph(svg) {
    G.nodes = {}; G.adj = {}; G.pois = []; G.walls = []; G.autoN = 0; G.main = null;
    const L = CONFIG.layers;
    const T = CONFIG.replaceTargets;
    // após o replace, as camadas usam os IDs do host (replaceTargets)
    const nodeLayerIds = [...new Set([...(L.nodes || []), T.nodes].filter(Boolean))];
    const edgeLayerIds = [...new Set([...(L.edges || []), T.edgeIndoor, T.edgeOutdoor].filter(Boolean))];
    const poiLayerIds = [...new Set([...(L.pois || []), T.pois].filter(Boolean))];

    parseWalls(svg);

    // NODES oficiais do Illustrator (= entradas / pontos de passagem)
    nodeLayerIds.forEach((layerId) => {
      const g = layerById(svg, layerId);
      if (!g) return;
      g.querySelectorAll("circle, ellipse, rect").forEach((c, i) => {
        const id = c.id || `${layerId}-n${i}`;
        const p = centerOf(c);
        if (isNaN(p.x) || isNaN(p.y)) return;
        G.nodes[id] = { id, x: p.x, y: p.y, official: true };
        G.adj[id] = [];
      });
    });

    // EDGES indoor + outdoor — line/polyline da camada técnica (filhos ou nested)
    edgeLayerIds.forEach((layerId) => {
      const g = layerById(svg, layerId);
      if (!g) return;
      const isOutdoor = /outdoor/i.test(layerId);
      const zone = isOutdoor ? "outdoor" : "indoor";
      const shapes = [...g.querySelectorAll("line, polyline")];
      shapes.forEach((c) => {
        const pts = edgeEndpoints(c);
        if (pts.length < 2) return;
        const epTol = tol("edgeEndpointTol", zone);
        const ids = pts.map((p) => ensureNode(p, epTol));
        for (let k = 1; k < ids.length; k++) {
          const a = ids[k - 1], b = ids[k];
          if (a === b) continue;
          addEdge(a, b, [pts[k - 1], pts[k]], true, { zone }); // oficial
        }
      });
    });

    // une só nós da malha já conectada com folga mínima de exportação
    bridgeNearbyNodes(CONFIG.bridgeTol);
    attachOrphanOfficialNodes();
    pruneIllegalEdges();
    computeMainComponent();
    connectComponentsToMain(CONFIG.componentBridgeTol || 22);
    computeMainComponent();

    // POIS — ancora na ENTRADA (layer L00_poi_*_node_* ou legado P000_…)
    poiLayerIds.forEach((layerId) => {
      const g = layerById(svg, layerId);
      if (!g) return;
      const L00I = l00();
      const isLayerPoiId = (id) => L00I?.isLayerPoiElementId(id);
      const isLegacyPoiId = (id) => /^(P\d+|B\d+_)/i.test(id);
      const els = [...g.querySelectorAll("[id]")].filter((el, i, arr) => {
        const id = el.id;
        if (!id || arr.indexOf(el) !== i) return false;
        return isLayerPoiId(id) || isLegacyPoiId(id);
      });
      els.forEach((c, i) => {
        const p = poiCenter(c);
        if (isNaN(p.x) || isNaN(p.y)) return;
        const rawId = c.id || `${layerId}-p${i}`;
        const layerParsed = L00I?.parsePoiLayerName(rawId);

        if (layerParsed) {
          const validated = L00I.validateAccessNode(
            layerParsed.accessNodeId,
            layerParsed.displayName,
            state.navGraph,
            G.nodes,
            G.adj
          );
          if (!validated) return;
          const poiId = rawId;
          const snap = { x: validated.x, y: validated.y };
          const poi = enrichPoiMeta({
            id: poiId,
            name: layerParsed.displayName,
            cat: c.getAttribute("data-cat") || guessCat(layerParsed.displayName),
            x: snap.x,
            y: snap.y,
            iconX: snap.x,
            iconY: snap.y,
            rawId,
            anchor: validated.graphNodeId,
            snap,
            level: layerParsed.floorId,
            mapLevel: layerParsed.floorId,
            fromLayerIndex: true,
            layerAccessNodeId: layerParsed.accessNodeId,
            officialAccessNodeId: L00I.nodeIdBase(layerParsed.accessNodeId),
            graphNodeId: validated.graphNodeId,
            navNodeIds: [validated.graphNodeId],
            layerSearchTerms: [
              layerParsed.normalizedName,
              ...layerParsed.aliases.map((a) => L00I.normalizeSearchText(a)),
            ],
          });
          G.pois.push(poi);
          if (!isSearchablePoi(poi)) {
            c.removeAttribute("data-poi");
            c.style.cursor = "default";
            c.style.pointerEvents = "none";
          } else {
            c.setAttribute("data-poi", poiId);
            c.style.cursor = "pointer";
            ensurePoiHitArea(c, p);
          }
          return;
        }

        const name = decodePoiName(rawId, c.getAttribute("data-name"));
        const cat = c.getAttribute("data-cat") || guessCat(name);
        const ov = poiLevelOverride(rawId);
        const level = ov?.level || levelFromId(rawId) || levelFromId(c.id) || "L00";
        const mapLevel = ov?.mapLevel || "L00";
        const poiId = `${level}_${rawId}`;
        const poi = enrichPoiMeta({
          id: poiId, name, cat, x: p.x, y: p.y,
          iconX: p.x, iconY: p.y,
          rawId, anchor: null, snap: null,
          level,
          mapLevel,
        });
        G.pois.push(poi);
        if (!isSearchablePoi(poi)) {
          c.removeAttribute("data-poi");
          c.style.cursor = "default";
          c.style.pointerEvents = "none";
        } else {
          c.setAttribute("data-poi", poiId);
          c.style.cursor = "pointer";
          ensurePoiHitArea(c, p);
        }
      });
    });

    rebuildL00PoiIndex();
    injectHiddenRoutePois();
    injectHiddenSearchPois();

    G.pois.forEach((poi) => {
      if (poi.fromLayerIndex || l00()?.hasOfficialLayerNode(poi)) return;
      const snap = snapToEntrance(poi);
      poi.anchor = snap.id;
      poi.snap = { x: snap.x, y: snap.y };
    });
    resolveAnchorConflicts();
    G.pois.forEach((poi) => forcePoiOnMain(poi));
    markParkingZones();
    computeMainComponent();
    G.pois.forEach((poi) => enrichPoiMeta(poi));
    G.pois.sort((a, b) => (a.searchLabel || a.name).localeCompare(b.searchLabel || b.name, "pt-BR"));
    rebuildPoiCaches();

    // camada de rota DENTRO do mapa (coordenadas iguais ao vetor)
    ensureRouteLayer(svg);
  }

  // liga nós quase coincidentes que JÁ pertencem à malha (folga do AI).
  // Não cria atalhos entre nós isolados ou distantes.
  function bridgeNearbyNodes(tol) {
    const ids = Object.keys(G.nodes).filter((id) => (G.adj[id] || []).length > 0);
    for (let i = 0; i < ids.length; i++) {
      for (let j = i + 1; j < ids.length; j++) {
        const a = ids[i], b = ids[j];
        const d = dist(G.nodes[a], G.nodes[b]);
        if (d > tol || d < 0.05) continue;
        if ((G.adj[a] || []).some((e) => e.id === b)) continue;
        addEdge(a, b, null, true);
      }
    }
  }

  /** Liga componentes menores à malha principal (evita POIs sem rota). */
  function connectComponentsToMain(maxDist) {
    computeMainComponent();
    if (!G.main || !G.main.size) return;

    const seen = new Set();
    for (const start of Object.keys(G.nodes)) {
      if (seen.has(start) || G.main.has(start)) continue;
      if (!(G.adj[start] || []).length) { seen.add(start); continue; }

      const comp = [];
      const stack = [start];
      seen.add(start);
      while (stack.length) {
        const cur = stack.pop();
        comp.push(cur);
        for (const nb of G.adj[cur] || []) {
          if (seen.has(nb.id) || G.main.has(nb.id)) continue;
          if (!(G.adj[nb.id] || []).length) continue;
          seen.add(nb.id);
          stack.push(nb.id);
        }
      }

      let best = null;
      for (const a of comp) {
        const pa = G.nodes[a];
        if (!pa) continue;
        for (const b of G.main) {
          const pb = G.nodes[b];
          if (!pb) continue;
          const d = dist(pa, pb);
          if (d > maxDist) continue;
          const wall = crossesWall(pa, pb);
          const score = d + (wall ? 50 : 0);
          if (!best || score < best.score) best = { score, a, b, wall };
        }
      }
      if (!best) continue;
      // só une componentes com micro-folga sem atravessar parede (não inventa atalho)
      if (best.wall || best.score > (CONFIG.bridgeTol || 6) * 3) continue;
      addEdge(best.a, best.b, null, true, { zone: null });
      for (const id of comp) G.main.add(id);
    }
  }

  /** Garante que o POI ancora em um nó da malha principal navegável. */
  function forcePoiOnMain(poi) {
    if (!poi) return;
    const ok = poi.anchor && G.nodes[poi.anchor]
      && (G.adj[poi.anchor] || []).some((e) => e.official)
      && (!G.main || !G.main.size || G.main.has(poi.anchor));
    if (ok) return;

    // node da malha principal mais próximo SEM atravessar parede
    let best = null;
    const pool = G.main && G.main.size ? G.main : new Set(Object.keys(G.nodes));
    const zone = poiToleranceZone(poi);
    const maxReach = tol("entranceTol", zone) * 1.5;
    for (const id of pool) {
      if (!(G.adj[id] || []).some((e) => e.official)) continue;
      const n = G.nodes[id];
      if (!n) continue;
      const d = dist(poi, n);
      if (d > maxReach) continue;
      if (crossesWall(poi, n)) continue;
      if (!best || d < best.d) best = { id, n, d };
    }
    if (!best) {
      const id = nearestConnectedNode(poi, true);
      if (id && G.nodes[id] && !crossesWall(poi, G.nodes[id])) {
        best = { id, n: G.nodes[id], d: dist(poi, G.nodes[id]) };
      }
    }
    if (!best) return;

    // âncora configurada órfã: só liga com micro-folga sem parede
    if (poi.anchor && G.nodes[poi.anchor] && poi.anchor !== best.id) {
      const orphan = G.nodes[poi.anchor];
      const d = dist(orphan, best.n);
      if (d <= (CONFIG.snapTol || 8) * 3 && !crossesWall(orphan, best.n)) {
        addEdge(poi.anchor, best.id, null, true);
        if (G.main) G.main.add(poi.anchor);
        poi.snap = { x: orphan.x, y: orphan.y };
        return;
      }
    }
    poi.anchor = best.id;
    poi.snap = { x: best.n.x, y: best.n.y };
    if (G.main) G.main.add(best.id);
  }

  function listComponents() {
    const seen = new Set();
    const comps = [];
    for (const start in G.nodes) {
      if (seen.has(start)) continue;
      if (!(G.adj[start] || []).length) { seen.add(start); continue; }
      const comp = new Set([start]);
      const stack = [start];
      seen.add(start);
      while (stack.length) {
        const cur = stack.pop();
        for (const nb of G.adj[cur] || []) {
          if (seen.has(nb.id)) continue;
          seen.add(nb.id); comp.add(nb.id); stack.push(nb.id);
        }
      }
      comps.push(comp);
    }
    return comps;
  }

  // ancora POI ao nó da malha cujo segmento até o POI NÃO atravessa parede
  function nearestReachableAnchor(p) {
    return snapToNetwork(p).id;
  }

  const edgeKey = (a, b) => (a < b ? `${a}|${b}` : `${b}|${a}`);

  /* Projeção ortogonal de p sobre o segmento a→b */
  function projectOnSeg(p, a, b) {
    const dx = b.x - a.x, dy = b.y - a.y;
    const len2 = dx * dx + dy * dy;
    if (len2 < 1e-8) return { x: a.x, y: a.y, t: 0, d: dist(p, a) };
    let t = ((p.x - a.x) * dx + (p.y - a.y) * dy) / len2;
    t = Math.max(0, Math.min(1, t));
    const q = { x: a.x + t * dx, y: a.y + t * dy };
    return { x: q.x, y: q.y, t, d: dist(p, q) };
  }

  function removeEdge(a, b) {
    G.adj[a] = (G.adj[a] || []).filter((e) => e.id !== b);
    G.adj[b] = (G.adj[b] || []).filter((e) => e.id !== a);
  }

  // divide a aresta a—b no ponto snap (para a rota passar exatamente ali)
  function splitEdgeAt(a, b, snapId, snapPt) {
    const e = (G.adj[a] || []).find((x) => x.id === b);
    if (!e) {
      addEdge(a, snapId, [{ x: G.nodes[a].x, y: G.nodes[a].y }, snapPt], true);
      addEdge(snapId, b, [snapPt, { x: G.nodes[b].x, y: G.nodes[b].y }], true);
      return;
    }
    const geom = e.geom && e.geom.length >= 2
      ? e.geom
      : [{ x: G.nodes[a].x, y: G.nodes[a].y }, { x: G.nodes[b].x, y: G.nodes[b].y }];

    // acha o segmento da geom mais próximo do snap e parte ali
    let cut = 1, bestD = Infinity;
    for (let i = 1; i < geom.length; i++) {
      const pr = projectOnSeg(snapPt, geom[i - 1], geom[i]);
      if (pr.d < bestD) { bestD = pr.d; cut = i; }
    }
    const g1 = geom.slice(0, cut).concat([snapPt]);
    const g2 = [snapPt].concat(geom.slice(cut));
    // limpa duplicatas consecutivas
    const clean = (arr) => {
      const o = [];
      for (const p of arr) if (!o.length || dist(o[o.length - 1], p) > 0.2) o.push(p);
      return o;
    };
    removeEdge(a, b);
    addEdge(a, snapId, clean(g1), true);
    addEdge(snapId, b, clean(g2), true);
  }

  function edgeInMain(a, b) {
    if (!G.main || !G.main.size) return true;
    return G.main.has(a) && G.main.has(b);
  }

  // snapToEntrance / snapToNetwork definidos junto ao parse do grafo


  function ensureRouteLayer(svg) {
    let layer = svg.querySelector("#mapRouteLayer");
    if (!layer) {
      layer = document.createElementNS(NS, "g");
      layer.setAttribute("id", "mapRouteLayer");
      svg.appendChild(layer);
    }
    upgradeMapRouteLayer(layer);
    layer.setAttribute("data-route-overlay", "true");
    svg.appendChild(layer);
    globalThis.RouteAnimation?.applyRouteAnimationVars?.(layer);
    return layer;
  }

  function upgradeMapRouteLayer(layer) {
    layer.setAttribute("class", "route-layer");
    layer.setAttribute("pointer-events", "none");
    ["mapRouteGlow", "mapRouteCasing", "mapRouteLine"].forEach((id) => {
      const old = layer.querySelector(`#${id}`);
      if (old) old.remove();
    });
    const mkPath = (id, className) => {
      let p = layer.querySelector(`#${id}`);
      if (!p) {
        p = document.createElementNS(NS, "path");
        p.setAttribute("id", id);
        p.setAttribute("fill", "none");
        p.setAttribute("d", "");
        p.setAttribute("vector-effect", "non-scaling-stroke");
        layer.appendChild(p);
      }
      p.setAttribute("class", className);
      return p;
    };
    /* Base embaixo, brilho animado por cima (stroke-dashoffset) */
    mkPath("mapRoutePathBase", "route-path route-path-base");
    mkPath("mapRoutePathGlow", "route-path route-path-glow");
    const base = layer.querySelector("#mapRoutePathBase");
    const glow = layer.querySelector("#mapRoutePathGlow");
    if (base && glow) layer.appendChild(glow);
    if (!layer.querySelector("#mapRouteStart")) {
      const pin = (id, kind) => {
        const g = document.createElementNS(NS, "g");
        g.setAttribute("id", id);
        g.setAttribute("class", `route-marker route-marker--${kind}`);
        g.setAttribute("visibility", "hidden");
        const Icons = globalThis.MapNavIcons;
        if (kind === "start" && Icons?.appendInnerArrow) Icons.appendInnerArrow(g);
        else if (kind === "end" && Icons?.appendInnerPin) Icons.appendInnerPin(g);
        layer.appendChild(g);
      };
      pin("mapRouteStart", "start");
      pin("mapRouteEnd", "end");
    }
  }

  function initRouteAnimationLayers() {
    if (el.routeLayer) globalThis.RouteAnimation?.applyRouteAnimationVars?.(el.routeLayer);
  }

  function setRouteVisualCompleted(completed) {
    state.routeVisualCompleted = !!completed;
    globalThis.RouteAnimation?.setRouteCompleted?.(el.routeLayer, completed);
    const mapSvg = el.svgHost.querySelector("#mapaSVG") || el.svgHost.querySelector("svg");
    const mapLayer = mapSvg?.querySelector?.("#mapRouteLayer");
    if (mapLayer) globalThis.RouteAnimation?.setRouteCompleted?.(mapLayer, completed);
  }

  function pointsToPathD(points) {
    if (!points || points.length < 1) return "";
    let d = `M${points[0].x} ${points[0].y}`;
    for (let i = 1; i < points.length; i++) d += ` L${points[i].x} ${points[i].y}`;
    return d;
  }

  // centro estável do ícone POI (prioriza bbox compacto / primeiro M absoluto)
  function poiCenter(el) {
    try {
      const b = el.getBBox();
      if (b.width > 0.5 && b.height > 0.5 && b.width < 90 && b.height < 90) {
        return { x: b.x + b.width / 2, y: b.y + b.height / 2 };
      }
    } catch { /* ignore */ }

    const kids = [...el.querySelectorAll("path, polygon, circle, ellipse, rect")];
    let sx = 0, sy = 0, n = 0;
    kids.forEach((s) => {
      try {
        const b = s.getBBox();
        if (b.width + b.height < 0.01) return;
        if (b.width > 60 || b.height > 60) return;
        sx += b.x + b.width / 2;
        sy += b.y + b.height / 2;
        n++;
      } catch { /* ignore */ }
    });
    if (n) return { x: sx / n, y: sy / n };

    const path = el.querySelector("path[d]") || (el.tagName.toLowerCase() === "path" ? el : null);
    if (path) {
      const m = (path.getAttribute("d") || "").match(/M\s*(-?\d+\.?\d*)[,\s]+(-?\d+\.?\d*)/i);
      if (m) return { x: +m[1], y: +m[2] };
    }
    try {
      const b = el.getBBox();
      return { x: b.x + b.width / 2, y: b.y + b.height / 2 };
    } catch {
      return centerOf(el);
    }
  }

  /** Círculo invisível para facilitar clique em ícones pequenos (ex.: Jardim). */
  function ensurePoiHitArea(el, center) {
    if (!el || !center || !isFinite(center.x)) return;
    const host = el.parentNode;
    if (!host) return;
    if (host.querySelector(`[data-poi-hit="${el.id}"]`)) return;
    const hit = document.createElementNS(NS, "circle");
    hit.setAttribute("data-poi-hit", el.id || "1");
    hit.setAttribute("cx", String(center.x));
    hit.setAttribute("cy", String(center.y));
    hit.setAttribute("r", "18");
    hit.setAttribute("fill", "transparent");
    hit.setAttribute("pointer-events", "all");
    hit.style.cursor = "pointer";
    const poiAttr = el.getAttribute("data-poi");
    if (poiAttr) hit.setAttribute("data-poi", poiAttr);
    // irmão (não filho de <path>) para hit-area válida no SVG
    if (el.nextSibling) host.insertBefore(hit, el.nextSibling);
    else host.appendChild(hit);
  }

  /* ============================================================ POIs clicaveis */
  /** Oculta rótulos da camada info que não sinalizam um POI (mantém o SVG intacto). */
  function hideNonPoiInfoTexts(svg) {
    const layer = layerById(svg, CONFIG.replaceTargets.infoTextos);
    if (!layer) return;

    const poiKeys = [];
    for (const p of G.pois || []) {
      const name = norm(p.name || "");
      const raw = norm(String(p.rawId || "").replace(/^(P|B)\d+_/i, "").replace(/_/g, " "));
      if (name) poiKeys.push(name);
      if (raw && raw !== name) poiKeys.push(raw);
    }

    // aliases curtos ↔ nomes do mapa
    const aliases = [
      "espaco servir", "area kids", "refeitorio externo", "espaco conexao",
      "livraria evangelica", "sala de oracao", "banheiro familia", "banheiro feminino",
      "banheiro masculino", "elevador ginasio", "elevadores", "seven pass", "sevenpass",
      "espaco acolher", "abasc", "estacionamento moto", "estacionamento motos",
      "entrada principal toldo", "entrada estacionamento", "entrada pedestre",
      "jardim", "templo", "capela", "bercario", "recepcao", "narnia",
      "centro de formacao", "centro de formacao cf", "centro de formacao | cf",
      "restaurante seven pass", "seven pass", "bazar transforma abasc",
      "bazar transforma", "bazar abasc", "abasc - acao social", "acao social",
      "entrada sevenpass", "entrada seven pass", "ginasio", "entrada ginasio",
      "min esportes", "min. esportes", "ministerio esportes", "ministério esportes",
    ];
    for (const a of aliases) poiKeys.push(a);

    const reject = (t) =>
      /^(escadas|fonte|batisterio|hall do templo)\b/.test(t)
      || /\bescadas\b/.test(t)
      || /estacionamento conveniado/.test(t)
      || /entrada lateral/.test(t)
      || /entrada 0[12] principal templo/.test(t)
      || /entrada e saida para pedestre/.test(t)
      || /entrada para pedestres 01\b/.test(t)
      || /entrada para pedestres principal/.test(t);

    const isPoiLabel = (raw) => {
      const t = norm(raw);
      if (!t || t.length < 3 || reject(t)) return false;
      for (const key of poiKeys) {
        if (!key || key.length < 3) continue;
        if (t === key || t.includes(key) || key.includes(t)) return true;
        const tt = t.split(/\s+/).filter((w) => w.length > 2);
        const kk = key.split(/\s+/).filter((w) => w.length > 2);
        if (!kk.length || !tt.length) continue;
        const hits = kk.filter((k) => tt.some((w) => w === k || (k.length >= 5 && w.includes(k)) || (w.length >= 5 && k.includes(w))));
        const need = Math.min(2, kk.length);
        if (hits.length >= need) return true;
        if (hits.length === 1 && ["jardim", "templo", "capela", "abasc", "kids", "narnia", "toldo", "bercario", "recepcao", "ginasio", "formacao", "sevenpass", "seven", "bazar", "cf", "esportes"].includes(hits[0])) {
          return true;
        }
      }
      return false;
    };

    const hide = (el) => {
      el.setAttribute("visibility", "hidden");
      el.setAttribute("aria-hidden", "true");
      el.style.pointerEvents = "none";
    };

    [...layer.children].forEach((child) => {
      const tag = (child.tagName || "").toLowerCase();
      // tipografia em path marcada como rótulo de POI (ex.: Centro de Formação CF)
      if (child.getAttribute("data-keep-label") === "true") {
        child.removeAttribute("visibility");
        child.removeAttribute("aria-hidden");
        child.style.visibility = "";
        child.style.display = "";
        return;
      }
      if (tag === "text") {
        const content = (child.textContent || "").replace(/\s+/g, " ").trim();
        if (!isPoiLabel(content)) hide(child);
        return;
      }
      // tipografia convertida em path perto de POIs prioritários
      if (tag === "g" && shouldKeepPathLabel(child)) {
        child.setAttribute("data-keep-label", "true");
        return;
      }
      // setas e tipografia em path — só poluem; POIs já têm ícone + texto mantido
      hide(child);
    });
  }

  /** Mantém grupos de tipografia (path) próximos a POIs que devem ficar legíveis. */
  function shouldKeepPathLabel(g) {
    const first = g.querySelector("path");
    if (!first) return false;
    const d = first.getAttribute("d") || "";
    const m = d.match(/^M\s*(-?[\d.]+)[,\s]+(-?[\d.]+)/i);
    if (!m) return false;
    const x = +m[1], y = +m[2];
    // âncoras aproximadas dos rótulos: Centro de Formação | CF, SEVEN PASS, Bazar abasc
    const anchors = [
      { x: 99, y: 108, r: 40 },   // Centro de Formação | CF
      { x: 742, y: 457, r: 40 },  // SEVEN PASS
      { x: 808, y: 457, r: 40 },  // Bazar abasc
    ];
    return anchors.some((a) => Math.hypot(x - a.x, y - a.y) <= a.r);
  }

  /** Reposiciona hit-area de clique quando poiIconCampus difere do SVG exportado. */
  function syncPoiHitAreas(svg) {
    if (!svg) return;
    for (const poi of G.pois || []) {
      const raw = poi.rawId || poi.id || "";
      const campus = resolvePoiIconCampus(poi);
      if (!campus) continue;
      const hit = svg.querySelector(`[data-poi-hit="${raw}"]`);
      if (hit) {
        hit.setAttribute("cx", String(campus.x));
        hit.setAttribute("cy", String(campus.y));
      }
    }
  }

  function bindPOIs(svg) {
    svg.querySelectorAll("[data-poi]").forEach((node) => {
      const poiId = node.getAttribute("data-poi");
      node.addEventListener("mouseenter", () => node.setAttribute("data-hover", "true"));
      node.addEventListener("mouseleave", () => node.removeAttribute("data-hover"));
      node.addEventListener("click", (e) => {
        e.stopPropagation();
        if (state.placingHere || state._ignoreNextPoiClick) {
          if (state.placingHere) {
            state._ignoreNextPoiClick = false;
            const poi = G.poisById?.get(poiId) || G.pois.find((p) => p.id === poiId);
            if (!poi || !isSearchablePoi(poi)) return;
            const startNodeId = resolveHerePoiStartNode(poi);
            if (!startNodeId) {
              toast(`Não foi possível localizar um acesso navegável para ${poi.searchLabel || poi.name}.`);
              return;
            }
            const field = state.placingHereField || "origin";
            state.placingHere = false;
            state.placingHereField = "origin";
            el.viewport.style.cursor = "";
            const startNode = state.navGraph?.nodesById.get(startNodeId);
            const pickedPoi = {
              ...poi,
              startNodeId,
              anchor: startNodeId,
              navNodeIds: [startNodeId],
              snap: startNode ? { x: startNode.x, y: startNode.y } : poi.snap,
            };
            setField(field, pickedPoi);
            toast(field === "dest"
              ? `Destino: ${pickedPoi.searchLabel || pickedPoi.name}`
              : `Você está em: ${pickedPoi.searchLabel || pickedPoi.name}`);
            return;
          }
          state._ignoreNextPoiClick = false;
          return;
        }
        const poi = G.pois.find((p) => p.id === poiId);
        if (!poi || !isSearchablePoi(poi)) return;
        poi = resolveCampusPoiForUi(poi);
        enrichTripPoi(poi);
        const lvl = poiMapViewLevel(poi);
        if (lvl !== state.activeLevel) setActiveLevel(lvl, { silent: true, keepTrip: true });
        if (!state.origin || state.origin.id === "__here__") setField("origin", poi);
        else setField("dest", poi);
        toast(`${poi.name} selecionado.`);
      });
    });
  }

  /** Associa ícones/áreas do SVG de andar (L02/L03) aos POIs do grafo. */
  function bindFloorPois(svg, levelId) {
    if (!svg || !levelId) return;
    const levelPois = (G.pois || []).filter((p) => (p.level || p.mapLevel) === levelId && isSearchablePoi(p));

    // Ícones de Área Kids fora do L01: só decorativos (sem clique / sem destino)
    if (levelId !== "L01") {
      [
        "P007_L01_area_kids",
        "L01_sala_019_p007_area_kids",
        "L02_POI0002_area_kids",
        "L03_POI0002_area_kids",
        "L04_poi_0014",
      ].forEach((id) => {
        const el = svg.getElementById(id);
        if (!el) return;
        el.removeAttribute("data-poi");
        el.style.pointerEvents = "none";
        el.style.cursor = "default";
      });
    }

    if (!levelPois.length) return;

    const iconMaps = {
      L01: {
        L01_sala_001: "L01_poi_0001",
        "L01_sala_001-2": "L01_poi_0001",
        L01_sala_002: "L01_poi_0002",
        L01_sala_003: "L01_poi_0013",
        L01_sala_004: "L01_poi_0015",
        L01_sala_005: "L01_poi_0017",
        L01_sala_006: "L01_poi_0018",
        L01_sala_007: "L01_poi_0019",
        L01_sala_008: "L01_poi_0021",
        L01_sala_009: "L01_poi_0022",
        L01_sala_012: "L01_poi_0010",
        L01_sala_020: "L01_poi_0009",
        L01_sala_000_sala_pastoral: "L01_poi_0005",
        L01_sala_011_secretaria_pastoral: "L01_poi_0011",
        L01_sala_014_salaequipe: "L01_poi_0012",
        L01_sala_019_p007_area_kids: "L01_poi_0024",
        L01_sala_021_l02_auditorio_01: "L01_poi_0023",
        L01_sala_010_p027_l01_elevador_templo: "L01_poi_0006",
        L01_sala_005_p023_l02_banheiro_feminino: "L01_poi_0003",
        L01_sala_004_p023_l02_banheiro_feminino: "L01_poi_0003",
        L01_sala_002_p024_l02_banheiro_masculino: "L01_poi_0004",
        L01_sala_003_p024_l02_banheiro_masculino: "L01_poi_0004",
      },
      L02: {
        L02_sala_001: "L02_POI0010_sala_01",
        L02_sala_002: "L02_POI0011_sala_02",
        L02_sala_003: "L02_POI0001_sala_03",
        L02_sala_004: "L02_POI0004_sala_04",
        L02_sala_005: "L02_POI0005_sala_05",
        L02_auditorio_01: "L02_POI0003_auditorio",
        P023_L02_banheiro_feminino: "L02_POI0008_banheiro_feminino",
        "P023_L02_banheiro_feminino-2": "L02_POI0008_banheiro_feminino",
        P024_L02_banheiro_masculino: "L02_POI0009_banheiro_masculino",
        P024__L02_banheiro_masculino: "L02_POI0009_banheiro_masculino",
        P027_L01_elevador_templo: "L02_POI0002_elevador",
      },
      L03: {
        L03_sala_001: "L03_POI0010_sala_01",
        L03_sala_002: "L03_POI0011_sala_02",
        L03_sala_003: "L03_POI0001_sala_03",
        L03_sala_004: "L03_POI0004_sala_04",
        L03_sala_005: "L03_POI0005_sala_05",
        L03_sala_006: "L03_POI0006_sala_06",
        L03_sala_007: "L03_POI0007_sala_07",
        L03_sala_008: "L03_POI0008_sala_08",
        L03_sala_009: "L03_POI0009_sala_09",
        L03_sala_010: "L03_POI0010_sala_10",
        L03_sala_011: "L03_POI0011_sala_11",
        L03_sala_012: "L03_POI0012_sala_12",
        "L03_sala_012-2": "L03_POI0013_sala_13",
        L03_sala_014: "L03_POI0014_sala_14",
        L03_sala_015: "L03_POI0015_sala_15",
        L03_sala_016: "L03_POI0016_sala_16",
        L03_auditorio_02: "L03_POI0003_auditorio",
        L03_cozinha: "L03_POI0027_copa",
        P023_L02_banheiro_feminino: "L03_POI0028_banheiro_feminino",
        "P023_L02_banheiro_feminino-2": "L03_POI0028_banheiro_feminino",
        P024_L02_banheiro_masculino: "L03_POI0009_banheiro_masculino",
        P024__L02_banheiro_masculino: "L03_POI0009_banheiro_masculino",
        P027_L01_elevador_templo: "L03_POI0002_elevador",
      },
      L04: {
        L04_sala_021_l04_auditorio_01: "L04_poi_0016",
        L01_sala_010_p027_l01_elevador_templo: "L04_poi_0003",
        L01_sala_020: "L04_poi_0006",
        L01_sala_004_sala_calma: "L04_poi_0002",
        L01_sala_003: "L04_poi_0001",
        L01_sala_009: "L04_poi_0009",
        L01_sala_008: "L04_poi_0008",
        L01_sala_005: "L04_poi_0013",
        L01_sala_007: "L04_poi_0007",
        L01_sala_006: "L04_poi_0015",
        L01_sala_005_p023_l02_banheiro_feminino: "L04_poi_0010",
        P023_L02_banheiro_feminino: "L04_poi_0010",
        P024__L02_banheiro_masculino: "L04_poi_0010",
        P024_L02_banheiro_masculino: "L04_poi_0010",
      },
      L05: {
        L04_sala_021_l04_auditorio_01: "L05_poi_0030",
        L01_sala_010_p027_l01_elevador_templo: "L05_poi_0001",
        L01_sala_019_p007_area_kids: "L05_poi_0021",
        L01_sala_005_p023_l02_banheiro_feminino: "L05_poi_0030_banheiro_01",
        P023_L02_banheiro_feminino: "L05_poi_0030_banheiro_01",
        "P023_L02_banheiro_feminino-2": "L05_poi_0007_banheiro_02",
        P024_L02_banheiro_masculino: "L05_poi_0008_banheiro_03",
        P024__L02_banheiro_masculino: "L05_poi_0008_banheiro_03",
      },
      L06: {
        L06_sala_0019_salao: "L06_poi_0005",
        // Ala direita (Sala 07–21): ícones e áreas das salas apontam ao POI/nó oficial.
        L01_sala_007: "L06_poi_0007",
        "L01_sala_007-2": "L06_poi_0021",
        L01_sala_009: "L06_poi_0031",
        L01_sala_008: "L06_poi_0030",
        "L01_sala_008-2": "L06_poi_0029",
        "L01_sala_008-3": "L06_poi_0037",
        "L01_sala_003-4": "L06_poi_0023",
        "L01_sala_003-5": "L06_poi_0008",
        L01_sala_003: "L06_poi_0001",
        "L01_sala_003-2": "L06_poi_0020",
        "L01_sala_003-6": "L06_poi_0009",
        "L01_sala_003-7": "L06_poi_0039",
        L01_sala_005: "L06_poi_0018",
        "L01_sala_005-2": "L06_virtual_sala_21",
        L06_sala_0004_sala_07_l06room: "L06_poi_0007",
        L06_sala_0018_sala_08_l06room: "L06_poi_0021",
        L06_sala_0017_sala_09_l06room: "L06_poi_0031",
        L06_sala_0016_sala_10_l06room: "L06_poi_0030",
        L06_sala_0015_sala_11_l06room: "L06_poi_0029",
        L06_sala_0014_sala_12_l06room: "L06_poi_0037",
        L06_sala_0013_sala_13_l06room: "L06_poi_0023",
        L06_sala_0012_sala_14_l06room: "L06_poi_0008",
        L06_sala_0011_sala_15_l06room: "L06_poi_0017-2",
        L06_sala_0010_sala_16_l06room: "L06_poi_0001",
        L06_sala_0009_sala_17_l06room: "L06_poi_0020",
        L06_sala_0007_sala_18_l06room: "L06_poi_0009",
        L06_sala_0006_sala_19_l06room: "L06_poi_0039",
        L06_sala_0008_sala_20_l06room: "L06_poi_0018",
        L06_sala_0021_sala_21_l05room: "L06_virtual_sala_21",
        L06_sala_0029_elevadores: "L06_poi_0033",
        L06_sala_0028_hall_l05: "L06_poi_0034_hall_l06",
        L06_sala_0024_escadas_laterais: "L06_poi_0035_escada_lateral_l05",
        L06_sala_0031_escadas_de_emergencia: "L06_poi_0026_escada_emerg",
        L06_sala_0030_recepcao_01: "L06_poi_0024",
        L06_sala_0022_copa_l06eating: "L06_poi_0024_copa",
        L06_sala_0020_banheiro_l06bathroom: "L06_poi_0028_banheiro_01",
        L06_sala_0026_banheiro_l06bathroom: "L06_poi_0011_banheiro_03",
        L06_sala_0027_banheiro_l06bathroom: "L06_poi_0012_banheiro_04",
        L01_sala_019_p007_area_kids: "L06_poi_0017",
        L01_sala_010_p027_l01_elevador_templo: "L06_poi_0033",
        P023_L02_banheiro_feminino: "L06_poi_0028_banheiro_01",
        "P023_L02_banheiro_feminino-2": "L06_poi_0011_banheiro_03",
        P024_L02_banheiro_masculino: "L06_poi_0012_banheiro_04",
        P024__L02_banheiro_masculino: "L06_poi_0012_banheiro_04",
      },
      B01: {
        B01_sala_0001_banheiro_masculino_b01bathroom: "B01_poi_0006",
        B01_sala_0002_banheiro_feminino_b01bathroom: "B01_poi_0001",
        B01_sala_0003_entrada_de_narnia_b1_e_b2banheiro_b1batisterio_tencomun_b2ensaio_b1pastoreo_b1: "B01_entrada_narnia",
        B01_sala_0004_sala_02_b01_estudio_ensaio: "B01_poi_0012",
        B01_sala_0005_sala_03_b01_pastoreo: "B01_poi_0002",
        B01_sala_0006_sala_03_b01_som_tec: "B01_som_tec",
        B01_sala_0007_acesso_palco_templo_t_batisterio_t_banheiros_b01_encomun_b02: "B01_poi_0007",
        B01_sala_0008_acesso_encomunestudioradiorede_super: "B01_poi_0009",
      },
      B02: {
        B02_sala_0001_sala_11_b02_almoxarifado: "B02_poi_almox",
        B02_sala_0002_sala_10_b02_radio: "B02_poi_0003",
        B02_sala_0003_sala_09_b02_acesso_ao_espaco_servir: "B02_poi_0006",
        B02_sala_0004_sala_08_b02_comunicacao_rede_super: "encomun",
        B02_sala_0005_sala_07_b02_cozinha: "B02_poi_0007",
        B02_sala_0006_sala_06_b02_sala_abert_m: "sala_albert",
        B02_sala_0007_sala_05_b01_estudio_de_video: "B01_poi_0006-2",
        B02_sala_0008_sala_04_b02_sala_de_vidro: "B02_poi_0013",
        B02_sala_0009_sala_03_b02_engenharia_ao_vivo: "B02_poi_eng_vivo",
        B02_sala_0010_sala_01_b02_transmicao_ao_vivo: "B02_poi_0011",
        B02_sala_0011_sala_02_b01_som_tec: "B02_poi_0010",
        B02_sala_0012_entrada_a_narniaencomun: "B02_entrada_narnia_map",
      },
    };
    const iconMap = iconMaps[levelId] || {};

    const byRaw = Object.fromEntries(levelPois.map((p) => [p.rawId, p]));
    const poiLayerId = `${levelId}_POI`;

    // áreas técnicas (retângulos) — clicáveis, invisíveis
    svg.querySelectorAll(`#${poiLayerId} [id^='${levelId}_POI'], #${poiLayerId} rect[id]`).forEach((el) => {
      const raw = el.id;
      const poi = byRaw[raw];
      if (!poi) return;
      el.setAttribute("data-poi", poi.id);
      el.style.cursor = "pointer";
      el.style.pointerEvents = "all";
    });

    // ícones visíveis
    Object.entries(iconMap).forEach(([elId, rawId]) => {
      const el = svg.getElementById(elId);
      const poi = byRaw[rawId];
      if (!el || !poi) return;
      el.setAttribute("data-poi", poi.id);
      el.style.cursor = "pointer";
      el.style.pointerEvents = "all";
    });

    // fallback: qualquer id que bata com rawId
    levelPois.forEach((poi) => {
      const el = svg.getElementById(poi.rawId);
      if (!el || el.hasAttribute("data-poi")) return;
      el.setAttribute("data-poi", poi.id);
      el.style.cursor = "pointer";
      el.style.pointerEvents = "all";
    });

    bindPOIs(svg);
    syncFloorPoiIconsFromSvg(svg, iconMaps[levelId] || {}, levelId);
  }

  /* ============================================================ DIJKSTRA */

  function isParkingPoi(poi) {
    if (!poi) return false;
    return poi.cat === "estacionamento"
      || /estacionamento/i.test(poi.rawId || "")
      || /estacionamento/i.test(poi.id || "")
      || /estacionamento/i.test(poi.name || "");
  }

  /** Só libera a malha do estacionamento se origem ou destino for o próprio estacionamento. */
  function tripAllowsParking(origin, dest) {
    return isParkingPoi(dest) || isParkingPoi(origin);
  }

  function pointInParkingZone(p) {
    if (!p || p.x == null) return false;
    const zones = CONFIG.parkingZones || [];
    for (const z of zones) {
      if (p.x >= z.x0 && p.x <= z.x1 && p.y >= z.y0 && p.y <= z.y1) return true;
    }
    return false;
  }

  function isParkingNodeId(id) {
    return /estacionamento|escacionamento|moto|entrada_pedestre_principal_bento|entrada_estacionamento|templo_estacionamento/i.test(String(id || ""));
  }

  /** Marca nós/edges dentro do pátio — rota NÃO atravessa, salvo destino/origem = estacionamento. */
  function markParkingZones() {
    const parkingPois = G.pois.filter(isParkingPoi);
    for (const id of Object.keys(G.nodes)) {
      const n = G.nodes[id];
      n.parking = false;
      if (isParkingNodeId(id) || pointInParkingZone(n)) {
        n.parking = true;
        continue;
      }
      for (const p of parkingPois) {
        if (dist(n, p) < 90) {
          n.parking = true;
          break;
        }
      }
    }
    for (const a of Object.keys(G.adj)) {
      for (const e of G.adj[a] || []) {
        const na = G.nodes[a], nb = G.nodes[e.id];
        let mid = null;
        if (e.geom && e.geom.length >= 2) {
          const g0 = e.geom[0], g1 = e.geom[e.geom.length - 1];
          mid = { x: (g0.x + g1.x) / 2, y: (g0.y + g1.y) / 2 };
        } else if (na && nb) {
          mid = { x: (na.x + nb.x) / 2, y: (na.y + nb.y) / 2 };
        }
        e.parking = !!(na?.parking && nb?.parking)
          || !!(mid && pointInParkingZone(mid))
          || !!(na?.parking || nb?.parking) && e.zone === "outdoor" && mid && pointInParkingZone(mid);
        // trecho outdoor com pelo menos uma ponta no pátio = trecho de estacionamento
        if (!e.parking && e.zone === "outdoor" && (na?.parking || nb?.parking)) {
          e.parking = true;
        }
      }
    }
  }

  /** Caminho passa por nó/edge de estacionamento (além da origem/destino)? */
  function pathCrossesParking(ids, startNode, endNode) {
    if (!ids || ids.length < 2) return false;
    for (let i = 0; i < ids.length; i++) {
      const id = ids[i];
      if (id === startNode || id === endNode) continue;
      if (G.nodes[id]?.parking) return true;
    }
    for (let i = 1; i < ids.length; i++) {
      const e = (G.adj[ids[i - 1]] || []).find((x) => x.id === ids[i]);
      if (e?.parking) {
        // edge de estacionamento entre nós que não são ambos extremos do trajeto
        const a = ids[i - 1], b = ids[i];
        if (a !== startNode && a !== endNode && b !== startNode && b !== endNode) return true;
        if ((G.nodes[a]?.parking && a !== startNode && a !== endNode)
          || (G.nodes[b]?.parking && b !== startNode && b !== endNode)) return true;
      }
    }
    return false;
  }

  function routeZoneMix(ids) {
    let indoor = 0, outdoor = 0;
    if (!ids || ids.length < 2) return { indoor, outdoor };
    for (let i = 1; i < ids.length; i++) {
      const e = (G.adj[ids[i - 1]] || []).find((x) => x.id === ids[i]);
      if (!e) continue;
      if (e.zone === "indoor") indoor += e.w;
      else if (e.zone === "outdoor") outdoor += e.w;
    }
    return { indoor, outdoor };
  }

  function classifyRouteKind(ids) {
    const { indoor, outdoor } = routeZoneMix(ids);
    if (indoor <= 0.01 && outdoor <= 0.01) return "mista";
    if (indoor >= outdoor * 1.15) return "templo";
    if (outdoor >= indoor * 1.15) return "fora";
    return "mista";
  }

  // penalty: Map(edgeKey -> vezes) | blocked: Set(edgeKey) | opts: { avoidParking, preferZone, officialOnly }
  function shortest(a, b, penalty, blocked, opts) {
    if (!a || !b || !G.nodes[a] || !G.nodes[b]) return [];
    if (a === b) return [a];
    const avoidParking = !!opts?.avoidParking;
    const preferZone = opts?.preferZone || null;
    // por padrão: só edges oficiais do mapa (nunca atalhos inventados)
    const officialOnly = opts?.officialOnly !== false;
    const distMap = {}, prev = {}, pending = new Set(Object.keys(G.nodes));
    for (const k of pending) distMap[k] = Infinity;
    distMap[a] = 0;
    while (pending.size) {
      let cur = null, min = Infinity;
      for (const k of pending) if (distMap[k] < min) { min = distMap[k]; cur = k; }
      if (cur === null || min === Infinity) break;
      pending.delete(cur);
      if (cur === b) break;
      for (const nb of G.adj[cur] || []) {
        if (!pending.has(nb.id)) continue;
        if (officialOnly && !nb.official) continue;
        const ek = edgeKey(cur, nb.id);
        if (blocked && blocked.has(ek)) continue;

        // bloqueio duro: não entra no estacionamento (exceto nós de origem/destino)
        if (avoidParking) {
          if (nb.parking && nb.id !== a && nb.id !== b) continue;
          const toN = G.nodes[nb.id];
          const fromN = G.nodes[cur];
          if (toN?.parking && nb.id !== a && nb.id !== b) continue;
          if (fromN?.parking && cur !== a && cur !== b) continue;
        }

        let w = nb.w;
        if (!nb.official) w *= 8;

        if (preferZone === "indoor") {
          if (nb.zone === "outdoor") w *= 4.2;
          else if (nb.zone === "indoor") w *= 0.82;
        } else if (preferZone === "outdoor") {
          if (nb.zone === "indoor") w *= 4.2;
          else if (nb.zone === "outdoor") w *= 0.82;
        }

        if (penalty) {
          const u = penalty.get(ek);
          if (u) w *= 1 + 1.4 * u;
        }
        const nd = distMap[cur] + w;
        if (nd < distMap[nb.id]) { distMap[nb.id] = nd; prev[nb.id] = cur; }
      }
    }
    if (!isFinite(distMap[b])) return [];
    const path = []; let c = b;
    while (c) { path.unshift(c); if (c === a) break; c = prev[c]; }
    return path[0] === a ? path : [];
  }

  /** Nó navegável mais próximo (malha oficial), preferindo fora do estacionamento. */
  function nearestRoutableNode(p, avoidParking, maxDist = 420) {
    if (!p) return null;
    const pool = G.main && G.main.size ? G.main : new Set(Object.keys(G.nodes));
    let best = null;
    for (const id of pool) {
      const n = G.nodes[id];
      if (!n) continue;
      if (!(G.adj[id] || []).some((e) => e.official)) continue;
      if (avoidParking && n.parking) continue;
      const d = dist(p, n);
      if (d > maxDist) continue;
      const score = d + (crossesWall(p, n) ? 55 : 0);
      if (!best || score < best.score) best = { id, score, d, n };
    }
    if (best) return best;
    let b = null;
    for (const id of Object.keys(G.nodes)) {
      const n = G.nodes[id];
      if (!n || !(G.adj[id] || []).some((e) => e.official)) continue;
      if (avoidParking && n.parking) continue;
      const d = dist(p, n);
      const score = d + (crossesWall(p, n) ? 80 : 0);
      if (!b || score < b.score) b = { id, score, d, n };
    }
    return b;
  }

  /** Liga nó órfão à malha principal com trecho curto sem atravessar parede. */
  function attachNodeToMeshSafe(nodeId, avoidParking) {
    const n = G.nodes[nodeId];
    if (!n) return false;
    if ((G.adj[nodeId] || []).some((e) => e.official && (!avoidParking || !G.nodes[e.id]?.parking))) {
      if (G.main) G.main.add(nodeId);
      return true;
    }
    let best = null;
    const pool = G.main && G.main.size ? G.main : new Set(Object.keys(G.nodes));
    for (const id of pool) {
      if (id === nodeId) continue;
      const m = G.nodes[id];
      if (!m || !(G.adj[id] || []).some((e) => e.official)) continue;
      if (avoidParking && m.parking) continue;
      const d = dist(n, m);
      if (d > 280) continue;
      if (crossesWall(n, m)) continue;
      if (!best || d < best.d) best = { id, d };
    }
    if (!best) return false;
    addEdge(nodeId, best.id, null, true);
    if (G.main) { G.main.add(nodeId); G.main.add(best.id); }
    return true;
  }

  /** Reancora na malha oficial — sem inventar linha reta pelas paredes. */
  function ensureLinked(startNode, endNode, routeOpts) {
    const opts = { officialOnly: true, ...(routeOpts || {}) };
    let ids = shortest(startNode, endNode, null, null, opts);
    if (ids.length) return { ids, startNode, endNode };

    const avoid = !!opts.avoidParking;
    const sNear = nearestRoutableNode(G.nodes[startNode] || { x: 0, y: 0 }, avoid);
    const eNear = nearestRoutableNode(G.nodes[endNode] || { x: 0, y: 0 }, avoid);
    const s2 = (sNear && sNear.id) || nearestConnectedNode(G.nodes[startNode] || { x: 0, y: 0 }, true) || startNode;
    const e2 = (eNear && eNear.id) || nearestConnectedNode(G.nodes[endNode] || { x: 0, y: 0 }, true) || endNode;
    ids = shortest(s2, e2, null, null, opts);
    if (ids.length) return { ids, startNode: s2, endNode: e2 };

    if (startNode) attachNodeToMeshSafe(startNode, avoid);
    if (endNode) attachNodeToMeshSafe(endNode, avoid);
    if (s2) attachNodeToMeshSafe(s2, avoid);
    if (e2) attachNodeToMeshSafe(e2, avoid);
    computeMainComponent();

    ids = shortest(startNode, endNode, null, null, opts);
    if (ids.length) return { ids, startNode, endNode };
    ids = shortest(s2, e2, null, null, opts);
    if (ids.length) return { ids, startNode: s2, endNode: e2 };

    const soft = { ...opts, officialOnly: false };
    ids = shortest(s2, e2, null, null, soft);
    if (ids.length) return { ids, startNode: s2, endNode: e2 };

    return { ids: [], startNode: s2 || startNode, endNode: e2 || endNode };
  }

  /** Sempre tenta rota pela malha (nunca mensagem de sem caminho / linha reta). */
  function emergencyRoute(origin, dest) {
    forcePoiOnMain(origin);
    forcePoiOnMain(dest);
    const allowParking = tripAllowsParking(origin, dest);
    const avoid = !allowParking;

    let startNode = origin.anchor;
    let endNode = dest.anchor;
    const sNear = nearestRoutableNode(origin, avoid) || nearestRoutableNode(origin, false);
    const eNear = nearestRoutableNode(dest, avoid) || nearestRoutableNode(dest, false);
    if (sNear) {
      startNode = sNear.id;
      origin.anchor = sNear.id;
      origin.snap = { x: sNear.n.x, y: sNear.n.y };
    }
    if (eNear) {
      endNode = eNear.id;
      dest.anchor = eNear.id;
      dest.snap = { x: eNear.n.x, y: eNear.n.y };
    }
    if (!startNode) startNode = nearestConnectedNode(origin, true);
    if (!endNode) endNode = nearestConnectedNode(dest, true);
    if (!startNode || !endNode || !G.nodes[startNode] || !G.nodes[endNode]) return null;

    attachNodeToMeshSafe(startNode, avoid);
    attachNodeToMeshSafe(endNode, avoid);

    if (startNode === endNode) {
      const n = G.nodes[startNode];
      origin.snap = { x: n.x, y: n.y };
      dest.snap = { x: n.x, y: n.y };
      const pts = [{ x: n.x, y: n.y }];
      if (canSpurTo(origin, n, origin)) pts.unshift({ x: origin.x, y: origin.y });
      if (canSpurTo(dest, n, dest)) pts.push({ x: dest.x, y: dest.y });
      if (pts.length < 2) pts.push({ x: n.x + 0.5, y: n.y });
      let len = 0;
      for (let i = 1; i < pts.length; i++) len += dist(pts[i - 1], pts[i]);
      return { points: pts, length: len, nodeIds: [startNode], label: "Rota mais próxima", kind: "best" };
    }

    let linked = ensureLinked(startNode, endNode, { avoidParking: avoid, officialOnly: true });
    let ids = linked.ids;

    if (!ids.length && avoid) {
      const altStarts = [];
      const altEnds = [];
      for (const id of (G.main || [])) {
        if (G.nodes[id]?.parking) continue;
        if (!(G.adj[id] || []).some((e) => e.official)) continue;
        const ds = dist(origin, G.nodes[id]);
        const de = dist(dest, G.nodes[id]);
        if (ds < 320) altStarts.push({ id, d: ds });
        if (de < 320) altEnds.push({ id, d: de });
      }
      altStarts.sort((a, b) => a.d - b.d);
      altEnds.sort((a, b) => a.d - b.d);
      outer: for (const s of altStarts.slice(0, 12)) {
        for (const e of altEnds.slice(0, 12)) {
          const path = shortest(s.id, e.id, null, null, { avoidParking: true, officialOnly: true });
          if (path.length) {
            ids = path;
            linked = { ids, startNode: s.id, endNode: e.id };
            break outer;
          }
        }
      }
    }

    if (!ids.length) {
      linked = ensureLinked(startNode, endNode, { avoidParking: avoid, officialOnly: false });
      ids = linked.ids;
    }
    if (!ids.length) return null;

    if (avoid && pathCrossesParking(ids, linked.startNode, linked.endNode)) {
      const clean = shortest(linked.startNode, linked.endNode, null, null, {
        avoidParking: true, officialOnly: true,
      });
      if (clean.length && !pathCrossesParking(clean, linked.startNode, linked.endNode)) ids = clean;
    }

    origin.anchor = linked.startNode;
    dest.anchor = linked.endNode;
    origin.snap = { x: G.nodes[linked.startNode].x, y: G.nodes[linked.startNode].y };
    dest.snap = { x: G.nodes[linked.endNode].x, y: G.nodes[linked.endNode].y };
    const r = assembleRoute(ids, origin, dest);
    if (r) { r.label = "Rota mais próxima"; r.kind = "best"; }
    return r;
  }

  // Spur ícone↔malha: curto e sem atravessar parede
  function canSpurTo(from, to, poiForTol) {
    const max = tol("spurTol", poiForTol ? poiToleranceZone(poiForTol) : "indoor");
    return from && to && from.x != null && to.x != null
      && dist(from, to) > 0.8
      && dist(from, to) <= max
      && !crossesWall(from, to);
  }

  function resolvePoi(which) {
    if (state[which]) return state[which];
    const raw = ((which === "origin" ? el.originInput : el.destInput).value || "").trim();
    if (!raw) return null;
    if (isTempleSearchQuery(raw)) return buildGenericTemplePoi();
    const q = normSearch(raw);
    const hits = (G.pois || [])
      .filter((p) => isSearchablePoi(p))
      .map((p) => ({ poi: p, score: poiSearchScore(p, raw) }))
      .filter((x) => x.score > 0)
      .sort((a, b) => b.score - a.score);
    if (!hits.length) return null;
    if (hits[0].score >= 100 || hits.length === 1) return hits[0].poi;
    if (hits[0].score >= 78 && hits[0].score > hits[1].score) return hits[0].poi;
    return null;
  }

  // até 3 rotas válidas — JSON primeiro; se vazio, malha SVG; se falhar, emergency
  function routeOptions(origin, dest) {
    const fromJson = routeOptionsFromJson(origin, dest);
    if (fromJson && fromJson.length) return fromJson;

    forcePoiOnMain(origin);
    forcePoiOnMain(dest);

    // reancora sempre pela tabela/entrada correta (não reaproveita snap antigo errado)
    const sSnap = snapToEntrance(origin);
    const eSnap = snapToEntrance(dest);
    if (sSnap.id) {
      origin.anchor = sSnap.id;
      origin.snap = { x: sSnap.x, y: sSnap.y };
      forcePoiOnMain(origin);
    }
    if (eSnap.id) {
      dest.anchor = eSnap.id;
      dest.snap = { x: eSnap.x, y: eSnap.y };
      forcePoiOnMain(dest);
    }

    let startNode = origin.anchor;
    let endNode = dest.anchor;
    if (!startNode || !endNode) {
      const er = emergencyRoute(origin, dest);
      if (!er) return [];
      er.label = "Rota mais próxima";
      er.kind = "best";
      return [er];
    }

    const allowParking = tripAllowsParking(origin, dest);
    const baseOpts = { avoidParking: !allowParking, officialOnly: true };

    const linked = ensureLinked(startNode, endNode, baseOpts);
    startNode = linked.startNode;
    endNode = linked.endNode;
    if (startNode !== origin.anchor && G.nodes[startNode]) {
      origin.anchor = startNode;
      origin.snap = { x: G.nodes[startNode].x, y: G.nodes[startNode].y };
    }
    if (endNode !== dest.anchor && G.nodes[endNode]) {
      dest.anchor = endNode;
      dest.snap = { x: G.nodes[endNode].x, y: G.nodes[endNode].y };
    }

    const seen = new Set();
    const out = [];

    const pushPath = (ids, kind) => {
      if (!ids || !ids.length) return false;
      if (ids.length >= 2 && !pathUsesOfficialEdges(ids)) return false;
      if (!allowParking && pathCrossesParking(ids, startNode, endNode)) return false;
      const sig = ids.join(">");
      if (seen.has(sig)) return false;
      const r = assembleRoute(ids, origin, dest);
      if (!r || r.points.length < 2) return false;
      if (out.some((x) => isDuplicateRoute(x, r))) return false;
      r.sig = sig;
      r.kind = kind || classifyRouteKind(ids);
      out.push(r);
      seen.add(sig);
      return true;
    };

    // 1) melhor rota (mais curta, só malha oficial, sem pátio)
    const bestIds = shortest(startNode, endNode, null, null, baseOpts);
    if (bestIds.length) pushPath(bestIds, "best");
    else if (linked.ids.length) pushPath(linked.ids, "best");

    // 2) se destino é o templo, gera opções pelas entradas do estabelecimento
    if (isTempleDestination(dest) && out.length < 5) {
      for (const gate of (CONFIG.templeEntrances || [])) {
        if (!G.nodes[gate.id]) continue;
        if (gate.id === startNode) continue;
        const ids = shortest(startNode, gate.id, null, null, { ...baseOpts, avoidParking: false });
        if (!ids.length) continue;
        const destGate = {
          ...dest,
          anchor: gate.id,
          snap: { x: G.nodes[gate.id].x, y: G.nodes[gate.id].y },
          x: G.nodes[gate.id].x,
          y: G.nodes[gate.id].y,
          iconX: G.nodes[gate.id].x,
          iconY: G.nodes[gate.id].y,
        };
        const r = assembleRoute(ids, origin, destGate);
        if (!r || r.points.length < 2) continue;
        const sig = ids.join(">");
        if (seen.has(sig)) continue;
        if (out.some((x) => isDuplicateRoute(x, r))) continue;
        r.sig = sig;
        r.kind = "templo";
        r.label = gate.label;
        r.entranceId = gate.id;
        out.push(r);
        seen.add(sig);
      }
    }

    // 3) alternativa pelo templo (prioriza edges indoor)
    const templeIds = shortest(startNode, endNode, null, null, { ...baseOpts, preferZone: "indoor" });
    pushPath(templeIds, "templo");

    // 4) alternativa por fora (prioriza edges outdoor — ainda sem estacionamento)
    const outdoorIds = shortest(startNode, endNode, null, null, { ...baseOpts, preferZone: "outdoor" });
    pushPath(outdoorIds, "fora");

    // 4b) rotas externas nomeadas (ex.: pelo jardim / Av. Batel)
    for (const extSpec of namedExternalSpecsForPair(origin, dest)) {
      if (out.length >= 5) break;
      const vias = (Array.isArray(extSpec.via) ? extSpec.via : [extSpec.via])
        .filter((id) => G.nodes[id]);
      if (!vias.length) continue;
      const preferredEnds = (Array.isArray(extSpec.endNodes) ? extSpec.endNodes : [])
        .filter((id) => G.nodes[id]);
      const targetEnd = preferredEnds[0] || endNode;
      const extOpts = {
        avoidParking: !(extSpec.allowParking === true || extSpec.avoidParking === false),
        officialOnly: true,
      };
      const chain = [startNode, ...vias, targetEnd];
      let ids = [chain[0]];
      let ok = true;
      for (let i = 0; i < chain.length - 1; i++) {
        let leg = shortest(chain[i], chain[i + 1], null, null, extOpts);
        if ((!leg || leg.length < 2) && extOpts.avoidParking) {
          leg = shortest(chain[i], chain[i + 1], null, null, { ...extOpts, avoidParking: false });
        }
        if (!leg || leg.length < 2) { ok = false; break; }
        ids = ids.concat(leg.slice(1));
      }
      if (!ok) continue;
      const sig = ids.join(">");
      if (seen.has(sig)) continue;
      const destGate = preferredEnds[0]
        ? { id: preferredEnds[0], x: G.nodes[preferredEnds[0]].x, y: G.nodes[preferredEnds[0]].y }
        : dest;
      const r = assembleRoute(ids, origin, destGate);
      if (r && r.points.length >= 2 && !out.some((x) => isDuplicateRoute(x, r))) {
        r.sig = sig;
        r.kind = "fora";
        r.label = extSpec.label || "Por fora (externa)";
        r.namedExternal = true;
        r.viaEndNode = preferredEnds[0] || null;
        out.push(r);
        seen.add(sig);
      }
    }

    // se ainda faltam opções distintas, passa por nós-chave indoor / outdoor
    if (out.length < 3 && G.main && G.main.size) {
      const viasTemplo = [];
      const viasFora = [];
      for (const id of G.main) {
        if (id === startNode || id === endNode) continue;
        if (!(G.adj[id] || []).some((e) => e.official)) continue;
        if (G.nodes[id]?.parking && !allowParking) continue;
        if (/templo|capela|toldo|entrada_lateral|oracao|recepcao/i.test(id)) viasTemplo.push(id);
        else if (/entrada|jardim|ginasio|externo|pedestre/i.test(id) && !/estacionamento|escacionamento/i.test(id)) viasFora.push(id);
      }
      const tryVia = (via, kind) => {
        if (out.length >= 3) return;
        const p1 = shortest(startNode, via, null, null, baseOpts);
        const p2 = shortest(via, endNode, null, null, baseOpts);
        if (p1.length < 2 || p2.length < 2) return;
        pushPath(p1.slice(0, -1).concat(p2), kind);
      };
      for (const via of viasTemplo) tryVia(via, "templo");
      for (const via of viasFora) tryVia(via, "fora");
    }

    if (!out.length) {
      const er = emergencyRoute(origin, dest);
      if (er) {
        er.label = "Rota mais próxima";
        er.kind = "best";
        out.push(er);
      }
    }

    if (!out.length) {
      // última garantia: ancora nos nós mais próximos e monta pela malha
      const er = emergencyRoute(origin, dest);
      if (er) out.push(er);
    }

    if (!out.length) return [];

    out.sort((a, b) => a.length - b.length);

    // templo com rotas nomeadas por entrada — preserva labels e até 4 opções
    if (isTemplePoi(dest) && out.some((r) => r.entranceId && r.label)) {
      const doors = [];
      const seenDoor = new Set();
      for (const r of out) {
        if (!r.entranceId || !r.label || r.namedExternal) continue;
        if (seenDoor.has(r.entranceId)) continue;
        seenDoor.add(r.entranceId);
        doors.push(r);
        if (doors.length >= 3) break;
      }
      for (const r of out) {
        if (!r.namedExternal) continue;
        if (doors.some((d) => (d.edgeIds || []).join(">") === (r.edgeIds || []).join(">"))) continue;
        doors.push(r);
        if (doors.length >= 4) break;
      }
      if (doors.length) return finalizePackedRoutes(doors, globalThis.NavigationRouter, origin, dest);
    }

    const namedAll = out.filter((r) => r.namedExternal);
    const maxPick = maxRouteOptionsForPair(origin, dest);

    // garante no máximo uma de cada perfil + a melhor sempre em 1º
    const picked = [];
    const usedKinds = new Set();
    for (const r of out) {
      if (picked.length >= maxPick) break;
      if (r.namedExternal) {
        r.kind = "fora";
        r.label = r.label || "Por fora (externa)";
        picked.push(r);
        usedKinds.add("fora-" + (r.label || picked.length));
        continue;
      }
      const kind = r.kind === "best" ? classifyRouteKind(r.nodeIds) : r.kind;
      if (picked.length === 0) {
        r.kind = "best";
        r.label = r.label && r.entranceId ? r.label : "Rota mais próxima";
        picked.push(r);
        usedKinds.add(classifyRouteKind(r.nodeIds));
        continue;
      }
      const profile = kind === "mista" ? classifyRouteKind(r.nodeIds) : kind;
      if (profile !== "mista" && usedKinds.has(profile) && !r.entranceId) continue;
      if (!r.label || !r.entranceId) {
        if (profile === "templo") r.label = "Pelo templo";
        else if (profile === "fora") r.label = "Por fora";
        else r.label = "Alternativa";
      }
      r.kind = profile;
      usedKinds.add(profile === "mista" ? `mista-${picked.length}` : profile);
      picked.push(r);
    }

    // se só sobrou 1 opção mas havia 2+ no out com labels genéricos, completa
    if (picked.length < 2) {
      for (const r of out) {
        if (picked.length >= maxPick) break;
        if (picked.includes(r)) continue;
        if (r.namedExternal) {
          r.kind = "fora";
          r.label = r.label || "Por fora (externa)";
          picked.push(r);
          continue;
        }
        const profile = classifyRouteKind(r.nodeIds);
        r.kind = profile;
        r.label = profile === "templo" ? "Pelo templo" : profile === "fora" ? "Por fora" : "Alternativa";
        picked.push(r);
      }
    }

    // garante todas as externas nomeadas (jardim + Batel) nas alternativas
    const namedExts = out.filter((r) => r.namedExternal);
    if (namedExts.length) {
      const without = picked.filter((r) => !r.namedExternal);
      const next = [];
      if (without[0]) next.push(without[0]);
      for (const n of namedExts) {
        if (next.length >= maxPick) break;
        if (next.some((r) => isDuplicateRoute(r, n))) continue;
        next.push(n);
      }
      for (const r of without.slice(1)) {
        if (next.length >= maxPick) break;
        if (next.some((x) => isDuplicateRoute(x, r))) continue;
        next.push(r);
      }
      return finalizePackedRoutes(next, globalThis.NavigationRouter, origin, dest);
    }

    return finalizePackedRoutes(picked, globalThis.NavigationRouter, origin, dest);
  }

  // geometria real da edge do grafo — NUNCA inventa segmento sem edge
  function geomBetween(a, b) {
    const e = (G.adj[a] || []).find((x) => x.id === b);
    if (!e) return [];
    if (e.geom?.length >= 2) return e.geom.map((p) => ({ x: p.x, y: p.y }));
    const pa = G.nodes[a], pb = G.nodes[b];
    if (!pa || !pb) return [];
    // edge existe sem polyline: só aceita se oficial (malha do mapa) ou sem parede
    if (e.official || !crossesWall(pa, pb)) {
      return [{ x: pa.x, y: pa.y }, { x: pb.x, y: pb.y }];
    }
    return [];
  }

  function appendGeom(out, geom) {
    for (const p of geom) {
      if (!out.length || dist(out[out.length - 1], p) > 0.35) out.push({ x: p.x, y: p.y });
    }
  }

  /** Verifica se o caminho só usa edges existentes no grafo. */
  function pathHasGraphEdges(ids) {
    if (!ids || ids.length < 2) return ids?.length === 1;
    for (let i = 1; i < ids.length; i++) {
      const e = (G.adj[ids[i - 1]] || []).find((x) => x.id === ids[i]);
      if (!e) return false;
    }
    return true;
  }

  function pathUsesOfficialEdges(ids) {
    if (!ids || ids.length < 2) return ids?.length === 1;
    for (let i = 1; i < ids.length; i++) {
      const e = (G.adj[ids[i - 1]] || []).find((x) => x.id === ids[i]);
      if (!e || !e.official) return false;
    }
    return true;
  }

  // polilinha = geometria das edges da malha + trecho EXATO até o ícone do POI
  function assembleRoute(ids, origin, dest) {
    if (!ids.length) return null;
    if (ids.length >= 2 && !pathHasGraphEdges(ids)) return null;

    const startNode = G.nodes[ids[0]];
    const endNode = G.nodes[ids[ids.length - 1]];
    if (!startNode || !endNode) return null;
    const startSnap = origin.snap || startNode;
    const endSnap = dest.snap || endNode;
    const pts = [];
    const oIcon = poiIcon(origin);
    const dIcon = poiIcon(dest);

    // origem: só começa no ícone se o trecho for curto e livre de parede
    const maxSpurO = tol("spurTol", poiToleranceZone(origin));
    const maxSpurD = tol("spurTol", poiToleranceZone(dest));
    if (oIcon && dist(oIcon, startSnap) > 0.8 && dist(oIcon, startSnap) <= maxSpurO && !crossesWall(oIcon, startSnap)) {
      appendGeom(pts, [{ x: oIcon.x, y: oIcon.y }]);
    }
    appendGeom(pts, [{ x: startSnap.x, y: startSnap.y }]);

    for (let i = 1; i < ids.length; i++) {
      const a = ids[i - 1], b = ids[i];
      const e = (G.adj[a] || []).find((x) => x.id === b);
      if (!e) return null;
      const g = geomBetween(a, b);
      if (g.length < 2) return null;
      if (!e.official) {
        let ok = true;
        for (let k = 1; k < g.length; k++) {
          if (crossesWall(g[k - 1], g[k])) { ok = false; break; }
        }
        if (!ok) return null;
      }
      appendGeom(pts, g);
    }

    const last = pts[pts.length - 1] || startSnap;
    if (dist(last, endSnap) > 0.8) {
      appendGeom(pts, [{ x: endSnap.x, y: endSnap.y }]);
    }

    // destino: ícone só se curto e sem parede (templo = fica na porta)
    if (dIcon && !isTemplePoi(dest)) {
      const tip = pts[pts.length - 1] || endSnap;
      if (dist(tip, dIcon) > 0.8 && dist(tip, dIcon) <= maxSpurD && !crossesWall(tip, dIcon)) {
        appendGeom(pts, [{ x: dIcon.x, y: dIcon.y }]);
      }
    }

    const cleaned = [];
    for (const p of pts) {
      if (!isFinite(p.x) || !isFinite(p.y)) continue;
      if (!cleaned.length || dist(cleaned[cleaned.length - 1], p) > 0.35) cleaned.push(p);
    }
    if (cleaned.length < 2) return null;

    let len = 0;
    for (let i = 1; i < cleaned.length; i++) len += dist(cleaned[i - 1], cleaned[i]);
    return { points: cleaned, length: len, nodeIds: ids };
  }

  function routeBetween(origin, dest) {
    const opts = routeOptions(origin, dest);
    return opts[0] || null;
  }

  /* ============================================================ PASSOS (turn-by-turn) */
  function angle(a, b) { return Math.atan2(b.y - a.y, b.x - a.x); }
  function turnLabel(prev, cur, next) {
    let d = angle(cur, next) - angle(prev, cur);
    while (d > Math.PI) d -= 2 * Math.PI;
    while (d < -Math.PI) d += 2 * Math.PI;
    const deg = (d * 180) / Math.PI;
    if (deg > 30) return { txt: "Vire à direita", ico: "R" };
    if (deg < -30) return { txt: "Vire à esquerda", ico: "L" };
    return { txt: "Siga em frente", ico: "U" };
  }
  const STEP_ICO = {
    P: '<path d="M12 2.5c-2.8 0-5 2.2-5 5 0 3.8 5 9.5 5 9.5s5-5.7 5-9.5c0-2.8-2.2-5-5-5Z" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linejoin="round"/><circle cx="12" cy="7.5" r="2.2" fill="currentColor"/>',
    W: '<path d="M14.5 6.2a2.4 2.4 0 1 1-4.8 0 2.4 2.4 0 0 1 4.8 0ZM8.5 20.5l2.6-7.8 3.1 2.4 1.8-5.6 4.5 11" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>',
    E: '<rect x="7" y="3" width="10" height="18" rx="2" fill="none" stroke="currentColor" stroke-width="1.8"/><path d="M9 8h6M9 12h6M9 16h6" stroke="currentColor" stroke-width="1.5" stroke-linecap="round"/>',
    U: '<path d="M12 20V6M6 12l6-6 6 6" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>',
    R: '<path d="M6 18h6a4 4 0 0 0 4-4V7M12 3l4 4-4 4" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>',
    L: '<path d="M18 18h-6a4 4 0 0 1-4-4V7M12 3 8 7l4 4" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>',
    S: '<circle cx="12" cy="12" r="4" fill="currentColor"/>',
    F: '<path d="M6 20V9l6-3 6 3v11M9 20v-5h6v5" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linejoin="round"/>',
  };

  const WALK_PICTOGRAM_SRC = () => appAssetUrl("assets/icon-walk-map.png");

  function walkPictogramMarkup(size) {
    const s = size || 22;
    return `<img class="step-walk-pictogram walk-pictogram" src="${WALK_PICTOGRAM_SRC()}" width="${s}" height="${s}" alt="" aria-hidden="true" decoding="async" />`;
  }

  function guideStepsList() {
    return state.route ? buildSteps(state.route) : [];
  }

  /** Sincroniza botões Anterior/Próximo do hero com a lista passo a passo. */
  function updateGuideNav(opts = {}) {
    if (!isNavigating() || !state.route) {
      if (el.summaryNav) el.summaryNav.hidden = true;
      return;
    }

    const steps = guideStepsList();
    const total = steps.length;
    if (!total) return;

    state.guideStepIdx = Math.max(0, Math.min(state.guideStepIdx ?? 0, total - 1));

    el.steps?.querySelectorAll(".step-item").forEach((li, i) => {
      li.classList.toggle("is-active", i === state.guideStepIdx);
      li.classList.toggle("is-done", i < state.guideStepIdx);
    });
    el.steps?.children[state.guideStepIdx]?.scrollIntoView?.({ block: "nearest", behavior: "smooth" });

    if (el.summaryNav) el.summaryNav.hidden = false;
    if (el.summaryNavPrev) el.summaryNavPrev.disabled = state.guideStepIdx <= 0;
    if (el.summaryNavNext) {
      el.summaryNavNext.textContent = state.guideStepIdx >= total - 1 ? "Chegar" : "Próximo";
    }

    const cur = steps[state.guideStepIdx];
    if (cur && el.summaryMeta) {
      el.summaryMeta.textContent = `Passo ${state.guideStepIdx + 1} de ${total} · ${cur.txt}`;
    }

    if (opts.fitCamera) {
      if (isMobileLayout() && isNavigating()) fitMobileNavRouteView();
      else {
        fitSoon(() => {
          syncNavLayoutMetrics();
          fitRouteInView(state.route, {
            navMode: true,
            preferActiveLeg: true,
            fillWidth: isMobileLayout(),
          });
        });
      }
    }
  }

  function guideNavPrev() {
    if (!isNavigating()) return;
    state.guideStepIdx = Math.max(0, (state.guideStepIdx ?? 0) - 1);
    updateGuideNav({ fitCamera: true });
  }

  function guideNavNext() {
    if (!isNavigating()) return;
    const steps = guideStepsList();
    if (!steps.length) return;
    if (state.guideStepIdx >= steps.length - 1) {
      setRouteVisualCompleted(true);
      paintActiveRouteLeg();
      exitNav("Você chegou ao destino!");
      return;
    }
    state.guideStepIdx += 1;
    updateGuideNav({ fitCamera: true });
  }

  function renderRouteSteps(route) {
    if (!el.steps || !route) return;
    const steps = buildSteps(route);
    el.steps.innerHTML = steps.map((s, i) => {
      const mod = (s.ico || "W").toLowerCase();
      const iconInner = s.ico === "W"
        ? walkPictogramMarkup(22)
        : `<svg viewBox="0 0 24 24" width="18" height="18" aria-hidden="true">${STEP_ICO[s.ico] || STEP_ICO.W}</svg>`;
      return `<li class="step-item">
        <span class="step-num">${i + 1}</span>
        <span class="step-ico step-ico--${mod}">${iconInner}</span>
        <span class="step-txt">${s.txt}${s.dist ? `<span class="step-dist"> · ${s.dist}</span>` : ""}</span>
      </li>`;
    }).join("");
  }

  function buildSteps(route) {
    const oLvl = poiLevel(state.origin);
    const dLvl = poiLevel(state.dest);
    const legs = route.legs || routeLegsFromGraph(route);

    if (routeInvolvesBasementTransfer(oLvl, dLvl)) {
      return buildBasementNarniaSteps(oLvl, dLvl);
    }

    const steps = [];
    steps.push({ ico: "P", txt: `Início: ${state.origin.name}`, dist: "" });

    if (route.namedExternal && route.label && oLvl === dLvl) {
      steps.push({
        ico: "W",
        txt: `Siga: ${route.label}`,
        dist: fmtMeters(route.length),
      });
      steps.push({ ico: "F", txt: `Chegada: ${state.dest.name}`, dist: "" });
      return steps;
    }

    if (oLvl !== dLvl) {
      const viaStairs = routeUsesLateralStairs(route);
      const exitHub = viaStairs ? stairHub(oLvl) : elevatorHub(oLvl);
      const arriveHub = viaStairs ? stairHub(dLvl) : elevatorHub(dLvl);
      const accessLabel = viaStairs ? "escada lateral" : "elevador";
      const prep = viaStairs ? "a" : "o";
      const firstLeg = legs[0];
      if (firstLeg?.edgeIds?.length) {
        steps.push({
          ico: "W",
          txt: `Siga até ${prep} ${accessLabel}${exitHub ? ` (${exitHub.label})` : ""}`,
          dist: "",
        });
      } else {
        steps.push({
          ico: "W",
          txt: `Vá ${viaStairs ? "à" : "ao"} ${accessLabel}${exitHub ? ` — ${exitHub.label}` : ""}`,
          dist: "",
        });
      }
      steps.push({
        ico: "E",
        txt: `Use ${prep} ${accessLabel} até ${floorTitle(dLvl)}${arriveHub ? ` — ${arriveHub.label}` : ""}`,
        dist: "",
      });
      steps.push({
        ico: "W",
        txt: `${viaStairs ? "Da escada" : "Do elevador"}, siga até ${state.dest.name}`,
        dist: "",
      });
      steps.push({ ico: "F", txt: `Chegada: ${state.dest.name}`, dist: "" });
      return steps;
    }

    const p = route.points || [];
    let walk = 0;
    for (let i = 1; i < p.length - 1; i++) {
      const segLen = dist(p[i], p[i + 1]);
      walk += dist(p[i - 1], p[i]);
      const t = turnLabel(p[i - 1], p[i], p[i + 1]);
      const ico = t.ico === "U" ? "W" : t.ico;
      if (t.ico === "U" && segLen < 12) continue;
      if (t.ico !== "U" || walk > 18) {
        steps.push({ ico, txt: t.txt, dist: fmtMeters(Math.max(walk, segLen)) });
        walk = 0;
      }
    }
    steps.push({ ico: "F", txt: `Chegada: ${state.dest.name}`, dist: "" });
    return steps;
  }

  /* ============================================================ DESENHAR ROTA */

  function routeMarkerScale() {
    const Icons = globalThis.MapNavIcons;
    let base;
    if (Icons?.markerScaleForViewBox) {
      base = Icons.markerScaleForViewBox(G.vbW, G.vbH);
    } else {
      base = Math.max(0.105, Math.min(0.18, Math.min(G.vbW || 1011, G.vbH || 862) * 0.0001375));
    }
    // Compensa o zoom do SVG (width/height) — ícone mantém tamanho visual na tela
    return base / Math.max(0.08, state.scale || 1);
  }

  function refreshRouteMarkerScales() {
    const c = state._routeMarkerCache;
    if (c && el.routeStart && !el.routeStart.hasAttribute("hidden")) {
      paintRouteMarker(el.routeStart, "start", c.start, c.bearing);
      paintRouteMarker(el.routeEnd, "end", c.end);
    }
    paintMapPickMarkers();
  }

  function mapPickMarkerScale() {
    return Math.max(0.55, 1 / Math.max(0.08, state.scale || 1));
  }

  function paintMapPickMarkerNode(node, pt, visible) {
    if (!node) return;
    if (!visible || !pt || !isFinite(pt.x) || !isFinite(pt.y)) {
      node.hidden = true;
      node.setAttribute("hidden", "");
      node.setAttribute("visibility", "hidden");
      return;
    }
    const s = mapPickMarkerScale();
    node.removeAttribute("hidden");
    node.removeAttribute("visibility");
    node.hidden = false;
    node.setAttribute("visibility", "visible");
    node.setAttribute("transform", `translate(${pt.x} ${pt.y}) scale(${s})`);
  }

  function paintMapPickMarkers() {
    paintMapPickMarkerNode(el.mapPickPinPreview, state.mapPickPreview, true);
    paintMapPickMarkerNode(el.mapPickPinOrigin, state.mapPickOrigin, !state.route);
    paintMapPickMarkerNode(el.mapPickPinDest, state.mapPickDest, !state.route);
  }

  function paintRouteMarker(node, kind, pt, bearing) {
    if (!node || !pt) return;
    const s = routeMarkerScale();
    const Icons = globalThis.MapNavIcons;
    if (kind === "start" && Icons?.applyRouteStartTransform) {
      Icons.applyRouteStartTransform(node, pt.x, pt.y, bearing, s);
    } else if (kind === "end" && Icons?.applyRouteEndTransform) {
      Icons.applyRouteEndTransform(node, pt.x, pt.y, s);
    } else if (kind === "start") {
      node.setAttribute("transform", `translate(${pt.x} ${pt.y}) rotate(${bearing || 0}) scale(${s})`);
    } else {
      node.setAttribute("transform", `translate(${pt.x} ${pt.y}) scale(${s})`);
    }
  }

  function paintRoutePathNodes(layerEl, baseNode, glowNode, pathD) {
    const RA = globalThis.RouteAnimation;
    if (RA?.paintRoutePaths) {
      RA.applyRouteAnimationVars?.(layerEl);
      RA.paintRoutePaths(layerEl, baseNode, glowNode, pathD);
      return;
    }
    const stroke = "#00AEEF";
    if (baseNode) {
      baseNode.setAttribute("d", pathD);
      baseNode.setAttribute("fill", "none");
      baseNode.setAttribute("stroke", stroke);
      baseNode.setAttribute("stroke-width", "10");
      baseNode.setAttribute("stroke-linecap", "round");
      baseNode.setAttribute("stroke-linejoin", "round");
      baseNode.style.visibility = pathD ? "visible" : "hidden";
      baseNode.style.display = pathD ? "" : "none";
    }
    if (glowNode) {
      glowNode.setAttribute("d", pathD);
      glowNode.setAttribute("fill", "none");
      glowNode.setAttribute("stroke-linecap", "round");
      glowNode.setAttribute("stroke-linejoin", "round");
      glowNode.style.visibility = pathD ? "visible" : "hidden";
      glowNode.style.display = pathD ? "" : "none";
    }
    if (layerEl) {
      layerEl.style.display = pathD ? "" : "none";
      layerEl.style.visibility = pathD ? "visible" : "hidden";
      layerEl.removeAttribute("hidden");
    }
  }

  function paintRouteOnMap(ptsStr, a, b, points) {
    syncMapViewBeforeRoutePaint();
    const pts = (points || ptsStr.split(/\s+/).map((s) => {
      const [x, y] = s.split(",").map(Number);
      return { x, y };
    })).filter((p) => isFinite(p.x) && isFinite(p.y));
    if (pts.length < 2) return;
    const d = pointsToPathD(pts);
    const RA = globalThis.RouteAnimation;

    const overlayChanged = state._routeOverlayPathD !== d;
    if (overlayChanged) {
      RA?.applyRouteAnimationVars?.(el.routeLayer);
      if (RA?.paintRoutePaths) {
        RA.paintRoutePaths(el.routeLayer, el.routePathBase, el.routePathGlow, d);
      } else {
        paintRoutePathNodes(el.routeLayer, el.routePathBase, el.routePathGlow, d);
      }
      state._routeOverlayPathD = d;
    }
    forceRoutePathVisible(el.routePathBase, el.routePathGlow, d);
    if (el.routeLayer && d) {
      el.routeLayer.style.display = "";
      el.routeLayer.style.visibility = "visible";
      el.routeLayer.removeAttribute("hidden");
    }
    RA?.setRouteCompleted?.(el.routeLayer, !!state.routeVisualCompleted);

    const Icons = globalThis.MapNavIcons;
    const startBearing = Icons?.bearingDeg
      ? Icons.bearingDeg(a, pts[1] || b)
      : (Math.atan2((pts[1] || b).y - a.y, (pts[1] || b).x - a.x) * 180) / Math.PI + 90;

    el.routeStart.removeAttribute("hidden");
    el.routeStart.setAttribute("visibility", "visible");
    el.routeStart.style.display = "";
    paintRouteMarker(el.routeStart, "start", a, startBearing);

    el.routeEnd.removeAttribute("hidden");
    el.routeEnd.setAttribute("visibility", "visible");
    el.routeEnd.style.display = "";
    paintRouteMarker(el.routeEnd, "end", b);

    state._routeMarkerCache = { start: a, end: b, bearing: startBearing };

    const svg = el.svgHost.querySelector("svg");
    if (svg) {
      try {
        const { layer, base, glow } = resolveMapRoutePaintTargets(svg);
        const embeddedChanged = base?.getAttribute("d") !== d;
        if (embeddedChanged) {
          RA?.applyRouteAnimationVars?.(layer);
          if (RA?.paintRoutePaths) {
            RA.paintRoutePaths(layer, base, glow, d);
          } else {
            paintRoutePathNodes(layer, base, glow, d);
          }
        }
        forceRoutePathVisible(base, glow, d);
        RA?.setRouteCompleted?.(layer, !!state.routeVisualCompleted);
        ["mapRouteStart", "mapRouteEnd"].forEach((id) => {
          const n = svg.getElementById(id);
          if (n) n.setAttribute("visibility", "hidden");
        });
      } catch (err) {
        console.warn("mapRouteLayer:", err);
      }
    }
  }

  function clearRoutePaint() {
    const RA = globalThis.RouteAnimation;
    RA?.clearRoutePaths?.(el.routeLayer, el.routePathBase, el.routePathGlow);
    el.routeLayer?.querySelector("#routePolyline")?.setAttribute("points", "");
    state._routeOverlayPathD = null;
    state.routeVisualCompleted = false;
    el.routeStart.setAttribute("hidden", "");
    el.routeStart.setAttribute("visibility", "hidden");
    el.routeStart.style.display = "none";
    el.routeEnd.setAttribute("hidden", "");
    el.routeEnd.setAttribute("visibility", "hidden");
    el.routeEnd.style.display = "none";
    state._routeMarkerCache = null;
    const svg = el.svgHost.querySelector("#mapaSVG") || el.svgHost.querySelector("svg");
    if (svg) {
      const { layer, base, glow } = getMapRoutePaintTargets(svg);
      if (layer) RA?.clearRoutePaths?.(layer, base, glow);
    }
    if (!svg) return;
    ["mapRouteStart", "mapRouteEnd"].forEach((id) => {
      const n = svg.getElementById(id);
      if (n) n.setAttribute("visibility", "hidden");
    });
  }

  function isNavigating() {
    return document.body.classList.contains("is-navigating");
  }

  function canStartNavigation() {
    return !!(state.route?.points?.length && state.origin && state.dest);
  }

  function updateNavBtn() {
    if (!el.navBtn) return;
    const navigating = isNavigating();
    const ready = canStartNavigation();

    if (navigating) {
      el.navBtn.disabled = false;
      el.navBtn.setAttribute("aria-pressed", "true");
      el.navBtn.title = "Encerrar navegação passo a passo";
      if (el.navBtnLabel) el.navBtnLabel.textContent = "Sair da navegação";
      el.navBtn.classList.add("btn--nav-exit");
    } else {
      el.navBtn.disabled = !ready;
      el.navBtn.setAttribute("aria-pressed", "false");
      el.navBtn.title = ready
        ? "Iniciar navegação passo a passo"
        : "Trace uma rota com origem e destino";
      if (el.navBtnLabel) el.navBtnLabel.textContent = "Navegar";
      el.navBtn.classList.remove("btn--nav-exit");
    }
  }

  function updateSummaryMetaText() {
    if (!el.summaryMeta || !state.route || !state.origin || !state.dest) return;
    const oLvl = poiLevel(state.origin);
    const dLvl = poiLevel(state.dest);
    const multi = oLvl !== dLvl;
    el.summaryMeta.textContent = multi
      ? `${state.origin.name} → ${state.dest.name} · ${routeViaLabel(state.route, oLvl, dLvl)} (${oLvl}→${dLvl})`
      : `${state.origin.name} → ${state.dest.name}`;
  }

  function updateSummaryChrome() {
    const hasRoute = !!state.route;
    const navigating = isNavigating();
    if (el.summary) el.summary.hidden = !hasRoute;
    if (el.summaryBody) el.summaryBody.hidden = !hasRoute || navigating;
    if (el.routeGuide) el.routeGuide.hidden = !navigating;
    if (el.summaryNav) el.summaryNav.hidden = !navigating;
    el.panel?.classList.toggle("panel--has-route", hasRoute);
    el.panel?.classList.toggle("panel--nav-steps", navigating);
    if (hasRoute && !navigating) updateSummaryMetaText();
    updateNavBtn();
  }

  function routeOptionsCacheKey(origin, dest) {
    const startRole = origin?.id === "__here__" ? "here" : "origin";
    const startIds = resolveTripNodeIds(origin, startRole);
    const endIds = resolveTripNodeIds(dest, "dest");
    if (!startIds.length || !endIds.length) return null;
    // A assinatura começa pelos nodes oficiais; os IDs dos POIs preservam endpoints
    // visuais distintos que eventualmente compartilham a mesma entrada.
    return [
      state.navGraphCacheSignature,
      startIds.join(","),
      endIds.join(","),
      origin?.id || poiRawKey(origin),
      dest?.id || poiRawKey(dest),
    ].join("|");
  }

  function cloneRouteOptions(options) {
    return (options || []).map((route) => ({
      ...route,
      points: (route.points || []).map((point) => ({ ...point })),
      nodeIds: [...(route.nodeIds || [])],
      edgeIds: [...(route.edgeIds || [])],
    }));
  }

  async function drawRoute() {
    const origin = resolvePoi("origin");
    const dest = resolvePoi("dest");
    if (origin) { state.origin = origin; el.originInput.value = origin.searchLabel || origin.name; }
    if (dest) { state.dest = dest; el.destInput.value = dest.searchLabel || dest.name; }

    await ensureNavGraphForTrip(poiLevel(state.origin), poiLevel(state.dest));

    if (state.origin) state.origin = enrichTripPoi(state.origin);
    if (state.dest) state.dest = enrichTripPoi(state.dest);

    // em outro andar sem origem: usa o elevador do andar atual
    if (!state.origin && state.dest && (poiLevel(state.dest) !== state.activeLevel)) {
      const hub = elevatorPoiForLevel(state.activeLevel);
      if (hub) {
        state.origin = hub;
        el.originInput.value = hub.searchLabel || hub.name;
      }
    }

    if (!state.origin) { toast("Escolha onde você está."); openField("origin"); return; }
    if (!state.dest) { toast("Escolha para onde você quer ir."); openField("dest"); return; }
    const GFRM = gfr();
    if (GFRM?.isGenericGroundDestination(state.origin) && !isTempleDestination(state.origin)) {
      toast("Selecione um acesso oficial antes de traçar a rota.");
      openField("origin");
      return;
    }
    if (GFRM?.isGenericGroundDestination(state.dest) && !isTempleDestination(state.dest)) {
      toast("Selecione um acesso oficial antes de traçar a rota.");
      openField("dest");
      return;
    }
    if (state.origin.id === state.dest.id) {
      toast("Origem e destino são iguais."); return;
    }

    const cacheKey = routeOptionsCacheKey(state.origin, state.dest);
    const cachedOptions = cacheKey ? state.routeOptionsCache.get(cacheKey) : null;
    let options = cachedOptions
      ? cloneRouteOptions(cachedOptions)
      : collectRouteOptionsForTrip(state.origin, state.dest);
    if (!options.length) return;

    options = enforceMinimumRouteOptions(options, globalThis.NavigationRouter, state.origin, state.dest);
    if (options.length < minRouteOptionsForPair(state.origin, state.dest)) return;
    if (cacheKey && !cachedOptions) {
      state.routeOptionsCache.set(cacheKey, cloneRouteOptions(options));
    }

    state.routeOptions = options;
    state.routePickOpen = true;
    // No celular: fecha o painel para liberar espaço ao mapa completo
    if (isMobileLayout()) setPanelOpen(false);
    await selectRoute(preferredTempleRouteIndex(options, state.dest), true);
    updateSummaryChrome();
    const n = state.routeOptions.length;
    if (isCfToJardimPair(state.origin, state.dest) && poiRawKey(state.dest) === "P020_espaco_servir" && n >= 2) {
      toast(`${n} rotas até o Espaço Servir — toque nas opções abaixo para alternar.`);
    } else if (isCfToJardimPair(state.origin, state.dest) && n >= 2) {
      toast(`${n} rotas CF → Jardim — toque nas opções abaixo para alternar.`);
    } else if (isToCfPair(state.origin, state.dest) && n >= 2) {
      toast(`${n} rotas até o CF — inclui opção pelo corredor do estabelecimento. Toque abaixo para alternar.`);
    } else if (isL00InteriorTerrainPair(state.origin, state.dest) && n >= 2) {
      toast(`${n} rotas no térreo — inclui opção pela área interna. Toque abaixo para alternar.`);
    } else if (isRgoToConexaoPair(state.origin, state.dest) && n >= 2) {
      toast(`${n} rotas RGO → Espaço conexão — toque nas opções abaixo para alternar.`);
    } else if (involvesAdmFloorCross(poiLevel(state.origin), poiLevel(state.dest)) && n >= 2) {
      toast(`${n} rotas — Elevador T ou Escadas laterais T. Toque nas opções abaixo.`);
    } else if (isTempleDestination(state.dest) && n >= 2) {
      toast(`${n} entradas do Templo — toque nas opções abaixo para escolher.`);
    } else {
      toast(n >= 2
        ? `${n} rotas disponíveis — toque em Opções de rota para alternar.`
        : "Rota traçada até o destino.");
    }
  }

  async function selectRoute(idx, doFit) {
    const options = state.routeOptions || [];
    if (!options.length) return;
    idx = Math.max(0, Math.min(idx, options.length - 1));
    state.routeIdx = idx;
    const route = options[idx];
    state.route = route;
    setRouteVisualCompleted(false);
    syncTripPoiFromTempleRoute(route);

    const oLvl = poiLevel(state.origin);
    const dLvl = poiLevel(state.dest);
    const multi = oLvl !== dLvl;
    const viewLevel = routeInitialViewLevel(route, oLvl, dLvl);

    await setActiveLevel(viewLevel, { silent: true, keepTrip: true, force: true });

    const finish = () => {
      syncMapViewBeforeRoutePaint();
      rebuildRouteLegs(route);
      hydrateRouteLegPoints(route, state.activeLevel);
      paintActiveRouteLeg();
      el.summaryDist.textContent = fmtMeters(route.length);
      if (el.summaryTime) el.summaryTime.textContent = fmtRouteTime(route.length);
      updateSummaryMetaText();

      renderRouteOptions();
      state.navIdx = 0;
      if (isNavigating()) {
        state.guideStepIdx = 0;
        renderRouteSteps(route);
        updateGuideNav({ fitCamera: doFit });
      }
      updateNavBtn();
      if (doFit) {
        fitSoon(() => {
          syncNavLayoutMetrics();
          paintActiveRouteLeg();
          fitRouteInView(route, {
            navMode: document.body.classList.contains("is-navigating"),
            preferActiveLeg: true,
            fillWidth: isMobileLayout(),
          });
        });
      }
      if (multi) {
        if (routeInvolvesBasementTransfer(oLvl, dLvl)) {
          const startHint = isBasementEncomunTrip(oLvl, dLvl)
            ? `Comece em ${floorTitle(oLvl)}: siga até o ${CONFIG.encomunTransfer?.[oLvl]?.label || "Encomun"}.`
            : isBasementFloor(oLvl)
              ? `Comece em ${floorTitle(oLvl)}: siga até a ${narniaGateLabel(oLvl)} (saída do subsolo).`
              : isBasementFloor(dLvl)
                ? `Comece no Térreo: siga até a ${narniaGateLabel("L00")} para descer ao subsolo.`
                : !isAdmFloor(oLvl)
                  ? "Comece pelo mapa do Térreo (L00)."
                  : `Comece pelo mapa de ${floorTitle(oLvl)}.`;
          toast(`${startHint} Troque o andar para ver cada trecho da rota.`);
        } else if (routeUsesLateralStairs(route)) {
          const arrive = stairHub(dLvl);
          toast(`Via escada lateral: saia em ${arrive?.label || floorTitle(dLvl)} e siga até ${state.dest.name}. Troque o andar para ver cada trecho.`);
        } else {
          const arrive = elevatorHub(dLvl);
          toast(`Via elevador: comece em ${floorTitle(oLvl)} até ${elevatorHub(oLvl)?.label || "o elevador"}. Troque o andar para ver cada trecho.`);
        }
      }
    };

    finish();
  }

  function renderRouteOptions() {
    const NR = globalThis.NavigationRouter;
    let options = state.routeOptions || [];
    const cfForced = isCfToJardimPair(state.origin, state.dest) && options.some((r) => r.forceInclude);
    const gardenWestEastForced = isJardimDestination(state.dest)
      && gardenRequiredRouteLabels(state.origin, state.dest)
        .every((label) => options.some((r) => r.label === label && r.forceInclude));
    const toCfForced = isToCfPair(state.origin, state.dest) && options.some((r) => r.forceInclude);
    const l00InteriorForced = isL00InteriorTerrainPair(state.origin, state.dest)
      && options.some((r) => r.label === L00_INTERIOR_TERRAIN_LABEL);
    const rgoConexaoForced = isRgoToConexaoPair(state.origin, state.dest) && options.some((r) => r.forceInclude);
    const crossFloorForced = involvesAdmFloorCross(poiLevel(state.origin), poiLevel(state.dest))
      && options.some((r) => r.forceInclude && (r.kind === "elevator" || r.kind === "stairs" || r.viaStairs));
    if (!cfForced && !gardenWestEastForced && !toCfForced && !l00InteriorForced && !rgoConexaoForced && !crossFloorForced) {
      const deduped = dedupeRouteOptionsStrict(options, NR, state.origin, state.dest);
      if (deduped.length >= minRouteOptionsForPair(state.origin, state.dest)) {
        options = deduped;
      }
    }
    options = enforceMinimumRouteOptions(options, NR, state.origin, state.dest);
    if (options.length !== (state.routeOptions || []).length || options.some((r, i) => r !== state.routeOptions[i])) {
      state.routeOptions = options;
      if (state.routeIdx >= options.length) state.routeIdx = Math.max(0, options.length - 1);
    }
    if (!el.routePick) return;

    if (!options.length) {
      el.routePick.hidden = true;
      el.routeOptions.innerHTML = "";
      return;
    }

    el.routePick.hidden = options.length < 2;
    const templeTrip = (isTemplePoi(state.dest) || isTemplePoi(state.origin))
      && options.length >= 2
      && options.every((r) => r.kind === "templo");
    if (el.routePickLabel) {
      el.routePickLabel.textContent = gardenWestEastForced
        ? "Opções de rota · Jardim / Espaço Servir"
        : cfForced
          ? "Opções de rota · CF → Jardim"
        : toCfForced
          ? "Opções de rota · até o CF"
          : l00InteriorForced
            ? "Opções de rota · térreo (área interna)"
            : rgoConexaoForced
          ? "Opções de rota · RGO → Espaço conexão"
          : crossFloorForced
            ? "Opções de rota · Elevador T / Escadas laterais"
            : templeTrip
          ? "Opções de rota · Templo"
          : "Opções de rota";
    }
    if (el.routePickCount) {
      el.routePickCount.hidden = options.length < 2;
      el.routePickCount.textContent = `${options.length} opções`;
    }

    el.routeOptions.hidden = options.length < 2;
    if (options.length >= 2) {
      el.routeOptions.innerHTML = options.map((r, i) => {
        const active = i === state.routeIdx ? " is-active" : "";
        const name = r.label
          || (i === 0 ? "Rota 1 — Mais curta"
            : i === 1 ? "Rota 2 — Alternativa"
            : i === 2 ? "Rota 3 — Alternativa"
            : "Rota 4 — Alternativa");
        return `<button type="button" class="route-opt${active}" data-idx="${i}">
        <span class="route-opt__badge">${i + 1}</span>
        <span class="route-opt__txt"><span class="route-opt__name">${name}</span>
        <span class="route-opt__dist">${fmtMeters(r.length)}</span></span>
      </button>`;
      }).join("");
      el.routeOptions.querySelectorAll(".route-opt").forEach((btn) => {
        btn.addEventListener("click", (e) => {
          e.preventDefault();
          selectRoute(+btn.dataset.idx, true);
        });
      });
    } else {
      el.routeOptions.innerHTML = "";
    }
  }

  function resetTripSearchPanel() {
    state.origin = null;
    state.dest = null;
    state.navIdx = 0;
    state.guideStepIdx = 0;
    state.activeField = null;
    if (el.originInput) el.originInput.value = "";
    if (el.destInput) el.destInput.value = "";
    if (el.summaryDist) el.summaryDist.textContent = "—";
    if (el.summaryTime) el.summaryTime.textContent = "—";
    if (el.summaryMeta) el.summaryMeta.textContent = "—";
    if (el.steps) el.steps.innerHTML = "";
    closeSuggest();
    exitMobileSearchMode();
    highlightSelected();
  }

  function clearRoute(silent) {
    if (isNavigating()) exitNav();
    state.route = null;
    state.routeOptions = [];
    state.routeIdx = 0;
    state.routePickOpen = false;
    clearRoutePaint();
    state.mapPickPreview = null;
    paintMapPickMarkers();
    if (el.routePick) el.routePick.hidden = true;
    if (el.routeOptions) { el.routeOptions.hidden = true; el.routeOptions.innerHTML = ""; }
    if (!silent) resetTripSearchPanel();
    updateSummaryChrome();
    if (!silent) toast("Rota removida.");
  }

  /* ============================================================ CAMPOS / AUTOCOMPLETE */
  function highlightSelected() {
    el.svgHost.querySelectorAll('[data-poi][data-selected="true"]').forEach((n) => n.removeAttribute("data-selected"));
    [state.origin, state.dest].forEach((poi) => {
      if (!poi || !poi.id) return;
      const node = el.svgHost.querySelector(`[data-poi="${poi.id}"]`);
      if (node) node.setAttribute("data-selected", "true");
    });
  }

  function setField(which, poi, opts = {}) {
    if (!poi) return;
    poi = enrichTripPoi({ ...resolveCampusPoiForUi(poi) });
    const GFRM = gfr();
    // destino em outro andar sem origem → elevador do andar atual
    if (which === "dest" && !state.origin && poi) {
      const destLvl = poiLevel(poi);
      if (destLvl !== state.activeLevel) {
        const hub = elevatorPoiForLevel(state.activeLevel);
        if (hub) {
          state.origin = hub;
          if (el.originInput) el.originInput.value = hub.searchLabel || hub.name;
        }
      }
    }

    state[which] = poi;
    const input = which === "origin" ? el.originInput : el.destInput;
    const displayLabel = (poi.isGenericTemple || (isTemplePoi(poi) && !isTempleEntrancePoi(poi)))
      ? "Templo"
      : (poi.searchLabel || poi.name);
    input.value = displayLabel;
    closeSuggest();
    closeVirtualKeyboard();
    exitMobileSearchMode();
    input.blur();
    highlightSelected();

    if (which === "dest" && poi?.accessNote) {
      toast(poi.accessNote);
    }

    if (!opts.skipRoute && state.origin && state.dest) {
      drawRoute();
      return;
    }
    if (poi && !opts.keepMapLevel && poiMapViewLevel(poi) !== state.activeLevel) {
      const viewLvl = poiMapViewLevel(poi);
      const originLvl = state.origin ? poiMapViewLevel(state.origin) : null;
      if (which === "dest" && isBasementFloor(poiLevel(poi)) && originLvl && !isBasementFloor(originLvl)) {
        setActiveLevel(originLvl, { silent: true, keepTrip: true });
      } else {
        setActiveLevel(viewLvl, { silent: true, keepTrip: true });
      }
    }
  }

  function openField(which) {
    (which === "origin" ? el.originInput : el.destInput).focus();
    renderSuggest(which, "");
  }

  function iconFor() {
    return '<svg viewBox="0 0 24 24" width="16" height="16"><path d="M12 21s7-5.5 7-11a7 7 0 1 0-14 0c0 5.5 7 11 7 11Z" fill="none" stroke="currentColor" stroke-width="1.7"/><circle cx="12" cy="10" r="2.4" fill="currentColor"/></svg>';
  }

  function filterPoisForSearch(query) {
    const rawQ = String(query || "").trim();
    const correction = searchQueryCorrection(rawQ);
    const effectiveQuery = (correction && normSearch(rawQ) !== normSearch(correction))
      ? correction
      : rawQ;
    const q = normSearch(effectiveQuery);
    // Sem texto: não monta centenas de sugestões (evita salto de scroll no mobile e cursor resetado).
    if (!q) return [];
    const startKidsItems = collapseStartKidsSearchResults(effectiveQuery);
    if (startKidsItems?.length) {
      state.groundFloorSearchHint = CONFIG.startKidsSearch?.hint || null;
      return startKidsItems;
    }
    const bebedouroItems = isBebedouroSearchQuery(effectiveQuery)
      ? collapseBebedouroSearchResults()
      : null;
    if (bebedouroItems?.length) {
      state.groundFloorSearchHint = null;
      return bebedouroItems;
    }
    const l06EastRooms = searchL06EastRooms(effectiveQuery);
    if (l06EastRooms.length) {
      state.groundFloorSearchHint = null;
      return l06EastRooms;
    }
    const GFRM = gfr();
    if (GFRM) {
      const { hint, items } = GFRM.search(effectiveQuery, state.navGraph, G.nodes, G.adj);
      // O índice do térreo pode encontrar salas homônimas de outros andares.
      // No L06, não deixa esses resultados ocultarem as salas da ala direita.
      const hasCurrentFloorItem = items.some((item) => poiLevel(item) === state.activeLevel);
      if (items.length && (!isAdmFloor(state.activeLevel) || hasCurrentFloorItem)) {
        state.groundFloorSearchHint = isTempleSearchQuery(effectiveQuery) ? null : hint;
        return collapseTempleSearchResults(items, effectiveQuery);
      }
    }
    state.groundFloorSearchHint = null;
    if (isTempleSearchQuery(effectiveQuery)) {
      return [buildGenericTemplePoi()];
    }
    const onCampus = isCampusFloor(state.activeLevel);
    const results = (G.pois || []).reduce((found, p) => {
      if (!isSearchablePoi(p)) return found;
      const poiLvl = p.level || "L00";
      // No campus (T…L06): lista todos os andares publicados, não só o andar atual
      if (onCampus && !isCampusFloor(poiLvl)) return found;
      if (state.searchLevel && state.searchLevel !== "all" && poiLvl !== state.searchLevel) {
        return found;
      }
      // filtro de grupo
      const g = state.searchGroup || "all";
      if (g === "floor") {
        if (poiLvl !== state.activeLevel) return found;
      } else if (g !== "all") {
        if ((p.group || searchGroupFromPoi(p.rawId, p.name, p.cat)) !== g) return found;
      }
      const score = poiSearchScore(p, effectiveQuery, q);
      if (score) found.push({ p, score });
      return found;
    }, [])
      .sort((a, b) => b.score - a.score || (a.p.searchLabel || a.p.name).localeCompare(b.p.searchLabel || b.p.name, "pt-BR"))
      .map((x) => x.p);
    if (/\btemp|templo|igreja\b/.test(q) || (q.length >= 2 && "templo".startsWith(q))) {
      return collapseTempleSearchResults(
        [buildGenericTemplePoi(), ...results.filter((p) => !isTemplePoi(p) && !isTempleEntrancePoi(p))],
        effectiveQuery
      );
    }
    return dedupeSearchPoiResults(results);
  }

  /** Mantém o cursor no fim ao digitar (evita texto invertido "fc" ao buscar "CF"). */
  function withSearchInputCaret(input, fn, inputEvent) {
    if (!input) {
      fn();
      return;
    }
    const prevLen = input.value.length;
    const inputType = String(inputEvent?.inputType || "");
    fn();
    if (document.activeElement !== input) return;
    const restoreCaret = () => {
      if (document.activeElement !== input) return;
      try {
        const len = input.value.length;
        if (inputType.startsWith("delete") && len <= prevLen) {
          const start = input.selectionStart;
          const end = input.selectionEnd;
          const nextStart = Math.min(typeof start === "number" ? start : len, len);
          const nextEnd = Math.min(typeof end === "number" ? end : len, len);
          input.setSelectionRange(nextStart, nextEnd);
          return;
        }
        input.setSelectionRange(len, len);
      } catch (_) {}
    };
    requestAnimationFrame(restoreCaret);
    requestAnimationFrame(restoreCaret);
  }

  function hereSuggestHtml(which) {
    const isOrigin = which === "origin";
    const name = isOrigin ? "Estou aqui (marcar no mapa)" : "Marcar no mapa (destino)";
    const cat = isOrigin ? "Usar minha posição" : "Toque onde você quer ir";
    return `<li data-here="1" aria-selected="false"><span class="s-ico"><svg viewBox="0 0 24 24" width="16" height="16"><circle cx="12" cy="12" r="3" fill="currentColor"/><circle cx="12" cy="12" r="8" fill="none" stroke="currentColor" stroke-width="1.6"/></svg></span><span><span class="s-name">${name}</span><span class="s-cat">${cat}</span></span></li>`;
  }

  function bindHereSuggestItem(listEl, which) {
    const hereLi = listEl.querySelector("li[data-here]");
    if (hereLi) {
      hereLi.addEventListener("mousedown", (e) => {
        e.preventDefault();
        startPlacingHere(which);
      });
    }
  }

  function renderSuggest(which, query) {
    state.activeField = which;
    const listEl = which === "origin" ? el.originList : el.destList;
    const items = filterPoisForSearch(query);
    const correction = searchQueryCorrection(query);
    const showCorrection = correction
      && normSearch(query)
      && normSearch(query) !== normSearch(correction);

    let html = "";
    if (showCorrection) {
      html += `<li class="s-hint" role="presentation"><span class="s-cat">Você quis dizer: <strong>${correction}</strong>?</span></li>`;
    }
    html += hereSuggestHtml(which);
    if (state.groundFloorSearchHint && items.length
      && (items[0]?.officialAccessNodeId || items[0]?.startKidsGuide)) {
      html += `<li class="s-hint" role="presentation"><span class="s-cat">${state.groundFloorSearchHint}</span></li>`;
    }
    if (!items.length) {
      if (normSearch(query)) {
        html += `<li class="s-empty">Nenhum local encontrado para “${String(query).trim()}”.</li>`;
      }
      listEl.innerHTML = html;
      listEl.hidden = false;
      bindHereSuggestItem(listEl, which);
      return;
    }
    html += items.map((p) => {
      const label = poiSuggestTitle(p);
      const meta = poiSuggestMeta(p);
      return `
      <li data-id="${p.id}" aria-selected="false">
        <span class="s-ico">${iconFor()}</span>
        <span><span class="s-name">${label}</span><span class="s-cat">${meta}</span></span>
      </li>`;
    }).join("");
    listEl.innerHTML = html;
    listEl.hidden = false;

    listEl.querySelectorAll("li[data-id]").forEach((li) => {
      li.addEventListener("mousedown", (e) => {
        e.preventDefault();
        const poi = items.find((p) => p.id === li.dataset.id)
          || G.poisById?.get(li.dataset.id);
        if (poi) setField(which, poi);
      });
    });
    bindHereSuggestItem(listEl, which);
  }

  function closeSuggest() { el.originList.hidden = true; el.destList.hidden = true; }

  /* ============================================================ TECLADO VIRTUAL
     Usado em todos os dispositivos. Alimenta os campos de busca existentes
     disparando os mesmos eventos da digitação física — autocomplete, POI/node
     e rota inalterados, sem abrir o teclado do sistema operacional. */
  let activeSearchInput = null;

  function vkFieldOf(input) {
    if (input?.id === "roomModalSearch") return "room";
    return input && input.id === "destInput" ? "dest" : "origin";
  }

  function openVirtualKeyboard(input) {
    if (!el.virtualKeyboard || !input || input.disabled) return;
    activeSearchInput = input;
    el.virtualKeyboard.hidden = false;
    el.virtualKeyboard.setAttribute("aria-hidden", "false");
  }

  function closeVirtualKeyboard() {
    activeSearchInput = null;
    if (!el.virtualKeyboard) return;
    el.virtualKeyboard.hidden = true;
    el.virtualKeyboard.setAttribute("aria-hidden", "true");
  }

  function vkEmitInput(input, inputType) {
    let ev;
    try {
      ev = new InputEvent("input", { bubbles: true, inputType });
    } catch (_) {
      ev = new Event("input", { bubbles: true });
    }
    input.dispatchEvent(ev);
  }

  function vkCaret(input) {
    const len = input.value.length;
    const start = typeof input.selectionStart === "number" ? input.selectionStart : len;
    const end = typeof input.selectionEnd === "number" ? input.selectionEnd : len;
    return { start: Math.min(start, len), end: Math.min(end, len) };
  }

  function vkSetCaret(input, pos) {
    try { input.setSelectionRange(pos, pos); } catch (_) {}
  }

  function vkInsertText(text) {
    const input = activeSearchInput;
    if (!input) return;
    const { start, end } = vkCaret(input);
    input.value = input.value.slice(0, start) + text + input.value.slice(end);
    vkSetCaret(input, start + text.length);
    vkEmitInput(input, "insertText");
  }

  function vkDeleteBackward() {
    const input = activeSearchInput;
    if (!input) return;
    const { start, end } = vkCaret(input);
    if (start !== end) {
      input.value = input.value.slice(0, start) + input.value.slice(end);
      vkSetCaret(input, start);
    } else {
      if (!start) return;
      input.value = input.value.slice(0, start - 1) + input.value.slice(start);
      vkSetCaret(input, start - 1);
    }
    vkEmitInput(input, "deleteContentBackward");
  }

  /** Buscar: resolve o melhor POI pela mesma busca do autocomplete e confirma o campo. */
  function vkCommitSearch() {
    const input = activeSearchInput;
    if (!input) return;
    const which = vkFieldOf(input);
    const query = String(input.value || "").trim();
    closeVirtualKeyboard();
    if (which === "room") {
      renderRoomModal();
      input.blur();
      return;
    }
    if (!state[which] && query) {
      const best = filterPoisForSearch(query)[0];
      // setField já grava POI/node, fecha sugestões e traça a rota quando há origem+destino
      if (best) { setField(which, best); return; }
    }
    closeSuggest();
    input.blur();
    if (state.origin && state.dest) drawRoute();
  }

  function initVirtualKeyboard() {
    const kb = el.virtualKeyboard;
    if (!kb) return;

    // teclas não podem roubar o foco do input ativo
    const keepFocus = (e) => { if (e.target.closest("button")) e.preventDefault(); };
    kb.addEventListener("pointerdown", keepFocus);
    kb.addEventListener("mousedown", keepFocus);

    kb.addEventListener("click", (e) => {
      const btn = e.target.closest("button");
      if (!btn || !kb.contains(btn)) return;
      e.preventDefault();
      if (!activeSearchInput) return;
      if (btn.classList.contains("search")) { vkCommitSearch(); return; }
      if (btn.classList.contains("back")) { vkDeleteBackward(); return; }
      if (btn.classList.contains("space")) { vkInsertText(" "); return; }
      const key = (btn.textContent || "").trim();
      if (key) vkInsertText(key);
    });

    document.addEventListener("keydown", (e) => {
      if (e.key === "Escape" && activeSearchInput) closeVirtualKeyboard();
    });

  }

  /* ---- Mobile: painel no topo quando o teclado abre ---- */
  let mobileSearchExitTimer = null;

  function isMobileLayout() {
    return window.innerWidth <= 860;
  }

  function syncVisualViewportVars() {
    const vv = window.visualViewport;
    const top = vv ? vv.offsetTop : 0;
    const height = vv ? vv.height : window.innerHeight;
    document.documentElement.style.setProperty("--vv-top", `${Math.max(0, top)}px`);
    document.documentElement.style.setProperty("--vv-height", `${Math.max(180, height)}px`);
  }

  function enterMobileSearchMode() {
    if (!isMobileLayout() || !el.panel) return;
    clearTimeout(mobileSearchExitTimer);
    const wasSearching = el.panel.classList.contains("is-searching");
    if (!el.panel.classList.contains("open")) setPanelOpen(true);
    el.panel.classList.add("is-searching");
    document.body.classList.add("is-searching-mobile");
    syncVisualViewportVars();
    // scrollIntoView só na 1ª entrada — repetir a cada tecla no mobile resetava o cursor
    if (!wasSearching) {
      requestAnimationFrame(() => {
        const active = document.activeElement;
        if (active && el.panel.contains(active) && typeof active.scrollIntoView === "function") {
          active.scrollIntoView({ block: "nearest", inline: "nearest" });
        }
      });
    }
  }

  function exitMobileSearchMode() {
    if (!el.panel) return;
    clearTimeout(mobileSearchExitTimer);
    el.panel.classList.remove("is-searching");
    document.body.classList.remove("is-searching-mobile");
  }

  function scheduleExitMobileSearchMode() {
    clearTimeout(mobileSearchExitTimer);
    mobileSearchExitTimer = setTimeout(() => {
      const active = document.activeElement;
      if (active === el.originInput || active === el.destInput) return;
      if (active && el.panel?.contains(active) && active.closest?.(".suggest")) return;
      exitMobileSearchMode();
    }, 180);
  }

  function initMobileViewport() {
    syncGpsAvailability();
    syncVisualViewportVars();
    const onVV = () => {
      syncGpsAvailability();
      syncVisualViewportVars();
      if (isMobileLayout() && el.panel?.classList.contains("is-searching")) {
        // se o teclado fechou e nenhum campo tem foco, sai do modo busca
        const active = document.activeElement;
        const focused = active === el.originInput || active === el.destInput;
        if (!focused) exitMobileSearchMode();
      }
      if (document.body.classList.contains("is-navigating") && isMobileLayout()) {
        fitMobileNavRouteView();
      }
    };
    if (window.visualViewport) {
      window.visualViewport.addEventListener("resize", onVV);
      window.visualViewport.addEventListener("scroll", onVV);
    }
    window.addEventListener("resize", onVV);
    if (window.matchMedia) {
      window.matchMedia("(max-width: 860px)").addEventListener("change", syncGpsAvailability);
    }
  }


  function refreshOpenSuggest() {
    if (state.activeField === "origin" && el.originList && !el.originList.hidden) {
      withSearchInputCaret(el.originInput, () => renderSuggest("origin", el.originInput.value));
    } else if (state.activeField === "dest" && el.destList && !el.destList.hidden) {
      withSearchInputCaret(el.destInput, () => renderSuggest("dest", el.destInput.value));
    }
  }

  function searchGroupLabel(id) {
    const g = (CONFIG.searchGroups || []).find((x) => x.id === id);
    return g?.label || "Áreas";
  }

  function updateAreaChrome() {
    const active = state.searchGroup || "all";
    const label = searchGroupLabel(active);
    if (el.areaBtn) {
      el.areaBtn.title = active === "all" ? "Filtrar áreas" : `Área: ${label}`;
      el.areaBtn.setAttribute("aria-label", active === "all" ? "Filtrar áreas" : `Filtrar áreas · ${label}`);
    }
    if (el.areaBadge) el.areaBadge.hidden = active === "all";
  }

  function closeAreaMenu() {
    state.areaMenuOpen = false;
    if (el.areaMenu) el.areaMenu.hidden = true;
    if (el.areaBtn) el.areaBtn.setAttribute("aria-expanded", "false");
  }

  function roomModalPoisForFloor(floorId) {
    const listed = (G.pois || []).filter((poi) =>
      isSearchablePoi(poi)
      && poiDisplayLevel(poi) === floorId
    );
    // “Templo” é um destino geral com múltiplas entradas, criado pela
    // navegação em vez de existir como um POI único no SVG.
    const generalDestinations = floorId === "L00" ? [buildGenericTemplePoi()] : [];
    const l06Rooms = floorId === "L06" ? searchL06EastRooms("sala", floorId) : [];
    const seen = new Set();
    return [...listed, ...generalDestinations, ...l06Rooms]
      .filter((poi) => {
        const key = normSearch(poi.searchLabel || poi.name)
          .replace(/\b(?:l[0-6]|b[0-2]|terreo)\b/g, "")
          .replace(/\s+/g, " ")
          .trim();
        if (!key || seen.has(key)) return false;
        seen.add(key);
        return true;
      })
      .sort((a, b) => (a.searchLabel || a.name).localeCompare(b.searchLabel || b.name, "pt-BR", { numeric: true }));
  }

  function renderRoomModal() {
    if (!el.roomModalFloors || !el.roomModalRooms) return;
    const floors = visibleFloors().filter((floor) => isCampusFloor(floor.id));
    const selectedFloor = state.roomModalFloor || state.activeLevel || "L00";
    const query = normSearch(el.roomModalSearch?.value || "");
    el.roomModalFloors.innerHTML = floors.map((floor) =>
      `<button type="button" class="room-modal__floor ${floor.id === selectedFloor ? "is-active" : ""}"
        data-room-floor="${floor.id}" role="tab" aria-selected="${floor.id === selectedFloor}">${formatFloorTag(floor.id)}</button>`
    ).join("");
    const rooms = roomModalPoisForFloor(selectedFloor).filter((poi) => {
      if (!query) return true;
      return poiSearchScore(poi, query, query) > 0;
    });
    if (!rooms.length) {
      el.roomModalRooms.innerHTML = `<p class="room-modal__empty">Nenhum local encontrado neste andar.</p>`;
    } else {
      el.roomModalRooms.innerHTML = rooms.map((poi) => {
        const isOrigin = state.roomModalOrigin?.id === poi.id;
        const isDest = state.roomModalDest?.id === poi.id;
        const role = isOrigin ? "is-origin" : (isDest ? "is-destination" : "");
        const selectionLabel = isOrigin ? "Local de partida" : (isDest ? "Local de destino" : "Selecionar local");
        return `<button type="button" class="room-modal__room ${role}"
          data-room-id="${poi.id}" aria-selected="${isOrigin || isDest}" aria-label="${selectionLabel}: ${poi.searchLabel || poi.name}">${poi.searchLabel || poi.name}</button>`;
      }).join("");
    }
    el.roomModalFloors.querySelectorAll("[data-room-floor]").forEach((btn) => {
      btn.addEventListener("click", () => {
        state.roomModalFloor = btn.dataset.roomFloor;
        renderRoomModal();
      });
    });
    el.roomModalRooms.querySelectorAll("[data-room-id]").forEach((btn) => {
      btn.addEventListener("click", () => {
        const room = rooms.find((poi) => poi.id === btn.dataset.roomId);
        if (!room) return;
        if (!state.roomModalOrigin || (state.roomModalOrigin && state.roomModalDest)) {
          state.roomModalOrigin = room;
          state.roomModalDest = null;
        } else if (state.roomModalOrigin.id !== room.id) {
          state.roomModalDest = room;
        }
        renderRoomModal();
      });
    });
    if (el.roomModalGo) el.roomModalGo.disabled = !(state.roomModalOrigin && state.roomModalDest);
  }

  function closeRoomModal() {
    if (!el.roomSelectModal) return;
    el.roomSelectModal.hidden = true;
    el.roomSelectModal.setAttribute("aria-hidden", "true");
  }

  function openRoomModal() {
    if (!el.roomSelectModal) return;
    closeAreaMenu();
    closeSuggest();
    closeVirtualKeyboard();
    state.roomModalFloor = isCampusFloor(state.activeLevel) ? state.activeLevel : "L00";
    state.roomModalOrigin = null;
    state.roomModalDest = null;
    if (el.roomModalSearch) el.roomModalSearch.value = "";
    el.roomSelectModal.hidden = false;
    el.roomSelectModal.setAttribute("aria-hidden", "false");
    renderRoomModal();
    requestAnimationFrame(() => {
      el.roomModalSearch?.focus();
      openVirtualKeyboard(el.roomModalSearch);
    });
  }

  function confirmRoomModalSelection() {
    const origin = state.roomModalOrigin;
    const dest = state.roomModalDest;
    if (!origin || !dest) return;
    closeRoomModal();
    setSearchGroup("salas");
    setField("origin", origin, { skipRoute: true });
    // A rota pelo seletor abre sempre no andar da partida. O destino continua
    // registrado normalmente, mas não troca a visualização antes do traçado.
    setField("dest", dest, { skipRoute: true, keepMapLevel: true });
    drawRoute();
  }

  function renderAreaMenu() {
    if (!el.areaMenu) return;
    // O botão de filtros abre somente o seletor completo de locais/salas.
    const groups = (CONFIG.searchGroups || []).filter((group) => group.id === "salas");
    el.areaMenu.innerHTML = groups.map((g) => {
      const selected = g.id === state.searchGroup;
      return `<li role="option">
        <button type="button" class="floor-menu__item" data-group="${g.id}"
          aria-selected="${selected ? "true" : "false"}">
          <span>${g.label}</span>
          ${selected ? `<span class="floor-menu__meta">Ativo</span>` : ""}
        </button>
      </li>`;
    }).join("");
    el.areaMenu.querySelectorAll("[data-group]").forEach((btn) => {
      btn.addEventListener("click", (e) => {
        e.preventDefault();
        if (btn.dataset.group === "salas") {
          openRoomModal();
          return;
        }
        setSearchGroup(btn.dataset.group);
        closeAreaMenu();
      });
    });
  }

  function toggleAreaMenu() {
    if (state.floorMenuOpen) closeFloorMenu();
    state.areaMenuOpen = !state.areaMenuOpen;
    if (el.areaMenu) el.areaMenu.hidden = !state.areaMenuOpen;
    if (el.areaBtn) el.areaBtn.setAttribute("aria-expanded", state.areaMenuOpen ? "true" : "false");
    if (state.areaMenuOpen) renderAreaMenu();
  }

  function setSearchGroup(groupId) {
    state.searchGroup = groupId || "all";
    updateAreaChrome();
    refreshOpenSuggest();
  }

  function initBrowseFilters() {
    updateAreaChrome();
    if (el.searchLevelSelect) {
      const floors = visibleFloors().filter((f) => isCampusFloor(f.id));
      state.searchLevel = state.searchLevel || "all";
      el.searchLevelSelect.innerHTML = [
        `<option value="all">Todos os níveis</option>`,
        ...floors.map((f) => `<option value="${f.id}">${formatFloorTag(f.id)} — ${f.title}</option>`),
      ].join("");
      if (!el.searchLevelSelect.querySelector(`option[value="${state.searchLevel}"]`)) {
        state.searchLevel = "all";
      }
      el.searchLevelSelect.value = state.searchLevel || "all";
      el.searchLevelSelect.addEventListener("change", () => {
        state.searchLevel = el.searchLevelSelect.value || "all";
        refreshOpenSuggest();
      });
    }
  }

  /* ============================================================ "ESTOU AQUI" / MARCAR NO MAPA */
  function startPlacingHere(which = "origin") {
    state.placingHere = true;
    state.placingHereField = which === "dest" ? "dest" : "origin";
    closeSuggest();
    closeVirtualKeyboard();
    el.viewport.style.cursor = "crosshair";
    if (isMobileLayout()) setPanelOpen(false);
    toast(which === "dest"
      ? "Toque no mapa onde você quer ir."
      : "Toque no mapa onde você está.");
  }

  /** Snap “Estou aqui” para âncora de POI quando o clique cai na área do local (ex.: CF). */
  function snapHereToPoiZone(p, lvl) {
    if (lvl !== "L00") return null;
    const anchors = CONFIG.poiAnchors || {};
    for (const z of CONFIG.herePoiSnapZones || []) {
      if (p.x < z.x0 || p.x > z.x1 || p.y < z.y0 || p.y > z.y1) continue;
      const nodeId = z.nodeId || anchors[z.poiId];
      const node = nodeId && state.navGraph?.nodesById.get(nodeId);
      if (!node) continue;
      return {
        id: nodeId,
        x: node.x,
        y: node.y,
        d: Math.hypot(p.x - node.x, p.y - node.y),
        nearPoiId: z.poiId || null,
      };
    }
    const icons = CONFIG.poiIconCampus || {};
    const radius = CONFIG.herePoiSnapRadius || 55;
    let best = null;
    for (const [poiId, icon] of Object.entries(icons)) {
      const nodeId = anchors[poiId];
      if (!nodeId) continue;
      const d = Math.hypot(p.x - icon.x, p.y - icon.y);
      if (d > radius) continue;
      const node = state.navGraph?.nodesById.get(nodeId);
      if (!node) continue;
      if (!best || d < best.d) best = { id: nodeId, x: node.x, y: node.y, d, nearPoiId: poiId };
    }
    return best;
  }

  /** Resolve o node de partida ao clicar diretamente em um POI no modo "Estou aqui". */
  function resolveHerePoiStartNode(poi) {
    if (!poi || !state.navGraph) return null;
    const parsed = l00()?.parsePoiLayerName(poi.rawId || poi.id || "");
    const directIds = [
      poi.nodeId,
      parsed?.accessNodeId,
      poi.officialAccessNodeId,
      poi.graphNodeId,
      poi.anchor,
      ...(poi.navNodeIds || []),
    ].filter(Boolean);

    // A nomenclatura _node_XXXX e os nodes oficiais têm precedência absoluta.
    for (const id of directIds) {
      const resolved = resolveGraphNodeId(id) || id;
      if (state.navGraph.nodesById.has(resolved) && graphNodeHasEdges(resolved)) {
        return resolved;
      }
    }

    // Sem node associado: usa apenas o node navegável mais próximo da porta/âncora.
    const level = poiLevel(poi) || state.activeLevel || "L00";
    const accessPoint = poiRouteAnchor(poi) || poi.snap || poiIcon(poi) || poi;
    const nearest = globalThis.NavigationRouter?.nearestNodeId(accessPoint, state.navGraph, {
      level,
      avoidParking: true,
    });
    return nearest && graphNodeHasEdges(nearest) ? nearest : null;
  }

  function snapMapPointToNavMesh(p, lvl) {
    lvl = lvl || state.activeLevel || "L00";
    const maxSnap = lvl === "L00" ? 120 : 55;
    let snap = snapHereToPoiZone(p, lvl);

    if (!snap && state.navGraph && globalThis.NearestGraphPoint?.findNearestValidNavNode) {
      const hit = NearestGraphPoint.findNearestValidNavNode(p, state.navGraph, {
        level: lvl,
        maxDistanceSvg: maxSnap,
        metersPerUnit: G.metersPerUnit || CONFIG.metersPerUnit || 0.35,
      });
      if (hit?.id && hit.node) {
        snap = { id: hit.id, x: hit.node.x, y: hit.node.y, d: hit.distanceSvg };
      }
    }

    if (!snap && state.navGraph && globalThis.NearestGraphPoint?.findNearestWalkableEdge) {
      const edgeHit = NearestGraphPoint.findNearestWalkableEdge(p, state.navGraph, {
        level: lvl,
        maxDistanceSvg: maxSnap,
        metersPerUnit: G.metersPerUnit || CONFIG.metersPerUnit || 0.35,
      });
      if (edgeHit?.nearestNodeId) {
        const node = state.navGraph.nodesById.get(edgeHit.nearestNodeId);
        if (node) {
          snap = {
            id: edgeHit.nearestNodeId,
            x: node.x,
            y: node.y,
            d: edgeHit.distanceSvg,
          };
        }
      }
    }

    if (!snap && state.navGraph && globalThis.NavigationRouter) {
      const nid = NavigationRouter.nearestNodeId(p, state.navGraph, { level: lvl });
      const node = nid && state.navGraph.nodesById.get(nid);
      if (node && isFinite(node.x) && isFinite(node.y)) {
        const d = Math.hypot(p.x - node.x, p.y - node.y);
        if (d <= maxSnap * 1.35) snap = { id: nid, x: node.x, y: node.y, d };
      }
    }

    if (!snap && lvl === "L00") {
      const routable = nearestRoutableNode(p, true, maxSnap) || nearestRoutableNode(p, false, maxSnap);
      snap = routable
        ? { id: routable.id, x: routable.n.x, y: routable.n.y, d: routable.d }
        : null;
      if (snap?.id) attachNodeToMeshSafe(snap.id, true);
    }

    return snap?.id ? snap : null;
  }

  function buildMapPickPoi(snap, clickPt, field) {
    const lvl = state.activeLevel || "L00";
    const mappedPoi = poiForNavNode(snap.id);
    if (mappedPoi && field === "origin") {
      applyInjectedPoiIcon(mappedPoi);
      mappedPoi.anchor = snap.id;
      mappedPoi.snap = { x: snap.x, y: snap.y };
      mappedPoi.navNodeIds = [snap.id];
      return mappedPoi;
    }
    if (snap.nearPoiId) {
      const poi = (G.pois || []).find((p) => poiRawKey(p) === snap.nearPoiId && isSearchablePoi(p));
      if (poi) {
        applyInjectedPoiIcon(poi);
        poi.anchor = snap.id;
        poi.snap = { x: snap.x, y: snap.y };
        poi.navNodeIds = [snap.id];
        return poi;
      }
    }
    const isDest = field === "dest";
    const herePoi = {
      id: "__here__",
      name: isDest ? "Ponto no mapa" : "Estou aqui",
      searchLabel: isDest ? "Chegar aqui (mapa)" : "Sair daqui (mapa)",
      x: snap.x,
      y: snap.y,
      iconX: clickPt.x,
      iconY: clickPt.y,
      anchor: snap.id,
      snap: { x: snap.x, y: snap.y },
      nearPoiId: snap.nearPoiId || null,
      cat: "acesso",
      level: lvl,
      navNodeIds: [snap.id],
    };
    if (!isDest) state.here = herePoi;
    return herePoi;
  }

  let mapPickGeoCache = null;
  async function geoForMapPick() {
    if (mapPickGeoCache?.latLngToSvg) return mapPickGeoCache;
    let data = null;
    try {
      const res = await fetch("data/geo-reference.json", { cache: "no-store" });
      if (res.ok) data = await res.json();
    } catch (_) {}
    if (!data) return null;
    mapPickGeoCache = globalThis.GeoTransform?.createFromGeoReference?.(data) || null;
    return mapPickGeoCache;
  }

  async function resolveOriginForDestPick() {
    if (!isGpsEnabled()) return null;
    if (state.origin) return state.origin;
    const nav = state.userLocation?.getNavigationState?.();
    if (!nav?.gpsAvailable || nav.latitude == null || nav.longitude == null) return null;

    const geo = await geoForMapPick();
    const svgPt = geo?.latLngToSvg?.(nav.latitude, nav.longitude);
    if (!svgPt) return null;

    await ensureNavGraphForTrip("L00", state.activeLevel);
    const snap = snapMapPointToNavMesh(svgPt, "L00");
    if (!snap?.id) return null;

    const herePoi = {
      id: "__here__",
      name: "Estou aqui (GPS)",
      searchLabel: "Estou aqui (GPS)",
      x: snap.x,
      y: snap.y,
      iconX: svgPt.x,
      iconY: svgPt.y,
      anchor: snap.id,
      snap: { x: snap.x, y: snap.y },
      cat: "acesso",
      level: "L00",
      navNodeIds: [snap.id],
      gps: {
        source: "GPS",
        latitude: nav.latitude,
        longitude: nav.longitude,
        accuracy: nav.accuracy,
      },
    };
    state.here = herePoi;
    state.mapPickOrigin = { x: snap.x, y: snap.y };
    return herePoi;
  }

  function placeHere(p) {
    const field = state.placingHereField || "origin";
    const lvl = state.activeLevel || "L00";
    const snap = snapMapPointToNavMesh(p, lvl);

    if (!snap?.id) {
      toast("Toque mais perto de um corredor ou porta deste andar.");
      return;
    }

    if (snap.nearPoiId) {
      const poi = (G.pois || []).find((p) => poiRawKey(p) === snap.nearPoiId && isSearchablePoi(p));
      if (poi) {
        applyInjectedPoiIcon(poi);
        poi.anchor = snap.id;
        poi.snap = { x: snap.x, y: snap.y };
        poi.navNodeIds = [snap.id];
        state._ignoreNextPoiClick = true;
        setField(field, poi);
        state.placingHere = false;
        state.placingHereField = "origin";
        el.viewport.style.cursor = "";
        toast(field === "dest"
          ? `${poi.searchLabel || poi.name} marcado como destino.`
          : `${poi.searchLabel || poi.name} marcado como origem.`);
        return;
      }
    }

    const mappedPoi = poiForNavNode(snap.id);
    if (mappedPoi) {
      applyInjectedPoiIcon(mappedPoi);
      mappedPoi.anchor = snap.id;
      mappedPoi.snap = { x: snap.x, y: snap.y };
      mappedPoi.navNodeIds = [snap.id];
      state._ignoreNextPoiClick = true;
      setField(field, mappedPoi);
      state.placingHere = false;
      state.placingHereField = "origin";
      el.viewport.style.cursor = "";
      toast(field === "dest"
        ? `${mappedPoi.searchLabel || mappedPoi.name} marcado como destino.`
        : `${mappedPoi.searchLabel || mappedPoi.name} marcado como origem.`);
      return;
    }

    const herePoi = {
      id: "__here__",
      name: field === "dest" ? "Marcar no mapa" : "Estou aqui",
      searchLabel: field === "dest" ? "Marcar no mapa (destino)" : "Estou aqui (marcar no mapa)",
      x: snap.x,
      y: snap.y,
      iconX: p.x,
      iconY: p.y,
      anchor: snap.id,
      snap: { x: snap.x, y: snap.y },
      nearPoiId: snap.nearPoiId || null,
      cat: "acesso",
      level: lvl,
      navNodeIds: [snap.id],
    };
    if (field === "origin") state.here = herePoi;
    state._ignoreNextPoiClick = true;
    setField(field, herePoi);
    // LP: ponto azul “hereMarker” permanece oculto
    if (el.hereMarker) {
      el.hereMarker.hidden = true;
      el.hereMarker.setAttribute("hidden", "");
      el.hereMarker.setAttribute("visibility", "hidden");
      el.hereMarker.style.display = "none";
    }
    state.placingHere = false;
    state.placingHereField = "origin";
    el.viewport.style.cursor = "";
    toast(field === "dest"
      ? "Destino marcado no mapa."
      : "Posição marcada neste andar. Agora escolha o destino.");
  }

  /* ============================================================ PAN / ZOOM
     Zoom altera width/height do SVG (vetor nítido), NÃO usa scale() CSS
     — scale() CSS rasteriza e deixa o mapa borrado em zoom. */
  const mapCtrl = globalThis.PIBMapMapController?.create?.({
    state,
    G,
    el,
    refreshRouteMarkerScales,
    mobileMapPadding,
    onMapViewChanged: () => state._repositionMapPickMenu?.(),
  }) || {};
  const apply = mapCtrl.apply || function () {};
  const clamp = mapCtrl.clamp || function () {};
  const fit = mapCtrl.fit || function () {};
  const fitSoon = mapCtrl.fitSoon || function (fn) { requestAnimationFrame(() => requestAnimationFrame(fn || fit)); };
  const zoomAt = mapCtrl.zoomAt || function () {};
  const viewportPoint = mapCtrl.viewportPoint || function () { return { x: 0, y: 0 }; };
  const svgPointToClient = mapCtrl.svgPointToClient || function () { return { x: 0, y: 0 }; };

  function fitToPoints(pts, opts = {}) {
    if (!pts?.length) return;
    const r = el.viewport.getBoundingClientRect();
    if (!r.width || !r.height) return;

    const xs = pts.map((p) => p.x).filter(isFinite);
    const ys = pts.map((p) => p.y).filter(isFinite);
    if (!xs.length || !ys.length) return;

    const minX = Math.min(...xs);
    const maxX = Math.max(...xs);
    const minY = Math.min(...ys);
    const maxY = Math.max(...ys);
    const minSpan = opts.minSpan ?? 64;
    const w = Math.max(minSpan, maxX - minX);
    const h = Math.max(minSpan, maxY - minY);

    const mobile = innerWidth <= 860;
    let padLeft;
    let padRight;
    let padTop;
    let padBottom;
    if (mobile) {
      const mp = mobileMapPadding(opts);
      padLeft = mp.padLeft;
      padRight = mp.padRight;
      padTop = mp.padTop;
      padBottom = mp.padBottom;
    } else {
      const padX = opts.padX ?? 100;
      padLeft = padRight = padX;
      padTop = opts.padTop ?? 100;
      padBottom = opts.padBottom ?? (opts.navMode ? 200 : 100);
    }

    const availW = Math.max(60, r.width - padLeft - padRight);
    const availH = Math.max(60, r.height - padTop - padBottom);
    const scaleW = availW / w;
    const scaleH = availH / h;
    const widthMargin = opts.widthMargin ?? (opts.fillWidth ? 0.94 : 0.9);
    let nextScale;
    if (opts.fillWidth) {
      // Prioriza preencher a largura útil (como apps de navegação).
      nextScale = scaleW * widthMargin;
      const heightCap = scaleH * 1.06;
      if (nextScale > heightCap && h > w * 1.25) nextScale = heightCap;
    } else {
      nextScale = Math.min(scaleW, scaleH) * widthMargin;
    }
    nextScale = Math.min(
      state.maxScale,
      Math.max(state.minScale * 0.35, nextScale),
    );
    state.scale = nextScale;

    // viewBox dos andares começa em (vbX, vbY) — o pan opera no espaço local do SVG
    const vbX = G.vbX || 0;
    const vbY = G.vbY || 0;
    const midX = (minX + maxX) / 2 - vbX;
    const midY = (minY + maxY) / 2 - vbY;
    const focusCX = padLeft + availW / 2;
    const focusCY = padTop + availH / 2;
    state.panX = focusCX - midX * state.scale;
    state.panY = focusCY - midY * state.scale;
    clamp();
    apply();
  }

  function activeLegPoints(route = state.route) {
    if (!route) return [];
    const { points } = routePointsForLevel(route, state.activeLevel);
    return points.length >= 2 ? points : [];
  }

  /** Mantém o mapa completo centralizado; a rota permanece visível no andar ativo. */
  function fitRouteInView(_route, _opts = {}) {
    syncNavLayoutMetrics();
    fit();
  }

  /** Navegação passo a passo: mesmo enquadramento do mapa completo. */
  function fitNavSegment() {
    syncNavLayoutMetrics();
    fit();
  }


  /* ============================================================ NAVEGACAO / BUSSOLA */
  function bearingBetween(a, b) {
    // angulo em graus, 0 = para cima (norte do mapa), sentido horario
    return (Math.atan2(b.x - a.x, -(b.y - a.y)) * 180) / Math.PI;
  }

  function navSegments() {
    const p = navViewPoints();
    return Math.max(0, p.length - 1);
  }

  function enterNav() {
    if (!canStartNavigation()) return;
    if (navSegments() < 1) { toast("Rota inválida para navegação."); return; }
    state.navIdx = 0;

    const ensureStartFloor = () => {
      const oLvl = poiLevel(state.origin);
      const dLvl = poiLevel(state.dest);
      return ensureNavGraphForTrip(oLvl, dLvl).then(() => {
        rebuildRouteLegs(state.route);
        const viewLevel = routeInitialViewLevel(state.route, oLvl, dLvl);
        if (state.activeLevel === viewLevel) return;
        return setActiveLevel(viewLevel, { silent: true, keepTrip: true });
      });
    };

    ensureStartFloor().then(() => {
    state.navIdx = 0;
    state.guideStepIdx = 0;
    if (isMobileLayout()) {
      el.panel.classList.add("open", "panel--nav-compact");
      el.originInput?.setAttribute("readonly", "readonly");
      el.destInput?.setAttribute("readonly", "readonly");
    } else {
      el.panel.classList.add("open");
    }
    if (el.summary) el.summary.hidden = false;
    el.navOverlay.hidden = true;
    el.navOverlay.classList.remove("is-open");
    el.navOverlay.setAttribute("aria-hidden", "true");
    document.body.classList.add("is-navigating");
    syncMapToolsPlacement();
    paintActiveRouteLeg();
    renderRouteSteps(state.route);
    if (el.routePick) el.routePick.hidden = true;
    if (el.routeOptions) {
      el.routeOptions.hidden = true;
    }
    if (el.routePickCount) el.routePickCount.hidden = true;
    state.routePickOpen = false;
    state.userLocation?.setFollowMode?.("off");
    state.userLocation?.hidePuck?.();
    if (isGpsEnabled() && state.origin?.id === "__here__") {
      state.userLocation?.setFollowMode?.("follow");
      state.userLocation?.startFollowing?.().catch(() => {
        state.userLocation?.start?.({ silent: true });
      });
    }
    updateSummaryChrome();
    updateGuideNav({ fitCamera: false });
    if (isMobileLayout()) {
      fitMobileNavRouteView();
      fitMobileNavRouteView(180);
    } else {
      fitSoon(() => fitRouteInView(state.route, { navMode: true, preferActiveLeg: true }));
    }
    });
  }

  function exitNav(msg) {
    state.gpsOrientation?.getTracking()?.stop();
    state.gpsOrientation?.setGpsButtonState?.("IDLE");
    el.navOverlay.hidden = true;
    el.navOverlay.classList.remove("is-open");
    el.navOverlay.setAttribute("aria-hidden", "true");
    document.body.classList.remove("is-navigating");
    el.panel.classList.remove("panel--nav-compact");
    el.originInput?.removeAttribute("readonly");
    el.destInput?.removeAttribute("readonly");
    syncNavLayoutMetrics();
    state.navIdx = 0;
    state.guideStepIdx = 0;
    updateSummaryChrome();
    syncMapToolsPlacement();
    if (msg) toast(msg);
  }

  function navPrev() {
    if (!state.route) return;
    state.navIdx = Math.max(0, state.navIdx - 1);
    updateNav({ fitCamera: true });
  }

  function navNext() {
    if (!state.route) return;
    const total = navSegments();
    if (total < 1) {
      if (advanceToNextRouteLeg()) return;
      exitNav("Rota inválida.");
      return;
    }
    if (state.navIdx >= total - 1) {
      if (advanceToNextRouteLeg()) return;
      setRouteVisualCompleted(true);
      paintActiveRouteLeg();
      exitNav("Você chegou ao destino!");
      return;
    }
    state.navIdx += 1;
    syncRouteFloorToNavProgress(state.navIdx);
    updateNav({ fitCamera: true });
  }

  function updateNav(opts = {}) {
    const p = navViewPoints();
    if (!p || p.length < 2) {
      el.navStepText.textContent = "Sem trechos na rota";
      el.navDistText.textContent = "—";
      el.navHint.textContent = "Saia e trace a rota novamente.";
      return;
    }

    const total = p.length - 1;
    const i = Math.max(0, Math.min(state.navIdx, total - 1));
    state.navIdx = i;
    const from = p[i];
    const to = p[i + 1];
    if (!from || !to) return;

    const mapBearing = bearingBetween(from, to);
    const arrowRot = `rotate(${mapBearing - state.heading}deg)`;
    el.compassArrow.style.transform = arrowRot;
    if (el.navDirArrow) el.navDirArrow.style.transform = arrowRot;

    const segLen = dist(from, to);
    const remaining = navRemainingLength(i);
    const isLast = i >= total - 1;
    if (isLast) {
      el.navStepText.textContent = `Chegando: ${state.dest?.name || "destino"}`;
    } else {
      const t = turnLabel(p[i], p[i + 1], p[i + 2] || to);
      el.navStepText.textContent = t.txt;
    }
    el.navDistText.textContent = `${fmtMeters(segLen)} · trecho ${i + 1} de ${total}`;
    if (el.navTimeRemain) el.navTimeRemain.textContent = fmtNavTimeShort(remaining);
    if (el.navDistRemain) el.navDistRemain.textContent = fmtMeters(remaining);
    if (el.navProgressFill) {
      const pct = total > 0 ? Math.round((i / total) * 100) : 0;
      el.navProgressFill.style.width = `${pct}%`;
    }
    el.navHint.textContent = state._hasOrientation
      ? "Aponte o celular à frente: a seta indica a direção."
      : "Bússola indisponível — a seta usa o norte do mapa.";

    el.navPrev.disabled = i <= 0;
    el.navNext.textContent = isLast ? "Chegar" : "Próximo";

    if (opts.fitCamera) {
      fitSoon(() => {
        syncNavLayoutMetrics();
        fitNavSegment();
      });
    } else if (isMobileLayout()) {
      syncNavLayoutMetrics();
    }
  }

  function requestOrientation() {
    if (state._orientBound) return;
    const handler = (ev) => {
      let h = ev.webkitCompassHeading != null
        ? ev.webkitCompassHeading
        : (ev.alpha != null ? 360 - ev.alpha : null);
      if (h != null) {
        state.heading = h;
        state._hasOrientation = true;
        if (el.navOverlay.classList.contains("is-open")) updateNav();
      }
    };
    const bindOrient = () => {
      state._orientBound = true;
      addEventListener("deviceorientationabsolute", handler, true);
      addEventListener("deviceorientation", handler, true);
    };
    if (typeof DeviceOrientationEvent !== "undefined" && typeof DeviceOrientationEvent.requestPermission === "function") {
      DeviceOrientationEvent.requestPermission().then((s) => { if (s === "granted") bindOrient(); }).catch(() => {});
    } else if (typeof DeviceOrientationEvent !== "undefined") {
      bindOrient();
    }
  }

  /* ============================================================ ANDARES (B01–B02, L00–L07) */
  function levelFromId(id) {
    const s = String(id || "");
    const m =
      s.match(/(?:^|_)(B0[12]|L0[0-7])(?=_|$)/i) ||
      s.match(/\b(B0[12]|L0[0-7])\b/i);
    return m ? m[1].toUpperCase() : null;
  }

  function floorById(id) {
    return (CONFIG.floors || []).find((f) => f.id === id) || null;
  }

  /** Andares exibidos ao usuário (oculta L07 etc.). */
  function visibleFloors() {
    return (CONFIG.floors || []).filter((f) => !f.hidden);
  }

  function poisForActiveLevel() {
    return (G.pois || []).filter((p) => (p.level || "L00") === state.activeLevel && isSearchablePoi(p));
  }

  function closeFloorMenu() {
    state.floorMenuOpen = false;
    if (el.floorMenu) el.floorMenu.hidden = true;
    if (el.floorBtn) el.floorBtn.setAttribute("aria-expanded", "false");
  }

  function toggleFloorMenu() {
    if (state.areaMenuOpen) closeAreaMenu();
    state.floorMenuOpen = !state.floorMenuOpen;
    if (el.floorMenu) el.floorMenu.hidden = !state.floorMenuOpen;
    if (el.floorBtn) el.floorBtn.setAttribute("aria-expanded", state.floorMenuOpen ? "true" : "false");
    if (state.floorMenuOpen) renderFloorMenu();
  }

  function renderFloorMenu() {
    if (!el.floorMenu) return;
    const floors = visibleFloors();
    el.floorMenu.innerHTML = floors.map((f) => {
      const selected = f.id === state.activeLevel;
      const available = !!(f.mapUrl || f.ready);
      const meta = floorMenuMeta(f);
      return `<li role="option">
        <button type="button" class="floor-menu__item${available ? "" : " floor-menu__item--soon"}" data-floor="${f.id}"
          aria-selected="${selected ? "true" : "false"}">
          <span class="floor-menu__text">
            <span class="floor-menu__title">${formatFloorTag(f.id)} — ${f.title}</span>
            ${f.subtitle ? `<span class="floor-menu__sub">${f.subtitle}</span>` : ""}
          </span>
          ${meta ? `<span class="floor-menu__meta">${meta}</span>` : ""}
        </button>
      </li>`;
    }).join("");
    el.floorMenu.querySelectorAll("[data-floor]").forEach((btn) => {
      btn.addEventListener("click", (e) => {
        e.preventDefault();
        setActiveLevel(btn.dataset.floor);
        closeFloorMenu();
      });
    });
  }

  function updateFloorChrome() {
    const floor = floorById(state.activeLevel) || { id: "L00", title: "Térreo", ready: true };
    if (el.floorHint) {
      el.floorHint.textContent = `${formatFloorTag(floor.id)} — ${floor.title}`;
      showBuildBadge();
    }
    if (el.floorBtn) {
      el.floorBtn.title = `Escolha o Andar · atual: ${formatFloorTag(floor.id)}`;
      el.floorBtn.setAttribute("aria-label", `Escolha o Andar · atual ${formatFloorTag(floor.id)}`);
    }
    if (el.floorBanner) {
      // Banner só para andares sem SVG; L01 (mapa base) já tem planta
      if (floor.ready || floor.mapUrl) {
        el.floorBanner.hidden = true;
      } else {
        el.floorBanner.hidden = false;
        if (el.floorBannerTitle) el.floorBannerTitle.textContent = `${formatFloorTag(floor.label || floor.id)} — ${floor.title}`;
        if (el.floorBannerMsg) {
          el.floorBannerMsg.textContent = "Mapa deste andar em preparação. As salas serão habilitadas quando o SVG for publicado.";
        }
      }
    }
  }

  /** Ícones no SVG do campus: usa mapLevel (Espaço Servir B01 continua visível no L00). */
  function applyFloorVisibility() {
    const host = state.floorViews.L00 || el.svgHost?.querySelector("#mapaSVG");
    if (!host) return;
    const active = state.activeLevel || "L00";
    host.querySelectorAll("[data-poi]").forEach((node) => {
      const poi = G.pois.find((p) => p.id === node.getAttribute("data-poi"));
      const mapLvl = poi?.mapLevel || "L00";
      const on = active === "L00" && mapLvl === "L00";
      node.style.display = on ? "" : "none";
      node.style.pointerEvents = on ? "all" : "none";
      if (!on) {
        node.removeAttribute("data-hover");
        node.removeAttribute("data-selected");
      }
    });
    host.style.opacity = "1";
    host.style.filter = "none";
  }

  function setMapViewBox(vbW, vbH, vbX = 0, vbY = 0) {
    G.vbW = vbW;
    G.vbH = vbH;
    G.vbX = vbX;
    G.vbY = vbY;
    el.overlay.setAttribute("viewBox", `${vbX} ${vbY} ${vbW} ${vbH}`);
    el.overlay.removeAttribute("width");
    el.overlay.removeAttribute("height");
    el.overlay.setAttribute("preserveAspectRatio", "xMidYMid meet");
  }

  async function ensureFloorSvg(floor) {
    if (!floor?.mapUrl) return null;
    if (state.floorViews[floor.id]) return state.floorViews[floor.id];
    const res = await fetch(appAssetUrl(floor.mapUrl), { cache: "no-store" });
    if (!res.ok) throw new Error(`Falha ao carregar ${floor.mapUrl}: HTTP ${res.status}`);
    const text = await res.text();
    const doc = new DOMParser().parseFromString(text, "image/svg+xml");
    if (doc.querySelector("parsererror") || !doc.documentElement.matches("svg")) {
      throw new Error(`SVG inválido: ${floor.mapUrl}`);
    }
    const svg = document.importNode(doc.documentElement, true);
    svg.removeAttribute("width");
    svg.removeAttribute("height");
    svg.setAttribute("preserveAspectRatio", "xMidYMid meet");
    svg.style.display = "block";
    svg.style.shapeRendering = "geometricPrecision";
    svg.setAttribute("id", `mapaSVG_${floor.id}`);
    svg.dataset.level = floor.id;

    const vb = (svg.getAttribute("viewBox") || "0 0 1000 600").split(/[\s,]+/).map(Number);
    const vbX = vb[0] || 0;
    const vbY = vb[1] || 0;
    const vbW = vb[2] || 1000;
    const vbH = vb[3] || 600;
    // Só injeta fundo se o SVG não trouxer um (ex.: L01 já tem #fffef5)
    const hasOwnBg = !!svg.querySelector(
      "[data-floor-bg], #L01_adm_map_background > rect, #L01_adm_map_bacground > rect, #L02_adm_map_background > rect, #L03_adm_map_background > rect, #L04_adm_map_background > rect, #L05_adm_map_background > rect, #L06_adm_map_background > rect, #B01_map_background > rect, #B02_map_background > rect, rect.cls-4, rect.l01-bg, rect.l02-bg, rect.l03-bg, rect.l04-bg, rect.l05-bg, rect.l06-bg, rect.b01-bg, rect.b02-bg",
    );
    if (!hasOwnBg) {
      const bg = document.createElementNS(NS, "rect");
      bg.setAttribute("data-floor-bg", "true");
      bg.setAttribute("x", String(vbX));
      bg.setAttribute("y", String(vbY));
      bg.setAttribute("width", String(vbW));
      bg.setAttribute("height", String(vbH));
      bg.setAttribute("fill", "#0a0a0a");
      const first = svg.firstElementChild;
      if (first && first.tagName.toLowerCase() === "defs" && first.nextSibling) {
        svg.insertBefore(bg, first.nextSibling);
      } else if (first) {
        svg.insertBefore(bg, first);
      } else {
        svg.appendChild(bg);
      }
    }

    state.floorViews[floor.id] = svg;
    state.floorMeta[floor.id] = { vbX, vbY, vbW, vbH };

    // Andares internos: esconder camadas técnicas (poi/node/edge) se existirem
    ["L01_POI", "L01_NODES", "L01_EDGES", "L02_POI", "L02_NODES", "L02_EDGES", "L03_POI", "L03_NODES", "L03_EDGES", "L04_POI", "L04_NODES", "L04_EDGES", "L05_POI", "L05_NODES", "L05_EDGES", "L06_POI", "L06_NODES", "L06_EDGES", "B01_POI", "B01_NODES", "B01_EDGES", "B02_POI", "B02_NODES", "B02_EDGES", "NODES", "EDGES"].forEach((id) => {
      const g = svg.getElementById(id);
      if (!g) return;
      g.style.display = "none";
      g.style.visibility = "hidden";
      g.style.pointerEvents = "none";
      g.setAttribute("aria-hidden", "true");
    });

    bindFloorPois(svg, floor.id);
    applyBasementFloorBackground(svg, floor.id);
    parseFloorWalls(svg, floor.id);

    return svg;
  }

  /** B01/B02: fundo branco opaco (evita transparência sobre o mapa de rua). */
  function applyBasementFloorBackground(svg, floorId) {
    if (floorId !== "B01" && floorId !== "B02") return;
    const fill = "#ffffff";
    svg.querySelectorAll(
      "[data-floor-bg], .b01-bg, .b02-bg, #B01_map_background > rect, #B02_map_background > rect",
    ).forEach((node) => {
      node.setAttribute("fill", fill);
    });
    const styleEl = svg.querySelector("defs style");
    if (styleEl?.textContent) {
      styleEl.textContent = styleEl.textContent
        .replace(/\.b01-bg\s*\{[^}]*\}/g, `.b01-bg { fill: ${fill}; }`)
        .replace(/\.b02-bg\s*\{[^}]*\}/g, `.b02-bg { fill: ${fill}; }`);
    }
  }

  async function showFloorMap(levelId) {
    const floor = floorById(levelId) || floorById("L00");
    const isCampus = !floor.mapUrl || floor.id === "L00";

    if (isCampus) {
      const campus = state.floorViews.L00;
      if (!campus) return;
      if (el.svgHost.firstChild !== campus) {
        el.svgHost.innerHTML = "";
        el.svgHost.appendChild(campus);
      }
      el.svgHost.dataset.level = "L00";
      el.svgHost.classList.remove("svg-host--floor");
      const meta = state.floorMeta.L00 || { vbX: 0, vbY: 0, vbW: G.vbW, vbH: G.vbH };
      setMapViewBox(meta.vbW, meta.vbH, meta.vbX || 0, meta.vbY || 0);
      applyFloorVisibility();
      if (state.route) {
        syncMapViewBeforeRoutePaint();
        rebuildRouteLegs(state.route);
        hydrateRouteLegPoints(state.route, "L00");
        paintActiveRouteLeg();
        fitSoon(() => {
          syncMapViewBeforeRoutePaint();
          paintActiveRouteLeg();
          if (document.body.classList.contains("is-navigating")) fitNavSegment();
          else fitRouteInView(state.route, { navMode: false, preferActiveLeg: true });
        });
      } else {
        fitSoon();
      }
      return;
    }

    try {
      const svg = await ensureFloorSvg(floor);
      if (!svg) return;
      if (el.svgHost.firstChild !== svg) {
        el.svgHost.innerHTML = "";
        el.svgHost.appendChild(svg);
      }
      el.svgHost.dataset.level = floor.id;
      el.svgHost.classList.add("svg-host--floor");
      const meta = state.floorMeta[floor.id];
      setMapViewBox(meta.vbW, meta.vbH, meta.vbX || 0, meta.vbY || 0);
      ensureRouteLayer(svg);
      if (state.route) {
        syncMapViewBeforeRoutePaint();
        rebuildRouteLegs(state.route);
        hydrateRouteLegPoints(state.route, floor.id);
        paintActiveRouteLeg();
        fitSoon(() => {
          syncMapViewBeforeRoutePaint();
          paintActiveRouteLeg();
          fitRouteInView(state.route, {
            navMode: !!document.body.classList.contains("is-navigating"),
            preferActiveLeg: true,
          });
        });
      } else {
        clearRoutePaint();
        fitSoon();
      }
    } catch (err) {
      console.error(err);
      toast(`Não foi possível abrir o mapa ${floor.id}`);
      state.activeLevel = "L00";
      await showFloorMap("L00");
      updateFloorChrome();
    }
  }

  async function setActiveLevel(levelId, opts = {}) {
    const floor = floorById(levelId);
    if (!floor) return;
    if (state.activeLevel === floor.id && !opts.force) {
      updateFloorChrome();
      if (state.route) paintActiveRouteLeg();
      return;
    }
    state.activeLevel = floor.id;
    state.liveNav?.rebuildIndexes?.(floor.id);
    state.liveMapMatchEnhancer = state.liveNav?.createMapMatchEnhancer?.() || state.liveMapMatchEnhancer;

    const multiTrip = !!(state.origin && state.dest && poiLevel(state.origin) !== poiLevel(state.dest));
    const keepTrip = !!opts.keepTrip || multiTrip || !!state.route;

    if (!keepTrip) {
      const badOrigin = state.origin && state.origin.id !== "__here__" && poiLevel(state.origin) !== floor.id;
      const badDest = state.dest && poiLevel(state.dest) !== floor.id;
      if (badOrigin || badDest) {
        state.origin = null;
        state.dest = null;
        if (el.originInput) el.originInput.value = "";
        if (el.destInput) el.destInput.value = "";
        clearRoute(true);
        highlightSelected();
      } else if (floor.mapUrl && !state.route) {
        clearRoutePaint();
      }
    }

    await state.ensureNavGraphFloors?.(floor.id);
    if (state.route && state.origin && state.dest) {
      await ensureNavGraphForTrip(poiLevel(state.origin), poiLevel(state.dest));
      rebuildRouteLegs(state.route);
    }
    await showFloorMap(floor.id);
    if (state.route) paintActiveRouteLeg();
    updateFloorChrome();
    closeSuggest();

    const n = poisForActiveLevel().length;
    if (!opts.silent) {
      if (state.route && multiTrip) {
        toast(`${floor.title}: trecho da rota neste andar`);
      } else if (floor.ready && floor.mapUrl) {
        toast(`${formatFloorTag(floor.id)} — ${floor.title}`);
      } else if (floor.ready) {
        toast(`${floor.title} · ${n} ${n === 1 ? "local" : "locais"}`);
      } else {
        toast(`${floor.label} · em breve (mapa ainda não publicado)`);
      }
    }
    if (el.statusHint) {
      if (state.route && multiTrip) {
        const via = routeViaLabel(state.route, poiLevel(state.origin), poiLevel(state.dest));
        renderFloorLocaisHint(`${floor.title}: trecho da rota · ${via}`);
      } else {
        renderFloorLocaisHint();
      }
    }
  }

  /* ============================================================ MOBILE: TOOLS + DRAWER LATERAL */
  function isMobileLayout() {
    return window.matchMedia && window.matchMedia("(max-width: 860px)").matches;
  }

  function mobilePanelInsetPx() {
    if (!isMobileLayout() || !el.panel?.classList.contains("open")) return 0;
    if (document.body.classList.contains("is-navigating")) return 0;
    const w = el.panel.offsetWidth || Math.min(360, innerWidth * 0.88);
    return w + 16;
  }

  function syncNavLayoutMetrics() {
    const root = document.documentElement;
    if (!isMobileLayout() || !document.body.classList.contains("is-navigating")) {
      root.style.removeProperty("--nav-top-h");
      root.style.removeProperty("--nav-bottom-h");
      return;
    }
    const topH = el.panel?.getBoundingClientRect().height || 210;
    root.style.setProperty("--nav-top-h", `${Math.ceil(topH)}px`);

    const overlayOpen = el.navOverlay
      && !el.navOverlay.hidden
      && el.navOverlay.classList.contains("is-open");
    const bottomH = overlayOpen
      ? (el.navOverlay.querySelector(".nav-card")?.getBoundingClientRect().height || 220) + 12
      : 72;
    root.style.setProperty("--nav-bottom-h", `${Math.ceil(bottomH)}px`);
  }

  /** Enquadra rota no mapa mobile após painel compacto (Navegar). */
  function fitMobileNavRouteView(extraDelayMs = 0) {
    if (!state.route || !isMobileLayout() || !isNavigating()) return;
    const run = () => {
      syncNavLayoutMetrics();
      paintActiveRouteLeg();
      fitRouteInView(state.route, {
        navMode: true,
        preferActiveLeg: true,
        fillWidth: true,
        widthMargin: 0.96,
        padBottom: 88,
      });
    };
    if (extraDelayMs > 0) {
      setTimeout(() => fitSoon(() => fitSoon(run)), extraDelayMs);
      return;
    }
    fitSoon(() => fitSoon(run));
  }

  function mobileMapPadding(opts = {}) {
    if (!isMobileLayout()) {
      const pad = opts.padX ?? 36;
      return {
        padLeft: pad,
        padRight: pad,
        padTop: opts.padTop ?? 36,
        padBottom: opts.padBottom ?? 36,
      };
    }
    if (document.body.classList.contains("is-navigating")) {
      const root = document.documentElement;
      const cs = getComputedStyle(root);
      const top = parseFloat(root.style.getPropertyValue("--nav-top-h"))
        || parseFloat(cs.getPropertyValue("--nav-top-h"))
        || 210;
      const overlayOpen = el.navOverlay
        && !el.navOverlay.hidden
        && el.navOverlay.classList.contains("is-open");
      const bottomDefault = overlayOpen ? 230 : 72;
      const bottom = parseFloat(root.style.getPropertyValue("--nav-bottom-h"))
        || parseFloat(cs.getPropertyValue("--nav-bottom-h"))
        || bottomDefault;
      const side = opts.fillWidth ? 12 : 44;
      return {
        padLeft: opts.padLeft ?? side,
        padRight: opts.padRight ?? side,
        padTop: opts.padTop ?? Math.ceil(top + 10),
        padBottom: opts.padBottom ?? Math.ceil(bottom + 14),
      };
    }
    const inset = mobilePanelInsetPx();
    const side = opts.fillWidth ? 14 : 12;
    return {
      padLeft: opts.padLeft ?? (side + inset),
      padRight: opts.padRight ?? side,
      padTop: opts.padTop ?? 12,
      padBottom: opts.padBottom ?? (opts.navMode ? 140 : 24),
    };
  }

  function syncMapToolsPlacement() {
    const extras = el.mapToolsExtras;
    const host = el.panelActionsHost;
    const stage = el.stage;
    if (!extras || !host || !stage) return;
    if (isMobileLayout()) {
      /* Painel aberto ou navegação: ícones no header (horizontal), como no desktop */
      const inPanel = document.body.classList.contains("is-navigating")
        || el.panel?.classList.contains("open");
      if (inPanel) {
        if (extras.parentElement !== host) host.appendChild(extras);
      } else if (extras.parentElement !== stage) {
        stage.appendChild(extras);
      }
    } else {
      document.body.classList.remove("panel-drawer-open");
      if (extras.parentElement !== host) host.appendChild(extras);
    }
  }

  function setPanelOpen(open) {
    if (!el.panel) return;
    if (!open) exitMobileSearchMode();
    el.panel.classList.toggle("open", !!open);
    el.panel.style.transform = "";
    el.panel.classList.remove("is-dragging");
    document.body.classList.toggle("panel-drawer-open", isMobileLayout() && !!open);
    syncMapToolsPlacement();
    if (el.panelToggle) {
      el.panelToggle.setAttribute("aria-expanded", open ? "true" : "false");
    }
    if (isMobileLayout()) fitSoon();
  }

  function togglePanelSheet() {
    if (!el.panel) return;
    setPanelOpen(!el.panel.classList.contains("open"));
  }

  function panelClosedOffset() {
    const w = el.panel?.offsetWidth || 0;
    return Math.max(0, w);
  }

  function initPanelSheetGesture() {
    const panel = el.panel;
    const grab = el.panelGrab;
    if (!panel || !grab) return;

    let active = false;
    let startX = 0;
    let startOffset = 0;
    let lastX = 0;
    let lastT = 0;
    let velocity = 0;
    let moved = false;
    let pointerId = null;

    function canGesture() {
      return isMobileLayout()
        && !panel.classList.contains("is-searching")
        && !document.body.classList.contains("is-navigating");
    }

    function currentOffset() {
      if (panel.classList.contains("open") && !panel.classList.contains("is-dragging")) return 0;
      const t = panel.style.transform;
      const m = /translateX\(([-\d.]+)px\)/.exec(t || "");
      if (m) return +m[1];
      return panel.classList.contains("open") ? 0 : -panelClosedOffset();
    }

    function setOffset(x) {
      const min = -panelClosedOffset();
      const clamped = Math.min(0, Math.max(min, x));
      panel.style.transform = `translateX(${clamped}px)`;
      return clamped;
    }

    function isGrabTarget(target) {
      if (!target || !panel.contains(target)) return false;
      if (target.closest("input, textarea, select, button, a, .suggest, .floor-menu, .trip__actions, .summary, .browse")) {
        return false;
      }
      if (grab.contains(target) || target === grab) return true;
      if (target.closest(".panel__head, .brand")) return true;
      return false;
    }

    function onDown(e) {
      if (!canGesture()) return;
      if (e.pointerType === "mouse" && e.button !== 0) return;
      if (!isGrabTarget(e.target)) return;
      active = true;
      moved = false;
      pointerId = e.pointerId;
      startX = e.clientX;
      lastX = e.clientX;
      lastT = performance.now();
      velocity = 0;
      startOffset = currentOffset();
      panel.classList.add("is-dragging");
      try { panel.setPointerCapture?.(e.pointerId); } catch {}
    }

    function onMove(e) {
      if (!active || (pointerId != null && e.pointerId !== pointerId)) return;
      const x = e.clientX;
      const now = performance.now();
      const dx = x - startX;
      if (Math.abs(dx) > 4) moved = true;
      const dt = Math.max(1, now - lastT);
      velocity = (x - lastX) / dt;
      lastX = x;
      lastT = now;
      setOffset(startOffset + dx);
      if (moved) e.preventDefault();
    }

    function onUp(e) {
      if (!active || (pointerId != null && e.pointerId !== pointerId)) return;
      active = false;
      const wasMoved = moved;
      pointerId = null;
      panel.classList.remove("is-dragging");
      const offset = currentOffset();
      const max = panelClosedOffset() || 1;
      const flickOpen = velocity > 0.45;
      const flickClose = velocity < -0.45;
      let open;
      if (flickOpen) open = true;
      else if (flickClose) open = false;
      else if (!wasMoved) open = !panel.classList.contains("open");
      else open = offset > -max * 0.45;
      panel.style.transform = "";
      setPanelOpen(open);
    }

    panel.addEventListener("pointerdown", onDown);
    window.addEventListener("pointermove", onMove, { passive: false });
    window.addEventListener("pointerup", onUp);
    window.addEventListener("pointercancel", onUp);
  }

  /* ============================================================ TEMA (dark/light) */
  function applyTheme(theme) {
    const t = theme === "light" ? "light" : "dark";
    document.documentElement.setAttribute("data-theme", t);
    try { localStorage.setItem("mapa-theme", t); } catch {}
    if (el.themeBtn) {
      el.themeBtn.setAttribute("aria-pressed", t === "light");
      el.themeBtn.dataset.theme = t;
      el.themeBtn.title = t === "light" ? "Tema claro (clique p/ escuro)" : "Tema escuro (clique p/ claro)";
    }
    const meta = document.querySelector('meta[name="theme-color"]');
    if (meta) meta.setAttribute("content", t === "light" ? "#e8eef8" : "#0a1220");
  }
  function initTheme() {
    let saved = null;
    try { saved = localStorage.getItem("mapa-theme"); } catch {}
    applyTheme(saved || "dark");
  }
  function toggleTheme() {
    const cur = document.documentElement.getAttribute("data-theme");
    applyTheme(cur === "light" ? "dark" : "light");
  }

  /* ============================================================ EVENTOS */
  function bind() {
    initRouteAnimationLayers();
    syncMapToolsPlacement();
    if (el.themeBtn) el.themeBtn.addEventListener("click", (e) => { e.preventDefault(); toggleTheme(); });
    if (el.areaBtn) {
      el.areaBtn.addEventListener("click", (e) => {
        e.preventDefault();
        e.stopPropagation();
        openRoomModal();
      });
    }
    if (el.floorBtn) {
      el.floorBtn.addEventListener("click", (e) => {
        e.preventDefault();
        e.stopPropagation();
        toggleFloorMenu();
      });
    }
    document.addEventListener("pointerdown", (e) => {
      if (state.areaMenuOpen && el.areaPicker && !e.target.closest("#areaPicker")) closeAreaMenu();
      if (state.floorMenuOpen && el.floorPicker && !e.target.closest("#floorPicker")) closeFloorMenu();
    });
    el.roomModalClose?.addEventListener("click", closeRoomModal);
    el.roomModalCancel?.addEventListener("click", closeRoomModal);
    el.roomModalGo?.addEventListener("click", confirmRoomModalSelection);
    el.roomModalSearch?.addEventListener("input", renderRoomModal);
    el.roomModalSearch?.addEventListener("focus", () => openVirtualKeyboard(el.roomModalSearch));
    el.roomModalSearch?.addEventListener("click", () => openVirtualKeyboard(el.roomModalSearch));
    el.roomSelectModal?.addEventListener("click", (e) => {
      if (e.target === el.roomSelectModal) closeRoomModal();
    });
    document.addEventListener("keydown", (e) => {
      if (e.key === "Escape" && !el.roomSelectModal?.hidden) closeRoomModal();
    });
    // inputs autocomplete
    function initSearchField(input) {
      if (!input) return;
      let searchDebounceTimer = null;
      const scheduleSuggest = (which, inputEvent) => {
        clearTimeout(searchDebounceTimer);
        searchDebounceTimer = setTimeout(() => {
          withSearchInputCaret(input, () => renderSuggest(which, input.value), inputEvent);
        }, 150);
      };
      input.setAttribute("dir", "ltr");
      input.setAttribute("autocorrect", "off");
      input.setAttribute("autocapitalize", "off");
      input.setAttribute("spellcheck", "false");
      input.addEventListener("focus", () => {
        enterMobileSearchMode();
        openVirtualKeyboard(input);
        withSearchInputCaret(input, () => {
          renderSuggest(input.id === "originInput" ? "origin" : "dest", input.value);
        });
      });
      // clique direto no campo reabre o teclado (o foco pode já estar nele)
      input.addEventListener("click", () => openVirtualKeyboard(input));
      input.addEventListener("input", (e) => {
        const which = input.id === "originInput" ? "origin" : "dest";
        state[which] = null;
        if (state.route) clearRoute(true);
        else updateNavBtn();
        scheduleSuggest(which, e);
      });
      input.addEventListener("blur", () => {
        scheduleExitMobileSearchMode();
        setTimeout(() => {
          const active = document.activeElement;
          if (active === el.originInput || active === el.destInput) return;
          if (active && el.virtualKeyboard?.contains(active)) return;
          closeVirtualKeyboard();
        }, 120);
      });
    }
    initSearchField(el.originInput);
    initSearchField(el.destInput);
    initVirtualKeyboard();
    document.addEventListener("pointerdown", (e) => {
      if (e.target.closest(".virtual-keyboard")) return;
      if (!e.target.closest(".field") && !e.target.closest(".suggest") && !e.target.closest("#browseBar")) {
        closeSuggest();
        exitMobileSearchMode();
        closeVirtualKeyboard();
      }
    });

    initMobileViewport();

    el.swapBtn.addEventListener("click", (e) => {
      e.preventDefault();
      const o = state.origin, d = state.dest;
      state.origin = d; state.dest = o;
      el.originInput.value = d ? d.name : "";
      el.destInput.value = o ? o.name : "";
      if (state.origin && state.dest) drawRoute();
    });
    el.hereBtn.addEventListener("click", (e) => { e.preventDefault(); startPlacingHere(); });
    el.routeBtn.addEventListener("click", (e) => { e.preventDefault(); drawRoute(); });
    el.clearBtn.addEventListener("click", (e) => { e.preventDefault(); clearRoute(); });
    el.navBtn.addEventListener("click", (e) => {
      e.preventDefault();
      if (el.navBtn.disabled) return;
      if (isNavigating()) exitNav();
      else enterNav();
    });
    el.summaryNavPrev?.addEventListener("click", (e) => {
      e.preventDefault();
      guideNavPrev();
    });
    el.summaryNavNext?.addEventListener("click", (e) => {
      e.preventDefault();
      guideNavNext();
    });

    // Delegação no overlay — garante clique mesmo com SVG/filho no caminho
    el.navOverlay.addEventListener("click", (e) => {
      const btn = e.target.closest("button");
      if (!btn || !el.navOverlay.contains(btn)) return;
      e.preventDefault();
      e.stopPropagation();
      if (btn.id === "navExit") exitNav();
      else if (btn.id === "navPrev") navPrev();
      else if (btn.id === "navNext") navNext();
    });

    // controles
    el.zoomIn.addEventListener("click", (e) => { e.preventDefault(); zoomAt(1.25); });
    el.zoomOut.addEventListener("click", (e) => { e.preventDefault(); zoomAt(0.8); });
    el.fitBtn.addEventListener("click", (e) => { e.preventDefault(); fit(); });
    el.panelToggle.addEventListener("click", (e) => {
      e.preventDefault();
      togglePanelSheet();
    });
    syncMapToolsPlacement();
    initPanelSheetGesture();
    if (el.stage) {
      el.stage.addEventListener("click", (e) => {
        if (!isMobileLayout() || !el.panel?.classList.contains("open")) return;
        if (el.panel.contains(e.target)) return;
        if (e.target.closest(".map-tools, .map-controls, .nav-overlay, .floor-menu, .area-menu")) return;
        if (el.panel.classList.contains("is-searching")) {
          exitMobileSearchMode();
          el.originInput?.blur();
          el.destInput?.blur();
        }
        setPanelOpen(false);
      });
    }
    updateSummaryChrome();
    window.addEventListener("resize", () => syncMapToolsPlacement());
    if (window.matchMedia) {
      window.matchMedia("(max-width: 860px)").addEventListener("change", () => syncMapToolsPlacement());
    }

    if (el.calibBtn) {
      el.calibBtn.addEventListener("click", (e) => {
        e.preventDefault();
        if (!CONFIG.isDev) return;
        if (state.calibMode) exitCalibMode();
        else enterCalibMode();
      });
    }
    if (el.calibCancel) {
      el.calibCancel.addEventListener("click", (e) => {
        e.preventDefault();
        exitCalibMode();
        if (CONFIG.isDev && state.calibration) {
          drawCalibrationMarks(state.calibration.startPoint, state.calibration.endPoint);
        } else clearCalibrationMarks();
      });
    }
    if (el.calibSave) {
      el.calibSave.addEventListener("click", (e) => {
        e.preventDefault();
        if (!state._calibDraft) return;
        applyCalibration(state._calibDraft, { persist: true });
        exitCalibMode();
        if (CONFIG.isDev) {
          drawCalibrationMarks(state.calibration.startPoint, state.calibration.endPoint);
        }
        toast("Escala do Batistério aplicada (6,80 m).");
      });
    }
    if (el.calibRealInput) {
      el.calibRealInput.addEventListener("change", () => {
        if (state.calibPoints.length >= 2) finishCalibPreview();
      });
    }

    // pan / zoom — ignora cliques em controles do mapa
    let mapPickCtrl = null;
    if (globalThis.PIBMapPickController) {
      mapPickCtrl = globalThis.PIBMapPickController.create({
        el,
        state,
        toast,
        viewportPoint,
        mapPointToClient: svgPointToClient,
        snapMapPoint: (p) => snapMapPointToNavMesh(p, state.activeLevel || "L00"),
        buildMapPickPoi,
        setField,
        drawRoute,
        resolveOriginForDestPick,
        paintMapPickMarkers,
        isMobileLayout,
        setPanelOpen,
      });
      mapPickCtrl.bind();
      state._repositionMapPickMenu = () => mapPickCtrl.repositionMenu?.();
    }

    el.viewport.addEventListener("wheel", (e) => {
      e.preventDefault();
      const r = el.viewport.getBoundingClientRect();
      zoomAt(e.deltaY < 0 ? 1.12 : 0.9, e.clientX - r.left, e.clientY - r.top);
    }, { passive: false });

    el.viewport.addEventListener("pointerdown", (e) => {
      if (e.target.closest("button, a, input, .map-marker, .map-pick-menu, [data-poi]")) return;
      if (state.calibMode) {
        e.preventDefault();
        const p = viewportPoint(e);
        if (state.calibStep === 0) {
          state.calibPoints = [p];
          state.calibStep = 1;
          drawCalibrationMarks(p, null);
          if (el.calibHelp) {
            el.calibHelp.innerHTML = "Agora clique no extremo <strong>direito</strong> da largura do Batistério.";
          }
          toast("Ponto esquerdo marcado. Clique no extremo direito.");
        } else if (state.calibStep === 1) {
          state.calibPoints[1] = p;
          state.calibStep = 2;
          finishCalibPreview();
          toast("Pontos definidos. Revise e salve a escala.");
        }
        return;
      }
      if (state.placingHere) {
        e.preventDefault();
        state._ignoreNextPoiClick = true;
        placeHere(viewportPoint(e));
        return;
      }
      state.drag = true; state.moved = false;
      state.sx = e.clientX; state.sy = e.clientY;
      state.px = state.panX; state.py = state.panY;
      el.viewport.classList.add("dragging");
      el.viewport.setPointerCapture(e.pointerId);
    });
    el.viewport.addEventListener("pointermove", (e) => {
      if (!state.drag) return;
      const dx = e.clientX - state.sx, dy = e.clientY - state.sy;
      if (Math.abs(dx) + Math.abs(dy) > 3) {
        state.moved = true;
        if (state.userLocation) state.userLocation.onMapDragged();
      }
      state.panX = state.px + dx; state.panY = state.py + dy; clamp(); apply();
    });
    const endDrag = (e) => {
      state.drag = false;
      el.viewport.classList.remove("dragging");
      try { el.viewport.releasePointerCapture(e.pointerId); } catch {}
    };

    // pinch (touch) — declarado antes do pointerup para distinguir toque de zoom
    let pinch = null;
    let pinching = false;

    el.viewport.addEventListener("pointerup", (e) => {
      const wasTap = state.drag && !state.moved && !pinching;
      endDrag(e);
      if (wasTap) mapPickCtrl?.onMapTap?.(e);
    });
    el.viewport.addEventListener("pointercancel", endDrag);

    el.viewport.addEventListener("touchmove", (e) => {
      if (e.touches.length === 2) {
        e.preventDefault();
        pinching = true;
        mapPickCtrl?.setPinching?.(true);
        const [a, b] = e.touches;
        const d = Math.hypot(a.clientX - b.clientX, a.clientY - b.clientY);
        const mid = { x: (a.clientX + b.clientX) / 2, y: (a.clientY + b.clientY) / 2 };
        const r = el.viewport.getBoundingClientRect();
        if (pinch) zoomAt(d / pinch, mid.x - r.left, mid.y - r.top);
        pinch = d;
      }
    }, { passive: false });
    el.viewport.addEventListener("touchend", () => {
      pinch = null;
      pinching = false;
      mapPickCtrl?.setPinching?.(false);
    });

    addEventListener("keydown", (e) => {
      if (e.key === "Escape" && el.navOverlay.classList.contains("is-open")) exitNav();
    });
    addEventListener("resize", () => setTimeout(() => {
      if (document.body.classList.contains("is-navigating") && isMobileLayout()) {
        fitMobileNavRouteView();
      } else {
        fit();
      }
    }, 120));
  }

  /* ============================================================ INIT */
  setupDevUi();
  initTheme();
  initBrowseFilters();
  bind();
  showBuildBadge();
  watchBuildUpdates();
  loadSVG();
})();
