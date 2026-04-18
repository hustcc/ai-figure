import { themes } from './theme';
import { escapeXml } from './utils';
import type { QuadrantChartOptions } from './types';

const PAD = 60;          // outer padding (room for axis labels)
const MARKER_SIZE = 8;   // arrowhead size
const POINT_R = 6;       // data-point circle radius

/**
 * Generate an SVG quadrant chart (2×2 matrix).
 *
 * The plot area is divided into four quadrants by two orthogonal axes.
 * Each data point is positioned using normalised coordinates (0–1 on each axis),
 * where x=0 is left, x=1 is right, y=0 is bottom, y=1 is top.
 */
export function createQuadrantChart(options: QuadrantChartOptions): string {
  const {
    xAxis,
    yAxis,
    quadrants,
    points,
    theme: themeName = 'excalidraw',
    width = 600,
    height = 600,
  } = options;

  const theme = Object.prototype.hasOwnProperty.call(themes, themeName)
    ? themes[themeName as keyof typeof themes]
    : themes['excalidraw'];

  const sw = theme.strokeWidth;
  const pointColor = theme.nodeStrokes['process'];
  const textColor = theme.textColors['process'];
  const axisColor = theme.edgeColor;

  // Plot area (inside the padding)
  const plotX = PAD;
  const plotY = PAD;
  const plotW = width - PAD * 2;
  const plotH = height - PAD * 2;

  // Centre of the axes
  const originX = plotX + plotW / 2;
  const originY = plotY + plotH / 2;

  const parts: string[] = [];

  // ── Defs: arrowhead markers ─────────────────────────────────────────────
  parts.push(
    `<defs>`,
    `  <marker id="arrow-end" markerWidth="${MARKER_SIZE}" markerHeight="${MARKER_SIZE}" ` +
      `refX="${MARKER_SIZE - 1}" refY="${MARKER_SIZE / 2}" orient="auto">` +
      `<path d="M0,0 L0,${MARKER_SIZE} L${MARKER_SIZE},${MARKER_SIZE / 2} Z" ` +
      `fill="${escapeXml(axisColor)}" opacity="0.7"/>` +
      `</marker>`,
    `  <marker id="arrow-start" markerWidth="${MARKER_SIZE}" markerHeight="${MARKER_SIZE}" ` +
      `refX="1" refY="${MARKER_SIZE / 2}" orient="auto">` +
      `<path d="M${MARKER_SIZE},0 L${MARKER_SIZE},${MARKER_SIZE} L0,${MARKER_SIZE / 2} Z" ` +
      `fill="${escapeXml(axisColor)}" opacity="0.7"/>` +
      `</marker>`,
    `</defs>`,
  );

  // ── Quadrant background shading (very subtle) ───────────────────────────
  const qFill = theme.nodeFills['process'];
  // top-left (quadrants[0]), top-right (quadrants[1]),
  // bottom-left (quadrants[2]), bottom-right (quadrants[3])
  const quadDefs = [
    { x: plotX,    y: plotY,     w: plotW / 2, h: plotH / 2, label: quadrants[0], anchor: 'start',  lx: plotX + 10,             ly: plotY + 18 },
    { x: originX,  y: plotY,     w: plotW / 2, h: plotH / 2, label: quadrants[1], anchor: 'end',    lx: plotX + plotW - 10,      ly: plotY + 18 },
    { x: plotX,    y: originY,   w: plotW / 2, h: plotH / 2, label: quadrants[2], anchor: 'start',  lx: plotX + 10,             ly: plotY + plotH - 10 },
    { x: originX,  y: originY,   w: plotW / 2, h: plotH / 2, label: quadrants[3], anchor: 'end',    lx: plotX + plotW - 10,      ly: plotY + plotH - 10 },
  ];

  for (const q of quadDefs) {
    parts.push(
      `<rect x="${q.x}" y="${q.y}" width="${q.w}" height="${q.h}" ` +
        `fill="${escapeXml(qFill)}" fill-opacity="0.04" stroke="none"/>`,
    );
  }

  // ── Axis lines with arrows ───────────────────────────────────────────────
  // Horizontal X axis (left → right)
  parts.push(
    `<line x1="${plotX}" y1="${originY}" x2="${plotX + plotW}" y2="${originY}" ` +
      `stroke="${escapeXml(axisColor)}" stroke-width="${sw}" opacity="0.6" ` +
      `marker-start="url(#arrow-start)" marker-end="url(#arrow-end)"/>`,
  );
  // Vertical Y axis (bottom → top; SVG goes top-down so y1 is plot bottom)
  parts.push(
    `<line x1="${originX}" y1="${plotY + plotH}" x2="${originX}" y2="${plotY}" ` +
      `stroke="${escapeXml(axisColor)}" stroke-width="${sw}" opacity="0.6" ` +
      `marker-start="url(#arrow-start)" marker-end="url(#arrow-end)"/>`,
  );

  // ── Axis labels (min / max) ──────────────────────────────────────────────
  const labelFs = theme.fontSize - 2;

  // X axis: min on the left, max on the right
  parts.push(
    `<text x="${plotX + 4}" y="${originY + 16}" ` +
      `text-anchor="start" font-family="${escapeXml(theme.fontFamily)}" font-size="${labelFs}" ` +
      `fill="${escapeXml(textColor)}" opacity="0.7">${escapeXml(xAxis.min)}</text>`,
  );
  parts.push(
    `<text x="${plotX + plotW - 4}" y="${originY + 16}" ` +
      `text-anchor="end" font-family="${escapeXml(theme.fontFamily)}" font-size="${labelFs}" ` +
      `fill="${escapeXml(textColor)}" opacity="0.7">${escapeXml(xAxis.max)}</text>`,
  );
  // X axis name — centred below the axis
  parts.push(
    `<text x="${originX}" y="${height - 10}" ` +
      `text-anchor="middle" font-family="${escapeXml(theme.fontFamily)}" font-size="${labelFs}" ` +
      `fill="${escapeXml(textColor)}" opacity="0.8">${escapeXml(xAxis.label)}</text>`,
  );

  // Y axis: min at bottom, max at top
  parts.push(
    `<text x="${originX - 8}" y="${plotY + plotH - 4}" ` +
      `text-anchor="end" font-family="${escapeXml(theme.fontFamily)}" font-size="${labelFs}" ` +
      `fill="${escapeXml(textColor)}" opacity="0.7">${escapeXml(yAxis.min)}</text>`,
  );
  parts.push(
    `<text x="${originX - 8}" y="${plotY + 14}" ` +
      `text-anchor="end" font-family="${escapeXml(theme.fontFamily)}" font-size="${labelFs}" ` +
      `fill="${escapeXml(textColor)}" opacity="0.7">${escapeXml(yAxis.max)}</text>`,
  );
  // Y axis name — rotated, left of the axis
  parts.push(
    `<text x="${10}" y="${originY}" ` +
      `text-anchor="middle" dominant-baseline="middle" ` +
      `font-family="${escapeXml(theme.fontFamily)}" font-size="${labelFs}" ` +
      `fill="${escapeXml(textColor)}" opacity="0.8" ` +
      `transform="rotate(-90, 10, ${originY})">${escapeXml(yAxis.label)}</text>`,
  );

  // ── Quadrant labels ──────────────────────────────────────────────────────
  for (const q of quadDefs) {
    parts.push(
      `<text x="${q.lx}" y="${q.ly}" ` +
        `text-anchor="${q.anchor}" ` +
        `font-family="${escapeXml(theme.fontFamily)}" font-size="${labelFs}" ` +
        `fill="${escapeXml(pointColor)}" opacity="0.45" font-style="italic">${escapeXml(q.label)}</text>`,
    );
  }

  // ── Data points ──────────────────────────────────────────────────────────
  for (const pt of points) {
    // Convert normalised coords to SVG coords
    // x: 0=left → plotX, 1=right → plotX+plotW
    // y: 0=bottom → plotY+plotH, 1=top → plotY  (flip!)
    const cx = plotX + pt.x * plotW;
    const cy = plotY + (1 - pt.y) * plotH;

    parts.push(
      `<circle cx="${cx}" cy="${cy}" r="${POINT_R}" ` +
        `fill="${escapeXml(pointColor)}" fill-opacity="0.85" stroke="none"/>`,
    );

    // Label: place to the right; if near right edge, place to the left
    const labelX = pt.x > 0.85 ? cx - POINT_R - 4 : cx + POINT_R + 5;
    const anchor = pt.x > 0.85 ? 'end' : 'start';
    parts.push(
      `<text x="${labelX}" y="${cy + theme.fontSize * 0.35}" ` +
        `text-anchor="${anchor}" ` +
        `font-family="${escapeXml(theme.fontFamily)}" font-size="${theme.fontSize - 1}" ` +
        `fill="${escapeXml(textColor)}">${escapeXml(pt.label)}</text>`,
    );
  }

  return [
    `<svg xmlns="http://www.w3.org/2000/svg" width="${width}" height="${height}" viewBox="0 0 ${width} ${height}">`,
    `<g class="quadrant-chart">`,
    ...parts,
    `</g>`,
    `</svg>`,
  ].join('\n');
}
