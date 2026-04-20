import { resolveTheme } from './theme';
import { escapeXml, titleBlockHeight, renderTitleBlock } from './utils';
import type { NestedDiagramOptions } from './types';

/** Incrementing counter for unique per-diagram SVG IDs. */
let _nestedCount = 0;

// ── Layout constants ────────────────────────────────────────────────────────
const PAD_H      = 30;   // horizontal inset between rings
const PAD_V      = 40;   // vertical inset between rings
const LABEL_INSET = 10;   // label offset from left edge of its ring
const LABEL_INSET_TOP = 12; // label offset from top edge of its ring
const LABEL_FS   = 11;   // eyebrow label font size
const SUBLAB_FS  = 10;   // sublabel font size
const RX         = 10;   // corner radius
const INNER_W    = 200;  // minimum inner content width
const INNER_H    = 120;  // minimum inner content height

/**
 * Generate an SVG nested containment diagram.
 *
 * Rings are drawn from outermost (index 0) to innermost (last index).
 * Outer rings use faint strokes and translucent fills that deepen inward.
 * The accent flag marks the focal innermost ring with the theme's decision color.
 */
export function createNestedDiagram(options: NestedDiagramOptions): string {
  const {
    rings,
    theme: mode = 'light',
    palette,
    title,
    subtitle,
  } = options;

  const theme  = resolveTheme(palette, mode);
  const titleH = titleBlockHeight(title, subtitle, theme.fontSize);
  const uid    = `nd-${++_nestedCount}`;
  const n      = rings.length;

  if (n === 0) {
    const h = 200 + titleH;
    return `<svg xmlns="http://www.w3.org/2000/svg" width="480" height="${h}" viewBox="0 0 480 ${h}"></svg>`;
  }

  // ── Compute ring sizes ───────────────────────────────────────────────────
  // Innermost ring has INNER_W × INNER_H; each outer ring adds PAD_H / PAD_V.
  const ringW: number[] = new Array(n).fill(0);
  const ringH: number[] = new Array(n).fill(0);
  ringW[n - 1] = INNER_W;
  ringH[n - 1] = INNER_H;
  for (let i = n - 2; i >= 0; i--) {
    ringW[i] = ringW[i + 1] + PAD_H * 2;
    ringH[i] = ringH[i + 1] + PAD_V * 2 + LABEL_FS + LABEL_INSET_TOP * 2;
  }

  // Add outer canvas padding
  const OUTER_PAD = 24;
  const WIDTH  = ringW[0] + OUTER_PAD * 2;
  const HEIGHT = ringH[0] + OUTER_PAD * 2;

  const accentStroke = theme.nodeStrokes['decision'];
  const accentFill   = theme.nodeFills['decision'];
  const accentText   = theme.textColors['decision'];

  const parts: string[] = [];

  // ── Ring opacity / color ramp ────────────────────────────────────────────
  // Outermost (i=0): faintest; innermost (i=n-1): most opaque / accent.
  // Strokes step from groupColor (muted) → nodeStrokes['process'] (brighter)
  const baseStroke = theme.nodeStrokes['process'];
  const muteStroke = theme.groupColor;

  for (let i = 0; i < n; i++) {
    const ring   = rings[i];
    const isLast = i === n - 1;
    const isAcc  = ring.accent === true || isLast;

    // Ring position: centered, growing outward
    const rx = OUTER_PAD + (ringW[0] - ringW[i]) / 2;
    const ry = OUTER_PAD + (ringH[0] - ringH[i]) / 2;
    const rw = ringW[i];
    const rh = ringH[i];

    // Fill opacity increases inward (0.02 → 0.08) or accent-tint on focal
    const t      = n > 1 ? i / (n - 1) : 1;
    const opacity = 0.02 + t * 0.06;
    const fill    = isAcc && ring.accent
      ? accentFill
      : (theme.background
          ? `rgba(128,128,128,${opacity})`
          : `rgba(0,0,0,${opacity})`);
    const stroke  = isAcc && ring.accent ? accentStroke : (t > 0.5 ? baseStroke : muteStroke);
    const strokeOpacity = isAcc && ring.accent ? 1 : 0.3 + t * 0.55;

    parts.push(
      `<rect x="${rx}" y="${ry}" width="${rw}" height="${rh}" ` +
        `rx="${RX}" ry="${RX}" fill="${escapeXml(fill)}" ` +
        `stroke="${escapeXml(stroke)}" stroke-width="1.5" ` +
        `stroke-opacity="${strokeOpacity}"/>`,
    );

    // Label at top-left of the ring
    const labelX = rx + LABEL_INSET;
    const labelY = ry + LABEL_INSET_TOP + LABEL_FS;
    const txtClr = isAcc && ring.accent ? accentText : theme.edgeColor;

    // Mask pill behind the label so it reads over the ring border
    const labelTextLen = ring.label.length * (LABEL_FS * 0.65);
    const pillW = labelTextLen + 10;
    const pillH = LABEL_FS + 4;
    const maskFill = theme.background || (mode === 'dark' ? '#1a1b1e' : 'white');

    parts.push(
      `<rect x="${labelX - 4}" y="${ry + LABEL_INSET_TOP - 2}" ` +
        `width="${pillW}" height="${pillH}" rx="3" fill="${escapeXml(maskFill)}"/>`,
      `<text x="${labelX}" y="${labelY}" ` +
        `font-family="${escapeXml(theme.fontFamily)}" font-size="${LABEL_FS}" ` +
        `font-weight="600" letter-spacing="0.1em" ` +
        `fill="${escapeXml(txtClr)}"` +
        (isAcc && ring.accent ? '' : ` opacity="0.75"`) +
        `>${escapeXml(ring.label.toUpperCase())}</text>`,
    );

    if (ring.sublabel) {
      parts.push(
        `<text x="${labelX}" y="${labelY + SUBLAB_FS + 3}" ` +
          `font-family="${escapeXml(theme.fontFamily)}" font-size="${SUBLAB_FS}" ` +
          `fill="${escapeXml(theme.groupColor)}">${escapeXml(ring.sublabel)}</text>`,
      );
    }
  }

  const bgParts: string[] = theme.background
    ? [`<rect width="100%" height="100%" fill="${theme.background}"/>`]
    : [];

  const titleSvg = renderTitleBlock(
    title, subtitle, WIDTH / 2, 0,
    theme.fontFamily, theme.fontSize, theme.edgeColor, theme.groupColor,
  );

  return [
    `<svg xmlns="http://www.w3.org/2000/svg" width="${WIDTH}" height="${HEIGHT + titleH}" ` +
      `viewBox="0 0 ${WIDTH} ${HEIGHT + titleH}" id="${uid}">`,
    ...bgParts,
    ...(titleSvg ? [titleSvg] : []),
    `<g class="nested-diagram"${titleH > 0 ? ` transform="translate(0,${titleH})"` : ''}>`,
    ...parts,
    `</g>`,
    `</svg>`,
  ].join('\n');
}
