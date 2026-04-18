import { themes } from './theme';
import { escapeXml } from './utils';
import type { QuadrantChartOptions, NodeType } from './types';

// Auto-calculated canvas size — not user-configurable
const WIDTH = 560;
const HEIGHT = 560;
const PAD_LEFT = 52;    // room for rotated Y-axis label
const PAD_RIGHT = 28;
const PAD_TOP = 28;
const PAD_BOTTOM = 52;  // room for X-axis label
const PLOT_W = WIDTH - PAD_LEFT - PAD_RIGHT;   // 480
const PLOT_H = HEIGHT - PAD_TOP - PAD_BOTTOM;  // 480
const PLOT_X = PAD_LEFT;
const PLOT_Y = PAD_TOP;
const POINT_R = 5;
const MARKER_SIZE = 7;
/** x-coordinate threshold above which the label is placed to the left of the point. */
const LABEL_FLIP_THRESHOLD = 0.82;
/** Fractional offset applied to font-size to vertically centre the label next to a point. */
const LABEL_Y_OFFSET_RATIO = 0.38;

/** Node types assigned to quadrants: TL / TR / BL / BR. */
const QUAD_NODE_TYPES: NodeType[] = ['terminal', 'process', 'io', 'decision'];

/** Incrementing counter for unique per-diagram marker IDs. */
let _quadrantCount = 0;

/**
 * Generate an SVG quadrant chart (2×2 matrix).
 *
 * Each quadrant is rendered in a distinct theme color (matching the library's
 * other diagrams).  Data points use normalised coordinates (0–1 on each axis),
 * where x=0 is left, x=1 is right, y=0 is bottom, y=1 is top.
 *
 * Canvas size is fixed at 560×560 — no need to specify width/height.
 */
export function createQuadrantChart(options: QuadrantChartOptions): string {
  const {
    xAxis,
    yAxis,
    quadrants,
    points,
    theme: themeName = 'excalidraw',
  } = options;

  const theme = Object.prototype.hasOwnProperty.call(themes, themeName)
    ? themes[themeName as keyof typeof themes]
    : themes['excalidraw'];

  const sw = theme.strokeWidth;
  const axisColor = theme.edgeColor;
  const labelFs = theme.fontSize - 1;

  const midX = PLOT_X + PLOT_W / 2;
  const midY = PLOT_Y + PLOT_H / 2;
  const halfW = PLOT_W / 2;
  const halfH = PLOT_H / 2;

  // Unique marker ID to avoid conflicts when multiple diagrams are in one HTML page
  const uid = `qd-${++_quadrantCount}`;

  const parts: string[] = [];

  // ── Defs: arrowhead marker ────────────────────────────────────────────
  parts.push(
    `<defs>` +
      `<marker id="${uid}-arrow" markerWidth="${MARKER_SIZE}" markerHeight="${MARKER_SIZE}" ` +
      `refX="${MARKER_SIZE - 1}" refY="${MARKER_SIZE / 2}" orient="auto" markerUnits="strokeWidth">` +
      `<polygon points="0 0, ${MARKER_SIZE} ${MARKER_SIZE / 2}, 0 ${MARKER_SIZE}, 1.5 ${MARKER_SIZE / 2}" ` +
      `fill="${escapeXml(axisColor)}" opacity="0.6"/>` +
      `</marker>` +
      `</defs>`,
  );

  // ── Quadrant background regions (4 distinct theme colors) ─────────────
  // Mapping: [0]=TL, [1]=TR, [2]=BL, [3]=BR
  const quadRegions = [
    { x: PLOT_X,         y: PLOT_Y,         nt: QUAD_NODE_TYPES[0] },  // TL
    { x: PLOT_X + halfW, y: PLOT_Y,         nt: QUAD_NODE_TYPES[1] },  // TR
    { x: PLOT_X,         y: PLOT_Y + halfH, nt: QUAD_NODE_TYPES[2] },  // BL
    { x: PLOT_X + halfW, y: PLOT_Y + halfH, nt: QUAD_NODE_TYPES[3] },  // BR
  ];

  for (const q of quadRegions) {
    parts.push(
      `<rect x="${q.x}" y="${q.y}" width="${halfW}" height="${halfH}" ` +
        `fill="${escapeXml(theme.nodeFills[q.nt])}" fill-opacity="0.08" stroke="none"/>`,
    );
  }

  // ── Outer plot border ──────────────────────────────────────────────────
  parts.push(
    `<rect x="${PLOT_X}" y="${PLOT_Y}" width="${PLOT_W}" height="${PLOT_H}" ` +
      `fill="none" stroke="${escapeXml(theme.groupColor)}" stroke-width="1" opacity="0.4"/>`,
  );

  // ── Center divider lines (axis lines with arrowheads in + direction) ──
  // Horizontal X-axis divider
  parts.push(
    `<line x1="${PLOT_X}" y1="${midY}" x2="${PLOT_X + PLOT_W}" y2="${midY}" ` +
      `stroke="${escapeXml(axisColor)}" stroke-width="${sw}" opacity="0.45" ` +
      `marker-end="url(#${uid}-arrow)"/>`,
  );
  // Vertical Y-axis divider (draws bottom→top so arrow points up)
  parts.push(
    `<line x1="${midX}" y1="${PLOT_Y + PLOT_H}" x2="${midX}" y2="${PLOT_Y}" ` +
      `stroke="${escapeXml(axisColor)}" stroke-width="${sw}" opacity="0.45" ` +
      `marker-end="url(#${uid}-arrow)"/>`,
  );

  // ── Axis min / max labels ─────────────────────────────────────────────
  // X axis: min at left end, max at right end, displayed below the divider
  parts.push(
    `<text x="${PLOT_X + 4}" y="${midY + 16}" text-anchor="start" ` +
      `font-family="${escapeXml(theme.fontFamily)}" font-size="${labelFs}" ` +
      `fill="${escapeXml(axisColor)}" opacity="0.55">${escapeXml(xAxis.min)}</text>`,
    `<text x="${PLOT_X + PLOT_W - 4}" y="${midY + 16}" text-anchor="end" ` +
      `font-family="${escapeXml(theme.fontFamily)}" font-size="${labelFs}" ` +
      `fill="${escapeXml(axisColor)}" opacity="0.55">${escapeXml(xAxis.max)}</text>`,
  );
  // X axis name: centered below the plot area
  parts.push(
    `<text x="${midX}" y="${HEIGHT - 12}" text-anchor="middle" ` +
      `font-family="${escapeXml(theme.fontFamily)}" font-size="${labelFs}" ` +
      `font-weight="600" fill="${escapeXml(axisColor)}" opacity="0.7">${escapeXml(xAxis.label)}</text>`,
  );

  // Y axis: min near bottom, max near top — displayed to the left of divider
  parts.push(
    `<text x="${midX - 8}" y="${PLOT_Y + PLOT_H - 4}" text-anchor="end" ` +
      `font-family="${escapeXml(theme.fontFamily)}" font-size="${labelFs}" ` +
      `fill="${escapeXml(axisColor)}" opacity="0.55">${escapeXml(yAxis.min)}</text>`,
    `<text x="${midX - 8}" y="${PLOT_Y + 14}" text-anchor="end" ` +
      `font-family="${escapeXml(theme.fontFamily)}" font-size="${labelFs}" ` +
      `fill="${escapeXml(axisColor)}" opacity="0.55">${escapeXml(yAxis.max)}</text>`,
  );
  // Y axis name: rotated label centred on the left margin
  const yLabelX = Math.round(PAD_LEFT / 2);
  const yLabelY = PLOT_Y + PLOT_H / 2;
  parts.push(
    `<text x="${yLabelX}" y="${yLabelY}" text-anchor="middle" dominant-baseline="middle" ` +
      `font-family="${escapeXml(theme.fontFamily)}" font-size="${labelFs}" ` +
      `font-weight="600" fill="${escapeXml(axisColor)}" opacity="0.7" ` +
      `transform="rotate(-90, ${yLabelX}, ${yLabelY})">${escapeXml(yAxis.label)}</text>`,
  );

  // ── Quadrant name labels (centered within each quadrant cell) ─────────
  const qLabels = [
    { cx: PLOT_X + halfW / 2,   cy: PLOT_Y + halfH / 2,   label: quadrants[0], nt: QUAD_NODE_TYPES[0] },
    { cx: PLOT_X + halfW * 1.5, cy: PLOT_Y + halfH / 2,   label: quadrants[1], nt: QUAD_NODE_TYPES[1] },
    { cx: PLOT_X + halfW / 2,   cy: PLOT_Y + halfH * 1.5, label: quadrants[2], nt: QUAD_NODE_TYPES[2] },
    { cx: PLOT_X + halfW * 1.5, cy: PLOT_Y + halfH * 1.5, label: quadrants[3], nt: QUAD_NODE_TYPES[3] },
  ];

  for (const q of qLabels) {
    parts.push(
      `<text x="${q.cx}" y="${q.cy}" text-anchor="middle" dominant-baseline="middle" ` +
        `font-family="${escapeXml(theme.fontFamily)}" font-size="${theme.fontSize + 1}" ` +
        `font-weight="700" fill="${escapeXml(theme.nodeStrokes[q.nt])}" opacity="0.3">${escapeXml(q.label)}</text>`,
    );
  }

  // ── Data points ────────────────────────────────────────────────────────
  const ptColor = theme.nodeStrokes['process'];
  const ptTextColor = theme.textColors['process'];

  for (const pt of points) {
    // x: 0=left→PLOT_X, 1=right→PLOT_X+PLOT_W
    // y: 0=bottom→PLOT_Y+PLOT_H, 1=top→PLOT_Y  (SVG Y-flip)
    const cx = PLOT_X + pt.x * PLOT_W;
    const cy = PLOT_Y + (1 - pt.y) * PLOT_H;

    // White-fill circle with colored stroke — matches node styling in other charts
    parts.push(
      `<circle cx="${cx}" cy="${cy}" r="${POINT_R}" ` +
        `fill="white" stroke="${escapeXml(ptColor)}" stroke-width="2"/>`,
    );

    // Label placed to the right; near right edge → place to the left
    const nearRight = pt.x > LABEL_FLIP_THRESHOLD;
    const labelX = nearRight ? cx - POINT_R - 5 : cx + POINT_R + 6;
    const anchor = nearRight ? 'end' : 'start';
    parts.push(
      `<text x="${labelX}" y="${cy + labelFs * LABEL_Y_OFFSET_RATIO}" text-anchor="${anchor}" ` +
        `font-family="${escapeXml(theme.fontFamily)}" font-size="${labelFs}" ` +
        `fill="${escapeXml(ptTextColor)}">${escapeXml(pt.label)}</text>`,
    );
  }

  return [
    `<svg xmlns="http://www.w3.org/2000/svg" width="${WIDTH}" height="${HEIGHT}" viewBox="0 0 ${WIDTH} ${HEIGHT}">`,
    `<g class="quadrant-chart">`,
    ...parts,
    `</g>`,
    `</svg>`,
  ].join('\n');
}

