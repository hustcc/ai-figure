import { resolveTheme } from './theme';
import { escapeXml, wrapText, titleBlockHeight, renderTitleBlock } from './utils';
import type { SwimlaneDiagramOptions, SwimlaneNode, SwimlaneEdge, NodeType } from './types';

/** Incrementing counter for unique per-diagram SVG IDs. */
let _swimlaneCount = 0;

// ── Layout constants ────────────────────────────────────────────────────────
const LANE_LABEL_W  = 130;   // left column width for lane labels
const NODE_W        = 152;   // node box width
const NODE_H        = 50;    // node box height
const NODE_RX       = 8;
const NODE_H_GAP    = 48;    // horizontal gap between nodes within a lane
const NODE_V_GAP    = 30;    // vertical gap between nodes within a lane (reserved)
const LANE_PAD_TOP  = 32;    // padding at top of each lane above nodes
const LANE_PAD_BOT  = 32;    // padding at bottom of each lane below nodes
const LANE_FS       = 13;    // lane label font size
const LABEL_FS      = 13;    // node label font size

// ── Node type → color cycle ──────────────────────────────────────────────────
const SWIM_NODE_TYPES: NodeType[] = ['process', 'terminal', 'io', 'decision'];

/**
 * Compute node positions within each lane.
 * Nodes in a lane are arranged left-to-right in definition order.
 * Lane height adapts to fit its nodes.
 */
function computeLayout(
  lanes: string[],
  nodes: SwimlaneNode[],
): {
  nodePos: Map<string, { cx: number; cy: number }>;
  laneY: Map<string, number>;
  laneH: Map<string, number>;
  totalW: number;
  totalH: number;
} {
  // Group nodes by lane
  const byLane = new Map<string, SwimlaneNode[]>();
  for (const lane of lanes) byLane.set(lane, []);
  for (const node of nodes) {
    const arr = byLane.get(node.lane);
    if (arr) arr.push(node);
  }

  const nodePos = new Map<string, { cx: number; cy: number }>();
  const laneY   = new Map<string, number>();
  const laneH   = new Map<string, number>();

  let curY      = 0;
  let maxWidth  = LANE_LABEL_W + NODE_W + NODE_H_GAP * 2;

  for (const lane of lanes) {
    const laneNodes = byLane.get(lane) ?? [];
    laneY.set(lane, curY);

    // Place nodes left-to-right
    let cx = LANE_LABEL_W + NODE_H_GAP + NODE_W / 2;
    const cy = curY + LANE_PAD_TOP + NODE_H / 2;

    for (const node of laneNodes) {
      nodePos.set(node.id, { cx, cy });
      maxWidth = Math.max(maxWidth, cx + NODE_W / 2 + NODE_H_GAP);
      cx += NODE_W + NODE_H_GAP;
    }

    const h = LANE_PAD_TOP + NODE_H + LANE_PAD_BOT;
    laneH.set(lane, h);
    curY += h;
  }

  return { nodePos, laneY, laneH, totalW: maxWidth, totalH: curY };
}

/**
 * Generate an SVG swimlane diagram.
 *
 * Each lane is a horizontal band labeled on the left. Nodes sit inside their
 * respective lanes; edges between nodes are drawn as straight lines with
 * arrowheads. Cross-lane edges are the intended use case.
 */
export function createSwimlaneDiagram(options: SwimlaneDiagramOptions): string {
  const {
    lanes,
    nodes,
    edges,
    theme: mode = 'light',
    palette,
    title,
    subtitle,
  } = options;

  const theme  = resolveTheme(palette, mode);
  const titleH = titleBlockHeight(title, subtitle, theme.fontSize);
  const uid    = `sw-${++_swimlaneCount}`;

  const layout = computeLayout(lanes, nodes);
  const WIDTH  = Math.max(500, layout.totalW);
  const HEIGHT = Math.max(200, layout.totalH);

  const parts: string[] = [];

  // ── Defs ─────────────────────────────────────────────────────────────────
  parts.push(
    `<defs>` +
      `<marker id="${uid}-arrow" markerWidth="8" markerHeight="6" ` +
        `refX="7" refY="3" orient="auto" markerUnits="strokeWidth">` +
        `<polygon points="0 0, 8 3, 0 6, 1.5 3" fill="${escapeXml(theme.edgeColor)}"/>` +
      `</marker>` +
    `</defs>`,
  );

  // ── Lane bands ───────────────────────────────────────────────────────────
  for (let li = 0; li < lanes.length; li++) {
    const lane  = lanes[li];
    const y     = layout.laneY.get(lane) ?? 0;
    const h     = layout.laneH.get(lane) ?? NODE_H + LANE_PAD_TOP + LANE_PAD_BOT;

    // Neutral gray header: cycle through subtle opacity steps so lanes are
    // visually distinct without using any palette color.
    const hdrOpacity = 0.08 + (li % 4) * 0.06;  // 0.08 / 0.14 / 0.20 / 0.26 ...

    // Content band: alternate very subtle tint
    const bandFill = li % 2 === 1 ? theme.groupFill : 'none';
    parts.push(
      `<rect x="${LANE_LABEL_W}" y="${y}" width="${WIDTH - LANE_LABEL_W}" height="${h}" ` +
        `fill="${escapeXml(bandFill)}" stroke="none"/>`,
    );

    // Horizontal divider line (top of lane)
    parts.push(
      `<line x1="0" y1="${y}" x2="${WIDTH}" y2="${y}" ` +
        `stroke="${escapeXml(theme.groupColor)}" stroke-width="1.5"/>`,
    );

    // Lane label column — neutral gray fill, darker per-lane via fill-opacity
    parts.push(
      `<rect x="0" y="${y}" width="${LANE_LABEL_W}" height="${h}" ` +
        `fill="${escapeXml(theme.groupColor)}" fill-opacity="${hdrOpacity}" stroke="none"/>`,
    );

    // Right border of label column
    parts.push(
      `<line x1="${LANE_LABEL_W}" y1="${y}" x2="${LANE_LABEL_W}" y2="${y + h}" ` +
        `stroke="${escapeXml(theme.groupColor)}" stroke-width="1.5"/>`,
    );

    // Lane label text (vertical centering)
    const labelCY = y + h / 2;
    parts.push(
      `<text x="${LANE_LABEL_W / 2}" y="${labelCY}" text-anchor="middle" ` +
        `dominant-baseline="central" ` +
        `font-family="${escapeXml(theme.fontFamily)}" font-size="${LANE_FS}" ` +
        `font-weight="700" fill="${escapeXml(theme.edgeColor)}">${escapeXml(lane)}</text>`,
    );
  }

  // Bottom border
  parts.push(
    `<line x1="0" y1="${HEIGHT}" x2="${WIDTH}" y2="${HEIGHT}" ` +
      `stroke="${escapeXml(theme.groupColor)}" stroke-width="1.5"/>`,
  );

  // ── Edges ─────────────────────────────────────────────────────────────────
  const nodeMap = new Map<string, SwimlaneNode>(nodes.map((n) => [n.id, n]));
  for (const edge of edges) {
    const fromPos = layout.nodePos.get(edge.from);
    const toPos   = layout.nodePos.get(edge.to);
    if (!fromPos || !toPos) continue;

    const fromNode = nodeMap.get(edge.from);
    const toNode   = nodeMap.get(edge.to);
    const sameLane = fromNode?.lane === toNode?.lane;

    let pathD: string;
    let labelX: number;
    let labelY: number;

    if (sameLane) {
      // Same lane: horizontal arrow from right edge to left edge
      const x1 = fromPos.cx + NODE_W / 2;
      const y1 = fromPos.cy;
      const x2 = toPos.cx - NODE_W / 2;
      const y2 = toPos.cy;
      pathD  = `M${x1},${y1} L${x2},${y2}`;
      labelX = (x1 + x2) / 2;
      labelY = y1 - 8;
    } else {
      // Cross-lane: S-curve from bottom-center of source to top-center of target
      const x1   = fromPos.cx;
      const y1   = fromPos.cy + NODE_H / 2;
      const x2   = toPos.cx;
      const y2   = toPos.cy - NODE_H / 2;
      const midY = (y1 + y2) / 2;
      pathD  = `M${x1},${y1} C${x1},${midY} ${x2},${midY} ${x2},${y2}`;
      labelX = (x1 + x2) / 2;
      labelY = midY - 6;
    }

    parts.push(
      `<path d="${escapeXml(pathD)}" fill="none" ` +
        `stroke="${escapeXml(theme.edgeColor)}" stroke-width="${theme.edgeWidth}" stroke-dasharray="6,4" ` +
        `marker-end="url(#${uid}-arrow)">` +
        `<animate attributeName="stroke-dashoffset" from="0" to="-20" dur="0.8s" repeatCount="indefinite"/>` +
      `</path>`,
    );

    if (edge.label) {
      parts.push(
        `<text x="${labelX}" y="${labelY}" text-anchor="middle" ` +
          `font-family="${escapeXml(theme.fontFamily)}" font-size="${LABEL_FS - 2}" ` +
          `fill="${escapeXml(theme.edgeColor)}" opacity="0.85">${escapeXml(edge.label)}</text>`,
      );
    }
  }

  // ── Nodes ─────────────────────────────────────────────────────────────────
  for (let ni = 0; ni < nodes.length; ni++) {
    const node    = nodes[ni];
    const pos     = layout.nodePos.get(node.id);
    if (!pos) continue;

    const nodeType: NodeType = node.type ?? SWIM_NODE_TYPES[ni % SWIM_NODE_TYPES.length];
    const fill     = theme.nodeFills[nodeType];
    const stroke   = theme.nodeStrokes[nodeType];
    const txtClr   = theme.textColors[nodeType];

    const x = pos.cx - NODE_W / 2;
    const y = pos.cy - NODE_H / 2;
    const lines = wrapText(node.label, NODE_W - 16, LABEL_FS);
    const lineH  = LABEL_FS * 1.3;
    const textY0 = pos.cy - ((lines.length - 1) * lineH) / 2;

    parts.push(
      `<rect x="${x}" y="${y}" width="${NODE_W}" height="${NODE_H}" ` +
        `rx="${NODE_RX}" ry="${NODE_RX}" fill="${escapeXml(fill)}" ` +
        `stroke="${escapeXml(stroke)}" stroke-width="${theme.strokeWidth}"/>`,
    );
    for (let li = 0; li < lines.length; li++) {
      parts.push(
        `<text x="${pos.cx}" y="${textY0 + li * lineH}" text-anchor="middle" ` +
          `dominant-baseline="central" ` +
          `font-family="${escapeXml(theme.fontFamily)}" font-size="${LABEL_FS}" ` +
          `font-weight="600" fill="${escapeXml(txtClr)}">${escapeXml(lines[li])}</text>`,
      );
    }
  }

  const bgParts: string[] = theme.background
    ? [`<rect width="100%" height="100%" fill="${theme.background}"/>`]
    : [];

  const titleSvg = renderTitleBlock(
    title, subtitle, WIDTH / 2, 0,
    theme.fontFamily, theme.fontSize, theme.edgeColor, theme.groupColor,
  );

  return [
    `<svg xmlns="http://www.w3.org/2000/svg" width="${WIDTH}" height="${HEIGHT + titleH}" ` +
      `viewBox="0 0 ${WIDTH} ${HEIGHT + titleH}">`,
    ...bgParts,
    ...(titleSvg ? [titleSvg] : []),
    `<g class="swimlane-diagram"${titleH > 0 ? ` transform="translate(0,${titleH})"` : ''}>`,
    ...parts,
    `</g>`,
    `</svg>`,
  ].join('\n');
}
