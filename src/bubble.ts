import { resolveTheme } from './theme';
import { escapeXml, titleBlockHeight, renderTitleBlock } from './utils';
import type { BubbleChartOptions, NodeType } from './types';

/** Minimum bubble radius in SVG user units. */
const MIN_R = 18;
/** Maximum bubble radius in SVG user units. */
const MAX_R = 80;
/**
 * Gap between adjacent bubble edges at rest.
 * Must be ≥ 2 × MAX_R × PULSE_GROW (= 6.4 px) so animated bubbles never
 * overlap even when two neighbours reach their peak simultaneously.
 */
const GAP = 18;
/** Padding around the entire packed cluster. */
const PAD = 28;
/** Radius (px) at which labels move outside the bubble instead of inside. */
const INSIDE_R = 24;
/** Fraction by which the radius grows at the peak of the pulse animation. */
const PULSE_GROW = 0.04;
/** Node types cycled by item index for color variation. */
const BUBBLE_TYPES: NodeType[] = ['process', 'decision', 'terminal', 'io'];

/** Incrementing counter for unique per-diagram SVG IDs. */
let _bubbleCount = 0;

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

/**
 * Choose between white and near-black text based on the perceived brightness
 * of `hexColor` (ITU-R BT.601 luma coefficients).
 * Supports both 6-character (#rrggbb) and 3-character (#rgb) hex codes.
 */
function textColorOnFill(hexColor: string): string {
  let h = hexColor.replace('#', '');
  // Expand 3-character shorthand to 6 characters
  if (h.length === 3) h = h[0] + h[0] + h[1] + h[1] + h[2] + h[2];
  if (h.length < 6) return '#ffffff';
  const r = parseInt(h.slice(0, 2), 16);
  const g = parseInt(h.slice(2, 4), 16);
  const b = parseInt(h.slice(4, 6), 16);
  const luma = (r * 299 + g * 587 + b * 114) / 1000;
  return luma > 155 ? 'rgba(0,0,0,0.72)' : '#ffffff';
}

// ---------------------------------------------------------------------------
// Circle-packing helpers
// ---------------------------------------------------------------------------

/**
 * Return the (up to 2) centers of a circle with radius `r` that is externally
 * tangent to both circle A (ax, ay, ar) and circle B (bx, by, br).
 * Uses the law of cosines on the triangle formed by the three centers.
 */
function apolloniusCandidates(
  ax: number, ay: number, ar: number,
  bx: number, by: number, br: number,
  r: number,
): Array<[number, number]> {
  const da = ar + r + GAP;
  const db = br + r + GAP;
  const dx = bx - ax;
  const dy = by - ay;
  const d  = Math.hypot(dx, dy);
  if (d < 1e-9 || d > da + db + 0.5 || d < Math.abs(da - db) - 0.5) return [];
  const cosA = Math.max(-1, Math.min(1, (da * da + d * d - db * db) / (2 * da * d)));
  const alpha = Math.acos(cosA);
  const base  = Math.atan2(dy, dx);
  return [
    [ax + da * Math.cos(base + alpha), ay + da * Math.sin(base + alpha)],
    [ax + da * Math.cos(base - alpha), ay + da * Math.sin(base - alpha)],
  ];
}

/**
 * Pack `n` circles with the given radii into a tight cluster centered near
 * the origin.  Returns `[cx, cy]` for each circle in input order.
 *
 * Strategy:
 *  1. Sort by radius (largest first) for best density.
 *  2. Place the first circle at the origin.
 *  3. For each subsequent circle try every Apollonius position relative to all
 *     already-placed pairs, keep the one with the smallest distance to origin.
 *  4. Fall back to an angular sweep around each placed circle if no pair
 *     position is collision-free.
 */
function packCircles(radii: number[]): Array<[number, number]> {
  const n = radii.length;
  if (n === 0) return [];
  const pos: Array<[number, number]> = new Array(n);
  pos[0] = [0, 0];
  if (n === 1) return pos;

  pos[1] = [radii[0] + radii[1] + GAP, 0];

  for (let i = 2; i < n; i++) {
    const r = radii[i];
    let bestX = 0, bestY = 0, bestD = Infinity;

    /** Check candidate (cx, cy) — no overlap with circles 0..i-1 */
    const tryCandidate = (cx: number, cy: number): void => {
      for (let k = 0; k < i; k++) {
        if (Math.hypot(pos[k][0] - cx, pos[k][1] - cy) < radii[k] + r + GAP - 0.5) return;
      }
      const d = Math.hypot(cx, cy);
      if (d < bestD) { bestD = d; bestX = cx; bestY = cy; }
    };

    // Apollonius positions for all placed pairs
    for (let a = 0; a < i; a++) {
      for (let b = a + 1; b < i; b++) {
        for (const [cx, cy] of apolloniusCandidates(
          pos[a][0], pos[a][1], radii[a],
          pos[b][0], pos[b][1], radii[b],
          r,
        )) tryCandidate(cx, cy);
      }
    }

    // Fallback: angular sweep around each placed circle
    if (!isFinite(bestD)) {
      const STEPS = 72;
      for (let a = 0; a < i; a++) {
        const dist = radii[a] + r + GAP;
        for (let s = 0; s < STEPS; s++) {
          const angle = (s / STEPS) * 2 * Math.PI;
          tryCandidate(pos[a][0] + dist * Math.cos(angle), pos[a][1] + dist * Math.sin(angle));
        }
      }
    }

    pos[i] = [bestX, bestY];
  }
  return pos;
}

// ---------------------------------------------------------------------------
// Renderer
// ---------------------------------------------------------------------------

/**
 * Generate an SVG packed-bubble chart.
 *
 * Each bubble is sized so that its **area is proportional to its value**.
 * Positions are determined by a greedy circle-packing algorithm — the caller
 * only provides labels and values.  Bubbles are rendered as solid filled
 * circles with a subtle drop-shadow and a light specular-highlight overlay for
 * gentle depth, keeping the visual style consistent with the rest of the library.
 * A SMIL animation gently pulses each bubble radius with staggered delays so
 * the bubbles breathe independently without ever touching their neighbours.
 */
export function createBubbleChart(options: BubbleChartOptions): string {
  const {
    items: rawItems = [],
    theme: mode = 'light',
    palette,
    title,
    subtitle,
  } = options;

  const theme  = resolveTheme(palette, mode);
  const titleH = titleBlockHeight(title, subtitle, theme.fontSize);
  const labelFs = theme.fontSize - 1;
  const uid    = `bub-${++_bubbleCount}`;

  // ── Compute radii (area ∝ value) ─────────────────────────────────────────
  const maxVal = rawItems.reduce((m, it) => Math.max(m, Math.abs(it.value ?? 0)), 0);
  const items  = rawItems.map((it, origIdx) => ({
    ...it,
    origIdx,
    r: maxVal > 0
      ? Math.round(MIN_R + Math.sqrt(Math.abs(it.value ?? 0) / maxVal) * (MAX_R - MIN_R))
      : MIN_R,
  }));

  // Sort largest first for better packing, remember original order for colors
  const sorted = [...items].sort((a, b) => b.r - a.r);
  const radii  = sorted.map(it => it.r);
  const rawPos = packCircles(radii);

  // ── Bounding box (account for external labels below small bubbles) ───────
  let minX = Infinity, maxX = -Infinity, minY = Infinity, maxY = -Infinity;
  for (let i = 0; i < sorted.length; i++) {
    const r  = sorted[i].r;
    const extraY = r < INSIDE_R ? labelFs + 4 : 0;
    minX = Math.min(minX, rawPos[i][0] - r);
    maxX = Math.max(maxX, rawPos[i][0] + r);
    minY = Math.min(minY, rawPos[i][1] - r);
    maxY = Math.max(maxY, rawPos[i][1] + r + extraY);
  }
  if (!isFinite(minX)) { minX = 0; maxX = 0; minY = 0; maxY = 0; }

  const contentW = maxX - minX + PAD * 2;
  const contentH = maxY - minY + PAD * 2;
  const WIDTH    = Math.max(480, Math.round(contentW));
  const HEIGHT   = Math.max(360, Math.round(contentH));

  // Offset so the packed cluster is centered in the canvas
  const offX = -minX + PAD + (WIDTH  - contentW) / 2;
  const offY = -minY + PAD + (HEIGHT - contentH) / 2;

  const parts: string[] = [];

  // ── Defs: drop-shadow filter + specular-highlight gradient ───────────────
  parts.push(
    `<defs>` +
      // Soft shadow gives a gentle sense of elevation without heaviness
      `<filter id="${uid}-sh" x="-50%" y="-50%" width="200%" height="200%">` +
      `<feDropShadow dx="0" dy="2" stdDeviation="3" flood-color="rgba(0,0,0,0.18)"/>` +
      `</filter>` +
      // Off-center radial gradient simulates a light source at top-left (subtle)
      `<radialGradient id="${uid}-hl" cx="35%" cy="28%" r="65%" fx="35%" fy="28%">` +
      `<stop offset="0%" stop-color="rgba(255,255,255,0.25)"/>` +
      `<stop offset="100%" stop-color="rgba(255,255,255,0)"/>` +
      `</radialGradient>` +
      `</defs>`,
  );

  // ── Bubbles ───────────────────────────────────────────────────────────────
  for (let si = 0; si < sorted.length; si++) {
    const item  = sorted[si];
    const cx    = Math.round(rawPos[si][0] + offX);
    const cy    = Math.round(rawPos[si][1] + offY);
    const r     = item.r;
    const r2    = Math.round(r * (1 + PULSE_GROW));
    const delay = (si % 4) * 0.5;

    // Color determined by original insertion order so re-sorting doesn't change colors
    const nt        = BUBBLE_TYPES[item.origIdx % BUBBLE_TYPES.length];
    const fillColor = theme.nodeStrokes[nt];   // vibrant solid fill, no stroke
    const txtColor  = textColorOnFill(fillColor);

    // Shared SMIL animate string (reused for main circle and highlight overlay)
    const animateAttr =
      `attributeName="r" values="${r};${r2};${r}" dur="3s" begin="${delay}s" ` +
      `repeatCount="indefinite" calcMode="spline" ` +
      `keySplines="0.45 0 0.55 1;0.45 0 0.55 1" keyTimes="0;0.5;1"`;

    // Main solid circle — no stroke, drop shadow
    parts.push(
      `<circle cx="${cx}" cy="${cy}" r="${r}" ` +
        `fill="${escapeXml(fillColor)}" filter="url(#${uid}-sh)">` +
        `<animate ${animateAttr}/>` +
        `</circle>`,
    );
    // Highlight overlay — synced pulse, no pointer events
    parts.push(
      `<circle cx="${cx}" cy="${cy}" r="${r}" ` +
        `fill="url(#${uid}-hl)" pointer-events="none">` +
        `<animate ${animateAttr}/>` +
        `</circle>`,
    );

    if (r >= INSIDE_R) {
      // Label + value inside the bubble on two lines, vertically centered
      const valueStr = String(item.value ?? '');
      const lineH    = labelFs + 2;
      parts.push(
        `<text x="${cx}" y="${cy - lineH / 2}" text-anchor="middle" dominant-baseline="middle" ` +
          `font-family="${escapeXml(theme.fontFamily)}" font-size="${labelFs}" font-weight="600" ` +
          `fill="${escapeXml(txtColor)}" pointer-events="none">${escapeXml(item.label)}</text>`,
        `<text x="${cx}" y="${cy + lineH / 2 + 2}" text-anchor="middle" dominant-baseline="middle" ` +
          `font-family="${escapeXml(theme.fontFamily)}" font-size="${labelFs - 2}" ` +
          `fill="${escapeXml(txtColor)}" opacity="0.82" pointer-events="none">${escapeXml(valueStr)}</text>`,
      );
    } else {
      // Small bubble: label and value below, combined
      const valueStr = String(item.value ?? '');
      parts.push(
        `<text x="${cx}" y="${cy + r + labelFs + 2}" text-anchor="middle" ` +
          `font-family="${escapeXml(theme.fontFamily)}" font-size="${labelFs}" ` +
          `fill="${escapeXml(theme.edgeColor)}" pointer-events="none">${escapeXml(item.label)} (${escapeXml(valueStr)})</text>`,
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
    `<svg xmlns="http://www.w3.org/2000/svg" width="${WIDTH}" height="${HEIGHT + titleH}" viewBox="0 0 ${WIDTH} ${HEIGHT + titleH}">`,
    ...bgParts,
    ...(titleSvg ? [titleSvg] : []),
    `<g class="bubble-chart"${titleH > 0 ? ` transform="translate(0,${titleH})"` : ''}>`,
    ...parts,
    `</g>`,
    `</svg>`,
  ].join('\n');
}
