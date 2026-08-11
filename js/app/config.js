/** Configuração principal — mapa PIB Curitiba */
(function (global) {
  "use strict";
  global.PIBMapConfig = {
    appBuild: "364",
    showAllInfoTexts: true,
    /** URL com cache-bust automático (usa appBuild). */
    appAssetUrl(path) {
      const v = global.PIBMapConfig?.appBuild || global.__PIB_BUILD__ || "0";
      if (!path) return path;
      const sep = String(path).includes("?") ? "&" : "?";
      return `${path}${sep}v=${encodeURIComponent(v)}`;
    },
    // UI técnica (calibração / camadas SVG) só com ?calib=1 ou ?dev=1
    isDev: /(?:\?|&)(?:calib|dev)=1(?:&|$)/.test(location.search),
    svgFiles: {
      background: "assets/mapa-background.svg",
      wall: "assets/mapa-wall.svg",
      edgeIndoor: "assets/mapa-edge-indoor.svg",
      edgeOutdoor: "assets/mapa-edge-outdoor.svg",
      nodes: "assets/mapa-nodes.svg",
      pois: "assets/mapa-pois.svg",
      infoTextos: "assets/mapa-info-textos.svg",
    },
    layers: {
      // IDs no SVG composto — malha refinada 2026 (L00_nodes / L00_edges_*)
      nodes: ["L00_nodes"],
      edges: ["L00_edges_indoor", "L00_edges_outdoor"],
      edgeZones: ["indoor", "outdoor"],
      pois: ["_08_info_icon"],
      visible: [
        "_02_background_estacionamento_BG",
        "_03_background_estacionamento_Map",
        "_04__background_wall_paredes_tech",
        "_07_txt_info",
        "_08_info_icon",
        "_x30_4_x5F__x5F_background_x5F_wall_x5F_paredes_x5F_tech",
        "_x30_7_x5F_txt_x5F_info",
        "_x30_8_x5F_pois",
      ],
      technical: [
        "L00_edges_indoor",
        "L00_edges_outdoor",
        "L00_nodes",
        "_x30_5_x5F_edge_x5F_indoor_x5F_tech",
        "_x30_6_x5F_edge_x5F_outdoor-tech",
        "_x30_9_x5F_nodes_x5F_L00",
      ],
    },
    // no background antigo, as camadas ainda têm estes IDs (antes da substituição)
    replaceTargets: {
      nodes: "_x30_9_x5F_nodes_x5F_L00",
      pois: "_x30_8_x5F_pois",
      wall: "_x30_4_x5F__x5F_background_x5F_wall_x5F_paredes_x5F_tech",
      infoTextos: "_x30_7_x5F_txt_x5F_info",
      edgeIndoor: "_x30_5_x5F_edge_x5F_indoor_x5F_tech",
      edgeOutdoor: "_x30_6_x5F_edge_x5F_outdoor-tech",
    },
    /** IDs alternativos nos SVGs 2026 (export limpo vs. placeholders do background). */
    layerSourceAliases: {
      wall: [
        "_04__background_wall_paredes_tech",
        "_04_background_wall_paredes_tech",
        "04__background_wall_paredes_tech",
        "04_background_wall_paredes_tech",
      ],
      parkingMap: [
        "_03_background_estacionamento_Map",
        "03_background_estacionamento_Map",
      ],
      pois: [
        "_08_info_icon_poi",
        "08_info_icon_poi",
        "_08_info_icon",
        "08_info_icon",
      ],
    },
    metersPerUnit: 0.35, // fallback até calibração do Batistério (6,80 m)
    walkingSpeedMps: 1.2,
    calibrationUrl: "data/map-calibration.json",
    navigationUrl: "data/navigation.json",
    snapTol: 8,        // encaixe genérico entre nós (~2,8 m com escala 0,35)
    // Fallback global; preferir toleranceByZone (indoor/outdoor/parking)
    edgeEndpointTol: 20, // ponta de edge ↔ node oficial
    spurTol: 55,       // ícone POI ↔ malha (só visualização da rota)
    edgeSnapTol: 100,  // POI → edge de entrada (fallback)
    entranceTol: 100,  // node oficial de porta ↔ POI (fallback)
    bridgeTol: 6,      // micro-folgas da malha oficial
    componentBridgeTol: 22, // une componentes por folga de exportação (efetivo ≤ bridgeTol×3)
    // Por zona — validar em paredes finas, salas vizinhas, corredores paralelos, estacionamento e templo
    toleranceByZone: {
      indoor: {
        edgeEndpointTol: 18,
        entranceTol: 95,
        edgeSnapTol: 85,
        spurTol: 48,
      },
      outdoor: {
        edgeEndpointTol: 24,
        entranceTol: 130,
        edgeSnapTol: 140,
        spurTol: 72,
      },
      parking: {
        edgeEndpointTol: 22,
        entranceTol: 105,
        edgeSnapTol: 110,
        spurTol: 62,
      },
    },
    // zonas de estacionamento (bbox em unidades SVG) — evita atravessar o pátio
    parkingZones: [
      // pátio principal (vagas ao sul do toldo / templo)
      { x0: 480, y0: 545, x1: 990, y1: 870 },
      // estacionamento 02 (pátio ao lado do CF — não inclui o corredor oeste y≈252)
      { x0: 340, y0: 270, x1: 450, y1: 350 },
    ],
    // clique “Estou aqui” dentro desta área → âncora do POI (ex.: CF)
    herePoiSnapZones: [
      { poiId: "P005_centro_de_formacao", x0: 25, y0: 85, x1: 230, y1: 250 },
      { poiId: "P004_sala_de_oracao_RGO", x0: 25, y0: 85, x1: 230, y1: 250 },
      { poiId: "P020_espaco_servir", x0: 155, y0: 655, x1: 280, y1: 760 },
      { poiId: "P016_jardim", x0: 80, y0: 720, x1: 220, y1: 840 },
    ],
    /** Trecho oficial malha → ícone (POI edge) — rota e clique no ponto visível do mapa. */
    poiRouteEdges: {
      P016_jardim: {
        anchor: "L00_node_0037_jardim",
        meshEdgeIds: ["L00_edge_0038_node_0036_node_0037"],
        icon: { x: 133.83, y: 768.84 },
      },
      P020_espaco_servir: {
        anchor: "L00_node_0035_espaco_servir",
        meshEdgeIds: ["L00_edge_0037_node_0036_node_0035"],
        icon: { x: 207, y: 715 },
      },
      P027_elevador_templo: {
        anchor: "L00_node_0081_elevador_t",
        meshEdgeIds: ["L00_edge_0045_node_0083_node_0081"],
        icon: { x: 372.21, y: 485.59 },
      },
      L00_escadas_laterais_t: {
        anchor: "L00_node_0079_escada_lateral_",
        meshEdgeIds: ["L00_edge_0004_node_0079_node_0084"],
        icon: { x: 397.22, y: 511.24 },
      },
      "gfr-escadaLateral": {
        anchor: "L00_node_0079_escada_lateral_",
        meshEdgeIds: ["L00_edge_0004_node_0079_node_0084"],
        icon: { x: 397.22, y: 511.24 },
      },
    },
    /** Impede prolongamento horizontal leste após a curva do Jardim (0037 → 0036). */
    jardimRouteBlockedEdges: ["L00_edge_0038_node_0036_node_0037"],
    // POIs removidos do mapa — bloqueia ressurgência via cache SVG antigo
    hiddenPoiRawIds: [
      "P000_templo",
      "P000E2_entrada_02_principal_templo",
      "P000E3_entrada_lateral_03_templo",
      "P000E4_entrada_lateral_02_templo",
      "P000E5_entrada_01_principal_templo",
    ],
    /** POI oculto no mapa, mas pesquisável (origem/destino). */
    hiddenSearchPois: [
      {
        rawId: "L00_bebedouro_escadas",
        name: "Bebedouro",
        searchLabel: "Bebedouro | entrada",
        anchor: "L00_node_0028",
        iconCampus: { x: 613.63, y: 588.86 },
        level: "L00",
        cat: "apoio",
      },
      {
        rawId: "L00_bebedouro_abasc",
        name: "Bebedouro",
        searchLabel: "Bebedouro | recepção",
        anchor: "L00_node_0065",
        iconCampus: { x: 658, y: 556.25 },
        level: "L00",
        cat: "apoio",
      },
    ],
    /** POI oculto (sem ícone) — só ancora a direção da rota na malha oficial. */
    hiddenRoutePois: [
      {
        rawId: "P000E4_templo_entrada_4_lateral_03",
        name: "Templo — Entrada 4",
        anchor: "L00_node_0036",
        templeEntranceNodeId: "L00_node_0036",
        iconCampus: { x: 251.73, y: 768.84 },
        level: "L00",
      },
    ],
    // nó de malha → POI exibido (corredor do Espaço Servir, não entrada do templo)
    navNodePoiMap: {
      L00_node_0033_corredor_servir: "P020_espaco_servir",
      L00_node_0035_espaco_servir: "P020_espaco_servir",
      L00_node_0036: "P020_espaco_servir",
    },
    minRouteOptions: 2,
    snapLateral: 0.45,
    // âncora oficial (entrada) por POI — evita misturar locais vizinhos
    poiAnchors: {
      P000_templo: "L00_node_0088__entrada_templo_01",
      P000E1_entrada_lateral_01_templo: "L00_node_0088__entrada_templo_01",
      P000E4_entrada_lateral_02_templo: "L00_node_0072_entrada_templo_02",
      P000E4_templo_entrada_4_lateral_03: "L00_node_0036",
      P001_entrada_principal_toldo: "L00_node_0023",
      P002_capela: "L00_node_0068_capela",
      P003_estacionamento_01: "L00_node_0021_estacionamento_01",
      P004_sala_de_oracao_RGO: "L00_node_0045_rgo",
      P005_centro_de_formacao: "L00_node_0042_cf",
      P006_estacionamento_02: "L00_node_0038",
      P007_area_kids: "L00_node_0001_area_kids_t",
      P007T_area_kids_t: "L00_node_0001_area_kids_t",
      P008_refeitorio_externo: "L00_node_0026_refeitorio_externo_kids_t",
      P009_livraria_evangelica: "L00_node_0080_livraria_evangelica",
      P010_espaco_conexao: "L00_node_0082_espaco_conexao",
      P011_bercario: "L00_node_0074_bercario_familia",
      P012_sala_de_oracao_cleusa: "L00_node_0030_sala_de_oracao_cleude",
      P013_recepcao: "L00_node_0029_recepcao",
      P014_seven_pass: "L00_node_0054_sevenpass",
      P015_bazar_abasc: "L00_node_0053_entrada_abasc",
      P016_jardim: "L00_node_0037_jardim",
      P017_espaco_acolher_ceara: "L00_node_0076_ceara",
      P018_abasc: "L00_node_0064_abasc",
      P019_banheiro_familia: "L00_node_0074_bercario_familia",
      P020_espaco_servir: "L00_node_0035_espaco_servir",
      P021_banheiro_feminino_ginasio: "L00_node_0058",
      P022_banheiro_masculino_ginasio: "L00_node_0052",
      P023_banheiro_feminino: "L00_node_0070",
      P024_banheiro_masculino: "L00_node_0065",
      P025_banheiro_masculino_feminino: "L00_node_0062",
      P026_elevador_ginasio: "L00_node_0063_min_esporte",
      P027_elevador_templo: "L00_node_0081_elevador_t",
      L00_escadas_laterais_t: "L00_node_0079_escada_lateral_",
      L00_bebedouro_escadas: "L00_node_0028",
      L00_bebedouro_abasc: "L00_node_0065",
      "gfr-escadaLateral": "L00_node_0079_escada_lateral_",
      escada_mesanino_01: "L00_node_0089_escada_mesanino_01",
      escada_mesanino_02: "L00_node_0066_escada_mesanino_02",
      P028_estacionamento_moto: "L00_node_0002",
      B02_entrada_narnia: "L00_node_0016_entrada_narnia",
      P028_B02_entrada_narnia: "L00_node_0016_entrada_narnia",
      P029_entrada_pedestre_02_batel: "L00_node_0087_entrada_av_batel_01",
      P030_entrada_estacionamento_av_batel: "L00_node_0086_entrada_av_batel_02",
      P031_entrada_estacionamento_bento_viana: "L00_node_0003_entrada_pedestre_bento",
      entrada_ginasio: "L00_node_0024_entrada_sevenpass_ginasio",
      min_esportes: "L00_node_0063_min_esporte",
      encomun: "B02_node_0012_comunicacao_encomun",
      sala_albert: "B02_node_0004_albert",
      L04_poi_0016: "L04_node_0023_auditorio_l01",
    },
    // rótulos oficiais na busca (podem diferir do ícone no mapa)
    poiDisplayNames: {
      P005_centro_de_formacao: "Centro de Formação | CF",
      P007T_area_kids_t: "Área Kids T",
      P028_estacionamento_moto: "Estacionamento Moto",
      P020_espaco_servir: "Espaço Servir",
      P010_espaco_conexao: "Espaço conexão",
      P000E1_entrada_lateral_01_templo: "Entrada lateral 01 templo",
      L00_bebedouro_escadas: "Bebedouro | entrada",
      L00_bebedouro_abasc: "Bebedouro | recepção",
      escada_mesanino_01: "Mezanino 1",
      escada_mesanino_02: "Mezanino 2",
      min_esportes: "Min. esportes",
      encomun: "Encomun",
      L06_poi_0007: "Sala 07",
      L06_poi_0021: "Sala 08",
      L06_poi_0040: "Sala 08",
      L06_poi_0031: "Sala 09",
      L06_poi_0030: "Sala 10",
      L06_poi_0029: "Sala 11",
      L06_poi_0037: "Sala 12",
      L06_poi_0023: "Sala 13",
      L06_poi_0008: "Sala 14",
      "L06_poi_0017-2": "Sala 15",
      L06_poi_0001: "Sala 16",
      L06_poi_0020: "Sala 17",
      L06_poi_0009: "Sala 18",
      L06_poi_0039: "Sala 19",
      L06_poi_0018: "Sala 20",
    },
    // atalhos de busca → rawId do POI
    poiSearchAliases: {
      P005_centro_de_formacao: ["cf", "centro de formacao cf", "centro formacao cf", "formacao cf"],
      P004_sala_de_oracao_RGO: ["rgo", "sala rgo", "sala de oracao rgo", "oracao", "oração"],
      min_esportes: ["min esportes", "ministerio esportes", "ministerio de esportes", "esportes"],
      encomun: ["encomun", "comunicacao", "comunicação", "rede super", "sala 08", "sala 08 b02"],
      sala_albert: ["sala albert", "albert", "sala abert", "sala 06", "sala 06 b02"],
      P000_templo: ["templo", "igreja"],
      P000E1_entrada_lateral_01_templo: ["templo", "entrada lateral 01 templo", "templo lateral 01"],
      P016_jardim: ["jardim"],
      P010_espaco_conexao: ["espaco conexao", "espaço conexão", "conexao servir", "conexão servir"],
      P007T_area_kids_t: ["area kids t", "area kids terreo", "area kids térreo", "kids t", "area kids"],
      P028_estacionamento_moto: ["estacionamento moto", "estacionamento motos", "moto", "motos", "icon moto"],
      P020_espaco_servir: ["espaco servir", "espaço servir", "servir", "espaco servir b01", "espaço servir b01", "subsolo servir"],
      escada_mesanino_01: ["mesanino 1", "mezanino 1", "escada mesanino 1", "escadas mesanino 1", "mesanino templo 1"],
      escada_mesanino_02: ["mesanino 2", "mezanino 2", "escada mesanino 2", "escadas mesanino 2", "mesanino templo 2"],
      entrada_ginasio: ["ginasio", "ginásio", "seven pass", "sevenpass"],
      B02_entrada_narnia: ["entrada de narnia", "entrada narnia", "porta de narnia", "narnia"],
      B01_entrada_narnia: ["entrada de narnia b01", "entrada narnia b01", "porta de narnia b01"],
      B02_entrada_narnia_map: ["entrada narnia b02", "porta de narnia b02"],
      P027_elevador_templo: ["elevador t", "elevadores t", "elevador templo", "elevadores templo"],
      L00_escadas_laterais_t: ["escada lateral", "escadas laterais", "escadas laterais t", "escada lateral t"],
      "gfr-escadaLateral": ["escada lateral", "escadas laterais", "escadas laterais t", "escada lateral t"],
      L00_bebedouro_escadas: ["bebedouro", "bebedouduro", "agua", "água", "agua potavel", "água potável"],
      L00_bebedouro_abasc: ["bebedouro", "bebedouduro", "agua", "água", "agua potavel", "água potável"],
      L06_poi_0007: ["sala 07", "sala 7"],
      L06_poi_0021: ["sala 08", "sala 8"],
      L06_poi_0040: ["sala 08", "sala 8"],
      L06_poi_0031: ["sala 09", "sala 9"],
      L06_poi_0030: ["sala 10"],
      L06_poi_0029: ["sala 11"],
      L06_poi_0037: ["sala 12"],
      L06_poi_0023: ["sala 13"],
      L06_poi_0008: ["sala 14"],
      "L06_poi_0017-2": ["sala 15"],
      L06_poi_0001: ["sala 16"],
      L06_poi_0020: ["sala 17"],
      L06_poi_0009: ["sala 18"],
      L06_poi_0039: ["sala 19"],
      L06_poi_0018: ["sala 20", "sala 21"],
    },
    // limita opções de rota em pares específicos (evita desvios absurdos no grafo)
    routeOptionCaps: [
      {
        a: ["P005_centro_de_formacao", "P004_sala_de_oracao_RGO"],
        b: ["P000_templo"],
        max: 5,
      },
      {
        a: ["P005_centro_de_formacao", "P004_sala_de_oracao_RGO"],
        b: ["min_esportes"],
        max: 3,
      },
      {
        a: ["P005_centro_de_formacao"],
        b: ["P016_jardim"],
        max: 3,
      },
      {
        a: ["P005_centro_de_formacao"],
        b: ["P020_espaco_servir"],
        max: 4,
      },
      {
        a: ["P004_sala_de_oracao_RGO"],
        b: ["P016_jardim"],
        max: 3,
      },
      {
        a: ["P004_sala_de_oracao_RGO"],
        b: ["P020_espaco_servir"],
        max: 4,
      },
      {
        a: ["P004_sala_de_oracao_RGO"],
        b: ["P010_espaco_conexao"],
        max: 2,
      },
      {
        a: ["P002_capela", "P013_recepcao", "P010_espaco_conexao", "P016_jardim", "P000_templo"],
        b: ["P005_centro_de_formacao"],
        max: 3,
      },
      {
        a: ["P005_centro_de_formacao", "P004_sala_de_oracao_RGO"],
        b: ["P002_capela", "P027_elevador_templo", "L00_escadas_laterais_t", "P010_espaco_conexao"],
        max: 3,
      },
    ],
    /**
     * Rotas L00 entre extremos do terreno (CF/RGO ↔ hall/conexão/elevador).
     * Adiciona alternativa “Pela área interna do térreo” (corredor conexão Templo/Jardim).
     */
    l00InteriorTerrain: {
      label: "Pela área interna do térreo",
      northKeys: [
        "P005_centro_de_formacao",
        "P004_sala_de_oracao_RGO",
        "P006_estacionamento_02",
      ],
      southKeys: [
        "P002_capela",
        "P027_elevador_templo",
        "L00_escadas_laterais_t",
        "P010_espaco_conexao",
        "P013_recepcao",
        "P000_templo",
        "P011_bercario",
        "P012_sala_de_oracao_cleusa",
        "P009_livraria_evangelica",
        "P017_espaco_acolher_ceara",
        "P019_banheiro_familia",
        "escada_mesanino_01",
        "escada_mesanino_02",
      ],
      westKeys: ["P016_jardim", "P020_espaco_servir"],
      northToSouthVia: [
        "L00_node_0043",
        "L00_node_0040",
        "L00_node_0039",
        "L00_node_0086_entrada_av_batel_02",
        "L00_node_0085",
        "L00_node_0083",
        "L00_node_0082_espaco_conexao",
        "L00_node_0084",
        "L00_node_0077",
        "L00_node_0073",
      ],
      southToNorthVia: [
        "L00_node_0073",
        "L00_node_0077",
        "L00_node_0084",
        "L00_node_0082_espaco_conexao",
        "L00_node_0083",
        "L00_node_0085",
        "L00_node_0086_entrada_av_batel_02",
        "L00_node_0039",
        "L00_node_0040",
        "L00_node_0043",
      ],
      westToNorthVia: [
        "L00_node_0085",
        "L00_node_0083",
        "L00_node_0082_espaco_conexao",
        "L00_node_0086_entrada_av_batel_02",
        "L00_node_0039",
        "L00_node_0040",
        "L00_node_0043",
      ],
      westToSouthVia: [
        "L00_node_0085",
        "L00_node_0083",
        "L00_node_0082_espaco_conexao",
        "L00_node_0084",
        "L00_node_0077",
        "L00_node_0073",
      ],
      northEndNodes: ["L00_node_0042_cf", "L00_node_0045_rgo"],
      southEndNodes: [
        "L00_node_0081_elevador_t",
        "L00_node_0079_escada_lateral_",
        "L00_node_0068_capela",
        "L00_node_0082_espaco_conexao",
        "L00_node_0029_recepcao",
      ],
      westEndNodes: ["L00_node_0037_jardim", "L00_node_0035_espaco_servir"],
      slot: 1,
    },
    // centro visual (planta local ADM) → pin de origem/destino nos andares internos
    poiIconLocal: {
      L04_poi_0016: { x: 82, y: 118 },
      escada_mesanino_01: { x: 282.13, y: 576.15 },
      escada_mesanino_02: { x: 510.89, y: 574.58 },
    },
    poiIconCampus: {
      P005_centro_de_formacao: { x: 88, y: 168 },
      P004_sala_de_oracao_RGO: { x: 120, y: 200 },
      P016_jardim: { x: 110.44, y: 633.42 },
      P020_espaco_servir: { x: 207, y: 715 },
      P000E4_templo_entrada_4_lateral_03: { x: 251.73, y: 768.84 },
      P000E1_entrada_lateral_01_templo: { x: 321.89, y: 580.53 },
      P027_elevador_templo: { x: 372.21, y: 485.59 },
      L00_escadas_laterais_t: { x: 397.22, y: 511.24 },
      "gfr-escadaLateral": { x: 397.22, y: 511.24 },
    },
    // entradas oficiais do Templo — nodeId = ID-base (L00_node_NNNN)
    templeEntrances: [
      { nodeId: "L00_node_0088", label: "Templo — Entrada 1" },
      { nodeId: "L00_node_0072", label: "Templo — Entrada 2" },
      { nodeId: "L00_node_0015", label: "Templo — Entrada 3" },
      { nodeId: "L00_node_0036", label: "Templo — Entrada 4" },
      { nodeId: "L00_node_0018", label: "Templo — Entrada 5" },
    ],
    /** Ícone de chegada da rota (porta) — malha continua no node oficial. */
    templeEntranceIconCampus: {
      L00_node_0036: { x: 251.73, y: 768.84 },
    },
    /** Percurso oficial por entrada do Templo (CF/RGO → estacionamento leste / jardim). */
    templeEntranceRoutes: [
      {
        a: ["P005_centro_de_formacao", "P004_sala_de_oracao_RGO"],
        entranceNodeId: "L00_node_0036",
        endNode: "L00_node_0036",
        via: [
          "L00_node_0044",
          "L00_node_0046",
          "L00_node_0048",
          "L00_node_0031",
          "L00_node_0065",
          "L00_node_0029_recepcao",
          "L00_node_0085",
          "L00_node_0037_jardim",
        ],
        allowParking: true,
      },
    ],
    // rotas opcionais nomeadas (par de POIs → via nó(s) externo(s))
    namedExternalRoutes: [
      // Jardim / Espaço Servir ↔ Entrada do toldo (e kids/refeitório): por fora, sul do templo
      {
        a: ["P016_jardim", "P020_espaco_servir"],
        b: [
          "P001_entrada_principal_toldo",
          "P007_area_kids",
          "P007T_area_kids_t",
          "P008_refeitorio_externo",
        ],
        via: [
          "L00_node_0027",
          "L00_node_0008",
          "L00_node_0009",
        ],
        label: "Por fora da igreja",
        // trecho leste do templo toca a zona de estacionamento no grafo
        avoidParking: false,
        allowParking: true,
      },
      // Nárnia / lado leste → Templo: sul do templo → Jardim → entrada lateral oeste
      {
        a: [
          "B02_entrada_narnia",
          "P028_B02_entrada_narnia",
          "P014_seven_pass",
          "P026_elevador_ginasio",
          "P021_banheiro_feminino_ginasio",
          "P022_banheiro_masculino_ginasio",
          "P007_area_kids",
          "P007T_area_kids_t",
          "P008_refeitorio_externo",
          "P025_banheiro_masculino_feminino",
          "P009_livraria_evangelica",
          "P010_espaco_conexao",
          "P011_bercario",
          "P012_sala_de_oracao_cleusa",
          "P013_recepcao",
          "P017_espaco_acolher_ceara",
          "P019_banheiro_familia",
          "P002_capela",
          "P001_entrada_principal_toldo",
          "P015_bazar_abasc",
          "P018_abasc",
        ],
        b: [
          "P027_elevador_templo",
          "P000_templo",
          "escada_mesanino_01",
          "escada_mesanino_02",
          "L01_node_0001_elevador",
          "L02_node_0001_elevador",
        ],
        via: ["L00_node_0027", "L00_node_0037_jardim"],
        endNodes: ["L00_node_0029_recepcao"],
        label: "Pelo jardim",
        avoidParking: false,
      },
      // CF / RGO → Jardim / Espaço Servir: corredor oeste (edges 0048→0038→0037 — malha oficial)
      {
        a: ["P005_centro_de_formacao", "P004_sala_de_oracao_RGO"],
        b: ["P016_jardim", "P020_espaco_servir"],
        via: [
          "L00_node_0043",
          "L00_node_0086_entrada_av_batel_02",
          "L00_node_0085",
        ],
        endNodes: ["L00_node_0037_jardim", "L00_node_0035_espaco_servir"],
        label: "Corredor oeste · Jardim/Servir",
        avoidParking: false,
        allowParking: true,
        slot: 1,
      },
      // CF / RGO → Jardim / Espaço Servir: pelo estabelecimento até o corredor oeste
      {
        a: [
          "P005_centro_de_formacao",
          "P004_sala_de_oracao_RGO",
        ],
        b: [
          "P016_jardim",
          "P020_espaco_servir",
        ],
        via: [
          "L00_node_0032",
          "L00_node_0086_entrada_av_batel_02",
          "L00_node_0083",
          "L00_node_0082_espaco_conexao",
          "L00_node_0081_elevador_t",
        ],
        endNodes: ["L00_node_0037_jardim", "L00_node_0035_espaco_servir"],
        label: "Entrada/saída · Av. Batel",
        avoidParking: false,
        allowParking: true,
        slot: 3,
      },
      // CF / RGO → Jardim / Espaço Servir: contorno leste pelo estacionamento
      {
        a: ["P005_centro_de_formacao", "P004_sala_de_oracao_RGO"],
        b: ["P016_jardim", "P020_espaco_servir"],
        via: [
          "L00_node_0043",
          "L00_node_0044",
          "L00_node_0046",
          "L00_node_0048",
          "L00_node_0031",
          "L00_node_0065",
          "L00_node_0054_sevenpass",
          "L00_node_0029_recepcao",
          "L00_node_0085",
        ],
        endNodes: ["L00_node_0037_jardim", "L00_node_0035_espaco_servir"],
        label: "Pelo estacionamento (leste)",
        avoidParking: false,
        allowParking: true,
        slot: 2,
      },
      // CF / RGO → Jardim: entrada comum no topo → descida vertical pelo jardim
      {
        a: ["P005_centro_de_formacao", "P004_sala_de_oracao_RGO"],
        b: ["P016_jardim"],
        via: ["L00_node_0085"],
        endNodes: ["L00_node_0037_jardim"],
        label: "Pelo jardim (vertical)",
        avoidParking: false,
        allowParking: true,
        slot: 2,
      },
      // CF / RGO / Estou aqui → Espaço Servir: pelo interior (recepção → conexão → Servir)
      {
        a: ["P005_centro_de_formacao", "P004_sala_de_oracao_RGO"],
        b: ["P020_espaco_servir"],
        via: [
          "L00_node_0046",
          "L00_node_0031",
          "L00_node_0065",
          "L00_node_0029_recepcao",
          "L00_node_0077",
          "L00_node_0084",
          "L00_node_0082_espaco_conexao",
        ],
        endNodes: ["L00_node_0035_espaco_servir"],
        label: "Pelo estabelecimento (interior)",
        avoidParking: false,
        allowParking: true,
        slot: 2,
      },
      // CF / L00 → Jardim: corredor do estabelecimento (sem entrar nas salas)
      {
        a: ["P005_centro_de_formacao", "P004_sala_de_oracao_RGO"],
        b: ["P016_jardim", "P020_espaco_servir"],
        via: [
          "L00_node_0046",
          "L00_node_0031",
          "L00_node_0065",
          "L00_node_0029_recepcao",
        ],
        endNodes: ["L00_node_0037_jardim", "L00_node_0035_espaco_servir"],
        label: "Pelo estabelecimento (RGO)",
        avoidParking: false,
        allowParking: true,
        slot: 4,
      },
      // RGO → Espaço conexão: corredor interno (estabelecimento → recepção → conexão)
      {
        a: ["P004_sala_de_oracao_RGO"],
        b: ["P010_espaco_conexao"],
        via: [
          "L00_node_0046",
          "L00_node_0048",
          "L00_node_0049",
          "L00_node_0031",
          "L00_node_0065",
          "L00_node_0067",
          "L00_node_0073",
          "L00_node_0077",
          "L00_node_0084",
        ],
        endNodes: ["L00_node_0082_espaco_conexao"],
        label: "Pelo corredor interno",
        avoidParking: false,
        allowParking: true,
        slot: 2,
      },
      // L00 → CF / Salas Start 10–12: corredor interno do estabelecimento (hall + oeste)
      {
        a: [
          "P002_capela",
          "P013_recepcao",
          "P010_espaco_conexao",
          "P011_bercario",
          "P012_sala_de_oracao_cleusa",
          "P017_espaco_acolher_ceara",
          "P019_banheiro_familia",
          "P027_elevador_templo",
          "P000_templo",
          "P001_entrada_principal_toldo",
          "P007_area_kids",
          "P007T_area_kids_t",
          "P008_refeitorio_externo",
          "P009_livraria_evangelica",
          "P014_seven_pass",
          "P015_bazar_abasc",
          "P018_abasc",
          "P025_banheiro_masculino_feminino",
          "P021_banheiro_feminino_ginasio",
          "P022_banheiro_masculino_ginasio",
          "P026_elevador_ginasio",
          "escada_mesanino_01",
          "escada_mesanino_02",
        ],
        b: ["P005_centro_de_formacao"],
        via: [
          "L00_node_0073",
          "L00_node_0077",
          "L00_node_0085",
          "L00_node_0040",
          "L00_node_0043",
        ],
        endNodes: ["L00_node_0042_cf"],
        label: "Pelo corredor do estabelecimento",
        avoidParking: false,
        allowParking: true,
        slot: 1,
      },
      // Jardim / oeste → CF: corredor oeste do estabelecimento
      {
        a: ["P016_jardim", "P020_espaco_servir", "P003_estacionamento_01", "P006_estacionamento_02"],
        b: ["P005_centro_de_formacao"],
        via: [
          "L00_node_0085",
          "L00_node_0040",
          "L00_node_0043",
        ],
        endNodes: ["L00_node_0042_cf"],
        label: "Corredor oeste · CF",
        avoidParking: false,
        allowParking: true,
        slot: 2,
      },
      // Estacionamento conveniado → Templo: lateral Av. Batel (sem desvio pelo CF)
      {
        a: ["P003_estacionamento_01"],
        b: [
          "P000_templo",
          "P027_elevador_templo",
          "escada_mesanino_01",
          "escada_mesanino_02",
          "L01_node_0001_elevador",
          "L02_node_0001_elevador",
          "L03_node_0001",
          "L04_node_0001_elevador",
          "L05_node_0001_elevador",
          "L06_node_0033_elevador",
        ],
        via: [
          "L00_node_0086_entrada_av_batel_02",
          "L00_node_0083",
          "L00_node_0082_espaco_conexao",
          "L00_node_0081_elevador_t",
        ],
        endNodes: ["L00_node_0084", "L00_node_0088__entrada_templo_01"],
        label: "Entrada/saída · Av. Batel",
        avoidParking: false,
        allowParking: true,
        slot: 4,
      },
      // Estacionamento 02 → Templo: lateral Av. Batel
      {
        a: ["P006_estacionamento_02"],
        b: [
          "P000_templo",
          "P027_elevador_templo",
          "escada_mesanino_01",
          "escada_mesanino_02",
          "L01_node_0001_elevador",
          "L02_node_0001_elevador",
          "L03_node_0001",
          "L04_node_0001_elevador",
          "L05_node_0001_elevador",
          "L06_node_0033_elevador",
        ],
        via: [
          "L00_node_0032",
          "L00_node_0086_entrada_av_batel_02",
          "L00_node_0083",
          "L00_node_0082_espaco_conexao",
          "L00_node_0081_elevador_t",
        ],
        endNodes: ["L00_node_0084", "L00_node_0088__entrada_templo_01"],
        label: "Entrada/saída · Av. Batel",
        avoidParking: false,
        allowParking: true,
        slot: 4,
      },
      // Estacionamento 02 → Jardim / Espaço Servir: lateral Av. Batel
      {
        a: ["P006_estacionamento_02"],
        b: [
          "P016_jardim",
          "P020_espaco_servir",
        ],
        via: [
          "L00_node_0032",
          "L00_node_0086_entrada_av_batel_02",
          "L00_node_0083",
          "L00_node_0082_espaco_conexao",
          "L00_node_0081_elevador_t",
        ],
        endNodes: ["L00_node_0037_jardim", "L00_node_0035_espaco_servir"],
        label: "Entrada/saída · Av. Batel",
        avoidParking: false,
        allowParking: true,
      },
    ],
    // Nível lógico (exibição/filtro) × mapa de rota (ícone/grafo)
    // Espaço Servir: sala no subsolo, mas busca/clique/mapa apontam para a entrada no térreo (L00).
    poiLevels: {
      P016_jardim: {
        level: "L00",
        mapLevel: "L00",
        building: "Jardim",
      },
      P020_espaco_servir: {
        level: "L00",
        mapLevel: "L00",
        building: "Subsolo 01",
        accessNote:
          "Acesso descendo pelo Jardim (L00) ou pela lateral do templo, próximo à entrada de pedestres da Av. Bento Viana",
      },
    },
    // Andares: L00 = térreo/campus; L01–L07 = andares; B01/B02 = subsolos
    floors: [
      { id: "L00", label: "T", title: "Térreo", subtitle: "Ação Social, Aconselhamento, Plantão Pastoral", ready: true },
      { id: "L01", label: "L1", title: "1º andar", subtitle: "Min. Infantil · TDP (2 a 5 anos)", ready: true, mapUrl: "assets/mapa-L01.svg" },
      { id: "L02", label: "L2", title: "2º andar", subtitle: "Mulheres e Idosos · TDP (6 e 7 anos)", ready: true, mapUrl: "assets/mapa-L02.svg" },
      { id: "L03", label: "L3", title: "3º andar", subtitle: "Juventude e Educação Cristã", ready: true, mapUrl: "assets/mapa-L03.svg" },
      { id: "L04", label: "L4", title: "4º andar", subtitle: "Min. Infantil · Espaço START (8 e 9 anos)", ready: true, mapUrl: "assets/mapa-L04.svg" },
      { id: "L05", label: "L5", title: "5º andar", subtitle: "Ministérios: Administração, RH, TI, Missões e Eficiente", ready: true, mapUrl: "assets/mapa-L05.svg" },
      { id: "L06", label: "L6", title: "6º andar", subtitle: "Ministérios: Pastoral, Adoração, Integração, Células, Movimento Discipular, Família", ready: true, mapUrl: "assets/mapa-L06.svg" },
      { id: "L07", label: "L7", title: "7º andar", subtitle: "Espaço ao Ar Livre", ready: false, hidden: true },
      { id: "B01", label: "B1", title: "Subsolo 01", subtitle: "Pastoreo, Espaço Servir, Estúdio ensaio", ready: true, mapUrl: "assets/mapa-B01.svg" },
      { id: "B02", label: "B2", title: "Subsolo 02 · Nárnia", subtitle: "Comunicação, Rádio, Estúdios e Transmissão", ready: true, mapUrl: "assets/mapa-B02.svg" },
    ],
    // hubs de elevador por andar (conexão vertical)
    narniaHub: {
      L00: "L00_node_0016_entrada_narnia",
      B01: "B01_node_0013_entrada_narnia",
      B02: "B02_node_0014_entrada_narnia",
    },
    narniaGateLabels: {
      L00: "Porta de Nárnia (Térreo)",
      B01: "Porta de Nárnia (Subsolo 01)",
      B02: "Porta de Nárnia (Subsolo 02 · Nárnia)",
    },
    /** Ícone exato do lampião / poste — origem e fim de rota na Entrada de Nárnia. */
    narniaGateIcons: {
      L00: { x: 480.85, y: 842.81, nodeId: "L00_node_0016_entrada_narnia" },
      B01: { x: 456.19, y: 174.68, nodeId: "B01_node_0013_entrada_narnia" },
      B02: { x: 303.82, y: 102.53, nodeId: "B02_node_0014_entrada_narnia" },
    },
    narniaPoiRawIds: [
      "B02_entrada_narnia",
      "B01_entrada_narnia",
      "B02_entrada_narnia_map",
      "P028_B02_entrada_narnia",
    ],
    /** B1 → B2: sempre pelo Encomun (escada azul no mapa B1). */
    encomunTransfer: {
      B01: {
        nodeId: "B01_node_0007_acesso_encomun_b02",
        label: "Encomun",
        gateIcon: { x: 312.15, y: 186.15 },
      },
      B02: {
        nodeId: "B02_node_0012_comunicacao_encomun",
        label: "Encomun",
      },
      b01BridgeNode: "B01_node_0006_conexao_templo_batisterio",
      b02BridgeNode: "B02_node_0008_conexao_templo_batisterio",
      verticalEdgeId: "B01_B02_E_batisterio",
    },
    /** B2 → Espaço Servir no T: corredor oeste após sair pela Nárnia no Térreo. */
    basementServirL00Via: [
      "L00_node_0033_corredor_servir",
      "L00_node_0036",
    ],
    /** Atalhos B01↔B02 / B01↔L00 que não passam pela entrada de Nárnia no T. */
    narniaForbiddenEdges: [
      "B01_B02_E_acesso_servir",
      "B01_B02_E_batisterio",
      "L00_B01_E_escada_batisterio",
    ],
    elevatorHubs: {
      L00: {
        nodeId: "L00_node_0081_elevador_t",
        transferNodeId: "L00_node_0077",
        label: "Elevador T",
      },
      L01: { nodeId: "L01_node_0001_elevador", label: "Elevador (1º andar)" },
      L02: { nodeId: "L02_node_0001_elevador", label: "Elevador (2º andar)" },
      L03: { nodeId: "L03_node_0001", label: "Elevador (3º andar)" },
      L04: { nodeId: "L04_node_0001_elevador", label: "Elevador (4º andar)" },
      L05: { nodeId: "L05_node_0001_elevador", label: "Elevador (5º andar)" },
      L06: { nodeId: "L06_node_0033_elevador", label: "Elevador (6º andar)" },
    },
    // hubs da escada lateral — L00 = ícone Escadas (Hall do Templo)
    stairHubs: {
      L00: {
        nodeId: "L00_node_0079_escada_lateral_",
        transferNodeId: "L00_node_0075_bercario_start",
        label: "Escadas laterais T",
      },
      L01: { nodeId: "L01_node_0040_escada_lateral", label: "Escada lateral (1º andar)" },
      L02: { nodeId: "L02_node_0003_escada_laral", label: "Escada lateral (2º andar)" },
      L03: { nodeId: "L03_node_0003", label: "Escada lateral (3º andar)" },
      L04: { nodeId: "L04_node_0024_escada_lateral", label: "Escada lateral (4º andar)" },
      L05: { nodeId: "L05_node_0039_escada_lateral", label: "Escada lateral (5º andar)" },
      L06: { nodeId: "L06_node_0035_escada_lateral", label: "Escada lateral (6º andar)" },
    },
    // filtros da lista de destinos
    searchGroups: [
      { id: "all", label: "Todos" },
      { id: "salas", label: "Salas" },
      { id: "auditorios", label: "Auditórios" },
      { id: "banheiros", label: "Banheiros" },
      { id: "elevadores", label: "Elevadores" },
      { id: "emergencia", label: "Emergência" },
    ],
    /** Busca “start” / “criança” → faixas etárias + elevador e escadas laterais (T). */
    startKidsSearch: {
      triggers: ["start", "salas start", "crianca", "criança", "criancas", "crianças", "bercario", "berçário", "infantil"],
      hint: "Use o elevador ou as escadas laterais no Hall do Templo (T) para chegar ao andar indicado.",
      ageBands: [
        {
          id: "startkids-2-7",
          label: "Salas Start (2 a 7 anos)",
          floorTag: "L1",
          destRawId: "L01_poi_0024",
          level: "L01",
          mapLevel: "L01",
        },
        {
          id: "startkids-8-9",
          label: "Salas Start (8 a 9 anos)",
          floorTag: "L4",
          destRawId: "L04_poi_0017_espaco_brincar",
          level: "L04",
          mapLevel: "L04",
        },
        {
          id: "startkids-10-12",
          label: "Salas Start (10 a 12 anos)",
          floorTag: "CF",
          destRawId: "P005_centro_de_formacao",
          level: "L00",
          mapLevel: "L00",
          meta: "CF · Centro de Formação",
        },
      ],
      transitHubs: [
        { rawId: "P027_elevador_templo", label: "Elevadores T" },
        { rawId: "L00_escadas_laterais_t", label: "Escadas laterais T" },
      ],
    },
    /** UI: L00→T, L01→L1, B01→B1 */
    formatFloorTag(levelId) {
      const id = String(levelId || "").trim();
      if (!id) return "";
      if (id === "L00") return "T";
      const m = /^([LB])0(\d+)$/.exec(id);
      if (m) return `${m[1]}${Number(m[2])}`;
      return id;
    },
  };
})(typeof window !== "undefined" ? window : globalThis);
