import { resolveTheme } from './theme';
import { escapeXml, titleBlockHeight, renderTitleBlock } from './utils';
import type { VennDiagramOptions, VennSet, NodeType } from './types';

/** Incrementing counter for unique per-diagram SVG IDs. */
let _vennCount = 0;

// ── Layout constants ────────────────────────────────────────────────────────
const LABEL_FS   = 13;
const SUBLAB_FS  = 10;
const INTER_FS   = 12;

// Node types used for coloring sets 0, 1, 2, 3, 4
const SET_NODE_TYPES: NodeType[] = ['process', 'terminal', 'io', 'decision', 'process'];

interface CircleDef {
  cx: number;
  cy: number;
  r: number;
}

interface CircleLayout {
  circles: CircleDef[];
  svgW: number;
  svgH: number;
}

/**
 * Compute circle centers and SVG dimensions for n-set Venn diagrams.
 * Supports 2–5 sets. Set labels are placed inside circles (outward sector).
 */
function getCircleLayout(n: number): CircleLayout {
  if (n <= 2) {
    const svgW = 560, svgH = 460;
    const cx = svgW / 2, cy = svgH / 2 + 10;
    const r = 130, gap = r * 0.55;
    return {
      circles: [
        { cx: cx - gap, cy, r },
        { cx: cx + gap, cy, r },
      ],
      svgW, svgH,
    };
  }

  if (n === 3) {
    // Equilateral triangle — circles sized so inner labels fit without crowding
    const svgW = 620, svgH = 560;
    const cx = svgW / 2, cy = svgH / 2 + 20;
    const r = 110, dist = 82;
    return {
      circles: [
        { cx,                    cy: cy - dist,           r },  // top
        { cx: cx - dist * 0.9,  cy: cy + dist * 0.5,     r },  // bottom-left
        { cx: cx + dist * 0.9,  cy: cy + dist * 0.5,     r },  // bottom-right
      ],
      svgW, svgH,
    };
  }

  if (n === 4) {
    // 2×2 grid arrangement
    const svgW = 680, svgH = 640;
    const cx = svgW / 2, cy = svgH / 2 + 10;
    const r = 90, g = 72;
    return {
      circles: [
        { cx: cx - g, cy: cy - g, r },  // top-left
        { cx: cx + g, cy: cy - g, r },  // top-right
        { cx: cx - g, cy: cy + g, r },  // bottom-left
        { cx: cx + g, cy: cy + g, r },  // bottom-right
      ],
      svgW, svgH,
    };
  }

  // n >= 5: pentagon arrangement
  const svgW = 760, svgH = 720;
  const cx = svgW / 2, cy = svgH / 2 + 10;
  const r = 78, dist = 112;
  const circles: CircleDef[] = [];
  for (let i = 0; i < n; i++) {
    const angle = 2 * Math.PI * i / n - Math.PI / 2;
    circles.push({
      cx: Math.round(cx + dist * Math.cos(angle)),
      cy: Math.round(cy + dist * Math.sin(angle)),
      r,
    });
  }
  return { circles, svgW, svgH };
}

/**
 * Generate an SVG Venn diagram for 2–5 sets.
 *
 * Circles use low-opacity fills that compound naturally in overlap regions.
 * Set names are placed inside each circle (in the non-overlapping outer sector).
 * Pairwise intersection labels are rendered inline at the overlap centroid.
 * Triple (3+) intersection labels are placed to the right with a dot + leader line.
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

  const displaySets = sets.slice(0, 5); // support up to 5 sets
  const { circles, svgW, svgH } = getCircleLayout(displaySets.length);

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
    const setIdxs = inter.sets
      .map((sid) => displaySets.findIndex((s) => s.id === sid))
      .filter((idx) => idx >= 0);

    if (setIdxs.length < 2) continue;

    const cx = setIdxs.reduce((s, i) => s + circles[i].cx, 0) / setIdxs.length;
    const cy = setIdxs.reduce((s, i) => s + circles[i].cy, 0) / setIdxs.length;
    const r  = circles[0].r * 0.35;
    const clipStr = `clip-path="url(#${uid}-clip${setIdxs[0]})"`;

    parts.push(
      `<circle cx="${cx}" cy="${cy}" r="${r}" ` +
        `fill="${escapeXml(accentFill)}" fill-opacity="0.35" stroke="none" ` +
        `${clipStr}/>`,
    );
  }

  // ── Intersection labels ───────────────────────────────────────────────────
  // Triple (3+) intersections: placed to the right of all circles with a leader line.
  // Pairwise intersections: rendered inline at the overlap centroid, with a small
  // radial offset to avoid collisions when two pairwise centroids are at the same Y.
  const diagramCx = circles.reduce((s, c) => s + c.cx, 0) / circles.length;
  const diagramCy = circles.reduce((s, c) => s + c.cy, 0) / circles.length;

  // Group pairwise intersections by their computed centroid Y to detect same-row collisions
  type InterItem = { ocx: number; ocy: number; isAccent: boolean; label: string; isTriple: boolean };
  const interItems: InterItem[] = [];

  for (const inter of intersections) {
    const setIdxs = inter.sets
      .map((sid) => displaySets.findIndex((s) => s.id === sid))
      .filter((idx) => idx >= 0);
    if (setIdxs.length === 0) continue;

    const ocx = setIdxs.reduce((s, i) => s + circles[i].cx, 0) / setIdxs.length;
    const ocy = setIdxs.reduce((s, i) => s + circles[i].cy, 0) / setIdxs.length;
    interItems.push({
      ocx, ocy,
      isAccent: inter.accent === true,
      label: inter.label,
      isTriple: setIdxs.length >= 3,
    });
  }

  // For pairwise labels sharing the same row (same Y ± 12px), offset them vertically
  for (let i = 0; i < interItems.length; i++) {
    const a = interItems[i];
    if (a.isTriple) continue;
    for (let j = i + 1; j < interItems.length; j++) {
      const b = interItems[j];
      if (b.isTriple) continue;
      if (Math.abs(a.ocy - b.ocy) < 14 && Math.abs(a.ocx - b.ocx) < 80) {
        // Both at similar Y position and reasonably close in X → nudge them apart vertically
        const nudge = 9;
        a.ocy -= nudge;
        b.ocy += nudge;
      }
    }
  }

  const rightExtent = Math.max(...circles.map((c) => c.cx + c.r));

  // Collect triple intersections to stack them vertically outside
  let tripleStackY = diagramCy;
  const TRIPLE_STACK_GAP = 22;

  for (const item of interItems) {
    const { ocx, ocy, isAccent, label, isTriple } = item;
    const fill = isAccent ? accentText : theme.edgeColor;

    if (isTriple) {
      const lx = rightExtent + 28;
      const ly = tripleStackY;
      tripleStackY += TRIPLE_STACK_GAP;

      // Small dot at overlap centroid
      parts.push(
        `<circle cx="${ocx}" cy="${ocy}" r="3" ` +
          `fill="${escapeXml(isAccent ? accentStroke : theme.groupColor)}" opacity="0.55"/>`,
      );

      // Leader line from dot to label
      const lineDx = lx - ocx, lineDy = ly - ocy;
      const lineLen = Math.sqrt(lineDx * lineDx + lineDy * lineDy) || 1;
      const lux = lineDx / lineLen, luy = lineDy / lineLen;
      parts.push(
        `<line x1="${ocx + lux * 6}" y1="${ocy + luy * 6}" ` +
             `x2="${lx - lux * 8}" y2="${ly - luy * 8}" ` +
          `stroke="${escapeXml(isAccent ? accentStroke : theme.groupColor)}" stroke-width="1" opacity="0.65"/>`,
      );

      parts.push(
        `<text x="${lx}" y="${ly}" text-anchor="start" dominant-baseline="central" ` +
          `font-family="${escapeXml(theme.fontFamily)}" font-size="${INTER_FS}" ` +
          `font-weight="${isAccent ? '700' : '600'}" fill="${escapeXml(fill)}">${escapeXml(label)}</text>`,
      );
    } else {
      // Pairwise intersection: render inline at (possibly nudged) overlap centroid
      parts.push(
        `<text x="${ocx}" y="${ocy}" text-anchor="middle" dominant-baseline="central" ` +
          `font-family="${escapeXml(theme.fontFamily)}" font-size="${INTER_FS}" ` +
          `font-weight="${isAccent ? '700' : '600'}" fill="${escapeXml(fill)}">${escapeXml(label)}</text>`,
      );
    }
  }

  // ── Set name labels — placed INSIDE each circle in the non-overlapping sector ──
  for (let i = 0; i < displaySets.length; i++) {
    const set  = displaySets[i];
    const c    = circles[i];
    const nodeType = SET_NODE_TYPES[i % SET_NODE_TYPES.length];
    const fill = theme.nodeStrokes[nodeType];

    // Outward direction from diagram centroid to circle center
    const outDx = c.cx - diagramCx;
    const outDy = c.cy - diagramCy;
    const outLen = Math.sqrt(outDx * outDx + outDy * outDy) || 1;
    const ux = outDx / outLen, uy = outDy / outLen;

    // Place label inside the circle at ~52% of the radius from center (outer sector)
    const insideDist = c.r * 0.52;
    const lx = c.cx + ux * insideDist;
    const ly = c.cy + uy * insideDist;

    parts.push(
      `<text x="${lx}" y="${ly}" text-anchor="middle" dominant-baseline="central" ` +
        `font-family="${escapeXml(theme.fontFamily)}" font-size="${LABEL_FS}" ` +
        `font-weight="700" fill="${escapeXml(fill)}">${escapeXml(set.label)}</text>`,
    );

    if (set.sublabel) {
      parts.push(
        `<text x="${lx}" y="${ly + LABEL_FS + 3}" text-anchor="middle" dominant-baseline="central" ` +
          `font-family="${escapeXml(theme.fontFamily)}" font-size="${SUBLAB_FS}" ` +
          `fill="${escapeXml(fill)}" opacity="0.7">${escapeXml(set.sublabel)}</text>`,
      );
    }
  }

  const bgParts: string[] = theme.background
    ? [`<rect width="100%" height="100%" fill="${theme.background}"/>`]
    : [];

  const titleSvg = renderTitleBlock(
    title, subtitle, svgW / 2, 0,
    theme.fontFamily, theme.fontSize, theme.edgeColor, theme.groupColor,
  );

  return [
    `<svg xmlns="http://www.w3.org/2000/svg" width="${svgW}" height="${svgH + titleH}" ` +
      `viewBox="0 0 ${svgW} ${svgH + titleH}" id="${uid}">`,
    ...bgParts,
    ...(titleSvg ? [titleSvg] : []),
    `<g class="venn-diagram"${titleH > 0 ? ` transform="translate(0,${titleH})"` : ''}>`,
    ...parts,
    `</g>`,
    `</svg>`,
  ].join('\n');
}

