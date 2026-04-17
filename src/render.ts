import type { FlowNode, FlowEdge, FlowGroup, FlowChartOptions } from './types';
import { computeLayout } from './layout';
import type { LayoutNode, LayoutEdge } from './layout';
import { themes } from './theme';
import type { ThemeConfig } from './theme';

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

function escapeXml(str: string): string {
  return str
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&apos;');
}

/** Naive text-wrapping based on estimated character width. */
function wrapText(text: string, maxWidth: number, fontSize: number): string[] {
  const avgCharWidth = fontSize * 0.58;
  const maxChars = Math.max(1, Math.floor(maxWidth / avgCharWidth));
  if (text.length <= maxChars) return [text];

  const words = text.split(' ');
  const lines: string[] = [];
  let current = '';

  for (const word of words) {
    const candidate = current ? `${current} ${word}` : word;
    if (candidate.length > maxChars) {
      if (current) lines.push(current);
      current = word;
    } else {
      current = candidate;
    }
  }
  if (current) lines.push(current);
  return lines.length > 0 ? lines : [text];
}

/**
 * Convert waypoints to a smooth cubic-bezier SVG path.
 * Control points are placed at the midpoint along the dominant axis of each
 * segment so that:
 *  - Vertical segments (TB) produce a tangent pointing downward at the endpoint → arrowhead points down ✓
 *  - Horizontal segments (LR) produce a tangent pointing rightward at the endpoint → arrowhead points right ✓
 */
function pointsToSmoothPath(points: { x: number; y: number }[]): string {
  if (points.length < 2) return '';
  const [first, ...rest] = points;
  let d = `M${first.x},${first.y}`;
  let prev = first;
  for (const curr of rest) {
    const dx = Math.abs(curr.x - prev.x);
    const dy = Math.abs(curr.y - prev.y);
    if (dy >= dx) {
      // Primarily vertical segment: control points at vertical midpoint, preserving x.
      // Tangent at endpoint: (curr.x, midY) → (curr.x, curr.y)  →  points downward ✓
      const midY = (prev.y + curr.y) / 2;
      d += ` C${prev.x},${midY} ${curr.x},${midY} ${curr.x},${curr.y}`;
    } else {
      // Primarily horizontal segment: control points at horizontal midpoint, preserving y.
      // Tangent at endpoint: (midX, curr.y) → (curr.x, curr.y)  →  points rightward ✓
      const midX = (prev.x + curr.x) / 2;
      d += ` C${midX},${prev.y} ${midX},${curr.y} ${curr.x},${curr.y}`;
    }
    prev = curr;
  }
  return d;
}

/** Pixels-per-character estimate used for edge label background width. */
const EDGE_LABEL_CHAR_WIDTH = 7;

// ---------------------------------------------------------------------------
// Node rendering
// ---------------------------------------------------------------------------

function renderNode(node: FlowNode, layout: LayoutNode, theme: ThemeConfig): string {
  const { x, y, width, height } = layout;
  const type = node.type ?? 'process';
  const fill = theme.nodeFills[type];
  const stroke = theme.nodeStrokes[type];
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
  const textColor = theme.textColors[type];
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
): string {
  const { points } = layoutEdge;
  if (points.length < 2) return '';

  const d = pointsToSmoothPath(points);
  const edgeSvg =
    `<path d="${d}" fill="none" stroke="${theme.edgeColor}" ` +
    `stroke-width="${theme.edgeWidth}" stroke-linecap="round" ` +
    `stroke-linejoin="round" stroke-dasharray="8 5" ` +
    `class="ai-fc-edge" marker-end="url(#arrowhead)"/>`;

  // Edge label at the midpoint
  let labelSvg = '';
  if (edge.label) {
    const mid = points[Math.floor(points.length / 2)];
    const labelFontSize = theme.fontSize - 2;
    const padX = 6;
    const padY = 4;
    const labelW = edge.label.length * EDGE_LABEL_CHAR_WIDTH + padX * 2;
    const labelH = labelFontSize + padY * 2;
    const bg =
      `<rect x="${mid.x - labelW / 2}" y="${mid.y - labelH / 2}" ` +
      `width="${labelW}" height="${labelH}" fill="white" rx="3" opacity="0.9"/>`;
    labelSvg =
      bg +
      `\n<text x="${mid.x}" y="${mid.y}" text-anchor="middle" dominant-baseline="middle" ` +
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
    theme: themeName = 'excalidraw',
    direction = 'TB',
  } = options;

  if (nodes.length === 0) {
    return `<svg xmlns="http://www.w3.org/2000/svg" width="200" height="100" viewBox="0 0 200 100"></svg>`;
  }

  const theme = themes[themeName];
  const layout = computeLayout(nodes, edges, direction);

  // SVG <defs> — arrowhead marker + edge animation
  const defs =
    `<defs>\n` +
    `    <marker id="arrowhead" markerWidth="8" markerHeight="6"\n` +
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

  // Edges
  const edgesSvg = edges
    .map((edge) => {
      const layoutEdge = layout.edges.find(
        (e) => e.from === edge.from && e.to === edge.to,
      );
      if (!layoutEdge) return '';
      return renderEdge(edge, layoutEdge, theme);
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

  const { width, height, viewBox: vb } = layout;

  return [
    `<svg xmlns="http://www.w3.org/2000/svg" width="${width}" height="${height}" viewBox="${vb.x} ${vb.y} ${vb.width} ${vb.height}">`,
    defs,
    `<g class="flowchart">`,
    groupsSvg,
    edgesSvg,
    nodesSvg,
    `</g>`,
    `</svg>`,
  ].join('\n');
}
