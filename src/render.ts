import type { FlowNode, FlowEdge, FlowGroup, FlowChartOptions } from './types';
import { computeLayout } from './layout';
import type { LayoutNode, LayoutEdge } from './layout';
import { resolveTheme } from './theme';
import type { ThemeConfig } from './theme';
import { escapeXml, wrapText, titleBlockHeight, renderTitleBlock } from './utils';

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

/**
 * Convert waypoints to a smooth SVG path with rounded corners.
 * Each intermediate waypoint is rounded using a quadratic bezier (Q), while
 * segments between waypoints are straight lines (L). This avoids the
 * S-curve "fold" that occurs when consecutive segments change direction
 * and keeps arrowhead orientation correct on any axis.
 */
function pointsToSmoothPath(points: { x: number; y: number }[]): string {
  if (points.length < 2) return '';
  const r = 10; // corner rounding radius (px)
  let d = `M${points[0].x},${points[0].y}`;
  for (let i = 1; i < points.length; i++) {
    const p = points[i];
    if (i === points.length - 1) {
      // Last point — draw a straight line to it so the arrowhead orientation is exact.
      d += ` L${p.x},${p.y}`;
    } else {
      // Intermediate waypoint — round the corner with a small quadratic bezier.
      const prev = points[i - 1];
      const next = points[i + 1];
      const dx1 = p.x - prev.x, dy1 = p.y - prev.y;
      const dx2 = next.x - p.x, dy2 = next.y - p.y;
      const d1 = Math.sqrt(dx1 * dx1 + dy1 * dy1);
      const d2 = Math.sqrt(dx2 * dx2 + dy2 * dy2);
      if (d1 < 1 || d2 < 1) {
        d += ` L${p.x},${p.y}`;
        continue;
      }
      const r1 = Math.min(r, d1 / 2);
      const r2 = Math.min(r, d2 / 2);
      // Point just before the corner
      const bx = p.x - (dx1 / d1) * r1, by = p.y - (dy1 / d1) * r1;
      // Point just after the corner
      const ax = p.x + (dx2 / d2) * r2, ay = p.y + (dy2 / d2) * r2;
      d += ` L${bx},${by} Q${p.x},${p.y} ${ax},${ay}`;
    }
  }
  return d;
}

/** Incrementing counter for unique per-diagram SVG IDs. */
let _flowChartCount = 0;

/** Approximate character-width-to-height ratio for Inter at typical sizes (used for label width estimation). */
const LABEL_CHAR_WIDTH_RATIO = 0.58;

// ---------------------------------------------------------------------------
// Node rendering
// ---------------------------------------------------------------------------

function renderNode(node: FlowNode, layout: LayoutNode, theme: ThemeConfig): string {
  const { x, y, width, height } = layout;
  const type = node.type ?? 'process';
  const fill = theme.nodeFills[type] ?? theme.nodeFills['process'];
  const stroke = theme.nodeStrokes[type] ?? theme.nodeStrokes['process'];
  const sw = theme.strokeWidth;

  let shapeSvg: string;

  switch (type) {
    case 'terminal': {
      const rx = Math.min(height / 2, 28);
      shapeSvg =
        `<rect x="${x}" y="${y}" width="${width}" height="${height}" ` +
        `rx="${rx}" ry="${rx}" fill="${fill}" stroke="${stroke}" stroke-width="${sw}"/>`;
      break;
    }
    case 'decision': {
      const cx = x + width / 2;
      const cy = y + height / 2;
      shapeSvg =
        `<polygon points="${cx},${y} ${x + width},${cy} ${cx},${y + height} ${x},${cy}" ` +
        `fill="${fill}" stroke="${stroke}" stroke-width="${sw}" stroke-linejoin="round"/>`;
      break;
    }
    case 'io': {
      const skew = 14;
      shapeSvg =
        `<polygon points="${x + skew},${y} ${x + width},${y} ${x + width - skew},${y + height} ${x},${y + height}" ` +
        `fill="${fill}" stroke="${stroke}" stroke-width="${sw}" stroke-linejoin="round"/>`;
      break;
    }
    default: {
      const rx = theme.cornerRadius;
      shapeSvg =
        `<rect x="${x}" y="${y}" width="${width}" height="${height}" ` +
        `rx="${rx}" ry="${rx}" fill="${fill}" stroke="${stroke}" stroke-width="${sw}"/>`;
    }
  }

  // Text label
  const labelX = x + width / 2;
  const labelY = y + height / 2;
  const textColor = theme.textColors[type] ?? theme.textColors['process'];
  const lines = wrapText(node.label, width - 16, theme.fontSize);
  const lineHeight = theme.fontSize * 1.4;
  const totalH = lines.length * lineHeight;
  const startY = labelY - totalH / 2 + lineHeight * 0.5;

  const textSvg = lines
    .map(
      (line, i) =>
        `<text x="${labelX}" y="${startY + i * lineHeight}" ` +
        `text-anchor="middle" dominant-baseline="middle" ` +
        `font-family="${escapeXml(theme.fontFamily)}" font-size="${theme.fontSize}" ` +
        `fill="${escapeXml(textColor)}">${escapeXml(line)}</text>`,
    )
    .join('\n');

  return `<g class="node node-${type}" data-id="${escapeXml(node.id)}">\n${shapeSvg}\n${textSvg}\n</g>`;
}

// ---------------------------------------------------------------------------
// Edge rendering
// ---------------------------------------------------------------------------

function renderEdge(
  edge: FlowEdge,
  layoutEdge: LayoutEdge,
  theme: ThemeConfig,
  arrowMarkerId: string,
): string {
  const { points } = layoutEdge;
  if (points.length < 2) return '';

  const d = pointsToSmoothPath(points);
  const edgeSvg =
    `<path d="${d}" fill="none" stroke="${theme.edgeColor}" ` +
    `stroke-width="${theme.edgeWidth}" stroke-linecap="round" ` +
    `stroke-linejoin="round" stroke-dasharray="8 5" ` +
    `class="ai-fc-edge" marker-end="url(#${arrowMarkerId})"/>`;

  // Edge label at the midpoint
  let labelSvg = '';
  if (edge.label) {
    const mid = points[Math.floor(points.length / 2)];
    const labelFontSize = theme.fontSize - 2;
    const padX = 5;
    const padY = 3;
    const labelW = edge.label.length * (labelFontSize * LABEL_CHAR_WIDTH_RATIO) + padX * 2;
    const labelH = labelFontSize + padY * 2;
    const bg =
      `<rect x="${mid.x - labelW / 2}" y="${mid.y - labelH / 2}" ` +
      `width="${labelW}" height="${labelH}" fill="${theme.background || 'white'}" rx="3" opacity="0.9"/>`;
    labelSvg =
      bg +
      `\n<text x="${mid.x}" y="${mid.y}" dy="0.35em" text-anchor="middle" ` +
      `font-family="${escapeXml(theme.fontFamily)}" font-size="${labelFontSize}" ` +
      `fill="${escapeXml(theme.edgeColor)}">${escapeXml(edge.label)}</text>`;
  }

  return `<g class="edge" data-from="${escapeXml(edge.from)}" data-to="${escapeXml(edge.to)}">\n${edgeSvg}\n${labelSvg}\n</g>`;
}

// ---------------------------------------------------------------------------
// Group rendering
// ---------------------------------------------------------------------------

function renderGroup(
  group: FlowGroup,
  nodeLayouts: Map<string, LayoutNode>,
  theme: ThemeConfig,
): string {
  const groupNodes = group.nodes
    .map((id) => nodeLayouts.get(id))
    .filter((n): n is LayoutNode => n !== undefined);

  if (groupNodes.length === 0) return '';

  const padding = 24;
  const labelHeight = theme.fontSize + 8;
  const minX = Math.min(...groupNodes.map((n) => n.x)) - padding;
  const minY = Math.min(...groupNodes.map((n) => n.y)) - padding - labelHeight;
  const maxX = Math.max(...groupNodes.map((n) => n.x + n.width)) + padding;
  const maxY = Math.max(...groupNodes.map((n) => n.y + n.height)) + padding;
  const w = maxX - minX;
  const h = maxY - minY;

  const groupSvg =
    `<rect x="${minX}" y="${minY}" width="${w}" height="${h}" rx="8" ` +
    `fill="${theme.groupFill}" stroke="${theme.groupColor}" stroke-width="1.5" ` +
    `stroke-dasharray="6 3"/>`;

  const labelSvg =
    `<text x="${minX + 10}" y="${minY + labelHeight - 4}" ` +
    `font-family="${escapeXml(theme.fontFamily)}" font-size="${theme.fontSize - 3}" ` +
    `fill="${escapeXml(theme.groupColor)}" font-weight="500">${escapeXml(group.label)}</text>`;

  return `<g class="group" data-id="${escapeXml(group.id)}">\n${groupSvg}\n${labelSvg}\n</g>`;
}

// ---------------------------------------------------------------------------
// Main renderer
// ---------------------------------------------------------------------------

export function renderFlowChart(options: FlowChartOptions): string {
  const {
    nodes,
    edges,
    groups = [],
    theme: mode = 'light',
    palette,
    direction = 'TB',
    title,
    subtitle,
  } = options;

  if (nodes.length === 0) {
    return `<svg xmlns="http://www.w3.org/2000/svg" width="200" height="100" viewBox="0 0 200 100"></svg>`;
  }

  const theme = resolveTheme(palette, mode);
  const layout = computeLayout(nodes, edges, direction);

  // Unique ID scoped to this diagram instance to avoid marker conflicts on the same HTML page.
  const uid = `fc-${++_flowChartCount}`;
  const arrowMarkerId = `${uid}-arrow`;

  // SVG <defs> — arrowhead marker + edge animation
  const defs =
    `<defs>\n` +
    `    <marker id="${arrowMarkerId}" markerWidth="8" markerHeight="6"\n` +
    `      refX="7" refY="3" orient="auto" markerUnits="strokeWidth">\n` +
    `      <polygon points="0 0, 8 3, 0 6, 1.5 3" fill="${theme.edgeColor}"/>\n` +
    `    </marker>\n` +
    `    <style>\n` +
    `      @keyframes ai-fc-flow { to { stroke-dashoffset: -26; } }\n` +
    `      .ai-fc-edge { animation: ai-fc-flow 1.2s linear infinite; }\n` +
    `    </style>\n` +
    `  </defs>`;

  // Groups (rendered first, behind everything else)
  const groupsSvg = groups
    .map((g) => renderGroup(g, layout.nodes, theme))
    .join('\n');

  // Build an O(1) index: input-edge-index → layout edge.
  // layout.ts names each dagre edge with String(i) where i is the input index.
  const layoutEdgeByIndex = new Map<number, LayoutEdge>();
  for (const le of layout.edges) {
    layoutEdgeByIndex.set(le.index, le);
  }

  // Edges
  const edgesSvg = edges
    .map((edge, i) => {
      const layoutEdge = layoutEdgeByIndex.get(i);
      if (!layoutEdge) return '';
      return renderEdge(edge, layoutEdge, theme, arrowMarkerId);
    })
    .join('\n');

  // Nodes (rendered last, on top)
  const nodesSvg = nodes
    .map((node) => {
      const layoutNode = layout.nodes.get(node.id);
      if (!layoutNode) return '';
      return renderNode(node, layoutNode, theme);
    })
    .join('\n');

  // Expand viewBox to include group rectangles, which extend above their nodes.
  let { width, height, viewBox: vb } = layout;
  if (groups.length > 0) {
    const GROUP_PAD = 24;
    // labelH matches renderGroup: fontSize + 8px of vertical padding around the label text
    const labelH = theme.fontSize + 8;
    let minX = vb.x, minY = vb.y, maxX = vb.x + vb.width, maxY = vb.y + vb.height;
    for (const group of groups) {
      const gNodes = group.nodes
        .map((id) => layout.nodes.get(id))
        .filter((n): n is LayoutNode => n !== undefined);
      if (!gNodes.length) continue;
      // Compute group bounds in a single pass over gNodes
      let gMinX = Infinity, gMinY = Infinity, gMaxX = -Infinity, gMaxY = -Infinity;
      for (const n of gNodes) {
        if (n.x < gMinX) gMinX = n.x;
        if (n.y < gMinY) gMinY = n.y;
        if (n.x + n.width > gMaxX) gMaxX = n.x + n.width;
        if (n.y + n.height > gMaxY) gMaxY = n.y + n.height;
      }
      if (gMinX - GROUP_PAD < minX) minX = gMinX - GROUP_PAD;
      if (gMinY - GROUP_PAD - labelH < minY) minY = gMinY - GROUP_PAD - labelH;
      if (gMaxX + GROUP_PAD > maxX) maxX = gMaxX + GROUP_PAD;
      if (gMaxY + GROUP_PAD > maxY) maxY = gMaxY + GROUP_PAD;
    }
    vb = { x: minX, y: minY, width: maxX - minX, height: maxY - minY };
    width = maxX - minX;
    height = maxY - minY;
  }

  // ── Title / subtitle block ─────────────────────────────────────────────
  // When a title (and/or subtitle) is provided, the viewBox is expanded upward
  // by `titleH` so the chart content retains its original coordinates while the
  // title block occupies the new space at the top.  No existing layout values
  // are modified — only vb.y, vb.height, and the SVG height grow.
  const titleH = titleBlockHeight(title, subtitle, theme.fontSize);
  let titleSvg = '';
  if (titleH > 0) {
    vb.y      -= titleH;
    vb.height += titleH;
    height    += titleH;
    // Center title horizontally over the diagram content.
    const cx = vb.x + vb.width / 2;
    titleSvg = renderTitleBlock(
      title, subtitle, cx, vb.y,
      theme.fontFamily, theme.fontSize, theme.edgeColor, theme.groupColor,
    );
  }

  // Background rect is computed after title expansion so it covers the full
  // (possibly enlarged) viewBox area including the title block.
  const bgParts: string[] = theme.background
    ? [`<rect x="${vb.x}" y="${vb.y}" width="${vb.width}" height="${vb.height}" fill="${theme.background}"/>`]
    : [];

  return [
    `<svg xmlns="http://www.w3.org/2000/svg" width="${width}" height="${height}" viewBox="${vb.x} ${vb.y} ${vb.width} ${vb.height}">`,
    defs,
    ...bgParts,
    ...(titleSvg ? [titleSvg] : []),
    `<g class="flowchart">`,
    groupsSvg,
    edgesSvg,
    nodesSvg,
    `</g>`,
    `</svg>`,
  ].join('\n');
}
