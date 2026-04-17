import type { FlowNode, FlowEdge, FlowGroup, FlowChartOptions } from './types';
import { computeLayout } from './layout';
import type { LayoutNode, LayoutEdge } from './layout';
import { themes } from './theme';
import type { ThemeConfig } from './theme';
import {
  roughRect,
  roughRoundedRect,
  roughDiamond,
  roughParallelogram,
  roughCurve,
} from './rough';
import type { PathInfo, RoughOptions } from './rough';

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

/** Convert a PathInfo array to SVG <path> elements. */
function pathsToSvg(
  paths: PathInfo[],
  fill: string,
  stroke: string,
  strokeWidth: number,
  extra = '',
): string {
  return paths
    .map((p) => {
      const f = p.fill && p.fill !== 'none' ? p.fill : fill;
      const s = p.stroke ?? stroke;
      const sw = p.strokeWidth ?? strokeWidth;
      const dash = p.strokeLineDash
        ? `stroke-dasharray="${p.strokeLineDash.join(' ')}"`
        : '';
      return `<path d="${p.d}" fill="${f}" stroke="${s}" stroke-width="${sw}" ${dash} stroke-linecap="round" stroke-linejoin="round" ${extra}/>`;
    })
    .join('\n');
}

// ---------------------------------------------------------------------------
// Node rendering
// ---------------------------------------------------------------------------

function renderNode(node: FlowNode, layout: LayoutNode, theme: ThemeConfig): string {
  const { x, y, width, height } = layout;
  const type = node.type ?? 'process';
  const fill = theme.nodeFills[type];
  const stroke = theme.nodeStrokes[type];

  const roughOpts: RoughOptions = {
    roughness: theme.roughness,
    bowing: theme.bowing,
    seed: theme.seed,
    stroke,
    strokeWidth: 2,
    fill,
    fillStyle: 'solid',
  };

  let pathInfos: PathInfo[];

  switch (type) {
    case 'terminal':
      pathInfos = roughRoundedRect(x, y, width, height, 28, roughOpts);
      break;
    case 'decision':
      pathInfos = roughDiamond(x + width / 2, y + height / 2, width, height, roughOpts);
      break;
    case 'io':
      pathInfos = roughParallelogram(x, y, width, height, 14, roughOpts);
      break;
    default:
      pathInfos = roughRect(x, y, width, height, roughOpts);
  }

  const shapeSvg = pathsToSvg(pathInfos, fill, stroke, 2);

  // Text label
  const labelX = x + width / 2;
  const labelY = y + height / 2;
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
        `fill="${escapeXml(stroke)}">${escapeXml(line)}</text>`,
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
  edgeIndex: number,
): string {
  const { points } = layoutEdge;
  if (points.length < 2) return '';

  const roughOpts: RoughOptions = {
    roughness: theme.roughness * 0.6,
    bowing: theme.bowing * 0.5,
    seed: theme.seed + edgeIndex + 10,
    stroke: theme.edgeColor,
    strokeWidth: 1.5,
    fill: 'none',
  };

  const pathInfos = roughCurve(points, roughOpts);
  // Add arrowhead marker only on the last path (the stroke path)
  const lastIndex = pathInfos.length - 1;
  const curveSvg = pathInfos
    .map((p, i) => {
      const markerAttr = i === lastIndex ? `marker-end="url(#arrowhead)"` : '';
      return (
        `<path d="${p.d}" fill="none" stroke="${theme.edgeColor}" ` +
        `stroke-width="${p.strokeWidth ?? 1.5}" stroke-linecap="round" ` +
        `stroke-linejoin="round" ${markerAttr}/>`
      );
    })
    .join('\n');

  // Edge label at the midpoint
  let labelSvg = '';
  if (edge.label) {
    const mid = points[Math.floor(points.length / 2)];
    const bg = `<rect x="${mid.x - edge.label.length * 4}" y="${mid.y - 10}" ` +
      `width="${edge.label.length * 8}" height="16" fill="white" rx="3" opacity="0.85"/>`;
    labelSvg =
      bg +
      `\n<text x="${mid.x}" y="${mid.y}" text-anchor="middle" dominant-baseline="middle" ` +
      `font-family="${escapeXml(theme.fontFamily)}" font-size="${theme.fontSize - 2}" ` +
      `fill="${escapeXml(theme.edgeColor)}">${escapeXml(edge.label)}</text>`;
  }

  return `<g class="edge" data-from="${escapeXml(edge.from)}" data-to="${escapeXml(edge.to)}">\n${curveSvg}\n${labelSvg}\n</g>`;
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

  // Use a plain SVG rect for the group border (roughjs fill paths bleed through otherwise)
  const groupSvg =
    `<rect x="${minX}" y="${minY}" width="${w}" height="${h}" rx="6" ` +
    `fill="none" stroke="${theme.groupColor}" stroke-width="1.5" ` +
    `stroke-dasharray="7 4" stroke-linecap="round"/>`;

  const labelSvg =
    `<text x="${minX + 10}" y="${minY + labelHeight - 4}" ` +
    `font-family="${escapeXml(theme.fontFamily)}" font-size="${theme.fontSize - 1}" ` +
    `fill="${escapeXml(theme.groupColor)}" font-style="italic">${escapeXml(group.label)}</text>`;

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

  // SVG <defs> — arrowhead marker
  const defs = `<defs>
    <marker id="arrowhead" markerWidth="10" markerHeight="7"
      refX="9" refY="3.5" orient="auto" markerUnits="strokeWidth">
      <polygon points="0 0, 10 3.5, 0 7" fill="${theme.edgeColor}"/>
    </marker>
  </defs>`;

  // Groups (rendered first, behind everything else)
  const groupsSvg = groups
    .map((g) => renderGroup(g, layout.nodes, theme))
    .join('\n');

  // Edges
  const edgesSvg = edges
    .map((edge, i) => {
      const layoutEdge = layout.edges.find(
        (e) => e.from === edge.from && e.to === edge.to,
      );
      if (!layoutEdge) return '';
      return renderEdge(edge, layoutEdge, theme, i);
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

  const { width, height } = layout;

  return [
    `<svg xmlns="http://www.w3.org/2000/svg" width="${width}" height="${height}" viewBox="0 0 ${width} ${height}">`,
    defs,
    `<g class="flowchart">`,
    groupsSvg,
    edgesSvg,
    nodesSvg,
    `</g>`,
    `</svg>`,
  ].join('\n');
}
