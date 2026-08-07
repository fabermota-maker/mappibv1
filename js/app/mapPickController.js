/**
 * Seleção de origem/destino por toque no mapa — menu “Sair daqui” / “Chegar aqui”.
 * Reutiliza snap, setField e drawRoute do app (sem roteamento próprio).
 */
(function (global) {
  "use strict";

  const MENU_PAD = 12;
  const MENU_OFFSET = 14;

  function create(ctx) {
    const {
      el,
      state,
      toast,
      viewportPoint,
      mapPointToClient,
      snapMapPoint,
      buildMapPickPoi,
      setField,
      drawRoute,
      resolveOriginForDestPick,
      paintMapPickMarkers,
      isMobileLayout,
      setPanelOpen,
    } = ctx;

    let pending = null;
    let pinching = false;
    let bound = false;

    function isMenuOpen() {
      return el.mapPickMenu && !el.mapPickMenu.hidden;
    }

    function showLoading(on) {
      if (!el.mapPickMenu) return;
      el.mapPickMenu.classList.toggle("is-loading", !!on);
      if (el.mapPickActions) el.mapPickActions.hidden = !!on;
      if (el.mapPickLoading) el.mapPickLoading.hidden = !on;
      if (on) requestAnimationFrame(() => repositionMenu());
    }

    function closeMenu() {
      if (!el.mapPickMenu) return;
      el.mapPickMenu.hidden = true;
      el.mapPickMenu.classList.remove("is-loading");
      showLoading(false);
      pending = null;
      state.mapPickMenuAnchor = null;
      state.mapPickPreview = null;
      paintMapPickMarkers?.();
    }

    function positionMenu(clientX, clientY) {
      const menu = el.mapPickMenu;
      if (!menu) return;
      menu.hidden = false;
      menu.style.visibility = "hidden";
      menu.style.left = "0";
      menu.style.top = "0";
      const rect = menu.getBoundingClientRect();
      const vw = window.innerWidth;
      const vh = window.innerHeight;
      let left = clientX + MENU_OFFSET;
      let top = clientY - rect.height * 0.45;
      if (left + rect.width > vw - MENU_PAD) left = clientX - rect.width - MENU_OFFSET;
      if (left < MENU_PAD) left = MENU_PAD;
      if (top < MENU_PAD) top = MENU_PAD;
      if (top + rect.height > vh - MENU_PAD) top = vh - rect.height - MENU_PAD;
      menu.style.left = `${Math.round(left)}px`;
      menu.style.top = `${Math.round(top)}px`;
      menu.style.visibility = "";
    }

    /** Reposiciona o menu junto ao ponto SVG do primeiro toque (acompanha pan/zoom). */
    function repositionMenu() {
      const anchor = state.mapPickMenuAnchor;
      if (!anchor || !isMenuOpen() || typeof mapPointToClient !== "function") return;
      const client = mapPointToClient(anchor.x, anchor.y);
      if (!client || !isFinite(client.x) || !isFinite(client.y)) return;
      positionMenu(client.x, client.y);
    }

    function openMenu(clientX, clientY, snap, clickPt) {
      pending = { snap, clickPt, clientX, clientY };
      state.mapPickMenuAnchor = { x: snap.x, y: snap.y };
      state.mapPickPreview = { x: snap.x, y: snap.y };
      paintMapPickMarkers?.();
      repositionMenu();
    }

    function isInteractionBlocked() {
      if (state.calibMode || state.placingHere) return true;
      if (document.body.classList.contains("is-navigating")) return true;
      if (pinching) return true;
      if (el.mapPickMenu?.classList.contains("is-loading")) return true;
      return false;
    }

    function isMapTapTarget(target) {
      if (!target) return false;
      return !!target.closest(
        "button, a, input, select, textarea, label, "
        + "[data-poi], .map-marker, .route-marker, .here-marker, "
        + ".map-controls, .map-tools, .nav-overlay, .floor-menu, .area-menu, "
        + ".map-pick-menu, .panel, .gps-compass, .floor-banner, "
        + "#userLocationPuck, .user-location-puck"
      );
    }

    async function drawRouteWithFeedback() {
      showLoading(true);
      try {
        await drawRoute();
        repositionMenu();
        if (state.origin && state.dest && !state.route && !(state.routeOptions || []).length) {
          toast("Não encontramos um caminho disponível entre esses pontos.");
        }
      } finally {
        showLoading(false);
        closeMenu();
      }
    }

    async function applyPick(field) {
      if (!pending?.snap) return;
      const { snap, clickPt } = pending;

      const poi = buildMapPickPoi(snap, clickPt, field);
      setField(field, poi, { skipRoute: true });

      if (field === "origin") {
        state.mapPickOrigin = { x: snap.x, y: snap.y };
        state.mapPickPreview = null;
      } else {
        state.mapPickDest = { x: snap.x, y: snap.y };
        state.mapPickPreview = null;
      }
      paintMapPickMarkers?.();
      repositionMenu();

      if (field === "dest" && !state.origin) {
        showLoading(true);
        const origin = await resolveOriginForDestPick();
        if (origin) {
          setField("origin", origin, { skipRoute: true });
          if (origin.snap) state.mapPickOrigin = { x: origin.snap.x, y: origin.snap.y };
          paintMapPickMarkers?.();
        }
        repositionMenu();
      }

      if (state.origin && state.dest) {
        await drawRouteWithFeedback();
        return;
      }

      closeMenu();
      toast(field === "origin"
        ? "Origem definida. Escolha o destino."
        : "Destino definido. Escolha a origem ou ative o GPS.");
    }

    function onMapTap(e) {
      if (isInteractionBlocked()) return;
      if (state.moved) return;
      if (isMapTapTarget(e.target)) return;

      const svgPt = viewportPoint(e);
      const snap = snapMapPoint(svgPt);
      if (!snap?.id) {
        toast("Não foi possível iniciar uma rota neste ponto.");
        return;
      }

      if (isMobileLayout()) setPanelOpen(false);
      openMenu(e.clientX, e.clientY, snap, svgPt);
    }

    function onPointerDownOutside(e) {
      if (!isMenuOpen()) return;
      if (e.target.closest("#mapPickMenu")) return;
      closeMenu();
    }

    function bind() {
      if (bound) return;
      bound = true;

      el.mapPickBtnOrigin?.addEventListener("click", (e) => {
        e.preventDefault();
        e.stopPropagation();
        applyPick("origin");
      });
      el.mapPickBtnDest?.addEventListener("click", (e) => {
        e.preventDefault();
        e.stopPropagation();
        applyPick("dest");
      });

      document.addEventListener("pointerdown", onPointerDownOutside);
      document.addEventListener("keydown", (e) => {
        if (e.key === "Escape" && isMenuOpen()) {
          e.preventDefault();
          closeMenu();
        }
      });
    }

    return {
      bind,
      onMapTap,
      closeMenu,
      repositionMenu,
      setPinching: (v) => { pinching = !!v; },
      isMenuOpen,
    };
  }

  global.PIBMapPickController = { create };
})(typeof window !== "undefined" ? window : globalThis);
