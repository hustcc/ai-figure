import { themes } from './theme';
import { escapeXml } from './utils';
import type { QuadrantChartOptions, NodeType } from './types';

// Canvas size — auto-calculated from point count, clamped to [640, 1024]
const BASE_SIZE = 640;
const MAX_SIZE  = 1024;
const PAD_LEFT   = 56;   // room for rotated Y-axis label
const PAD_RIGHT  = 24;
const PAD_TOP    = 32;
const PAD_BOTTOM = 52;   // room for X-axis label

const POINT_R = 4;
/** Corner padding for quadrant name labels. */
const CORNER_PAD = 10;
/** x-coordinate threshold above which the point label is placed to the left. */
const LABEL_FLIP_THRESHOLD = 0.82;
/** Fractional offset applied to font-size to vertically align label with point. */
const LABEL_Y_OFFSET_RATIO = 0.38;

/** Node types assigned to quadrants TL / TR / BL / BR. */
const QUAD_NODE_TYPES: NodeType[] = ['terminal', 'process', 'io', 'decision'];

/** Incrementing counter for unique per-diagram SVG IDs. */
let _quadrantCount = 0;

/**
 * Return the quadrant index (0=TL, 1=TR, 2=BL, 3=BR) for a normalised point.
 * x=0 is left, x=1 is right; y=0 is bottom, y=1 is top.
 */
function quadrantOf(x: number, y: number): number {
  const right = x >= 0.5;
  const top   = y >= 0.5;
  if (!right &&  top) return 0; // TL
  if ( right &&  top) return 1; // TR
  if (!right && !top) return 2; // BL
  return 3;                     // BR
}

/**
 * Generate an SVG quadrant chart (2×2 matrix).
 *
 * Canvas auto-sizes from 640×640 (base) up to 1024×1024 based on point count.
 * Quadrant backgrounds use distinct theme colors; data points are solid filled
 * and colored by the quadrant they fall into, with a subtle drop-shadow.
 */
export function createQuadrantChart(options: QuadrantChartOptions): string {
  const {
    xAxis,
    yAxis,
    quadrants,
    points,
    theme: themeName = 'colorful',
  } = options;

  const theme = Object.prototype.hasOwnProperty.call(themes, themeName)
    ? themes[themeName as keyof typeof themes]
    : themes['colorful'];

  // Canvas scales with point count: 640 base, +24 px per extra point above 4, max 1024
  const SIZE   = Math.min(MAX_SIZE, Math.max(BASE_SIZE, BASE_SIZE + (points.length - 4) * 24));
  const WIDTH  = SIZE;
  const HEIGHT = SIZE;
  const PLOT_W = WIDTH  - PAD_LEFT - PAD_RIGHT;
  const PLOT_H = HEIGHT - PAD_TOP  - PAD_BOTTOM;

  const sw = theme.strokeWidth;
  const axisColor  = theme.groupColor;  // muted gray — axis lines + arrows (lighter, no opacity needed)
  const groupColor = theme.groupColor;  // muted gray — corner labels + borders
  const textColor  = theme.edgeColor;   // regular dark gray for all text labels
  const labelFs    = theme.fontSize - 1;
  const cornerFs   = theme.fontSize - 2;

  const plotX = PAD_LEFT;
  const plotY = PAD_TOP;
  const midX = plotX + PLOT_W / 2;
  const midY = plotY + PLOT_H / 2;
  const halfW = PLOT_W / 2;
  const halfH = PLOT_H / 2;

  const uid = `qd-${++_quadrantCount}`;
  const parts: string[] = [];

  // ── Defs: drop-shadow filter + arrowhead marker ───────────────────────
  parts.push(
    `<defs>` +
      `<filter id="${uid}-shadow" x="-40%" y="-40%" width="180%" height="180%">` +
      `<feDropShadow dx="0" dy="0.8" stdDeviation="1" flood-color="rgba(0,0,0,0.18)"/>` +
      `</filter>` +
      `<marker id="${uid}-arrow" markerWidth="8" markerHeight="6" ` +
      `refX="7" refY="3" orient="auto" markerUnits="strokeWidth">` +
      `<polygon points="0 0, 8 3, 0 6, 1.5 3" ` +
      `fill="${escapeXml(axisColor)}"/>` +
      `</marker>` +
      `</defs>`,
  );

  // ── Quadrant background regions (4 distinct theme fill colors) ────────
  const quadRegions = [
    { x: plotX,          y: plotY,          nt: QUAD_NODE_TYPES[0] },  // TL
    { x: plotX + halfW,  y: plotY,          nt: QUAD_NODE_TYPES[1] },  // TR
    { x: plotX,          y: plotY + halfH,  nt: QUAD_NODE_TYPES[2] },  // BL
    { x: plotX + halfW,  y: plotY + halfH,  nt: QUAD_NODE_TYPES[3] },  // BR
  ];

  for (const q of quadRegions) {
    parts.push(
      `<rect x="${q.x}" y="${q.y}" width="${halfW}" height="${halfH}" ` +
        `fill="${escapeXml(theme.nodeFills[q.nt])}" fill-opacity="0.13" stroke="none"/>`,
    );
  }

  // ── Outer plot border ─────────────────────────────────────────────────
  parts.push(
    `<rect x="${plotX}" y="${plotY}" width="${PLOT_W}" height="${PLOT_H}" ` +
      `fill="none" stroke="${escapeXml(groupColor)}" stroke-width="1"/>`,
  );

  // ── Subtle dashed grid lines at 25 % and 75 % intervals ──────────────
  // Vertical lines
  for (const frac of [0.25, 0.75]) {
    const gx = Math.round(plotX + PLOT_W * frac);
    parts.push(
      `<line x1="${gx}" y1="${plotY}" x2="${gx}" y2="${plotY + PLOT_H}" ` +
        `stroke="${escapeXml(axisColor)}" stroke-width="1" stroke-dasharray="4 4" opacity="0.25"/>`,
    );
  }
  // Horizontal lines
  for (const frac of [0.25, 0.75]) {
    const gy = Math.round(plotY + PLOT_H * frac);
    parts.push(
      `<line x1="${plotX}" y1="${gy}" x2="${plotX + PLOT_W}" y2="${gy}" ` +
        `stroke="${escapeXml(axisColor)}" stroke-width="1" stroke-dasharray="4 4" opacity="0.25"/>`,
    );
  }

  // ── Center divider lines (no transparency) ────────────────────────────
  // Horizontal X-axis divider (left → right, arrow at right end)
  parts.push(
    `<line x1="${plotX}" y1="${midY}" x2="${plotX + PLOT_W}" y2="${midY}" ` +
      `stroke="${escapeXml(axisColor)}" stroke-width="${sw}" ` +
      `marker-end="url(#${uid}-arrow)"/>`,
  );
  // Vertical Y-axis divider (bottom → top, arrow at top end)
  parts.push(
    `<line x1="${midX}" y1="${plotY + PLOT_H}" x2="${midX}" y2="${plotY}" ` +
      `stroke="${escapeXml(axisColor)}" stroke-width="${sw}" ` +
      `marker-end="url(#${uid}-arrow)"/>`,
  );

  // ── Axis min/max tick labels ──────────────────────────────────────────
  // X axis: "min" below left end, "max" below right end
  parts.push(
    `<text x="${plotX + 4}" y="${midY + 16}" text-anchor="start" ` +
      `font-family="${escapeXml(theme.fontFamily)}" font-size="${labelFs}" ` +
      `fill="${escapeXml(textColor)}" opacity="0.6">${escapeXml(xAxis.min)}</text>`,
    `<text x="${plotX + PLOT_W - 30}" y="${midY + 16}" text-anchor="end" ` +
      `font-family="${escapeXml(theme.fontFamily)}" font-size="${labelFs}" ` +
      `fill="${escapeXml(textColor)}" opacity="0.6">${escapeXml(xAxis.max)}</text>`,
  );
  // X axis name: centered in the bottom margin
  parts.push(
    `<text x="${midX}" y="${HEIGHT - 12}" text-anchor="middle" ` +
      `font-family="${escapeXml(theme.fontFamily)}" font-size="${labelFs}" ` +
      `font-weight="600" fill="${escapeXml(textColor)}">${escapeXml(xAxis.label)}</text>`,
  );

  // Y axis: "min" to the left of bottom end, "max" to the left of top end
  parts.push(
    `<text x="${midX - 8}" y="${plotY + PLOT_H - 4}" text-anchor="end" ` +
      `font-family="${escapeXml(theme.fontFamily)}" font-size="${labelFs}" ` +
      `fill="${escapeXml(textColor)}" opacity="0.6">${escapeXml(yAxis.min)}</text>`,
    `<text x="${midX - 8}" y="${plotY + 14}" text-anchor="end" ` +
      `font-family="${escapeXml(theme.fontFamily)}" font-size="${labelFs}" ` +
      `fill="${escapeXml(textColor)}" opacity="0.6">${escapeXml(yAxis.max)}</text>`,
  );
  // Y axis name: rotated, centered in the left margin
  const yLabelX = Math.round(PAD_LEFT / 2);
  const yLabelY = plotY + PLOT_H / 2;
  parts.push(
    `<text x="${yLabelX}" y="${yLabelY}" text-anchor="middle" dominant-baseline="middle" ` +
      `font-family="${escapeXml(theme.fontFamily)}" font-size="${labelFs}" ` +
      `font-weight="600" fill="${escapeXml(textColor)}" ` +
      `transform="rotate(-90, ${yLabelX}, ${yLabelY})">${escapeXml(yAxis.label)}</text>`,
  );

  // ── Quadrant corner labels (small, muted gray, outer corner of each quadrant)
  // [0]=TL → top-left corner, [1]=TR → top-right, [2]=BL → bottom-left, [3]=BR → bottom-right
  const qCorners = [
    { x: plotX + CORNER_PAD,              y: plotY + CORNER_PAD + cornerFs,  label: quadrants[0], anchor: 'start' as const },
    { x: plotX + PLOT_W - CORNER_PAD,     y: plotY + CORNER_PAD + cornerFs,  label: quadrants[1], anchor: 'end'   as const },
    { x: plotX + CORNER_PAD,              y: plotY + PLOT_H - CORNER_PAD,    label: quadrants[2], anchor: 'start' as const },
    { x: plotX + PLOT_W - CORNER_PAD,     y: plotY + PLOT_H - CORNER_PAD,    label: quadrants[3], anchor: 'end'   as const },
  ];

  for (const q of qCorners) {
    parts.push(
      `<text x="${q.x}" y="${q.y}" text-anchor="${q.anchor}" ` +
        `font-family="${escapeXml(theme.fontFamily)}" font-size="${cornerFs}" ` +
        `font-weight="600" fill="${escapeXml(groupColor)}">${escapeXml(q.label)}</text>`,
    );
  }

  // ── Data points (solid fill, drop-shadow, colored by quadrant) ────────
  for (const pt of points) {
    // Normalised → SVG coordinates (Y is flipped: y=1 → top)
    const cx = plotX + pt.x * PLOT_W;
    const cy = plotY + (1 - pt.y) * PLOT_H;

    // Color the point by whichever quadrant it falls in
    const qi = quadrantOf(pt.x, pt.y);
    const ptFill = theme.nodeStrokes[QUAD_NODE_TYPES[qi]];

    parts.push(
      `<circle cx="${cx}" cy="${cy}" r="${POINT_R}" ` +
        `fill="${escapeXml(ptFill)}" stroke="none" filter="url(#${uid}-shadow)"/>`,
    );

    // Label: to the right of the point; near right edge → place to the left
    const nearRight = pt.x > LABEL_FLIP_THRESHOLD;
    const labelX = nearRight ? cx - POINT_R - 5 : cx + POINT_R + 6;
    const anchor  = nearRight ? 'end' : 'start';
    parts.push(
      `<text x="${labelX}" y="${cy + labelFs * LABEL_Y_OFFSET_RATIO}" text-anchor="${anchor}" ` +
        `font-family="${escapeXml(theme.fontFamily)}" font-size="${labelFs}" ` +
        `fill="${escapeXml(textColor)}">${escapeXml(pt.label)}</text>`,
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
