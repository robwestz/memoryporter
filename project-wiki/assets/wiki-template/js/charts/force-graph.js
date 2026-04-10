// force-graph.js — verlet-physics dependency graph
// Vanilla SVG, draggable nodes, accessible. Stops after ~240 frames.

import { escapeHtml } from "../utils.js";

const SVG_NS = "http://www.w3.org/2000/svg";

export function drawForceGraph(container, { nodes, edges }, opts = {}) {
  if (!container || !nodes || nodes.length === 0) {
    container && (container.innerHTML = `<p class="muted">No graph data</p>`);
    return;
  }

  const w = container.clientWidth || 720;
  const h = opts.height || 520;

  // Initialize positions in a circle
  const cx = w / 2;
  const cy = h / 2;
  const ringR = Math.min(w, h) * 0.32;
  nodes.forEach((n, i) => {
    n.x = cx + Math.cos((i / nodes.length) * Math.PI * 2) * ringR;
    n.y = cy + Math.sin((i / nodes.length) * Math.PI * 2) * ringR;
    n.vx = 0;
    n.vy = 0;
    n.radius = 8 + Math.sqrt((n.weight || 1) * 4);
  });

  container.innerHTML = "";
  const svg = document.createElementNS(SVG_NS, "svg");
  svg.setAttribute("viewBox", `0 0 ${w} ${h}`);
  svg.setAttribute("role", "img");
  svg.setAttribute("aria-label", "Dependency graph");
  svg.classList.add("chart-svg", "fg-svg");
  container.appendChild(svg);

  const edgeLayer = document.createElementNS(SVG_NS, "g");
  edgeLayer.setAttribute("class", "fg-edges");
  svg.appendChild(edgeLayer);
  const nodeLayer = document.createElementNS(SVG_NS, "g");
  nodeLayer.setAttribute("class", "fg-nodes");
  svg.appendChild(nodeLayer);

  const edgeEls = edges.map(() => {
    const l = document.createElementNS(SVG_NS, "line");
    l.setAttribute("class", "fg-edge");
    edgeLayer.appendChild(l);
    return l;
  });

  const nodeEls = nodes.map(n => {
    const g = document.createElementNS(SVG_NS, "g");
    g.setAttribute("class", "fg-node");
    g.setAttribute("tabindex", "0");
    g.setAttribute("aria-label", n.label || n.id);
    g.innerHTML = `
      <circle r="${n.radius}" fill="${n.color || "var(--accent)"}" stroke="var(--bg)" stroke-width="2"/>
      <text dy="-${n.radius + 4}" text-anchor="middle" class="fg-label">${escapeHtml(truncate(n.label || n.id, 24))}</text>
      <title>${escapeHtml(n.label || n.id)}</title>
    `;
    nodeLayer.appendChild(g);
    return g;
  });

  function step() {
    // Repulsion
    for (let i = 0; i < nodes.length; i++) {
      for (let j = i + 1; j < nodes.length; j++) {
        const a = nodes[i];
        const b = nodes[j];
        const dx = b.x - a.x;
        const dy = b.y - a.y;
        const dist2 = dx * dx + dy * dy + 0.1;
        const dist = Math.sqrt(dist2);
        const f = 1200 / dist2;
        a.vx -= (f * dx) / dist;
        a.vy -= (f * dy) / dist;
        b.vx += (f * dx) / dist;
        b.vy += (f * dy) / dist;
      }
    }
    // Spring on edges
    for (const e of edges) {
      const a = nodes[e.source];
      const b = nodes[e.target];
      if (!a || !b) continue;
      const dx = b.x - a.x;
      const dy = b.y - a.y;
      const dist = Math.sqrt(dx * dx + dy * dy) || 1;
      const f = (dist - 100) * 0.025;
      a.vx += (f * dx) / dist;
      a.vy += (f * dy) / dist;
      b.vx -= (f * dx) / dist;
      b.vy -= (f * dy) / dist;
    }
    // Gentle pull to center + damping
    for (const n of nodes) {
      n.vx = (n.vx + (cx - n.x) * 0.005) * 0.85;
      n.vy = (n.vy + (cy - n.y) * 0.005) * 0.85;
      n.x += n.vx;
      n.y += n.vy;
    }
  }

  function paint() {
    edgeEls.forEach((el, i) => {
      const a = nodes[edges[i].source];
      const b = nodes[edges[i].target];
      if (!a || !b) return;
      el.setAttribute("x1", a.x);
      el.setAttribute("y1", a.y);
      el.setAttribute("x2", b.x);
      el.setAttribute("y2", b.y);
    });
    nodeEls.forEach((el, i) => {
      el.setAttribute("transform", `translate(${nodes[i].x},${nodes[i].y})`);
    });
  }

  if (matchMedia("(prefers-reduced-motion: reduce)").matches) {
    for (let i = 0; i < 240; i++) step();
    paint();
  } else {
    let frames = 0;
    function loop() {
      step();
      paint();
      if (frames++ < 240) requestAnimationFrame(loop);
    }
    requestAnimationFrame(loop);
  }

  bindDrag(svg, nodes, nodeEls, paint, w, h);
}

function bindDrag(svg, nodes, els, paint, w, h) {
  let dragging = null;
  function toLocal(e) {
    const rect = svg.getBoundingClientRect();
    return {
      x: ((e.clientX - rect.left) / rect.width) * w,
      y: ((e.clientY - rect.top) / rect.height) * h,
    };
  }
  els.forEach((el, i) => {
    el.addEventListener("pointerdown", e => {
      dragging = i;
      el.setPointerCapture(e.pointerId);
      e.preventDefault();
    });
    el.addEventListener("pointermove", e => {
      if (dragging === i) {
        const p = toLocal(e);
        nodes[i].x = p.x;
        nodes[i].y = p.y;
        nodes[i].vx = 0;
        nodes[i].vy = 0;
        paint();
      }
    });
    el.addEventListener("pointerup", e => {
      if (dragging === i) {
        dragging = null;
        el.releasePointerCapture(e.pointerId);
      }
    });
  });
}

function truncate(s, n) {
  s = String(s);
  return s.length <= n ? s : s.slice(0, n - 1) + "…";
}
