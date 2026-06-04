import { resolveTheme } from './theme';
import { escapeXml, titleBlockHeight, renderTitleBlock, estimateTextWidth } from './utils';
import type { NetworkDiagramOptions, NodeType } from './types';

// ---------------------------------------------------------------------------
// Layout constants
// ---------------------------------------------------------------------------

/** Minimum node circle radius in SVG user units. */
const MIN_NODE_R = 6;
/** Maximum node circle radius in SVG user units. */
const MAX_NODE_R = 32;
/** Padding around the entire network. */
const PAD = 48;
/** Minimum canvas width / height. */
const MIN_W = 480;
const MIN_H = 360;
/** Ideal spring rest length for FR algorithm. */
const IDEAL_LEN = 120;
/** FR iterations. */
const ITERATIONS = 300;

/** Node types cycled by group index for color variety. */
const GROUP_TYPES: NodeType[] = ['process', 'decision', 'terminal', 'io'];

/** Incrementing counter for unique per-diagram SVG IDs. */
let _netCount = 0;

// ---------------------------------------------------------------------------
// Fruchterman–Reingold force-directed layout
// ---------------------------------------------------------------------------

interface LayoutNode {
  x: number;
  y: number;
  r: number;
  vx: number;
  vy: number;
}

/**
 * Run a simplified Fruchterman–Reingold layout and return final (x, y) positions.
 *
 * Forces applied per iteration:
 *  1. Repulsion between every pair of nodes (O(n²), fine for n ≤ ~80)
 *  2. Attraction along each edge (spring toward IDEAL_LEN)
 *  3. Weak gravity toward the centre to prevent drift
 *
 * Temperature starts at 200 and cools linearly to 0.5 over ITERATIONS steps,
 * acting as a maximum displacement clamp so the system settles smoothly.
 */
function runLayout(
  n: number,
  radii: number[],
  edgeList: Array<[number, number]>,
  W: number,
  H: number,
): Array<[number, number]> {
  if (n === 0) return [];

  // Initialise nodes on a circle for a deterministic, balanced start
  const nodes: LayoutNode[] = Array.from({ length: n }, (_, i) => {
    const angle = (2 * Math.PI * i) / n;
    const initR = Math.min(W, H) * 0.32;
    return {
      x: W / 2 + initR * Math.cos(angle),
      y: H / 2 + initR * Math.sin(angle),
      r: radii[i],
      vx: 0,
      vy: 0,
    };
  });

  const k = IDEAL_LEN; // spring rest length
  const k2 = k * k;
  const kAttr = k;

  for (let iter = 0; iter < ITERATIONS; iter++) {
    // Cooling schedule: linear from 200 to 0.5
    const t = 200 * (1 - iter / ITERATIONS) + 0.5;

    // Reset velocities
    for (let i = 0; i < n; i++) { nodes[i].vx = 0; nodes[i].vy = 0; }

    // 1. Repulsive forces (node pairs)
    for (let i = 0; i < n; i++) {
      for (let j = i + 1; j < n; j++) {
        const dx = nodes[i].x - nodes[j].x;
        const dy = nodes[i].y - nodes[j].y;
        const d2 = dx * dx + dy * dy || 0.01;
        const d  = Math.sqrt(d2);
        const f  = k2 / d;
        const fx = (dx / d) * f;
        const fy = (dy / d) * f;
        nodes[i].vx += fx;
        nodes[i].vy += fy;
        nodes[j].vx -= fx;
        nodes[j].vy -= fy;
      }
    }

    // 2. Attractive forces (edges)
    for (const [si, ti] of edgeList) {
      const dx = nodes[si].x - nodes[ti].x;
      const dy = nodes[si].y - nodes[ti].y;
      const d  = Math.sqrt(dx * dx + dy * dy) || 0.01;
      const f  = (d * d) / kAttr;
      const fx = (dx / d) * f;
      const fy = (dy / d) * f;
      nodes[si].vx -= fx;
      nodes[si].vy -= fy;
      nodes[ti].vx += fx;
      nodes[ti].vy += fy;
    }

    // 3. Gravity toward centre (weak)
    const cx = W / 2, cy = H / 2;
    for (let i = 0; i < n; i++) {
      nodes[i].vx += (cx - nodes[i].x) * 0.01;
      nodes[i].vy += (cy - nodes[i].y) * 0.01;
    }

    // 4. Apply displacement clamped to temperature
    for (let i = 0; i < n; i++) {
      const vLen = Math.sqrt(nodes[i].vx ** 2 + nodes[i].vy ** 2) || 1;
      const scale = Math.min(vLen, t) / vLen;
      nodes[i].x += nodes[i].vx * scale;
      nodes[i].y += nodes[i].vy * scale;
      // Keep within canvas bounds
      nodes[i].x = Math.max(nodes[i].r + PAD, Math.min(W - nodes[i].r - PAD, nodes[i].x));
      nodes[i].y = Math.max(nodes[i].r + PAD, Math.min(H - nodes[i].r - PAD, nodes[i].y));
    }
  }

  return nodes.map(n => [Math.round(n.x), Math.round(n.y)]);
}

// ---------------------------------------------------------------------------
// Renderer
// ---------------------------------------------------------------------------

/**
 * Generate an SVG network / relationship diagram using a force-directed layout.
 *
 * Node sizes use the same area-proportional mapping as the bubble chart:
 * each node's radius is derived so that the circle area is proportional to
 * its weight, interpolated between MIN_NODE_R and MAX_NODE_R.
 * Groups are colored by cycling the palette's node types.
 * Edges are animated dashed lines with arrowheads at a fixed stroke-width.
 */
export function createNetworkDiagram(options: NetworkDiagramOptions): string {
  const {
    nodes: rawNodes = [],
    edges: rawEdges = [],
    theme: mode = 'light',
    palette,
    title,
    subtitle,
  } = options;

  const theme  = resolveTheme(palette, mode);
  const titleH = titleBlockHeight(title, subtitle, theme.fontSize);
  const uid    = `net-${++_netCount}`;

  // ── Build node index and group→color map ────────────────────────────────
  const nodeIndex = new Map<string, number>();
  rawNodes.forEach((n, i) => nodeIndex.set(n.id, i));

  // Collect unique groups in order of first appearance
  const groupOrder: string[] = [];
  const groupSeen = new Set<string>();
  for (const n of rawNodes) {
    const g = n.group ?? '';
    if (!groupSeen.has(g)) { groupSeen.add(g); groupOrder.push(g); }
  }

  const groupType = (group: string | undefined): NodeType =>
    GROUP_TYPES[groupOrder.indexOf(group ?? '') % GROUP_TYPES.length];

  // ── Compute node radii (area-proportional, same formula as bubble chart) ─
  // Area ∝ weight: r = sqrt(MIN_R² + weight/maxWeight * (MAX_R² − MIN_R²))
  const nodeWeights = rawNodes.map(n => Math.max(0, n.weight ?? 1));
  const maxNodeW = Math.max(...(nodeWeights.length ? nodeWeights : [1]));
  const radii = nodeWeights.map(w =>
    maxNodeW > 0
      ? Math.round(Math.sqrt(MIN_NODE_R * MIN_NODE_R + (w / maxNodeW) * (MAX_NODE_R * MAX_NODE_R - MIN_NODE_R * MIN_NODE_R)))
      : MIN_NODE_R,
  );

  // ── Build edge index list (skip edges with unknown node ids) ─────────────
  const edgeList: Array<[number, number]> = [];
  for (const e of rawEdges) {
    const si = nodeIndex.get(e.from);
    const ti = nodeIndex.get(e.to);
    if (si !== undefined && ti !== undefined && si !== ti) edgeList.push([si, ti]);
  }

  // ── Layout canvas size (initial guess; FR runs inside these bounds) ───────
  const n = rawNodes.length;
  // Scale canvas to accommodate nodes — min area grows with count
  const sideGuess = Math.max(MIN_W, Math.ceil(Math.sqrt(n) * IDEAL_LEN * 1.4));
  const W = Math.min(1200, sideGuess);
  const H = Math.min(900, Math.max(MIN_H, Math.ceil(sideGuess * 0.75)));

  // ── Run force layout ─────────────────────────────────────────────────────
  const positions = n > 0 ? runLayout(n, radii, edgeList, W, H) : [];

  // ── Bounding box clamp → normalise to PAD-padded canvas ─────────────────
  let minX = Infinity, maxX = -Infinity, minY = Infinity, maxY = -Infinity;
  for (let i = 0; i < n; i++) {
    const r = radii[i];
    minX = Math.min(minX, positions[i][0] - r);
    maxX = Math.max(maxX, positions[i][0] + r);
    minY = Math.min(minY, positions[i][1] - r);
    maxY = Math.max(maxY, positions[i][1] + r + theme.fontSize + 6); // reserve space for label below
  }
  if (!isFinite(minX)) { minX = 0; maxX = W; minY = 0; maxY = H; }

  const contentW = maxX - minX;
  const contentH = maxY - minY;
  const CANVAS_W = Math.max(MIN_W, Math.ceil(contentW + PAD * 2));
  const CANVAS_H = Math.max(MIN_H, Math.ceil(contentH + PAD * 2));

  // Shift all positions so content is centred
  const offX = -minX + PAD + (CANVAS_W - contentW - PAD * 2) / 2;
  const offY = -minY + PAD + (CANVAS_H - contentH - PAD * 2) / 2;

  const px = (i: number) => Math.round(positions[i][0] + offX);
  const py = (i: number) => Math.round(positions[i][1] + offY);

  const parts: string[] = [];

  // ── Defs: arrowhead marker + CSS animation ───────────────────────────────
  parts.push(
    `<defs>` +
      `<marker id="${uid}-arr" markerWidth="8" markerHeight="6" refX="7" refY="3" ` +
      `orient="auto" markerUnits="strokeWidth">` +
      `<polygon points="0 0, 8 3, 0 6, 1.5 3" fill="${escapeXml(theme.edgeColor)}"/>` +
      `</marker>` +
      `<style>` +
      `.${uid}-edge{stroke-dasharray:8 5;animation:${uid}-dash 1.2s linear infinite;}` +
      `@keyframes ${uid}-dash{to{stroke-dashoffset:-26;}}` +
      `</style>` +
      `</defs>`,
  );

  // ── Edges ─────────────────────────────────────────────────────────────────
  for (let ei = 0; ei < rawEdges.length; ei++) {
    const e  = rawEdges[ei];
    const si = nodeIndex.get(e.from);
    const ti = nodeIndex.get(e.to);
    if (si === undefined || ti === undefined || si === ti) continue;

    const x1 = px(si), y1 = py(si);
    const x2 = px(ti), y2 = py(ti);
    const r2 = radii[ti];

    // Shorten line so it ends at the target node's boundary (arrowhead sits at border)
    const dx = x2 - x1, dy = y2 - y1;
    const dist = Math.sqrt(dx * dx + dy * dy) || 1;
    const ex2 = Math.round(x2 - (dx / dist) * (r2 + 2));
    const ey2 = Math.round(y2 - (dy / dist) * (r2 + 2));

    parts.push(
      `<line x1="${x1}" y1="${y1}" x2="${ex2}" y2="${ey2}" ` +
        `stroke="${escapeXml(theme.edgeColor)}" stroke-width="${theme.edgeWidth}" ` +
        `marker-end="url(#${uid}-arr)" class="${uid}-edge"/>`,
    );

    // Optional edge label (centred)
    if (e.label) {
      const lx = Math.round((x1 + ex2) / 2);
      const ly = Math.round((y1 + ey2) / 2);
      const labelFs  = 10;
      const labelW   = Math.round(estimateTextWidth(e.label, labelFs) + 10);
      const labelH   = labelFs + 6;
      const bg = theme.background || 'white';
      parts.push(
        `<rect x="${lx - Math.round(labelW / 2)}" y="${ly - Math.round(labelH / 2)}" ` +
          `width="${labelW}" height="${labelH}" fill="${escapeXml(bg)}" rx="3" opacity="0.9"/>`,
        `<text x="${lx}" y="${ly}" text-anchor="middle" dominant-baseline="middle" ` +
          `font-family="${escapeXml(theme.fontFamily)}" font-size="${labelFs}" ` +
          `fill="${escapeXml(theme.edgeColor)}">${escapeXml(e.label)}</text>`,
      );
    }
  }

  // ── Nodes ─────────────────────────────────────────────────────────────────
  for (let i = 0; i < n; i++) {
    const node = rawNodes[i];
    const cx = px(i), cy = py(i);
    const r  = radii[i];
    const nt = groupType(node.group);

    const fill   = theme.nodeFills[nt];
    const stroke = theme.nodeStrokes[nt];
    const text   = theme.textColors[nt];

    parts.push(
      `<circle cx="${cx}" cy="${cy}" r="${r}" ` +
        `fill="${escapeXml(fill)}" stroke="${escapeXml(stroke)}" stroke-width="${theme.strokeWidth}"/>`,
    );

    // Label inside the circle (truncate to max 10 chars)
    const labelFs = 10;
    let label = node.label;
    if (label.length > 10) {
      label = label.slice(0, 10) + '…';
    }

    parts.push(
      `<text x="${cx}" y="${cy}" text-anchor="middle" dominant-baseline="middle" ` +
        `font-family="${escapeXml(theme.fontFamily)}" font-size="${labelFs}" ` +
        `fill="${escapeXml(text)}">${escapeXml(label)}</text>`,
    );
  }

  const bgParts: string[] = theme.background
    ? [`<rect width="100%" height="100%" fill="${theme.background}"/>`]
    : [];

  const titleSvg = renderTitleBlock(
    title, subtitle, CANVAS_W / 2, 0,
    theme.fontFamily, theme.fontSize, theme.edgeColor, theme.groupColor,
  );

  return [
    `<svg xmlns="http://www.w3.org/2000/svg" width="${CANVAS_W}" height="${CANVAS_H + titleH}" viewBox="0 0 ${CANVAS_W} ${CANVAS_H + titleH}">`,
    ...bgParts,
    ...(titleSvg ? [titleSvg] : []),
    `<g class="network-diagram"${titleH > 0 ? ` transform="translate(0,${titleH})"` : ''}>`,
    ...parts,
    `</g>`,
    `</svg>`,
  ].join('\n');
}
