/**
 * Associação explícita: área pesquisável do Térreo (L00) → node oficial de acesso.
 * Fonte de verdade para início/fim de rotas no campus térreo.
 */
(function (global) {
  "use strict";

  const LEVEL = "L00";

  function l00Idx() {
    return global.L00PoiLayerIndex || null;
  }

  /** @type {Array<object>} */
  const FLOOR_GROUND_DESTINATIONS = [
    {
      id: "templo",
      label: "Templo",
      requiresAccessSelection: true,
      selectionHint: "Escolha uma entrada do Templo",
      searchTerms: ["templo", "igreja"],
      accesses: [
        { label: "Templo — Entrada 1", nodeId: "L00_node_0088" },
        { label: "Templo — Entrada 2", nodeId: "L00_node_0072" },
        { label: "Templo — Entrada 3", nodeId: "L00_node_0015" },
        { label: "Templo — Entrada 4", nodeId: "L00_node_0036" },
        { label: "Templo — Entrada 5", nodeId: "L00_node_0018" },
      ],
    },
    {
      id: "entradaNarnia",
      label: "Entrada para Narnia",
      nodeId: "L00_node_0016",
      searchTerms: ["entrada para narnia", "entrada narnia", "porta de narnia", "narnia"],
      poiRawIds: ["B02_entrada_narnia", "P028_B02_entrada_narnia"],
    },
    {
      id: "espacoServir",
      label: "Espaço Servir",
      nodeId: "L00_node_0035_espaco_servir",
      searchTerms: ["espaco servir", "espaço servir", "servir"],
      poiRawIds: ["P020_espaco_servir"],
    },
    {
      id: "jardim",
      label: "Jardim",
      nodeId: "L00_node_0037_jardim",
      searchTerms: ["jardim"],
      poiRawIds: ["P016_jardim"],
    },
    {
      id: "entradaAvBatel",
      label: "Entrada Av. Batel",
      requiresAccessSelection: true,
      selectionHint: "Escolha um acesso da Entrada Av. Batel",
      searchTerms: ["entrada av batel", "entrada av. batel", "av batel", "avenida batel", "entrada batel"],
      accesses: [
        { label: "Entrada Av. Batel — Acesso 1", nodeId: "L00_node_0087" },
        { label: "Entrada Av. Batel — Acesso 2", nodeId: "L00_node_0086" },
      ],
    },
    {
      id: "ceara",
      label: "CEARA",
      nodeId: "L00_node_0076",
      searchTerms: ["ceara", "ceará", "espaco acolher ceara", "espaço acolher ceará"],
      poiRawIds: ["P017_espaco_acolher_ceara"],
    },
    {
      id: "livrariaEvangelica",
      label: "Livraria Evangélica",
      nodeId: "L00_node_0080",
      searchTerms: ["livraria evangelica", "livraria evangélica", "livraria"],
      poiRawIds: ["P009_livraria_evangelica"],
    },
    {
      id: "conexaoServir",
      label: "Espaço conexão",
      nodeId: "L00_node_0082",
      searchTerms: ["espaco conexao", "espaço conexão", "conexao servir", "conexão servir"],
      poiRawIds: ["P010_espaco_conexao"],
    },
    {
      id: "escadaLateral",
      label: "Escadas laterais T",
      nodeId: "L00_node_0079_escada_lateral_",
      searchTerms: ["escada lateral", "escadas laterais", "escadas laterais t", "escada lateral t", "escadas"],
      poiRawIds: ["L00_escadas_laterais_t", "gfr-escadaLateral"],
    },
    {
      id: "escadaEmergencia",
      label: "Escada de Emergência",
      nodeId: "L00_node_0078",
      searchTerms: ["escada de emergencia", "escada de emergência", "escada emergencia"],
    },
    {
      id: "elevadores",
      label: "Elevadores T",
      nodeId: "L00_node_0081_elevador_t",
      searchTerms: ["elevadores", "elevador templo", "elevador do templo", "elevadores t"],
      poiRawIds: ["P027_elevador_templo"],
    },
    {
      id: "bercarioStart",
      label: "Berçário START",
      nodeId: "L00_node_0075",
      searchTerms: ["bercario start", "berçário start", "bercario"],
    },
    {
      id: "banheiroFamiliaBebes",
      label: "Banheiro Família e Bebês",
      nodeId: "L00_node_0074",
      searchTerms: ["banheiro familia", "banheiro família", "banheiro familia e bebes", "banheiro bebes"],
      poiRawIds: ["P011_bercario", "P019_banheiro_familia"],
    },
    {
      id: "banheiroFemininoTemplo",
      label: "Banheiro Feminino",
      nodeId: "L00_node_0070",
      searchTerms: ["banheiro feminino templo", "banheiro feminino do templo"],
      poiRawIds: ["P023_banheiro_feminino"],
    },
    {
      id: "banheiroMasculinoTemplo",
      label: "Banheiro Masculino",
      nodeId: "L00_node_0069",
      searchTerms: ["banheiro masculino templo", "banheiro masculino do templo"],
      poiRawIds: ["P024_banheiro_masculino"],
    },
    {
      id: "capela",
      label: "Capela",
      nodeId: "L00_node_0068",
      searchTerms: ["capela"],
      poiRawIds: ["P002_capela"],
    },
    {
      id: "recepcao",
      label: "Recepção",
      nodeId: "L00_node_0029",
      searchTerms: ["recepcao", "recepção"],
      poiRawIds: ["P013_recepcao"],
    },
    {
      id: "salaOracaoCleude",
      label: "Sala de Oração Cleude",
      nodeId: "L00_node_0030",
      searchTerms: ["sala de oracao cleude", "sala de oração cleude", "cleude", "cleusa"],
      poiRawIds: ["P012_sala_de_oracao_cleusa"],
    },
    {
      id: "entradaToldo",
      label: "Entrada do Toldo",
      nodeId: "L00_node_0027",
      searchTerms: ["entrada do toldo", "entrada toldo", "toldo"],
      poiRawIds: ["P001_entrada_principal_toldo"],
    },
    {
      id: "abasc",
      label: "ABASC",
      nodeId: "L00_node_0064",
      searchTerms: ["abasc"],
      poiRawIds: ["P018_abasc"],
    },
    {
      id: "restauranteSevenpass",
      label: "Restaurante SEVENPASS",
      nodeId: "L00_node_0054",
      searchTerms: ["restaurante sevenpass", "sevenpass", "seven pass", "restaurante"],
      poiRawIds: ["P014_seven_pass"],
    },
    {
      id: "entradaSevenpassGinasio",
      label: "Entrada SEVENPASS / Ginásio",
      nodeId: "L00_node_0054",
      searchTerms: ["entrada sevenpass", "entrada seven pass", "entrada sevenpass ginasio"],
    },
    {
      id: "entradaGinasio",
      label: "Entrada do Ginásio",
      nodeId: "L00_node_0054",
      searchTerms: ["entrada do ginasio", "entrada do ginásio", "entrada ginasio"],
      poiRawIds: ["entrada_ginasio"],
    },
    {
      id: "banheirosRestaurante",
      label: "Banheiros do Restaurante",
      nodeId: "L00_node_0062",
      searchTerms: ["banheiros do restaurante", "banheiro restaurante"],
      poiRawIds: ["P025_banheiro_masculino_feminino"],
    },
    {
      id: "banheiroFemininoRestaurante",
      label: "Banheiro Feminino do Restaurante",
      nodeId: "L00_node_0058",
      searchTerms: ["banheiro feminino do restaurante", "banheiro feminino restaurante"],
      poiRawIds: ["P021_banheiro_feminino_ginasio"],
    },
    {
      id: "banheiroMasculinoRestaurante",
      label: "Banheiro Masculino do Restaurante",
      nodeId: "L00_node_0052",
      searchTerms: ["banheiro masculino do restaurante", "banheiro masculino restaurante"],
      poiRawIds: ["P022_banheiro_masculino_ginasio"],
    },
    {
      id: "escadasGinasio",
      label: "Escadas do Ginásio",
      requiresAccessSelection: true,
      selectionHint: "Escolha um acesso das Escadas do Ginásio",
      searchTerms: ["escadas do ginasio", "escadas do ginásio", "escada ginasio"],
      accesses: [
        { label: "Escadas do Ginásio — Acesso 1", nodeId: "L00_node_0051" },
        { label: "Escadas do Ginásio — Acesso 2", nodeId: "L00_node_0057" },
      ],
    },
    {
      id: "ministerioEsportes",
      label: "Ministério de Esportes",
      nodeId: "L00_node_0063",
      searchTerms: ["ministerio de esportes", "ministério de esportes", "min esportes", "ministerio esportes"],
      poiRawIds: ["min_esportes", "P026_elevador_ginasio"],
    },
    {
      id: "bazarAbasc",
      label: "Bazar ABASC",
      nodeId: "L00_node_0053",
      searchTerms: ["bazar abasc", "bazar"],
      poiRawIds: ["P015_bazar_abasc"],
    },
    {
      id: "areaKidsT",
      label: "Área Kids T",
      nodeId: "L00_node_0001",
      searchTerms: ["area kids t", "área kids t", "area kids terreo", "area kids", "kids t"],
      poiRawIds: ["P007_area_kids", "P007T_area_kids_t"],
    },
    {
      id: "restauranteExterno",
      label: "Restaurante Externo",
      nodeId: "L00_node_0059",
      searchTerms: ["restaurante externo", "refeitorio externo"],
      poiRawIds: ["P008_refeitorio_externo"],
    },
    {
      id: "estacionamentoBentoViana",
      label: "Estacionamento Bento Viana",
      requiresAccessSelection: true,
      selectionHint: "Escolha um acesso do Estacionamento Bento Viana",
      searchTerms: ["estacionamento bento viana", "estacionamento bento"],
      accesses: [
        { label: "Estacionamento Bento Viana — Acesso 1", nodeId: "L00_node_0022" },
        { label: "Estacionamento Bento Viana — Acesso 2", nodeId: "L00_node_0021" },
      ],
    },
    {
      id: "estacionamentoMotosBento",
      label: "Estacionamento de Motos Bento",
      nodeId: "L00_node_0009",
      searchTerms: ["estacionamento motos bento", "estacionamento moto", "motos bento"],
      poiRawIds: ["P028_estacionamento_moto"],
    },
    {
      id: "estacionamentoConveniado",
      label: "Estacionamento Conveniado",
      nodeId: "L00_node_0038",
      searchTerms: ["estacionamento conveniado", "estacionamento 02"],
      poiRawIds: ["P006_estacionamento_02"],
    },
    {
      id: "salaOracaoRgo",
      label: "Sala de Oração RGO",
      nodeId: "L00_node_0045",
      searchTerms: ["sala de oracao rgo", "sala de oração rgo", "rgo", "sala rgo"],
      poiRawIds: ["P004_sala_de_oracao_RGO"],
    },
    {
      id: "centroFormacao",
      label: "Centro de Formação | CF",
      nodeId: "L00_node_0042",
      searchTerms: [
        "centro de formacao",
        "centro de formação",
        "centro formacao",
        "formacao cf",
        "cf",
        "centro de formacao cf",
        "centro formacao cf",
      ],
      poiRawIds: ["P005_centro_de_formacao"],
    },
    {
      id: "entradaPedestresAvBatel",
      label: "Entrada de Pedestres Av. Batel",
      nodeId: "L00_node_0039",
      searchTerms: ["entrada de pedestres av batel", "entrada pedestres av batel", "pedestres av batel"],
      poiRawIds: ["P029_entrada_pedestre_02_batel"],
    },
    {
      id: "entradaPedestresBento",
      label: "Entrada de Pedestres Bento",
      nodeId: "L00_node_0003",
      searchTerms: ["entrada de pedestres bento", "entrada pedestres bento", "pedestres bento"],
      poiRawIds: ["P031_entrada_estacionamento_bento_viana"],
    },
    {
      id: "entradaSaidaCarrosBento",
      label: "Entrada/Saída de Carros Bento Viana",
      requiresAccessSelection: true,
      selectionHint: "Escolha um acesso de Entrada/Saída de Carros Bento Viana",
      searchTerms: [
        "entrada de carros bento viana",
        "saida de carros bento viana",
        "saída de carros bento viana",
        "entrada saida de carros bento viana",
        "entrada/saida de carros bento viana",
        "carros bento viana",
      ],
      accesses: [
        { label: "Entrada/Saída de Carros Bento Viana — Acesso 1", nodeId: "L00_node_0004" },
        { label: "Entrada/Saída de Carros Bento Viana — Acesso 2", nodeId: "L00_node_0005" },
      ],
    },
  ];

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

  function warnUnavailable(baseId) {
    console.warn(`[GroundFloorRoute] Destino indisponível: node ${baseId} não encontrado ou sem edge válido.`);
  }

  function validateAccess(access, navGraph, gNodes, gAdj) {
    const baseId = nodeIdBase(access.nodeId);
    const resolved = resolveGraphNodeId(baseId, navGraph, gNodes);
    if (!resolved || nodeLevel(resolved, navGraph, gNodes) !== LEVEL) {
      warnUnavailable(baseId);
      return null;
    }
    if (!graphNodeHasEdges(resolved, navGraph, gAdj)) {
      warnUnavailable(baseId);
      return null;
    }
    const node = navGraph?.nodesById?.get(resolved) || gNodes?.[resolved];
    const campus = global.CONFIG?.templeEntranceIconCampus?.[baseId]
      || global.CONFIG?.templeEntranceIconCampus?.[resolved];
    return {
      nodeId: baseId,
      graphNodeId: resolved,
      label: access.label,
      x: node?.x,
      y: node?.y,
      routeIconX: campus?.x,
      routeIconY: campus?.y,
    };
  }

  const _rawToAreaId = new Map();
  FLOOR_GROUND_DESTINATIONS.forEach((area) => {
    (area.poiRawIds || []).forEach((raw) => _rawToAreaId.set(raw, area.id));
    if (area.nodeId) _rawToAreaId.set(area.id, area.id);
    (area.accesses || []).forEach((acc) => {
      _rawToAreaId.set(`${area.id}:${nodeIdBase(acc.nodeId)}`, area.id);
    });
  });

  function areaById(id) {
    return FLOOR_GROUND_DESTINATIONS.find((a) => a.id === id) || null;
  }

  function areaForPoiRaw(rawId) {
    if (!rawId) return null;
    const key = String(rawId).replace(/_x5F_/g, "_");
    const areaId = _rawToAreaId.get(key);
    return areaId ? areaById(areaId) : null;
  }

  function normTerm(s) {
    return String(s || "")
      .normalize("NFD")
      .replace(/[\u0300-\u036f]/g, "")
      .toLowerCase()
      .replace(/\s+/g, " ")
      .trim();
  }

  function termMatches(query, term) {
    const q = normTerm(query);
    const t = normTerm(term);
    if (!q || !t) return false;
    if (q === t) return true;
    if (t.startsWith(q) && q.length >= 2) return true;
    if (q.includes(t) || t.includes(q)) return true;
    return false;
  }

  function areaSearchTerms(area) {
    const terms = [...(area.searchTerms || []), area.label];
    (area.poiRawIds || []).forEach((raw) => {
      const aliases = (global.CONFIG?.poiSearchAliases || {})[raw];
      if (Array.isArray(aliases)) terms.push(...aliases);
    });
    return terms;
  }

  function matchesArea(query, area) {
    return areaSearchTerms(area).some((t) => termMatches(query, t));
  }

  function matchesAccess(query, access) {
    return termMatches(query, access.label);
  }

  function isSpecificAccessQuery(query, area) {
    const q = normTerm(query);
    if (!area?.accesses || !q) return false;
    return area.accesses.some((acc) => normTerm(acc.label) === q);
  }

  function buildAccessPoi(area, validatedAccess) {
    const id = `gfr-${area.id}-${validatedAccess.nodeId}`;
    const iconX = validatedAccess.routeIconX ?? validatedAccess.x;
    const iconY = validatedAccess.routeIconY ?? validatedAccess.y;
    return {
      id,
      rawId: id,
      name: validatedAccess.label,
      searchLabel: validatedAccess.label,
      level: LEVEL,
      mapLevel: LEVEL,
      building: area.label,
      group: "geral",
      cat: "geral",
      active: true,
      groundFloorAreaId: area.id,
      officialAccessNodeId: validatedAccess.nodeId,
      graphNodeId: validatedAccess.graphNodeId,
      templeEntranceNodeId: area.id === "templo" ? validatedAccess.nodeId : undefined,
      anchor: validatedAccess.graphNodeId,
      navNodeIds: [validatedAccess.graphNodeId],
      snap: { x: validatedAccess.x, y: validatedAccess.y },
      x: iconX,
      y: iconY,
      iconX,
      iconY,
    };
  }

  function buildGenericAreaPoi(area) {
    return {
      id: `gfr-generic-${area.id}`,
      rawId: `gfr-generic-${area.id}`,
      name: area.label,
      searchLabel: area.label,
      level: LEVEL,
      mapLevel: LEVEL,
      building: area.label,
      group: "geral",
      cat: "geral",
      active: true,
      groundFloorAreaId: area.id,
      isGenericGroundDestination: true,
      isGenericTemple: area.id === "templo",
    };
  }

  function buildSingleAreaPoi(area, validated, navGraph, gNodes) {
    const acc = validated || validateAccess({ nodeId: area.nodeId, label: area.label }, navGraph, gNodes, null);
    if (!acc) return null;
    const raw = area.poiRawIds?.[0] || `gfr-${area.id}`;
    const campus = global.CONFIG?.poiRouteEdges?.[raw]?.icon
      || global.CONFIG?.poiIconCampus?.[raw];
    const iconX = campus?.x ?? acc.x;
    const iconY = campus?.y ?? acc.y;
    return {
      id: `gfr-${area.id}`,
      rawId: raw,
      name: area.label,
      searchLabel: area.label,
      level: LEVEL,
      mapLevel: LEVEL,
      building: area.label,
      group: "geral",
      cat: "geral",
      active: true,
      groundFloorAreaId: area.id,
      officialAccessNodeId: acc.nodeId,
      graphNodeId: acc.graphNodeId,
      anchor: acc.graphNodeId,
      navNodeIds: [acc.graphNodeId],
      snap: { x: acc.x, y: acc.y },
      x: iconX,
      y: iconY,
      iconX,
      iconY,
    };
  }

  function getValidatedAccesses(area, navGraph, gNodes, gAdj) {
    return (area.accesses || [])
      .map((acc) => validateAccess(acc, navGraph, gNodes, gAdj))
      .filter(Boolean);
  }

  /**
   * Busca destinos oficiais do térreo.
   * @returns {{ hint: string|null, items: object[] }}
   */
  function search(query, navGraph, gNodes, gAdj) {
    const q = String(query || "").trim();
    if (!q) return { hint: null, items: [] };

    const L00I = l00Idx();
    if (L00I) {
      const fromLayer = L00I.search(q, navGraph, gNodes, gAdj);
      if (fromLayer.items.length) return fromLayer;
    }

    for (const area of FLOOR_GROUND_DESTINATIONS) {
      if (!area.requiresAccessSelection || !matchesArea(q, area)) continue;
      if (isSpecificAccessQuery(q, area)) continue;
      if (area.id === "templo") {
        return { hint: null, items: [buildGenericAreaPoi(area)] };
      }
      const accesses = getValidatedAccesses(area, navGraph, gNodes, gAdj);
      if (accesses.length) {
        return {
          hint: area.selectionHint,
          items: accesses.map((a) => buildAccessPoi(area, a)),
        };
      }
    }

    const accessHits = [];
    for (const area of FLOOR_GROUND_DESTINATIONS) {
      if (!area.accesses) continue;
      for (const acc of area.accesses) {
        if (matchesAccess(q, acc)) {
          const v = validateAccess(acc, navGraph, gNodes, gAdj);
          if (v) accessHits.push(buildAccessPoi(area, v));
        }
      }
    }
    if (accessHits.length) {
      const dedup = [];
      const seen = new Set();
      for (const p of accessHits) {
        if (seen.has(p.officialAccessNodeId)) continue;
        seen.add(p.officialAccessNodeId);
        dedup.push(p);
      }
      return { hint: null, items: dedup };
    }

    for (const area of FLOOR_GROUND_DESTINATIONS) {
      if (!matchesArea(q, area) || area.requiresAccessSelection) continue;
      const poi = buildSingleAreaPoi(area, null, navGraph, gNodes);
      if (poi) return { hint: null, items: [poi] };
    }

    return { hint: null, items: [] };
  }

  function isOfficialAccessPoi(poi) {
    if (!poi) return false;
    if (l00Idx()?.hasOfficialLayerNode(poi)) return true;
    return !!(poi.officialAccessNodeId || poi.templeEntranceNodeId || poi.graphNodeId && poi.groundFloorAreaId);
  }

  function isGenericGroundDestination(poi) {
    return !!(poi?.isGenericGroundDestination || poi?.isGenericTemple);
  }

  function isMappedL00Poi(poi, poiRawKeyFn) {
    if (!poi) return false;
    if (l00Idx()?.hasOfficialLayerNode(poi)) return true;
    if (poi.fromLayerIndex || poi.groundFloorAreaId || poi.officialAccessNodeId) return true;
    const raw = poiRawKeyFn ? poiRawKeyFn(poi) : (poi.rawId || poi.id || "");
    return !!areaForPoiRaw(raw) || !!l00Idx()?.parsePoiLayerName(raw);
  }

  function enrichPoiWithOfficialNode(poi, navGraph, gNodes, gAdj, poiRawKeyFn) {
    if (!poi || isGenericGroundDestination(poi)) return poi;
    const L00I = l00Idx();
    if (L00I) {
      L00I.enrichPoi(poi, navGraph, gNodes, gAdj);
      if (L00I.hasOfficialLayerNode(poi)) return poi;
    }
    if (isOfficialAccessPoi(poi)) return poi;
    const raw = poiRawKeyFn ? poiRawKeyFn(poi) : (poi.rawId || "");
    const area = areaForPoiRaw(raw);
    if (!area || area.requiresAccessSelection) return poi;
    if (!area.nodeId) return poi;
    const v = validateAccess({ nodeId: area.nodeId, label: area.label }, navGraph, gNodes, gAdj);
    if (!v) return poi;
    poi.groundFloorAreaId = area.id;
    poi.officialAccessNodeId = v.nodeId;
    poi.graphNodeId = v.graphNodeId;
    poi.anchor = v.graphNodeId;
    poi.navNodeIds = [v.graphNodeId];
    if (v.x != null) {
      poi.snap = { x: v.x, y: v.y };
      poi.iconX = v.x;
      poi.iconY = v.y;
      poi.x = v.x;
      poi.y = v.y;
    }
    return poi;
  }

  function resolveOfficialNodeId(poi, navGraph, gNodes, gAdj) {
    if (!poi) return null;
    if (isGenericGroundDestination(poi)) return { block: true };

    const L00I = l00Idx();
    if (L00I) {
      const fromLayer = L00I.resolveOfficialNodeId(poi, navGraph, gNodes, gAdj);
      if (fromLayer) return fromLayer;
    }

    const base = poi.officialAccessNodeId || poi.templeEntranceNodeId || (poi.graphNodeId ? nodeIdBase(poi.graphNodeId) : null);
    if (!base) return null;

    const resolved = poi.graphNodeId || resolveGraphNodeId(base, navGraph, gNodes);
    if (!resolved || nodeLevel(resolved, navGraph, gNodes) !== LEVEL) {
      warnUnavailable(base);
      return { unavailable: true, baseId: base };
    }
    if (!graphNodeHasEdges(resolved, navGraph, gAdj)) {
      warnUnavailable(base);
      return { unavailable: true, baseId: base };
    }
    return { graphNodeId: resolved, baseId: base };
  }

  function validateAll(navGraph, gNodes, gAdj) {
    const report = { found: [], missing: [], noEdge: [], multiAccess: [] };
    for (const area of FLOOR_GROUND_DESTINATIONS) {
      if (area.requiresAccessSelection) {
        report.multiAccess.push(area.id);
        for (const acc of area.accesses || []) {
          const base = nodeIdBase(acc.nodeId);
          const r = resolveGraphNodeId(base, navGraph, gNodes);
          if (!r) report.missing.push(base);
          else if (!graphNodeHasEdges(r, navGraph, gAdj)) report.noEdge.push(base);
          else report.found.push(base);
        }
      } else {
        const base = nodeIdBase(area.nodeId);
        const r = resolveGraphNodeId(base, navGraph, gNodes);
        if (!r) report.missing.push(base);
        else if (!graphNodeHasEdges(r, navGraph, gAdj)) report.noEdge.push(base);
        else report.found.push(base);
      }
    }
    return report;
  }

  global.GroundFloorRouteMap = {
    LEVEL,
    FLOOR_GROUND_DESTINATIONS,
    nodeIdBase,
    resolveGraphNodeId,
    graphNodeHasEdges,
    search,
    buildAccessPoi,
    buildGenericAreaPoi,
    buildSingleAreaPoi,
    getValidatedAccesses,
    areaById,
    areaForPoiRaw,
    isOfficialAccessPoi,
    isGenericGroundDestination,
    isMappedL00Poi,
    enrichPoiWithOfficialNode,
    resolveOfficialNodeId,
    validateAccess,
    validateAll,
    warnUnavailable,
  };
})(typeof window !== "undefined" ? window : globalThis);
