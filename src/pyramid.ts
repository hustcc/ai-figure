import { resolveTheme } from './theme';
import { escapeXml, titleBlockHeight, renderTitleBlock } from './utils';
import type { PyramidDiagramOptions, PyramidLayer, NodeType } from './types';

/** Incrementing counter for unique per-diagram SVG IDs. */
let _pyramidCount = 0;

// ── Layout constants ────────────────────────────────────────────────────────
const SVG_W        = 480;
const LAYER_H      = 60;    // fixed layer height
const BASE_W       = 400;   // widest layer width (base of pyramid / top of funnel)
const APEX_W       = 32;    // narrowest layer width
const PAD_TOP      = 32;    // padding above top layer
const PAD_BOTTOM   = 24;    // padding below bottom layer
const LABEL_FS     = 14;    // main label font size
const SUBLAB_FS    = 11;    // sublabel font size
const ANNOT_PAD    = 12;    // gap between trapezoid right edge and annotation text

// Node types used for fill colors (cycled per layer index)
const LAYER_NODE_TYPES: NodeType[] = ['process', 'terminal', 'io', 'decision'];

/**
 * Compute the left/right x-coordinates for a trapezoid layer.
 *
 * `layers[0]` is always the narrowest end (apex for pyramid, widest for funnel).
 * For `'pyramid'`: narrowest at top (index 0), widest at bottom (last index).
 * For `'funnel'`:  widest at top (index 0), narrowest at bottom (last index).
 *
 * When `values` are provided they scale the widths proportionally.
 */
function layerWidths(
  n: number,
  orientation: 'pyramid' | 'funnel',
  values: (number | undefined)[],
): { leftX: number; rightX: number }[] {
  const cx = SVG_W / 2;
  const hasValues = values.some((v) => v !== undefined);

  const totalValue = hasValues
    ? values.reduce<number>((sum, v) => sum + (v ?? 0), 0)
    : 0;

  return Array.from({ length: n }, (_, i) => {
    let halfW: number;

    if (hasValues && totalValue > 0) {
      // Proportional width: widest = BASE_W, narrowest = APEX_W.
      const v = (values[i] ?? 0) / totalValue;
      halfW = APEX_W / 2 + v * ((BASE_W - APEX_W) / 2) * (n > 1 ? n / (n - 1) : 1);
      halfW = Math.max(APEX_W / 2, Math.min(BASE_W / 2, halfW));
    } else {
      // Linear interpolation from APEX_W to BASE_W
      const t = n > 1 ? i / (n - 1) : 0;
      halfW = (APEX_W + t * (BASE_W - APEX_W)) / 2;
    }

    if (orientation === 'funnel') {
      // Funnel: index 0 is widest
      const ft = n > 1 ? (n - 1 - i) / (n - 1) : 0;
      const fhw = hasValues && totalValue > 0
        ? halfW // already proportional
        : (APEX_W + ft * (BASE_W - APEX_W)) / 2;
      return { leftX: cx - fhw, rightX: cx + fhw };
    }

    return { leftX: cx - halfW, rightX: cx + halfW };
  });
}

/**
 * Generate an SVG pyramid or funnel diagram.
 *
 * Each layer is rendered as a `<polygon>` trapezoid. Labels are centered
 * inside each layer. Sublabels appear below the main label in smaller type.
 * One layer may be highlighted with the accent color.
 */
export function createPyramidDiagram(options: PyramidDiagramOptions): string {
  const {
    layers,
    orientation = 'pyramid',
    theme: mode = 'light',
    palette,
    title,
    subtitle,
  } = options;

  const theme  = resolveTheme(palette, mode);
  const titleH = titleBlockHeight(title, subtitle, theme.fontSize);
  const uid    = `py-${++_pyramidCount}`;

  const n = layers.length;
  if (n === 0) {
    const h = 200 + titleH;
    return `<svg xmlns="http://www.w3.org/2000/svg" width="${SVG_W}" height="${h}" viewBox="0 0 ${SVG_W} ${h}"></svg>`;
  }

  const values  = layers.map((l) => l.value);
  const widths  = layerWidths(n, orientation, values);

  const accentStroke = theme.nodeStrokes['decision'];
  const accentFill   = theme.nodeFills['decision'];
  const accentText   = theme.textColors['decision'];

  const SVG_H = PAD_TOP + n * LAYER_H + PAD_BOTTOM;

  const parts: string[] = [];

  for (let i = 0; i < n; i++) {
    const layer    = layers[i];
    const isAccent = layer.accent === true;

    const topY   = PAD_TOP + i * LAYER_H;
    const botY   = topY + LAYER_H;
    const nodeType = LAYER_NODE_TYPES[i % LAYER_NODE_TYPES.length];

    const fill   = isAccent ? accentFill   : theme.nodeFills[nodeType];
    const stroke = isAccent ? accentStroke : theme.nodeStrokes[nodeType];
    const txtClr = isAccent ? accentText   : theme.textColors[nodeType];

    // Top edge: this layer's top widths
    const { leftX: tl, rightX: tr } = widths[i];
    // Bottom edge: next layer's widths (or same for last)
    const { leftX: bl, rightX: br } = i < n - 1 ? widths[i + 1] : widths[i];

    const pts = `${tl},${topY} ${tr},${topY} ${br},${botY} ${bl},${botY}`;

    parts.push(
      `<polygon points="${escapeXml(pts)}" ` +
        `fill="${escapeXml(fill)}" stroke="${escapeXml(stroke)}" stroke-width="1"/>`,
    );

    // Main label (centered inside trapezoid)
    const cx    = SVG_W / 2;
    const midY  = topY + LAYER_H / 2;

    const hasSubLabel = !!layer.sublabel;
    const labelY  = hasSubLabel ? midY - 5 : midY;
    const subLabY = midY + SUBLAB_FS + 1;

    parts.push(
      `<text x="${cx}" y="${labelY}" text-anchor="middle" dominant-baseline="central" ` +
        `font-family="${escapeXml(theme.fontFamily)}" font-size="${LABEL_FS}" ` +
        `font-weight="600" fill="${escapeXml(txtClr)}">${escapeXml(layer.label)}</text>`,
    );

    if (layer.sublabel) {
      parts.push(
        `<text x="${cx}" y="${subLabY}" text-anchor="middle" dominant-baseline="central" ` +
          `font-family="${escapeXml(theme.fontFamily)}" font-size="${SUBLAB_FS}" ` +
          `fill="${escapeXml(txtClr)}" opacity="0.75">${escapeXml(layer.sublabel)}</text>`,
      );
    }
  }

  const bgParts: string[] = theme.background
    ? [`<rect width="100%" height="100%" fill="${theme.background}"/>`]
    : [];

  const titleSvg = renderTitleBlock(
    title, subtitle, SVG_W / 2, 0,
    theme.fontFamily, theme.fontSize, theme.edgeColor, theme.groupColor,
  );

  return [
    `<svg xmlns="http://www.w3.org/2000/svg" width="${SVG_W}" height="${SVG_H + titleH}" ` +
      `viewBox="0 0 ${SVG_W} ${SVG_H + titleH}" id="${uid}">`,
    ...bgParts,
    ...(titleSvg ? [titleSvg] : []),
    `<g class="pyramid-diagram"${titleH > 0 ? ` transform="translate(0,${titleH})"` : ''}>`,
    ...parts,
    `</g>`,
    `</svg>`,
  ].join('\n');
}
