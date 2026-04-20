import { resolveTheme } from './theme';
import { escapeXml, titleBlockHeight, renderTitleBlock } from './utils';
import type { VennDiagramOptions, VennSet, NodeType } from './types';

/** Incrementing counter for unique per-diagram SVG IDs. */
let _vennCount = 0;

// ── Layout constants ────────────────────────────────────────────────────────
const SVG_W   = 560;
const SVG_H   = 540;   // taller to prevent top set-label clipping
const LABEL_FS   = 13;
const SUBLAB_FS  = 10;
const INTER_FS   = 12;

// Node types used for coloring sets 0, 1, 2
const SET_NODE_TYPES: NodeType[] = ['process', 'terminal', 'io'];

interface CircleDef {
  cx: number;
  cy: number;
  r: number;
}

/**
 * Pre-computed circle centers for 2 and 3 set Venn layouts.
 * For 2 sets: side-by-side with ~40 % overlap.
 * For 3 sets: equilateral triangle arrangement.
 * The centroid is shifted slightly below SVG mid so labels don't clip at top.
 */
function getCircles(n: number): CircleDef[] {
  const cx = SVG_W / 2;
  // Shift centroid 20px below center so top-label has room above circles
  const cy = SVG_H / 2 + 20;

  if (n <= 2) {
    const r   = 140;
    const gap = r * 0.55; // partial overlap
    return [
      { cx: cx - gap, cy, r },
      { cx: cx + gap, cy, r },
    ];
  }

  // 3 sets — equilateral triangle, centers 100px from centroid
  const r    = 128;
  const dist = 90;
  return [
    { cx: cx,              cy: cy - dist,              r },  // top
    { cx: cx - dist * 0.9, cy: cy + dist * 0.5,        r },  // bottom-left
    { cx: cx + dist * 0.9, cy: cy + dist * 0.5,        r },  // bottom-right
  ];
}

/**
 * Generate an SVG Venn diagram for 2 or 3 sets.
 *
 * Circles use low-opacity fills that compound naturally in overlap regions.
 * Set names are placed outside the circles; intersection labels inside.
 * One optional accent intersection can be highlighted with the theme's focal color.
 */
export function createVennDiagram(options: VennDiagramOptions): string {
  const {
    sets,
    intersections = [],
    theme: mode = 'light',
    palette,
    title,
    subtitle,
  } = options;

  const theme  = resolveTheme(palette, mode);
  const titleH = titleBlockHeight(title, subtitle, theme.fontSize);
  const uid    = `vn-${++_vennCount}`;

  const displaySets = sets.slice(0, 3); // cap at 3
  const circles     = getCircles(displaySets.length);

  const accentStroke = theme.nodeStrokes['decision'];
  const accentFill   = theme.nodeFills['decision'];
  const accentText   = theme.textColors['decision'];

  const parts: string[] = [];

  // ── Defs: clipPaths for intersection accent fills ────────────────────────
  parts.push(`<defs>`);
  for (let i = 0; i < circles.length; i++) {
    const c = circles[i];
    parts.push(
      `<clipPath id="${uid}-clip${i}">` +
        `<circle cx="${c.cx}" cy="${c.cy}" r="${c.r}"/>` +
      `</clipPath>`,
    );
  }
  parts.push(`</defs>`);

  // ── Set circles ──────────────────────────────────────────────────────────
  for (let i = 0; i < displaySets.length; i++) {
    const c        = circles[i];
    const nodeType = SET_NODE_TYPES[i % SET_NODE_TYPES.length];
    const stroke   = theme.nodeStrokes[nodeType];

    parts.push(
      `<circle cx="${c.cx}" cy="${c.cy}" r="${c.r}" ` +
        `fill="${escapeXml(stroke)}" fill-opacity="0.07" ` +
        `stroke="${escapeXml(stroke)}" stroke-width="1.5"/>`,
    );
  }

  // ── Intersection accent fills ─────────────────────────────────────────────
  for (const inter of intersections) {
    if (!inter.accent) continue;
    // For the accent intersection, fill with accent tint clipped to all member circles
    const setIdxs = inter.sets
      .map((sid) => displaySets.findIndex((s) => s.id === sid))
      .filter((idx) => idx >= 0);

    if (setIdxs.length < 2) continue;

    // Use nested clipPath approach: clip inside first set, then paint inside second
    // For simplicity, draw small accent fill circle at approximate centroid
    const cx = setIdxs.reduce((s, i) => s + circles[i].cx, 0) / setIdxs.length;
    const cy = setIdxs.reduce((s, i) => s + circles[i].cy, 0) / setIdxs.length;
    const r  = circles[0].r * 0.35;

    // Only render inside all relevant clip paths
    let clipStr = '';
    if (setIdxs.length >= 1) clipStr = `clip-path="url(#${uid}-clip${setIdxs[0]})"`;

    parts.push(
      `<circle cx="${cx}" cy="${cy}" r="${r}" ` +
        `fill="${escapeXml(accentFill)}" fill-opacity="0.35" stroke="none" ` +
        `${clipStr}/>`,
    );
  }

  // ── Intersection labels ───────────────────────────────────────────────────
  for (const inter of intersections) {
    const setIdxs = inter.sets
      .map((sid) => displaySets.findIndex((s) => s.id === sid))
      .filter((idx) => idx >= 0);

    if (setIdxs.length === 0) continue;

    const cx = setIdxs.reduce((s, i) => s + circles[i].cx, 0) / setIdxs.length;
    const cy = setIdxs.reduce((s, i) => s + circles[i].cy, 0) / setIdxs.length;

    const isAccent = inter.accent === true;
    const fill     = isAccent ? accentText : theme.edgeColor;

    parts.push(
      `<text x="${cx}" y="${cy}" text-anchor="middle" dominant-baseline="central" ` +
        `font-family="${escapeXml(theme.fontFamily)}" font-size="${INTER_FS}" ` +
        `font-weight="${isAccent ? '700' : '600'}" fill="${escapeXml(fill)}"` +
        (isAccent ? '' : ` opacity="0.85"`) +
        `>${escapeXml(inter.label)}</text>`,
    );
  }

  // ── Set name labels (outside circles) ─────────────────────────────────────
  for (let i = 0; i < displaySets.length; i++) {
    const set  = displaySets[i];
    const c    = circles[i];
    const nodeType = SET_NODE_TYPES[i % SET_NODE_TYPES.length];
    const fill = theme.nodeStrokes[nodeType];

    // Place label outside the circle based on position relative to centroid of diagram
    // (matches the shifted centroid used in getCircles)
    const dcx = SVG_W / 2;
    const dcy = SVG_H / 2 + 20;
    const outDx = (c.cx - dcx);
    const outDy = (c.cy - dcy);
    const outLen = Math.sqrt(outDx * outDx + outDy * outDy) || 1;
    const ux = outDx / outLen, uy = outDy / outLen;

    const labelDist = c.r + 18;
    const lx = c.cx + ux * labelDist;
    const ly = c.cy + uy * labelDist;

    // Determine text anchor based on horizontal direction
    const anchor = ux < -0.3 ? 'end' : ux > 0.3 ? 'start' : 'middle';
    const baseline = uy < -0.3 ? 'auto' : uy > 0.3 ? 'hanging' : 'central';

    parts.push(
      `<text x="${lx}" y="${ly}" text-anchor="${anchor}" dominant-baseline="${baseline}" ` +
        `font-family="${escapeXml(theme.fontFamily)}" font-size="${LABEL_FS}" ` +
        `font-weight="600" fill="${escapeXml(fill)}">${escapeXml(set.label)}</text>`,
    );

    if (set.sublabel) {
      parts.push(
        `<text x="${lx}" y="${ly + LABEL_FS + 3}" text-anchor="${anchor}" ` +
          `font-family="${escapeXml(theme.fontFamily)}" font-size="${SUBLAB_FS}" ` +
          `fill="${escapeXml(theme.groupColor)}">${escapeXml(set.sublabel)}</text>`,
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
    `<g class="venn-diagram"${titleH > 0 ? ` transform="translate(0,${titleH})"` : ''}>`,
    ...parts,
    `</g>`,
    `</svg>`,
  ].join('\n');
}
