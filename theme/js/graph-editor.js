/* Интерактивный редактор графов для mdBook */
(function () {
  function initGraphEditor(root) {
    if (!root || root.dataset.initialized === "true") return;
    root.dataset.initialized = "true";

    const svg = root.querySelector("svg");
    const status = root.querySelector(".graph-status");
    const vertexList = root.querySelector(".graph-vertex-list");
    const edgeList = root.querySelector(".graph-edge-list");
    const vertexCount = root.querySelector(".graph-vertex-count");
    const edgeCount = root.querySelector(".graph-edge-count");
    const statsBody = root.querySelector(".graph-stats-body");
    const selectedInfo = root.querySelector(".graph-selected-info");
    const canvas = root.querySelector(".graph-canvas");
    let hoverVertexId = null;
    const tooltip = document.createElement("div");
    tooltip.className = "graph-vertex-tooltip";
    tooltip.setAttribute("role", "status");
    tooltip.setAttribute("aria-live", "polite");
    tooltip.hidden = true;
    canvas.appendChild(tooltip);

    const NS = "http://www.w3.org/2000/svg";
    const W = 700, H = 420, R = 19;
    let vertices = [];
    let edges = [];
    let nextId = 0;
    let mode = "select";
    let edgeStart = null;
    let selectedVertexId = null;
    let dragId = null;
    let dragPointerId = null;
    let dragged = false;
    let suppressClick = false;
    let dragStart = null;

    function say(message) { status.textContent = message; }

    function labelFor(index) {
      let s = "";
      index += 1;
      while (index > 0) {
        index--;
        s = String.fromCharCode(97 + index % 26) + s;
        index = Math.floor(index / 26);
      }
      return s;
    }

    function vertexById(id) {
      return vertices.find(v => v.id === id);
    }

    function edgeKey(a, b) {
      return a < b ? a + ":" + b : b + ":" + a;
    }

    function neighborsOf(id) {
      return edges
        .filter(e => e.a === id || e.b === id)
        .map(e => e.a === id ? e.b : e.a)
        .filter(neighborId => vertexById(neighborId));
    }

    function hideTooltip() {
      tooltip.hidden = true;
      hoverVertexId = null;
      updateVisualHighlight();
    }

    // Подсвечиваем соседей вершины под курсором; если курсор не над вершиной,
    // сохраняем подсветку выбранной щелчком вершины.
    function updateVisualHighlight() {
      const focusId = hoverVertexId !== null ? hoverVertexId : selectedVertexId;
      const neighborIds = focusId !== null ? neighborsOf(focusId) : [];
      svg.querySelectorAll("[data-vertex]").forEach(el => {
        const id = Number(el.dataset.vertex);
        el.classList.toggle("is-selected", id === selectedVertexId);
        el.classList.toggle("is-hovered", id === hoverVertexId);
        el.classList.toggle("is-neighbor", neighborIds.includes(id) && id !== focusId);
      });
      svg.querySelectorAll(".edge-line").forEach(line => {
        const [a, b] = line.dataset.edgeVisual.split(":").map(Number);
        line.classList.toggle("edge-highlight", focusId !== null && (a === focusId || b === focusId));
      });
    }

    function showTooltip(id, vertexEl) {
      const v = vertexById(id);
      if (!v || !vertexEl) {
        hideTooltip();
        return;
      }
      hoverVertexId = id;
      updateVisualHighlight();
      const neighborIds = neighborsOf(id);
      const neighborLabels = neighborIds.map(nid => vertexById(nid).label);
      tooltip.replaceChildren();

      const title = document.createElement("strong");
      title.textContent = "Вершина " + v.label;
      const degree = document.createElement("div");
      degree.textContent = "Степень: deg(" + v.label + ") = " + neighborIds.length;
      const neighbors = document.createElement("div");
      neighbors.textContent = "Соседи: N(" + v.label + ") = " +
        (neighborLabels.length ? "{" + neighborLabels.join(", ") + "}" : "∅");
      tooltip.append(title, degree, neighbors);
      tooltip.hidden = false;

      const canvasRect = canvas.getBoundingClientRect();
      const vertexRect = vertexEl.getBoundingClientRect();
      const tooltipRect = tooltip.getBoundingClientRect();
      const centerX = vertexRect.left + vertexRect.width / 2 - canvasRect.left;
      const topY = vertexRect.top - canvasRect.top;
      const gap = 10;
      let left = centerX + gap;
      if (left + tooltipRect.width > canvasRect.width - 8) {
        left = centerX - tooltipRect.width - gap;
      }
      left = Math.max(8, Math.min(left, canvasRect.width - tooltipRect.width - 8));
      let top = topY - tooltipRect.height - 8;
      if (top < 8) top = vertexRect.bottom - canvasRect.top + 8;
      top = Math.max(8, Math.min(top, canvasRect.height - tooltipRect.height - 8));
      tooltip.style.left = left + "px";
      tooltip.style.top = top + "px";
    }

    function makeSvg(name, attrs, parent) {
      const el = document.createElementNS(NS, name);
      Object.entries(attrs || {}).forEach(([key, value]) =>
        el.setAttribute(key, String(value))
      );
      if (parent) parent.appendChild(el);
      return el;
    }

    function pointFromEvent(event) {
      const p = svg.createSVGPoint();
      p.x = event.clientX;
      p.y = event.clientY;
      const matrix = svg.getScreenCTM();
      if (!matrix) return { x: W / 2, y: H / 2 };
      const q = p.matrixTransform(matrix.inverse());
      return {
        x: Math.max(R + 2, Math.min(W - R - 2, q.x)),
        y: Math.max(R + 2, Math.min(H - R - 2, q.y))
      };
    }

    function updateLists() {
      vertexList.textContent = vertices.length
        ? "V = {" + vertices.map(v => v.label).join(", ") + "}"
        : "V = ∅";

      const pairs = edges.map(e => {
        const a = vertexById(e.a);
        const b = vertexById(e.b);
        return a && b ? "(" + a.label + ", " + b.label + ")" : null;
      }).filter(Boolean);

      edgeList.textContent = pairs.length
        ? "E = {" + pairs.join(", ") + "}"
        : "E = ∅";

      vertexCount.textContent = "Число вершин: " + vertices.length;
      edgeCount.textContent = "Число рёбер: " + edges.length;

      // Для каждой вершины вычисляем множество соседей и степень.
      statsBody.replaceChildren();
      if (vertices.length === 0) {
        const row = document.createElement("tr");
        const cell = document.createElement("td");
        cell.colSpan = 3;
        cell.textContent = "Добавьте вершины";
        row.appendChild(cell);
        statsBody.appendChild(row);
      } else {
        vertices.forEach(v => {
          const neighborIds = neighborsOf(v.id);
          const neighbors = neighborIds
            .map(id => vertexById(id))
            .filter(Boolean)
            .map(neighbor => neighbor.label);
          const row = document.createElement("tr");
          [v.label, String(neighbors.length), neighbors.length ? "{" + neighbors.join(", ") + "}" : "∅"]
            .forEach(value => {
              const cell = document.createElement("td");
              cell.textContent = value;
              row.appendChild(cell);
            });
          if (v.id === selectedVertexId) row.classList.add("is-selected-row");
          statsBody.appendChild(row);
        });
      }

      const selected = vertexById(selectedVertexId);
      if (selectedInfo) {
        if (!selected) {
          selectedInfo.textContent = "Щёлкните по вершине в режиме «Перемещать», чтобы увидеть её степень и соседей.";
        } else {
          const neighbors = neighborsOf(selected.id).map(id => vertexById(id).label);
          selectedInfo.textContent = "Вершина " + selected.label + ": степень d(" + selected.label + ") = " + neighbors.length + "; множество соседей N(" + selected.label + ") = " + (neighbors.length ? "{" + neighbors.join(", ") + "}" : "∅") + ". Соседи выделены на рисунке.";
        }
      }
    }

    function render() {
      svg.replaceChildren();

      if (vertices.length === 0) {
        const t = makeSvg("text", {
          x: W / 2, y: H / 2,
          "text-anchor": "middle",
          fill: "#8995a7", "font-size": 17
        }, svg);
        t.textContent = "Добавьте первую вершину";
      }

      // Сначала рисуем рёбра, чтобы они не перекрывали вершины.
      edges.forEach(e => {
        const a = vertexById(e.a), b = vertexById(e.b);
        if (!a || !b) return;

        const focusId = hoverVertexId !== null ? hoverVertexId : selectedVertexId;
        const isIncidentToFocus = focusId !== null && (e.a === focusId || e.b === focusId);
        makeSvg("line", {
          x1: a.x, y1: a.y, x2: b.x, y2: b.y,
          class: "edge-line" + (isIncidentToFocus ? " edge-highlight" : ""),
          "data-edge-visual": e.a + ":" + e.b
        }, svg);

        makeSvg("line", {
          x1: a.x, y1: a.y, x2: b.x, y2: b.y,
          class: "edge-hit",
          "data-edge": e.a + ":" + e.b
        }, svg);
      });

      vertices.forEach(v => {
        const g = makeSvg("g", {
          class: "vertex" + (edgeStart === v.id ? " selected" : "") +
            (selectedVertexId === v.id ? " is-selected" : "") +
            (selectedVertexId !== null && neighborsOf(selectedVertexId).includes(v.id) ? " is-neighbor" : ""),
          "data-vertex": v.id
        }, svg);

        makeSvg("circle", {
          cx: v.x, cy: v.y, r: R,
          class: "vertex-circle"
        }, g);

        const text = makeSvg("text", {
          x: v.x, y: v.y + 0.5,
          class: "vertex-text"
        }, g);
        text.textContent = v.label;
      });

      updateLists();
      updateVisualHighlight();
    }

    // Обновляет координаты уже существующих SVG-элементов без полной перерисовки.
    function moveVertex(v, x, y) {
      v.x = x;
      v.y = y;
      const group = svg.querySelector('[data-vertex="' + v.id + '"]');
      if (group) {
        const circle = group.querySelector("circle");
        const label = group.querySelector("text");
        if (circle) {
          circle.setAttribute("cx", x);
          circle.setAttribute("cy", y);
        }
        if (label) {
          label.setAttribute("x", x);
          label.setAttribute("y", y + 0.5);
        }
      }
      edges.filter(e => e.a === v.id || e.b === v.id).forEach(e => {
        const a = vertexById(e.a), b = vertexById(e.b);
        const key = e.a + ":" + e.b;
        const reverseKey = e.b + ":" + e.a;
        svg.querySelectorAll("[data-edge]").forEach(line => {
          if (line.getAttribute("data-edge") === key ||
              line.getAttribute("data-edge") === reverseKey) {
            line.setAttribute("x1", a.x);
            line.setAttribute("y1", a.y);
            line.setAttribute("x2", b.x);
            line.setAttribute("y2", b.y);
          }
        });
        // Видимая линия не имеет data-edge; находим её по порядку: перед hit-area.
        const hit = svg.querySelector('[data-edge="' + key + '"]') ||
                    svg.querySelector('[data-edge="' + reverseKey + '"]');
        if (hit && hit.previousElementSibling &&
            hit.previousElementSibling.classList.contains("edge-line")) {
          const line = hit.previousElementSibling;
          line.setAttribute("x1", a.x);
          line.setAttribute("y1", a.y);
          line.setAttribute("x2", b.x);
          line.setAttribute("y2", b.y);
        }
      });
    }

    function setMode(newMode, button) {
      mode = newMode;
      edgeStart = null;
      root.querySelectorAll("[data-mode]").forEach(b =>
        b.classList.toggle("active", b === button)
      );
      const messages = {
        select: "Режим: перемещение вершин.",
        vertex: "Режим: щёлкните по свободному месту, чтобы добавить вершину.",
        edge: "Режим: выберите две вершины, чтобы соединить их ребром.",
        delete: "Режим: нажмите на вершину или ребро, чтобы удалить его."
      };
      say(messages[mode]);
      render();
    }

    root.querySelectorAll("[data-mode]").forEach(button => {
      button.addEventListener("click", () => setMode(button.dataset.mode, button));
    });

    root.querySelector('[data-action="reset"]').addEventListener("click", () => {
      vertices = [];
      edges = [];
      nextId = 0;
      edgeStart = null;
      selectedVertexId = null;
      dragId = null;
      setMode("select", root.querySelector('[data-mode="select"]'));
      say("Граф очищен.");
    });

    svg.addEventListener("pointerover", event => {
      const vertexEl = event.target.closest("[data-vertex]");
      if (!vertexEl || !svg.contains(vertexEl)) return;
      if (event.relatedTarget && vertexEl.contains(event.relatedTarget)) return;
      showTooltip(Number(vertexEl.dataset.vertex), vertexEl);
    });

    svg.addEventListener("pointerout", event => {
      const vertexEl = event.target.closest("[data-vertex]");
      if (!vertexEl || (event.relatedTarget && vertexEl.contains(event.relatedTarget))) return;
      if (hoverVertexId === Number(vertexEl.dataset.vertex)) hideTooltip();
    });

    window.addEventListener("resize", () => {
      if (hoverVertexId !== null) {
        const el = svg.querySelector('[data-vertex="' + hoverVertexId + '"]');
        if (el) showTooltip(hoverVertexId, el);
      }
    });

    svg.addEventListener("pointerdown", event => {
      const vertexEl = event.target.closest("[data-vertex]");
      if (mode !== "select" || !vertexEl || event.button !== 0) return;
      const id = Number(vertexEl.dataset.vertex);
      const v = vertexById(id);
      if (!v) return;
      event.preventDefault();
      dragId = id;
      dragPointerId = event.pointerId;
      dragged = false;
      const p = pointFromEvent(event);
      dragStart = { x: p.x, y: p.y };
      svg.setPointerCapture(event.pointerId);
    });

    svg.addEventListener("pointermove", event => {
      if (dragId === null || event.pointerId !== dragPointerId) return;
      const v = vertexById(dragId);
      if (!v) return;
      const p = pointFromEvent(event);
      if (dragStart && Math.abs(p.x - dragStart.x) + Math.abs(p.y - dragStart.y) > 3) {
        dragged = true;
      }
      moveVertex(v, p.x, p.y);
    });

    function finishDrag(event) {
      if (dragId === null || event.pointerId !== dragPointerId) return;
      if (dragged) {
        suppressClick = true;
        say("Положение вершины изменено.");
        updateLists();
      }
      dragId = null;
      dragPointerId = null;
      dragStart = null;
      dragged = false;
    }
    svg.addEventListener("pointerup", finishDrag);
    svg.addEventListener("pointercancel", finishDrag);

    svg.addEventListener("click", event => {
      const vertexEl = event.target.closest("[data-vertex]");
      const edgeEl = event.target.closest("[data-edge]");

      if (suppressClick) {
        suppressClick = false;
        return;
      }

      if (vertexEl) {
        const id = Number(vertexEl.dataset.vertex);
        const v = vertexById(id);
        if (!v) return;

        if (mode === "select") {
          selectedVertexId = id;
          render();
          say("Выбрана вершина " + v.label + ". Степень и соседи показаны под графом.");
        } else if (mode === "edge") {
          if (edgeStart === null) {
            edgeStart = id;
            say("Первая вершина: " + v.label + ". Теперь выберите вторую.");
            render();
          } else if (edgeStart === id) {
            edgeStart = null;
            say("Выбор ребра отменён.");
            render();
          } else {
            const start = vertexById(edgeStart);
            const key = edgeKey(edgeStart, id);
            const exists = edges.some(e => edgeKey(e.a, e.b) === key);
            edgeStart = null;
            if (exists) {
              say("Такое ребро уже существует.");
            } else {
              edges.push({ a: start.id, b: id });
              say("Добавлено ребро (" + start.label + ", " + v.label + ").");
            }
            render();
          }
        } else if (mode === "delete") {
          const name = v.label;
          vertices = vertices.filter(x => x.id !== id);
          edges = edges.filter(e => e.a !== id && e.b !== id);
          if (selectedVertexId === id) selectedVertexId = null;
          if (edgeStart === id) edgeStart = null;
          render();
          say("Вершина " + name + " и все инцидентные ей рёбра удалены.");
        }
        return;
      }

      if (edgeEl && mode === "delete") {
        const [aId, bId] = edgeEl.dataset.edge.split(":").map(Number);
        const a = vertexById(aId), b = vertexById(bId);
        edges = edges.filter(e => edgeKey(e.a, e.b) !== edgeKey(aId, bId));
        render();
        say(a && b
          ? "Ребро (" + a.label + ", " + b.label + ") удалено."
          : "Ребро удалено.");
        return;
      }

      if (mode === "vertex" && !vertexEl && !edgeEl) {
        const p = pointFromEvent(event);
        const id = nextId++;
        vertices.push({ id, label: labelFor(id), x: p.x, y: p.y });
        render();
        say("Добавлена вершина " + vertexById(id).label + ".");
      } else if (mode === "edge" && edgeStart !== null && !vertexEl) {
        edgeStart = null;
        render();
        say("Выбор ребра отменён. Выберите первую вершину заново.");
      }
    });

    render();
  }

  function start() {
    document.querySelectorAll(".graph-editor").forEach(initGraphEditor);
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", start);
  } else {
    start();
  }
})();
