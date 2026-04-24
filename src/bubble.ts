import { resolveTheme } from './theme';
import { escapeXml, titleBlockHeight, renderTitleBlock } from './utils';
import type { BubbleChartOptions, NodeType } from './types';

// Canvas size
const BASE_SIZE  = 640;
const MAX_SIZE   = 1024;
const PAD_LEFT   = 56;   // room for rotated Y-axis label
const PAD_RIGHT  = 24;
const PAD_TOP    = 32;
const PAD_BOTTOM = 52;   // room for X-axis label

/** Minimum bubble radius in SVG user units. */
const MIN_R = 8;
/** Maximum bubble radius in SVG user units. */
const MAX_R = 48;

/** Fraction by which the radius grows at the peak of the pulse animation. */
const PULSE_GROW = 0.08;

/** Node types cycled by bubble index for color variation. */
const BUBBLE_NODE_TYPES: NodeType[] = ['process', 'decision', 'terminal', 'io'];

/** X-coordinate threshold above which the bubble label is placed to the left. */
const LABEL_FLIP_THRESHOLD = 0.78;

/** Incrementing counter for unique per-diagram SVG IDs. */
let _bubbleCount = 0;

/**
 * Generate an SVG bubble chart.
 *
 * Each bubble is positioned at (x, y) — both normalised to [0,1] — and sized
 * by a normalised `size` value.  A SMIL animation gently pulses each bubble
 * radius, with staggered start times so bubbles breathe independently.
 */
export function createBubbleChart(options: BubbleChartOptions): string {
  const {
    xAxis,
    yAxis,
    points,
    theme: mode = 'light',
    palette,
    title,
    subtitle,
  } = options;

  const theme  = resolveTheme(palette, mode);
  const titleH = titleBlockHeight(title, subtitle, theme.fontSize);

  // Canvas auto-scales with bubble count
  const SIZE   = Math.min(MAX_SIZE, Math.max(BASE_SIZE, BASE_SIZE + (points.length - 4) * 24));
  const WIDTH  = SIZE;
  const HEIGHT = SIZE;
  const PLOT_W = WIDTH  - PAD_LEFT - PAD_RIGHT;
  const PLOT_H = HEIGHT - PAD_TOP  - PAD_BOTTOM;

  const sw         = theme.strokeWidth;
  const axisColor  = theme.groupColor;
  const groupColor = theme.groupColor;
  const textColor  = theme.edgeColor;
  const labelFs    = theme.fontSize - 1;

  const plotX = PAD_LEFT;
  const plotY = PAD_TOP;
  const midX  = plotX + PLOT_W / 2;
  const midY  = plotY + PLOT_H / 2;

  const uid = `bc-${++_bubbleCount}`;
  const parts: string[] = [];

  // ── Defs: drop-shadow filter + arrowhead marker ───────────────────────
  parts.push(
    `<defs>` +
      `<filter id="${uid}-shadow" x="-50%" y="-50%" width="200%" height="200%">` +
      `<feDropShadow dx="0" dy="1" stdDeviation="2" flood-color="rgba(0,0,0,0.14)"/>` +
      `</filter>` +
      `<marker id="${uid}-arrow" markerWidth="8" markerHeight="6" ` +
      `refX="7" refY="3" orient="auto" markerUnits="strokeWidth">` +
      `<polygon points="0 0, 8 3, 0 6, 1.5 3" ` +
      `fill="${escapeXml(axisColor)}"/>` +
      `</marker>` +
      `</defs>`,
  );

  // ── Outer plot border ─────────────────────────────────────────────────
  parts.push(
    `<rect x="${plotX}" y="${plotY}" width="${PLOT_W}" height="${PLOT_H}" ` +
      `fill="none" stroke="${escapeXml(groupColor)}" stroke-width="1"/>`,
  );

  // ── Subtle dashed grid lines at 25 %, 50 %, and 75 % ──────────────────
  for (const frac of [0.25, 0.5, 0.75]) {
    const gx = Math.round(plotX + PLOT_W * frac);
    parts.push(
      `<line x1="${gx}" y1="${plotY}" x2="${gx}" y2="${plotY + PLOT_H}" ` +
        `stroke="${escapeXml(axisColor)}" stroke-width="1" stroke-dasharray="4 4" opacity="0.25"/>`,
    );
  }
  for (const frac of [0.25, 0.5, 0.75]) {
    const gy = Math.round(plotY + PLOT_H * frac);
    parts.push(
      `<line x1="${plotX}" y1="${gy}" x2="${plotX + PLOT_W}" y2="${gy}" ` +
        `stroke="${escapeXml(axisColor)}" stroke-width="1" stroke-dasharray="4 4" opacity="0.25"/>`,
    );
  }

  // ── Horizontal X-axis center line (arrow at right end) ───────────────
  parts.push(
    `<line x1="${plotX}" y1="${midY}" x2="${plotX + PLOT_W}" y2="${midY}" ` +
      `stroke="${escapeXml(axisColor)}" stroke-width="${sw}" ` +
      `marker-end="url(#${uid}-arrow)"/>`,
  );
  // ── Vertical Y-axis center line (arrow at top end) ───────────────────
  parts.push(
    `<line x1="${midX}" y1="${plotY + PLOT_H}" x2="${midX}" y2="${plotY}" ` +
      `stroke="${escapeXml(axisColor)}" stroke-width="${sw}" ` +
      `marker-end="url(#${uid}-arrow)"/>`,
  );

  // ── Axis min/max tick labels ──────────────────────────────────────────
  // X axis
  parts.push(
    `<text x="${plotX + 4}" y="${midY + 16}" text-anchor="start" ` +
      `font-family="${escapeXml(theme.fontFamily)}" font-size="${labelFs}" ` +
      `fill="${escapeXml(textColor)}" opacity="0.6">${escapeXml(xAxis.min)}</text>`,
    `<text x="${plotX + PLOT_W - 30}" y="${midY + 16}" text-anchor="end" ` +
      `font-family="${escapeXml(theme.fontFamily)}" font-size="${labelFs}" ` +
      `fill="${escapeXml(textColor)}" opacity="0.6">${escapeXml(xAxis.max)}</text>`,
  );
  // X axis name
  parts.push(
    `<text x="${midX}" y="${HEIGHT - 12}" text-anchor="middle" ` +
      `font-family="${escapeXml(theme.fontFamily)}" font-size="${labelFs}" ` +
      `font-weight="600" fill="${escapeXml(textColor)}">${escapeXml(xAxis.label)}</text>`,
  );
  // Y axis min/max
  parts.push(
    `<text x="${midX - 8}" y="${plotY + PLOT_H - 4}" text-anchor="end" ` +
      `font-family="${escapeXml(theme.fontFamily)}" font-size="${labelFs}" ` +
      `fill="${escapeXml(textColor)}" opacity="0.6">${escapeXml(yAxis.min)}</text>`,
    `<text x="${midX - 8}" y="${plotY + 14}" text-anchor="end" ` +
      `font-family="${escapeXml(theme.fontFamily)}" font-size="${labelFs}" ` +
      `fill="${escapeXml(textColor)}" opacity="0.6">${escapeXml(yAxis.max)}</text>`,
  );
  // Y axis name
  const yLabelX = Math.round(PAD_LEFT / 2);
  const yLabelY = plotY + PLOT_H / 2;
  parts.push(
    `<text x="${yLabelX}" y="${yLabelY}" text-anchor="middle" dominant-baseline="middle" ` +
      `font-family="${escapeXml(theme.fontFamily)}" font-size="${labelFs}" ` +
      `font-weight="600" fill="${escapeXml(textColor)}" ` +
      `transform="rotate(-90, ${yLabelX}, ${yLabelY})">${escapeXml(yAxis.label)}</text>`,
  );

  // ── Bubbles ───────────────────────────────────────────────────────────
  for (let i = 0; i < points.length; i++) {
    const pt = points[i];
    const cx = plotX + pt.x * PLOT_W;
    const cy = plotY + (1 - pt.y) * PLOT_H;

    // Clamp size to [0,1] before mapping to radius
    const s  = Math.max(0, Math.min(1, pt.size));
    const r  = Math.round(MIN_R + s * (MAX_R - MIN_R));
    const r2 = Math.round(r * (1 + PULSE_GROW));

    const nt        = BUBBLE_NODE_TYPES[i % BUBBLE_NODE_TYPES.length];
    const fillColor = theme.nodeFills[nt];
    const strkColor = theme.nodeStrokes[nt];
    const txtColor  = theme.textColors[nt];

    // Stagger the animation start so each bubble pulses independently.
    // Delay cycles through 0, 0.5, 1.0, 1.5 s for the first 4 bubbles;
    // thereafter it repeats the cycle.
    const delay = (i % 4) * 0.5;

    parts.push(
      `<circle cx="${cx}" cy="${cy}" r="${r}" ` +
        `fill="${escapeXml(fillColor)}" stroke="${escapeXml(strkColor)}" stroke-width="${sw}" ` +
        `filter="url(#${uid}-shadow)">` +
        `<animate attributeName="r" ` +
        `values="${r};${r2};${r}" ` +
        `dur="2s" begin="${delay}s" repeatCount="indefinite" calcMode="spline" ` +
        `keySplines="0.45 0 0.55 1;0.45 0 0.55 1" keyTimes="0;0.5;1"/>` +
        `</circle>`,
    );

    // Label: to the right; near right edge → flip to the left
    const nearRight  = pt.x > LABEL_FLIP_THRESHOLD;
    const labelOffX  = nearRight ? -(r2 + 6) : (r2 + 6);
    const labelX     = cx + labelOffX;
    const anchor     = nearRight ? 'end' : 'start';
    const labelYOff  = labelFs * 0.38;
    parts.push(
      `<text x="${labelX}" y="${cy + labelYOff}" text-anchor="${anchor}" ` +
        `font-family="${escapeXml(theme.fontFamily)}" font-size="${labelFs}" ` +
        `fill="${escapeXml(txtColor)}">${escapeXml(pt.label)}</text>`,
    );
  }

  const bgParts: string[] = theme.background
    ? [`<rect width="100%" height="100%" fill="${theme.background}"/>`]
    : [];
  const titleSvg = renderTitleBlock(
    title, subtitle, WIDTH / 2, 0,
    theme.fontFamily, theme.fontSize, theme.edgeColor, theme.groupColor,
  );
  return [
    `<svg xmlns="http://www.w3.org/2000/svg" width="${WIDTH}" height="${HEIGHT + titleH}" viewBox="0 0 ${WIDTH} ${HEIGHT + titleH}">`,
    ...bgParts,
    ...(titleSvg ? [titleSvg] : []),
    `<g class="bubble-chart"${titleH > 0 ? ` transform="translate(0,${titleH})"` : ''}>`,
    ...parts,
    `</g>`,
    `</svg>`,
  ].join('\n');
}
