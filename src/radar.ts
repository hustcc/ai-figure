import { resolveTheme } from './theme';
import { escapeXml, titleBlockHeight, renderTitleBlock } from './utils';
import type { RadarChartOptions, NodeType } from './types';

/** Chart constants. */
const W         = 560;    // total SVG width
const CX        = 280;    // horizontal center of the web
const R         = 180;    // radius to the outer ring
const LABEL_PAD = 38;     // extra px beyond R for axis label anchor
const LEVELS    = 5;      // concentric grid rings (20 / 40 / 60 / 80 / 100 %)

/** Legend row height and padding. */
const LEGEND_ITEM_H   = 22;
const LEGEND_PAD_TOP  = 18;
const LEGEND_PAD_BTOM = 14;

/** Node types cycled per series index for color variation. */
const SERIES_TYPES: NodeType[] = ['process', 'decision', 'terminal', 'io'];

/** Incrementing counter for unique per-diagram SVG IDs (marker, etc.). */
let _radarCount = 0;

// ---------------------------------------------------------------------------
// Geometry helpers
// ---------------------------------------------------------------------------

/** Angle (radians) of axis `i` among `n` total axes, starting from the top (−π/2). */
function axisAngle(i: number, n: number): number {
  return (2 * Math.PI * i) / n - Math.PI / 2;
}

/** Cartesian point on axis `i` at fraction `f` of the outer radius. */
function axisPoint(i: number, n: number, cy: number, f: number): [number, number] {
  const a = axisAngle(i, n);
  return [CX + R * f * Math.cos(a), cy + R * f * Math.sin(a)];
}

/** Build a closed `<path d="…">` string for a polygon with the given vertices. */
function polygon(pts: Array<[number, number]>): string {
  if (pts.length === 0) return '';
  return pts.map(([x, y], k) => `${k === 0 ? 'M' : 'L'}${x.toFixed(1)},${y.toFixed(1)}`).join(' ') + ' Z';
}

// ---------------------------------------------------------------------------
// Renderer
// ---------------------------------------------------------------------------

/**
 * Generate an SVG radar (spider / web) chart.
 *
 * Each series is drawn as a filled polygon whose vertices sit on the
 * corresponding axis at a distance proportional to the normalised value
 * (0–100).  Multiple series are overlaid with 15% fill opacity so they
 * remain readable when they overlap.
 *
 * Grid:
 *  - Five concentric n-gon rings at 20 / 40 / 60 / 80 / 100 % of the radius.
 *  - Axis spokes radiate from the center to each outer ring vertex.
 *  - Percentage labels (20 %–80 %) float next to the vertical (top) axis.
 *
 * A horizontal legend below the chart lists series labels with color dots.
 */
export function createRadarChart(options: RadarChartOptions): string {
  const {
    axes: axisLabels = [],
    series: rawSeries = [],
    theme: mode = 'light',
    palette,
    title,
    subtitle,
  } = options;

  const theme  = resolveTheme(palette, mode);
  const titleH = titleBlockHeight(title, subtitle, theme.fontSize);

  _radarCount += 1;

  const n      = axisLabels.length;
  const series = rawSeries.filter(s => Array.isArray(s.values) && s.values.length > 0);

  // ── Legend height ─────────────────────────────────────────────────────────
  const legendRows  = series.length > 0 ? Math.ceil(series.length / 4) : 0;
  const legendH     = legendRows > 0
    ? LEGEND_PAD_TOP + legendRows * LEGEND_ITEM_H + LEGEND_PAD_BTOM
    : LEGEND_PAD_BTOM;

  // ── Vertical center of the web ───────────────────────────────────────────
  // Leave LABEL_PAD + a bit above the web for top-axis labels.
  const CY_TOP_MARGIN = LABEL_PAD + theme.fontSize + 12;
  const CY = CY_TOP_MARGIN + R;                  // center y of web
  const contentH = CY + R + LABEL_PAD + theme.fontSize + legendH;
  const HEIGHT   = Math.round(contentH);

  const parts: string[] = [];

  // ── Background ────────────────────────────────────────────────────────────
  if (theme.background) {
    parts.push(`<rect width="100%" height="100%" fill="${escapeXml(theme.background)}"/>`);
  }

  // ── Title block ───────────────────────────────────────────────────────────
  const titleSvg = renderTitleBlock(
    title, subtitle, W / 2, 0,
    theme.fontFamily, theme.fontSize, theme.edgeColor, theme.groupColor,
  );
  if (titleSvg) parts.push(titleSvg);

  const gOff = titleH > 0 ? ` transform="translate(0,${titleH})"` : '';
  parts.push(`<g class="radar-chart"${gOff}>`);

  // ── Grid rings ────────────────────────────────────────────────────────────
  if (n >= 3) {
    for (let level = 1; level <= LEVELS; level++) {
      const f    = level / LEVELS;
      const pts  = Array.from({ length: n }, (_, i) => axisPoint(i, n, CY, f));
      const d    = polygon(pts);
      const outer = level === LEVELS;
      parts.push(
        `<path d="${d}" fill="none" stroke="${escapeXml(theme.groupColor)}" ` +
          `stroke-width="${outer ? '1.5' : '1'}"` +
          (outer ? '' : ` stroke-dasharray="4 4" opacity="0.35"`) +
          `/>`,
      );

      // Percentage label near the topmost axis (axis 0 → angle −π/2 → straight up)
      if (level < LEVELS) {
        const [, vy] = axisPoint(0, n, CY, f);
        parts.push(
          `<text x="${(CX + 5).toFixed(1)}" y="${(vy + 4).toFixed(1)}" ` +
            `font-family="${escapeXml(theme.fontFamily)}" font-size="${theme.fontSize - 3}" ` +
            `fill="${escapeXml(theme.edgeColor)}" opacity="0.6">${level * 20}%</text>`,
        );
      }
    }
  }

  // ── Axis spokes ───────────────────────────────────────────────────────────
  for (let i = 0; i < n; i++) {
    const [x, y] = axisPoint(i, n, CY, 1);
    parts.push(
      `<line x1="${CX}" y1="${CY}" x2="${x.toFixed(1)}" y2="${y.toFixed(1)}" ` +
        `stroke="${escapeXml(theme.groupColor)}" stroke-width="1" opacity="0.4"/>`,
    );
  }

  // ── Series polygons ───────────────────────────────────────────────────────
  for (let si = 0; si < series.length; si++) {
    const s     = series[si];
    const nt    = SERIES_TYPES[si % SERIES_TYPES.length];
    const color = theme.nodeStrokes[nt];
    const bg    = theme.background || 'white';

    const pts: Array<[number, number]> = Array.from({ length: n }, (_, i) => {
      const raw  = s.values[i] ?? 0;
      const norm = Math.max(0, Math.min(100, raw)) / 100;
      return axisPoint(i, n, CY, norm);
    });

    // Filled area
    parts.push(
      `<path d="${polygon(pts)}" fill="${escapeXml(color)}" fill-opacity="0.15" ` +
        `stroke="${escapeXml(color)}" stroke-width="2" stroke-linejoin="round"/>`,
    );

    // Data point dots
    for (const [px, py] of pts) {
      parts.push(
        `<circle cx="${px.toFixed(1)}" cy="${py.toFixed(1)}" r="4" ` +
          `fill="${escapeXml(color)}" stroke="${escapeXml(bg)}" stroke-width="1.5"/>`,
      );
    }
  }

  // ── Axis labels ───────────────────────────────────────────────────────────
  for (let i = 0; i < n; i++) {
    const angle = axisAngle(i, n);
    const cosA  = Math.cos(angle);
    const sinA  = Math.sin(angle);
    const lx    = CX + (R + LABEL_PAD) * cosA;
    const ly    = CY + (R + LABEL_PAD) * sinA;

    const anchor = cosA < -0.25 ? 'end' : cosA > 0.25 ? 'start' : 'middle';
    const dy     = sinA < -0.25 ? -6 : sinA > 0.25 ? 14 : 4;

    parts.push(
      `<text x="${lx.toFixed(1)}" y="${(ly + dy).toFixed(1)}" text-anchor="${anchor}" ` +
        `font-family="${escapeXml(theme.fontFamily)}" font-size="${theme.fontSize}" ` +
        `font-weight="600" fill="${escapeXml(theme.edgeColor)}">${escapeXml(axisLabels[i])}</text>`,
    );
  }

  // ── Legend ────────────────────────────────────────────────────────────────
  if (series.length > 0) {
    const legendTopY = CY + R + LABEL_PAD + theme.fontSize + LEGEND_PAD_TOP;
    const cols       = Math.min(series.length, 4);
    const colW       = Math.floor((W - 40) / cols);

    for (let si = 0; si < series.length; si++) {
      const s     = series[si];
      const nt    = SERIES_TYPES[si % SERIES_TYPES.length];
      const color = theme.nodeStrokes[nt];
      const col   = si % cols;
      const row   = Math.floor(si / cols);
      const ix    = 20 + col * colW;
      const iy    = legendTopY + row * LEGEND_ITEM_H;

      parts.push(
        `<circle cx="${ix + 6}" cy="${iy + 2}" r="5" fill="${escapeXml(color)}"/>`,
        `<text x="${ix + 15}" y="${iy + 7}" ` +
          `font-family="${escapeXml(theme.fontFamily)}" font-size="${theme.fontSize - 1}" ` +
          `fill="${escapeXml(theme.edgeColor)}">${escapeXml(s.label)}</text>`,
      );
    }
  }

  parts.push('</g>');

  return [
    `<svg xmlns="http://www.w3.org/2000/svg" width="${W}" height="${HEIGHT + titleH}" ` +
      `viewBox="0 0 ${W} ${HEIGHT + titleH}">`,
    ...parts,
    `</svg>`,
  ].join('\n');
}
