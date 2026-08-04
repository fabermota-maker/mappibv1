/**
 * Índice de POIs do Térreo (L00) a partir da nomenclatura das layers SVG.
 * Padrão: L00_poi_XXXX_nome_do_local_node_YYYY → L00_node_YYYY
 */
(function (global) {
  "use strict";

  const LEVEL = "L00";
  const LAYER_RE = /^(L\d{2})_poi_(\d{4})_(.+?)_+node_(\d{4})$/i;

  const POI_ACRONYMS = new Set(["abasc", "ceara", "rgo", "cf", "start"]);

  const POI_METADATA = {
    entrada_de_narnia: {
      displayName: "Entrada de Narnia",
      aliases: ["narnia", "entrada narnia", "entrada para narnia", "porta de narnia"],
    },
    icon_moto: {
      displayName: "Estacionamento de Motos Bento",
      aliases: ["moto", "motos", "estacionamento moto", "estacionamento de motos"],
    },
    elevador_templo: {
      displayName: "Elevador do Templo",
      aliases: ["elevador", "elevador templo", "elevadores"],
    },
    min_esportes: {
      displayName: "Ministério de Esportes",
      aliases: ["ministerio de esportes", "ministerio esportes", "esportes", "min esportes"],
    },
    banheiro_masculino_feminino: {
      displayName: "Banheiros do Restaurante",
      aliases: ["banheiros do restaurante", "banheiro restaurante"],
    },
    banheiro_masculino: {
      displayName: "Banheiro Masculino",
      aliases: ["banheiro masculino templo", "banheiro masculino do templo"],
    },
    banheiro_feminino: {
      displayName: "Banheiro Feminino",
      aliases: ["banheiro feminino templo", "banheiro feminino do templo"],
    },
    banheiro_masculino_ginasio: {
      displayName: "Banheiro Masculino do Restaurante",
      aliases: ["banheiro masculino do restaurante", "banheiro masculino restaurante"],
    },
    banheiro_feminino_ginasio: {
      displayName: "Banheiro Feminino do Restaurante",
      aliases: ["banheiro feminino do restaurante", "banheiro feminino restaurante"],
    },
    espaco_servir: {
      displayName: "Espaço Servir",
      aliases: ["servir", "espaco servir", "espaço servir"],
    },
    banheiro_familia: {
      displayName: "Banheiro Família e Bebês",
      aliases: ["banheiro familia", "banheiro família", "banheiro bebes", "bercario start"],
    },
    abasc: {
      displayName: "ABASC",
      aliases: ["abasc"],
    },
    espaco_acolher_ceara: {
      displayName: "Espaço Acolher — CEARA",
      aliases: ["ceara", "ceará", "acolher", "espaco acolher"],
    },
    jardim: {
      displayName: "Jardim",
      aliases: ["jardim"],
    },
    bazar_abasc: {
      displayName: "Bazar ABASC",
      aliases: ["bazar abasc", "bazar"],
    },
    seven_pass: {
      displayName: "Restaurante SEVENPASS",
      aliases: ["sevenpass", "seven pass", "restaurante sevenpass", "restaurante"],
    },
    recepcao: {
      displayName: "Recepção",
      aliases: ["recepcao", "recepção"],
    },
    sala_de_oracao_cleusa: {
      displayName: "Sala de Oração Cleusa",
      aliases: ["cleusa", "cleude", "oracao cleusa", "sala cleusa"],
    },
    sala_de_oracao_RGO: {
      displayName: "Sala de Oração RGO",
      aliases: ["rgo", "oracao rgo", "sala rgo"],
    },
    bercario: {
      displayName: "Berçário START",
      aliases: ["bercario start", "berçário start", "bercario", "start"],
    },
    espaco_conexao: {
      displayName: "Espaço conexão",
      aliases: ["espaco conexao", "espaço conexão", "conexao servir", "conexão servir"],
    },
    refeitorio_externo: {
      displayName: "Restaurante Externo",
      aliases: ["restaurante externo", "refeitorio externo"],
    },
    area_kids: {
      displayName: "Área Kids T",
      aliases: ["area kids t", "area kids terreo", "area kids", "kids t", "área kids t"],
    },
    estacionamento_02: {
      displayName: "Estacionamento Conveniado",
      aliases: ["estacionamento conveniado", "estacionamento 02"],
    },
    centro_de_formacao: {
      displayName: "Centro de Formação | CF",
      aliases: ["centro de formacao", "centro formacao", "cf", "centro de formacao cf", "centro formacao cf", "formacao cf"],
    },
    estacionamento_01: {
      displayName: "Estacionamento Bento Viana — Acesso 2",
      aliases: ["estacionamento bento acesso 2", "estacionamento 01"],
    },
    capela: {
      displayName: "Capela",
      aliases: ["capela"],
    },
    entrada_principal_toldo: {
      displayName: "Entrada do Toldo",
      aliases: ["entrada do toldo", "entrada toldo", "toldo"],
    },
    templo: {
      displayName: "Templo — Entrada 4",
      aliases: ["templo entrada 4"],
    },
    livraria_evangelica: {
      displayName: "Livraria Evangélica",
      aliases: ["livraria evangelica", "livraria"],
    },
  };

  /** Destinos com um único acesso oficial (sem submenu de acessos). */
  const SINGLE_ACCESS_LOCATIONS = {
    centro_de_formacao: {
      displayName: "Centro de Formação | CF",
      aliases: [
        "centro de formacao",
        "centro formacao",
        "cf",
        "centro de formacao cf",
        "centro formacao cf",
        "formacao cf",
      ],
      nodeId: "L00_node_0042",
      poiRawId: "P005_centro_de_formacao",
    },
  };

  const MULTI_ACCESS_LOCATIONS = {
    templo: {
      displayName: "Templo",
      selectionHint: "Escolha uma entrada do Templo",
      aliases: ["templo", "igreja"],
      nodeIds: [
        "L00_node_0088",
        "L00_node_0072",
        "L00_node_0033",
        "L00_node_0015",
        "L00_node_0018",
      ],
      accessLabels: [
        "Templo — Entrada 1",
        "Templo — Entrada 2",
        "Templo — Entrada 3",
        "Templo — Entrada 4",
        "Templo — Entrada 5",
      ],
    },
    entrada_av_batel: {
      displayName: "Entrada Av. Batel",
      selectionHint: "Escolha um acesso da Entrada Av. Batel",
      aliases: ["entrada batel", "entrada avenida batel", "av batel", "entrada av batel"],
      nodeIds: ["L00_node_0086", "L00_node_0087"],
      accessLabels: ["Entrada Av. Batel — Acesso 1", "Entrada Av. Batel — Acesso 2"],
    },
    escadas_ginasio: {
      displayName: "Escadas do Ginásio",
      selectionHint: "Escolha um acesso das Escadas do Ginásio",
      aliases: ["escada ginasio", "escadas ginasio", "escadas do ginasio"],
      nodeIds: ["L00_node_0051", "L00_node_0057"],
      accessLabels: ["Escadas do Ginásio — Acesso 1", "Escadas do Ginásio — Acesso 2"],
    },
    estacionamento_bento_viana: {
      displayName: "Estacionamento Bento Viana",
      selectionHint: "Escolha um acesso do Estacionamento Bento Viana",
      aliases: ["estacionamento bento", "estacionamento bento viana"],
      nodeIds: ["L00_node_0022", "L00_node_0021"],
      accessLabels: ["Estacionamento Bento Viana — Acesso 1", "Estacionamento Bento Viana — Acesso 2"],
    },
    entrada_saida_carros_bento: {
      displayName: "Entrada/Saída de Carros Bento Viana",
      selectionHint: "Escolha um acesso de Entrada/Saída de Carros Bento Viana",
      aliases: [
        "entrada carros bento",
        "saida carros bento",
        "entrada e saida carros bento",
        "carros bento viana",
      ],
      nodeIds: ["L00_node_0004", "L00_node_0005"],
      accessLabels: [
        "Entrada/Saída de Carros Bento Viana — Acesso 1",
        "Entrada/Saída de Carros Bento Viana — Acesso 2",
      ],
    },
  };

  /** @type {Map<string, object>} */
  let byLayerName = new Map();
  /** @type {object[]} */
  let searchIndex = [];
  /** @type {object[]} */
  let invalidEntries = [];
  /** @type {object|null} */
  let lastValidationReport = null;

  function normalizeSearchText(value) {
    return String(value || "")
      .normalize("NFD")
      .replace(/[\u0300-\u036f]/g, "")
      .toLowerCase()
      .replace(/[_-]+/g, " ")
      .replace(/[^\p{L}\p{N}\s]/gu, " ")
      .replace(/\s+/g, " ")
      .trim();
  }

  function formatDisplayName(rawName) {
    const words = String(rawName || "")
      .replace(/_+/g, " ")
      .trim()
      .split(/\s+/);
    return words
      .map((w, i) => {
        const lower = w.toLowerCase();
        if (POI_ACRONYMS.has(lower) || /^[A-Z0-9]{2,}$/.test(w)) return w.toUpperCase();
        if (i === 0) return lower.charAt(0).toUpperCase() + lower.slice(1);
        return lower;
      })
      .join(" ");
  }

  function getOfficialDisplayName(rawName) {
    const key = String(rawName || "").toLowerCase();
    return POI_METADATA[key]?.displayName || formatDisplayName(rawName);
  }

  function nodeIdBase(id) {
    const m = String(id || "").match(/^(L\d{2}_node_\d{4})/);
    return m ? m[1] : String(id || "");
  }

  function resolveGraphNodeId(baseId, navGraph, gNodes) {
    const base = nodeIdBase(baseId);
    if (!base) return null;
    if (navGraph?.nodesById?.has(base)) return base;
    if (gNodes?.[base]) return base;
    const prefix = base + "_";
    if (navGraph?.nodesById) {
      for (const id of navGraph.nodesById.keys()) {
        if (id === base || id.startsWith(prefix)) return id;
      }
    }
    if (gNodes) {
      for (const id of Object.keys(gNodes)) {
        if (id === base || id.startsWith(prefix)) return id;
      }
    }
    return null;
  }

  function graphNodeHasEdges(resolvedId, navGraph, gAdj) {
    if (!resolvedId) return false;
    if ((navGraph?.adjacency?.get(resolvedId) || []).length) return true;
    return ((gAdj?.[resolvedId] || []).length > 0);
  }

  function nodeLevel(resolvedId, navGraph, gNodes) {
    const n = navGraph?.nodesById?.get(resolvedId) || gNodes?.[resolvedId];
    return n?.level || LEVEL;
  }

  /**
   * Interpreta nomenclatura L00_poi_XXXX_nome_node_YYYY.
   * @returns {object|null}
   */
  function parsePoiLayerName(layerName) {
    const fullLayerName = String(layerName || "").trim();
    const match = fullLayerName.match(LAYER_RE);
    if (!match) return null;

    const [, floorId, poiNumber, rawName, nodeNumber] = match;
    const metaKey = rawName.toLowerCase();
    const meta = POI_METADATA[metaKey];
    const displayName = getOfficialDisplayName(rawName);
    const accessNodeId = `${floorId}_node_${nodeNumber}`;

    return {
      floorId,
      poiId: `${floorId}_poi_${poiNumber}`,
      poiNumber,
      rawName,
      normalizedName: normalizeSearchText(rawName.replace(/_/g, " ")),
      displayName,
      accessNodeId,
      fullLayerName,
      aliases: (meta?.aliases || []).slice(),
    };
  }

  function validateAccessNode(accessNodeId, displayName, navGraph, gNodes, gAdj) {
    const base = nodeIdBase(accessNodeId);
    const resolved = resolveGraphNodeId(base, navGraph, gNodes);
    if (!resolved || nodeLevel(resolved, navGraph, gNodes) !== LEVEL) {
      console.warn(
        `[PoiRouting] ${displayName || base}: ${base} não encontrado ou fora do L00.`
      );
      return null;
    }
    if (!graphNodeHasEdges(resolved, navGraph, gAdj)) {
      console.warn(
        `[PoiRouting] ${displayName || base}: ${base} não encontrado ou sem edges válidos.`
      );
      return null;
    }
    const node = navGraph?.nodesById?.get(resolved) || gNodes?.[resolved];
    return {
      accessNodeId: base,
      graphNodeId: resolved,
      x: node?.x,
      y: node?.y,
    };
  }

  function collectLayerElements(svg) {
    if (!svg) return [];
    const out = [];
    svg.querySelectorAll("[id]").forEach((el) => {
      if (parsePoiLayerName(el.id)) out.push(el);
    });
    return out;
  }

  function buildSearchIndex(svg, navGraph, gNodes, gAdj) {
    byLayerName = new Map();
    searchIndex = [];
    invalidEntries = [];
    const validNodes = [];
    const missingNodes = [];

    for (const el of collectLayerElements(svg)) {
      const parsed = parsePoiLayerName(el.id);
      if (!parsed) continue;
      if (parsed.rawName === "centro_de_formacao") continue;
      if (parsed.rawName === "refeeitorio_externo") continue;
      const validated = validateAccessNode(
        parsed.accessNodeId,
        parsed.displayName,
        navGraph,
        gNodes,
        gAdj
      );
      const entry = {
        fullLayerName: parsed.fullLayerName,
        poiId: parsed.poiId,
        floorId: parsed.floorId,
        displayName: parsed.displayName,
        normalizedName: parsed.normalizedName,
        rawName: parsed.rawName,
        aliases: parsed.aliases.map(normalizeSearchText),
        accessNodeId: parsed.accessNodeId,
        graphNodeId: validated?.graphNodeId || null,
        valid: !!validated,
        parsed,
      };
      byLayerName.set(parsed.fullLayerName, entry);
      if (validated) {
        searchIndex.push(entry);
        validNodes.push(nodeIdBase(parsed.accessNodeId));
      } else {
        invalidEntries.push(entry);
        missingNodes.push(nodeIdBase(parsed.accessNodeId));
      }
    }

    lastValidationReport = {
      valid: validNodes,
      invalid: missingNodes,
      totalLayers: byLayerName.size,
      validCount: searchIndex.length,
      invalidCount: invalidEntries.length,
    };
    return lastValidationReport;
  }

  function termMatches(query, term) {
    const q = normalizeSearchText(query);
    const t = normalizeSearchText(term);
    if (!q || !t) return false;
    if (q === t) return true;
    if (t.startsWith(q) && q.length >= 2) return true;
    if (q.includes(t) || t.includes(q)) return true;
    return false;
  }

  function matchesMultiAccess(query, area) {
    const terms = [area.displayName, ...(area.aliases || [])];
    return terms.some((t) => termMatches(query, t));
  }

  function isGenericMultiAccessQuery(query, area) {
    const q = normalizeSearchText(query);
    if (!q || !area) return false;
    const exactTerms = [area.displayName, ...(area.aliases || [])].map(normalizeSearchText);
    return exactTerms.some((t) => q === t || (t.startsWith(q) && q.length >= 3));
  }

  function searchScore(entry, query) {
    const q = normalizeSearchText(query);
    if (!q) return 0;
    const display = normalizeSearchText(entry.displayName);
    const aliases = entry.aliases || [];

    if (display === q) return 100;
    for (const a of aliases) if (a === q) return 95;
    if (display.startsWith(q)) return 85;
    const qWords = q.split(/\s+/).filter(Boolean);
    if (qWords.length > 1 && qWords.every((w) => display.includes(w))) return 78;
    for (const a of aliases) {
      if (a.startsWith(q)) return 72;
      if (qWords.length > 1 && qWords.every((w) => a.includes(w))) return 70;
    }
    if (display.includes(q)) return 50;
    for (const a of aliases) {
      if (a.includes(q)) return 45;
    }
    return 0;
  }

  function buildPoiFromEntry(entry, navGraph, gNodes) {
    const node = navGraph?.nodesById?.get(entry.graphNodeId) || gNodes?.[entry.graphNodeId];
    const snap = node ? { x: node.x, y: node.y } : null;
    return {
      id: entry.fullLayerName,
      rawId: entry.fullLayerName,
      name: entry.displayName,
      searchLabel: entry.displayName,
      level: entry.floorId,
      mapLevel: entry.floorId,
      building: entry.displayName,
      group: "geral",
      cat: "geral",
      active: true,
      fromLayerIndex: true,
      layerAccessNodeId: entry.accessNodeId,
      officialAccessNodeId: nodeIdBase(entry.accessNodeId),
      graphNodeId: entry.graphNodeId,
      anchor: entry.graphNodeId,
      navNodeIds: [entry.graphNodeId],
      snap,
      iconX: snap?.x,
      iconY: snap?.y,
      x: snap?.x,
      y: snap?.y,
      layerSearchTerms: [entry.normalizedName, ...entry.aliases],
    };
  }

  function buildMultiAccessPoi(areaId, area, nodeId, label, navGraph, gNodes, gAdj) {
    const validated = validateAccessNode(nodeId, label, navGraph, gNodes, gAdj);
    if (!validated) return null;
    const node = navGraph?.nodesById?.get(validated.graphNodeId) || gNodes?.[validated.graphNodeId];
    const snap = node ? { x: node.x, y: node.y } : null;
    return {
      id: `l00-multi-${areaId}-${nodeIdBase(nodeId)}`,
      rawId: `l00-multi-${areaId}-${nodeIdBase(nodeId)}`,
      name: label,
      searchLabel: label,
      level: LEVEL,
      mapLevel: LEVEL,
      building: area.displayName,
      group: "geral",
      cat: "geral",
      active: true,
      isMultiAccessOption: true,
      multiAccessAreaId: areaId,
      fromLayerIndex: true,
      officialAccessNodeId: nodeIdBase(nodeId),
      graphNodeId: validated.graphNodeId,
      anchor: validated.graphNodeId,
      navNodeIds: [validated.graphNodeId],
      snap,
      iconX: snap?.x,
      iconY: snap?.y,
      x: snap?.x,
      y: snap?.y,
    };
  }

  function buildGenericMultiAccessPoi(areaId, area) {
    return {
      id: `l00-generic-${areaId}`,
      rawId: `l00-generic-${areaId}`,
      name: area.displayName,
      searchLabel: area.displayName,
      level: LEVEL,
      mapLevel: LEVEL,
      isGenericGroundDestination: true,
      isGenericTemple: areaId === "templo",
      multiAccessAreaId: areaId,
      groundFloorAreaId: areaId,
    };
  }

  /**
   * Busca POIs indexados + áreas multi-acesso.
   * @returns {{ hint: string|null, items: object[] }}
   */
  function search(query, navGraph, gNodes, gAdj) {
    const q = String(query || "").trim();
    if (!q) return { hint: null, items: [] };

    for (const [areaId, area] of Object.entries(SINGLE_ACCESS_LOCATIONS)) {
      if (!matchesMultiAccess(q, area)) continue;
      const poi = buildMultiAccessPoi(
        areaId,
        { displayName: area.displayName },
        area.nodeId,
        area.displayName,
        navGraph,
        gNodes,
        gAdj
      );
      if (poi) {
        if (area.poiRawId) {
          poi.id = area.poiRawId;
          poi.rawId = area.poiRawId;
        }
        return { hint: null, items: [poi] };
      }
    }

    for (const [areaId, area] of Object.entries(MULTI_ACCESS_LOCATIONS)) {
      if (!matchesMultiAccess(q, area)) continue;
      if (!isGenericMultiAccessQuery(q, area)) continue;
      // Templo: só "Templo" na busca — entradas ficam em Opções de rota
      if (areaId === "templo") {
        return { hint: null, items: [buildGenericMultiAccessPoi(areaId, area)] };
      }
      const items = (area.nodeIds || [])
        .map((nodeId, i) => buildMultiAccessPoi(
          areaId,
          area,
          nodeId,
          area.accessLabels?.[i] || `${area.displayName} — Acesso ${i + 1}`,
          navGraph,
          gNodes,
          gAdj
        ))
        .filter(Boolean);
      if (items.length) {
        return {
          hint: area.selectionHint || `Escolha um acesso de ${area.displayName}`,
          items,
        };
      }
      return {
        hint: area.selectionHint,
        items: [buildGenericMultiAccessPoi(areaId, area)],
      };
    }

    const scored = searchIndex
      .map((entry) => ({ entry, score: searchScore(entry, q) }))
      .filter((x) => x.score > 0)
      .sort((a, b) => {
        if (b.score !== a.score) return b.score - a.score;
        return a.entry.displayName.localeCompare(b.entry.displayName, "pt-BR");
      });

    if (!scored.length) return { hint: null, items: [] };
    return {
      hint: null,
      items: scored.map((x) => buildPoiFromEntry(x.entry, navGraph, gNodes)),
    };
  }

  function entryForLayer(layerName) {
    return byLayerName.get(String(layerName || "").trim()) || null;
  }

  function poiFromLayer(layerName, navGraph, gNodes, gAdj) {
    const entry = entryForLayer(layerName);
    if (!entry) {
      const parsed = parsePoiLayerName(layerName);
      if (!parsed) return null;
      const validated = validateAccessNode(
        parsed.accessNodeId,
        parsed.displayName,
        navGraph,
        gNodes,
        gAdj
      );
      if (!validated) return null;
      return buildPoiFromEntry({
        ...parsed,
        graphNodeId: validated.graphNodeId,
        valid: true,
        aliases: parsed.aliases.map(normalizeSearchText),
      }, navGraph, gNodes);
    }
    if (!entry.valid) return null;
    return buildPoiFromEntry(entry, navGraph, gNodes);
  }

  function enrichPoi(poi, navGraph, gNodes, gAdj) {
    if (!poi) return poi;
    const layerName = poi.rawId || poi.id || "";
    const parsed = parsePoiLayerName(layerName);
    if (parsed) {
      const validated = validateAccessNode(
        parsed.accessNodeId,
        parsed.displayName,
        navGraph,
        gNodes,
        gAdj
      );
      if (!validated) return poi;
      const built = buildPoiFromEntry({
        ...parsed,
        graphNodeId: validated.graphNodeId,
        valid: true,
        aliases: parsed.aliases.map(normalizeSearchText),
      }, navGraph, gNodes);
      Object.assign(poi, built);
      return poi;
    }
    const entry = entryForLayer(layerName);
    if (entry?.valid) {
      Object.assign(poi, buildPoiFromEntry(entry, navGraph, gNodes));
    }
    return poi;
  }

  function hasOfficialLayerNode(poi) {
    if (!poi) return false;
    if (poi.fromLayerIndex && poi.graphNodeId) return true;
    return !!parsePoiLayerName(poi.rawId || poi.id || "");
  }

  function resolveOfficialNodeId(poi, navGraph, gNodes, gAdj) {
    if (!poi) return null;
    if (poi.isGenericGroundDestination || poi.isGenericTemple) return { block: true };
    const layerName = poi.rawId || poi.id || "";
    const parsed = parsePoiLayerName(layerName);
    if (parsed) {
      const validated = validateAccessNode(
        parsed.accessNodeId,
        parsed.displayName,
        navGraph,
        gNodes,
        gAdj
      );
      if (!validated) return { unavailable: true, baseId: nodeIdBase(parsed.accessNodeId) };
      return { graphNodeId: validated.graphNodeId, baseId: validated.accessNodeId };
    }
    if (poi.officialAccessNodeId || poi.graphNodeId) {
      const base = nodeIdBase(poi.officialAccessNodeId || poi.graphNodeId);
      const resolved = poi.graphNodeId || resolveGraphNodeId(base, navGraph, gNodes);
      if (!resolved || !graphNodeHasEdges(resolved, navGraph, gAdj)) {
        return { unavailable: true, baseId: base };
      }
      return { graphNodeId: resolved, baseId: base };
    }
    return null;
  }

  function isLayerPoiElementId(id) {
    return !!parsePoiLayerName(id);
  }

  global.L00PoiLayerIndex = {
    LEVEL,
    POI_METADATA,
    MULTI_ACCESS_LOCATIONS,
    normalizeSearchText,
    parsePoiLayerName,
    nodeIdBase,
    resolveGraphNodeId,
    graphNodeHasEdges,
    validateAccessNode,
    buildSearchIndex,
    search,
    entryForLayer,
    poiFromLayer,
    enrichPoi,
    hasOfficialLayerNode,
    resolveOfficialNodeId,
    isLayerPoiElementId,
    getSearchIndex: () => searchIndex.slice(),
    getInvalidEntries: () => invalidEntries.slice(),
    getValidationReport: () => lastValidationReport,
  };
})(typeof window !== "undefined" ? window : globalThis);
