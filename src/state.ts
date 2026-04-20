import * as dagre from 'dagre';
import { resolveTheme } from './theme';
import { escapeXml, wrapText, titleBlockHeight, renderTitleBlock } from './utils';
import type { StateDiagramOptions, StateNode } from './types';

/** Incrementing counter for unique per-diagram SVG IDs. */
let _stateCount = 0;

// ── Layout constants ────────────────────────────────────────────────────────
const NODE_W    = 148;
const NODE_H    = 44;
const NODE_RX   = 8;
const START_R   = 7;
const END_R     = 9;
const END_INNER_R = 5;
const PAD       = 40;

/** Build an SVG path for a self-loop arc rising above the node top-center. */
function selfLoopPath(cx: number, top: number): string {
  const r  = 28;
  const dx = 16;
  const startX = cx - dx;
  const endX   = cx + dx;
  const cpY    = top - r;
  return 'M' + startX + ',' + top + ' C' + startX + ',' + cpY + ' ' + endX + ',' + cpY + ' ' + endX + ',' + top;
}

/** Run dagre layout on generic {id, width, height} nodes and {from, to} edges. */
function layoutGraph(
  nodes: { id: string; width: number; height: number }[],
  edges: { id: string; from: string; to: string }[],
): {
  nodes: Map<string, { cx: number; cy: number; width: number; height: number }>;
  edges: Map<string, { points: { x: number; y: number }[] }>;
  width: number;
  height: number;
} {
  const g = new dagre.graphlib.Graph({ multigraph: true });
  g.setGraph({ rankdir: 'TB', ranksep: 70, nodesep: 50, marginx: PAD, marginy: PAD });
  g.setDefaultEdgeLabel(() => ({}));

  for (const n of nodes) {
    g.setNode(n.id, { width: n.width, height: n.height });
  }

  for (const e of edges) {
    g.setEdge(e.from, e.to, {}, e.id);
  }

  dagre.layout(g);

  const outNodes = new Map<string, { cx: number; cy: number; width: number; height: number }>();
  for (const id of g.nodes()) {
    const n = g.node(id) as dagre.Node;
    outNodes.set(id, { cx: n.x, cy: n.y, width: n.width, height: n.height });
  }

  const outEdges = new Map<string, { points: { x: number; y: number }[] }>();
  for (const { v, w, name } of g.edges()) {
    const e = g.edge(v, w, name) as dagre.GraphEdge;
    outEdges.set(name ?? (v + '-' + w), { points: (e.points ?? []) as { x: number; y: number }[] });
  }

  let maxX = 0, maxY = 0;
  for (const n of outNodes.values()) {
    maxX = Math.max(maxX, n.cx + n.width / 2);
    maxY = Math.max(maxY, n.cy + n.height / 2);
  }

  return { nodes: outNodes, edges: outEdges, width: maxX + PAD, height: maxY + PAD };
}

/**
 * Generate an SVG state machine diagram.
 */
export function createStateDiagram(options: StateDiagramOptions): string {
  const {
    nodes,
    transitions,
    theme: mode = 'light',
    palette,
    title,
    subtitle,
  } = options;

  const theme  = resolveTheme(palette, mode);
  const titleH = titleBlockHeight(title, subtitle, theme.fontSize);
  const uid    = 'st-' + (++_stateCount);

  const accentStroke = theme.nodeStrokes['decision'];
  const accentFill   = theme.nodeFills['decision'];
  const accentText   = theme.textColors['decision'];

  const dagreNodes = nodes.map((n) => {
    const t = n.type ?? 'state';
    if (t === 'start')  return { id: n.id, width: START_R * 2 + 4, height: START_R * 2 + 4 };
    if (t === 'end')    return { id: n.id, width: END_R   * 2 + 4, height: END_R   * 2 + 4 };
    return { id: n.id, width: NODE_W, height: NODE_H };
  });

  const nodeIds = new Set(nodes.map((n) => n.id));
  const dagreEdges = transitions
    .filter((t) => t.from !== t.to && nodeIds.has(t.from) && nodeIds.has(t.to))
    .map((t, i) => ({ id: 'e' + i, from: t.from, to: t.to }));

  const layout = layoutGraph(dagreNodes, dagreEdges);

  const WIDTH  = Math.max(420, layout.width);
  const HEIGHT = Math.max(300, layout.height);

  const parts: string[] = [];

  parts.push(
    '<defs>' +
      '<marker id="' + uid + '-arrow" markerWidth="8" markerHeight="6" ' +
        'refX="7" refY="3" orient="auto" markerUnits="strokeWidth">' +
        '<polygon points="0 0, 8 3, 0 6, 1.5 3" fill="' + escapeXml(theme.edgeColor) + '"/>' +
      '</marker>' +
      '<marker id="' + uid + '-arrow-accent" markerWidth="8" markerHeight="6" ' +
        'refX="7" refY="3" orient="auto" markerUnits="strokeWidth">' +
        '<polygon points="0 0, 8 3, 0 6, 1.5 3" fill="' + escapeXml(accentStroke) + '"/>' +
      '</marker>' +
    '</defs>',
  );

  const nodeMap = new Map<string, StateNode>(nodes.map((n) => [n.id, n]));

  let nonSelfIdx = 0;
  for (let i = 0; i < transitions.length; i++) {
    const t = transitions[i];
    const fromNode = nodeMap.get(t.from);
    const fromLn   = layout.nodes.get(t.from);
    if (!fromLn) continue;

    const isAccentEdge = fromNode?.accent === true;
    const edgeStroke   = isAccentEdge ? accentStroke : theme.edgeColor;
    const markerRef    = 'url(#' + uid + '-' + (isAccentEdge ? 'arrow-accent' : 'arrow') + ')';

    let pathD: string;
    let labelX = 0, labelY = 0;

    if (t.from === t.to) {
      const top = fromLn.cy - fromLn.height / 2;
      pathD  = selfLoopPath(fromLn.cx, top);
      labelX = fromLn.cx;
      labelY = top - 32;
    } else {
      const edgeKey = 'e' + nonSelfIdx;
      nonSelfIdx++;
      const le   = layout.edges.get(edgeKey);
      const toLn = layout.nodes.get(t.to);

      if (le && le.points.length >= 2) {
        const pts = le.points;
        pathD = 'M' + pts[0].x + ',' + pts[0].y;
        for (let p = 1; p < pts.length - 1; p++) {
          const cp = pts[p];
          const np = pts[p + 1];
          pathD += ' Q' + cp.x + ',' + cp.y + ' ' + ((cp.x + np.x) / 2) + ',' + ((cp.y + np.y) / 2);
        }
        const last = pts[pts.length - 1];
        pathD += ' L' + last.x + ',' + last.y;
        const mid = pts[Math.floor(pts.length / 2)];
        labelX = mid.x;
        labelY = mid.y - 7;
      } else {
        const toLnF = toLn ?? fromLn;
        pathD  = 'M' + fromLn.cx + ',' + fromLn.cy + ' L' + toLnF.cx + ',' + toLnF.cy;
        labelX = (fromLn.cx + toLnF.cx) / 2;
        labelY = (fromLn.cy + toLnF.cy) / 2 - 7;
      }
    }

    parts.push(
      '<path d="' + escapeXml(pathD) + '" fill="none" stroke="' + escapeXml(edgeStroke) + '" ' +
        'stroke-width="' + theme.edgeWidth + '" stroke-dasharray="6,4" marker-end="' + markerRef + '">' +
        '<animate attributeName="stroke-dashoffset" from="0" to="-20" dur="0.8s" repeatCount="indefinite"/>' +
      '</path>',
    );

    if (t.label) {
      const labelFill = isAccentEdge ? accentText : theme.edgeColor;
      const labelFs   = theme.fontSize - 3;
      parts.push(
        '<text x="' + labelX + '" y="' + labelY + '" text-anchor="middle" ' +
          'font-family="' + escapeXml(theme.fontFamily) + '" font-size="' + labelFs + '" ' +
          'fill="' + escapeXml(labelFill) + '" opacity="0.9">' + escapeXml(t.label) + '</text>',
      );
    }
  }

  for (const [id, ln] of layout.nodes) {
    const node  = nodeMap.get(id);
    if (!node) continue;
    const type  = node.type ?? 'state';
    const isAcc = node.accent === true;

    const fill   = isAcc ? accentFill   : theme.nodeFills['process'];
    const stroke = isAcc ? accentStroke : theme.nodeStrokes['process'];
    const txtClr = isAcc ? accentText   : theme.textColors['process'];

    if (type === 'start') {
      parts.push(
        '<circle cx="' + ln.cx + '" cy="' + ln.cy + '" r="' + START_R + '" ' +
          'fill="' + escapeXml(theme.edgeColor) + '" stroke="none"/>',
      );
    } else if (type === 'end') {
      parts.push(
        '<circle cx="' + ln.cx + '" cy="' + ln.cy + '" r="' + END_R + '" ' +
          'fill="none" stroke="' + escapeXml(theme.edgeColor) + '" stroke-width="2"/>',
        '<circle cx="' + ln.cx + '" cy="' + ln.cy + '" r="' + END_INNER_R + '" ' +
          'fill="' + escapeXml(theme.edgeColor) + '" stroke="none"/>',
      );
    } else {
      const x = ln.cx - ln.width / 2;
      const y = ln.cy - ln.height / 2;
      const textLines = wrapText(node.label, ln.width - 16, theme.fontSize);
      const lineH     = theme.fontSize * 1.3;
      const textStartY = ln.cy - ((textLines.length - 1) * lineH) / 2;

      parts.push(
        '<rect x="' + x + '" y="' + y + '" width="' + ln.width + '" height="' + ln.height + '" ' +
          'rx="' + NODE_RX + '" ry="' + NODE_RX + '" fill="' + escapeXml(fill) + '" ' +
          'stroke="' + escapeXml(stroke) + '" stroke-width="' + theme.strokeWidth + '"/>',
      );
      for (let li = 0; li < textLines.length; li++) {
        parts.push(
          '<text x="' + ln.cx + '" y="' + (textStartY + li * lineH) + '" text-anchor="middle" ' +
            'dominant-baseline="central" ' +
            'font-family="' + escapeXml(theme.fontFamily) + '" font-size="' + theme.fontSize + '" ' +
            'font-weight="600" fill="' + escapeXml(txtClr) + '">' + escapeXml(textLines[li]) + '</text>',
        );
      }
    }
  }

  const bgParts: string[] = theme.background
    ? ['<rect width="100%" height="100%" fill="' + theme.background + '"/>']
    : [];

  const titleSvg = renderTitleBlock(
    title, subtitle, WIDTH / 2, 0,
    theme.fontFamily, theme.fontSize, theme.edgeColor, theme.groupColor,
  );

  // Center the diagram horizontally if the dagre layout is narrower than MIN_WIDTH
  const offsetX = Math.round(Math.max(0, (WIDTH - layout.width) / 2));
  const groupTransform = offsetX > 0
    ? (titleH > 0 ? 'translate(' + offsetX + ',' + titleH + ')' : 'translate(' + offsetX + ',0)')
    : (titleH > 0 ? 'translate(0,' + titleH + ')' : '');

  return [
    '<svg xmlns="http://www.w3.org/2000/svg" width="' + WIDTH + '" height="' + (HEIGHT + titleH) + '" ' +
      'viewBox="0 0 ' + WIDTH + ' ' + (HEIGHT + titleH) + '">',
    ...bgParts,
    ...(titleSvg ? [titleSvg] : []),
    '<g class="state-diagram"' + (groupTransform ? ' transform="' + groupTransform + '"' : '') + '>',
    ...parts,
    '</g>',
    '</svg>',
  ].join('\n');
}
