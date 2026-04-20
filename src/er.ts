import { resolveTheme } from './theme';
import { escapeXml, titleBlockHeight, renderTitleBlock } from './utils';
import type { ErDiagramOptions, ErEntity, ErRelation, NodeType } from './types';

/** Incrementing counter for unique per-diagram SVG IDs. */
let _erCount = 0;

// ── Layout constants ────────────────────────────────────────────────────────
const ENTITY_W      = 220;   // entity box width
const HEADER_H      = 44;    // entity header height
const FIELD_H       = 26;    // height per field row
const ENTITY_RX     = 6;     // corner radius
const FONT_SIZE     = 14;    // field font size
const HEADER_FS     = 14;    // entity name font size
const TAG_FS        = 9;     // "ENTITY" eyebrow tag font size
const COL_GAP       = 80;    // gap between entity columns
const ROW_GAP       = 72;    // gap between entity rows
const PAD           = 40;    // canvas outer padding
const CARD_FS       = 11;    // cardinality label font size
const CARD_OFFSET   = 16;    // how far from the entity edge to draw cardinality
// Maximum columns: 2 keeps entities large and readable
const MAX_COLS      = 2;

// Node types cycled for entity accent colors
const ENTITY_NODE_TYPES: NodeType[] = ['process', 'terminal', 'io', 'decision'];

/** Compute the pixel height of an entity box (header + fields). */
function entityHeight(entity: ErEntity): number {
  return HEADER_H + entity.fields.length * FIELD_H;
}

/** Compute a simple grid layout for entities: up to MAX_COLS per row. */
function layoutEntities(
  entities: ErEntity[],
): Map<string, { x: number; y: number; width: number; height: number }> {
  const COLS = Math.min(MAX_COLS, entities.length);
  const result = new Map<string, { x: number; y: number; width: number; height: number }>();

  // Row heights — each row is the tallest entity in that row
  const rowCount = Math.ceil(entities.length / COLS);
  const rowHeights: number[] = Array.from({ length: rowCount }, () => 0);

  for (let i = 0; i < entities.length; i++) {
    const row = Math.floor(i / COLS);
    rowHeights[row] = Math.max(rowHeights[row], entityHeight(entities[i]));
  }

  let cumY = PAD;
  for (let row = 0; row < rowCount; row++) {
    for (let col = 0; col < COLS; col++) {
      const idx = row * COLS + col;
      if (idx >= entities.length) break;
      const entity = entities[idx];
      const x = PAD + col * (ENTITY_W + COL_GAP);
      result.set(entity.id, {
        x,
        y: cumY,
        width: ENTITY_W,
        height: entityHeight(entity),
      });
    }
    cumY += rowHeights[row] + ROW_GAP;
  }

  return result;
}

/** Find the center point of an entity box. */
function entityCenter(pos: { x: number; y: number; width: number; height: number }): { x: number; y: number } {
  return { x: pos.x + pos.width / 2, y: pos.y + pos.height / 2 };
}

/** Compute the edge point on the boundary of an entity box closest to a given external point. */
function edgePoint(
  pos: { x: number; y: number; width: number; height: number },
  target: { x: number; y: number },
): { x: number; y: number } {
  const cx = pos.x + pos.width / 2;
  const cy = pos.y + pos.height / 2;
  const dx = target.x - cx;
  const dy = target.y - cy;

  if (Math.abs(dx) < 0.001 && Math.abs(dy) < 0.001) {
    return { x: cx, y: pos.y }; // degenerate — return top center
  }

  const hw = pos.width / 2;
  const hh = pos.height / 2;

  // Scale to rectangle boundary
  const scaleX = Math.abs(dx) > 0.001 ? hw / Math.abs(dx) : Infinity;
  const scaleY = Math.abs(dy) > 0.001 ? hh / Math.abs(dy) : Infinity;
  const scale  = Math.min(scaleX, scaleY);

  return { x: cx + dx * scale, y: cy + dy * scale };
}

/**
 * Generate an SVG ER (Entity-Relationship) diagram.
 *
 * Entities are rendered as two-section boxes with a header (entity name) and
 * a body (field list). Relationships are lines connecting entity boxes with
 * optional cardinality labels and a relationship label.
 */
export function createErDiagram(options: ErDiagramOptions): string {
  const {
    entities,
    relations,
    theme: mode = 'light',
    palette,
    title,
    subtitle,
  } = options;

  const theme  = resolveTheme(palette, mode);
  const titleH = titleBlockHeight(title, subtitle, theme.fontSize);
  const uid    = `er-${++_erCount}`;

  const positions = layoutEntities(entities);

  // ── Canvas size ──────────────────────────────────────────────────────────
  let maxX = 0, maxY = 0;
  for (const pos of positions.values()) {
    maxX = Math.max(maxX, pos.x + pos.width);
    maxY = Math.max(maxY, pos.y + pos.height);
  }
  const WIDTH  = Math.max(480, maxX + PAD);
  const HEIGHT = Math.max(300, maxY + PAD);

  const parts: string[] = [];

  // ── Defs: arrowhead ─────────────────────────────────────────────────────
  parts.push(
    `<defs>` +
      `<marker id="${uid}-arrow" markerWidth="6" markerHeight="5" ` +
        `refX="5" refY="2.5" orient="auto" markerUnits="strokeWidth">` +
        `<polygon points="0 0, 6 2.5, 0 5" fill="${escapeXml(theme.groupColor)}"/>` +
      `</marker>` +
    `</defs>`,
  );

  // ── Relations ────────────────────────────────────────────────────────────
  const entityMap = new Map<string, ErEntity>(entities.map((e) => [e.id, e]));

  for (const rel of relations) {
    const fromPos = positions.get(rel.from);
    const toPos   = positions.get(rel.to);
    if (!fromPos || !toPos) continue;

    const fromCenter = entityCenter(fromPos);
    const toCenter   = entityCenter(toPos);
    const fromPt     = edgePoint(fromPos, toCenter);
    const toPt       = edgePoint(toPos, fromCenter);

    const lineColor = theme.groupColor;

    parts.push(
      `<line x1="${fromPt.x}" y1="${fromPt.y}" x2="${toPt.x}" y2="${toPt.y}" ` +
        `stroke="${escapeXml(lineColor)}" stroke-width="1.5" marker-end="url(#${uid}-arrow)"/>`,
    );

    // Relationship label (centered on line)
    if (rel.label) {
      const mx = (fromPt.x + toPt.x) / 2;
      const my = (fromPt.y + toPt.y) / 2 - 6;
      parts.push(
        `<text x="${mx}" y="${my}" text-anchor="middle" ` +
          `font-family="${escapeXml(theme.fontFamily)}" font-size="${FONT_SIZE - 1}" ` +
          `fill="${escapeXml(theme.edgeColor)}" font-style="italic">${escapeXml(rel.label)}</text>`,
      );
    }

    // Cardinality labels
    const dx = toPt.x - fromPt.x;
    const dy = toPt.y - fromPt.y;
    const len = Math.sqrt(dx * dx + dy * dy);
    if (len > 0.001) {
      const ux = dx / len, uy = dy / len;
      const perpX = -uy * 10, perpY = ux * 10;

      if (rel.fromCard) {
        const cx = fromPt.x + ux * CARD_OFFSET;
        const cy = fromPt.y + uy * CARD_OFFSET + perpY;
        parts.push(
          `<text x="${cx}" y="${cy}" text-anchor="middle" ` +
            `font-family="${escapeXml(theme.fontFamily)}" font-size="${CARD_FS}" ` +
            `fill="${escapeXml(theme.edgeColor)}">${escapeXml(rel.fromCard)}</text>`,
        );
      }
      if (rel.toCard) {
        const cx = toPt.x - ux * CARD_OFFSET;
        const cy = toPt.y - uy * CARD_OFFSET + perpY;
        parts.push(
          `<text x="${cx}" y="${cy}" text-anchor="middle" ` +
            `font-family="${escapeXml(theme.fontFamily)}" font-size="${CARD_FS}" ` +
            `fill="${escapeXml(theme.edgeColor)}">${escapeXml(rel.toCard)}</text>`,
        );
      }
    }
  }

  // ── Entities ─────────────────────────────────────────────────────────────
  for (let ei = 0; ei < entities.length; ei++) {
    const entity  = entities[ei];
    const pos     = positions.get(entity.id);
    if (!pos) continue;

    const isAccent  = entity.accent === true;
    const nodeType  = ENTITY_NODE_TYPES[ei % ENTITY_NODE_TYPES.length];
    const hdrFill   = isAccent ? theme.nodeFills['decision']   : theme.nodeFills[nodeType];
    const hdrStroke = isAccent ? theme.nodeStrokes['decision'] : theme.nodeStrokes[nodeType];
    const hdrText   = isAccent ? theme.textColors['decision']  : theme.textColors[nodeType];

    const { x, y, width, height } = pos;
    const bodyH = height - HEADER_H;

    // Entity body fill (rounded rect, no stroke — border drawn on top later)
    parts.push(
      `<rect x="${x}" y="${y}" width="${width}" height="${height}" ` +
        `rx="${ENTITY_RX}" ry="${ENTITY_RX}" ` +
        `fill="${escapeXml(theme.nodeFills['process'])}" stroke="none"/>`,
    );

    // Header fill
    parts.push(
      `<rect x="${x}" y="${y}" width="${width}" height="${HEADER_H}" ` +
        `rx="${ENTITY_RX}" ry="${ENTITY_RX}" fill="${escapeXml(hdrFill)}" stroke="none"/>`,
      // Cover bottom rounded corners of header with a straight rect
      `<rect x="${x}" y="${y + HEADER_H - ENTITY_RX}" width="${width}" height="${ENTITY_RX}" ` +
        `fill="${escapeXml(hdrFill)}" stroke="none"/>`,
    );

    // Header divider line
    parts.push(
      `<line x1="${x}" y1="${y + HEADER_H}" x2="${x + width}" y2="${y + HEADER_H}" ` +
        `stroke="${escapeXml(hdrStroke)}" stroke-width="1"/>`,
    );

    // ENTITY eyebrow tag
    parts.push(
      `<text x="${x + 8}" y="${y + 11}" ` +
        `font-family="${escapeXml(theme.fontFamily)}" font-size="${TAG_FS}" ` +
        `font-weight="500" letter-spacing="0.12em" ` +
        `fill="${escapeXml(hdrText)}" opacity="0.7">ENTITY</text>`,
    );

    // Entity name
    parts.push(
      `<text x="${x + width / 2}" y="${y + HEADER_H - 9}" text-anchor="middle" ` +
        `font-family="${escapeXml(theme.fontFamily)}" font-size="${HEADER_FS}" ` +
        `font-weight="600" fill="${escapeXml(hdrText)}">${escapeXml(entity.label)}</text>`,
    );

    // Fields
    for (let fi = 0; fi < entity.fields.length; fi++) {
      const field   = entity.fields[fi];
      const fieldY  = y + HEADER_H + (fi + 0.75) * FIELD_H;
      const fieldBg = y + HEADER_H + fi * FIELD_H;

      // Alternating row tint
      if (fi % 2 === 0) {
        parts.push(
          `<rect x="${x + 1}" y="${fieldBg}" width="${width - 2}" height="${FIELD_H}" ` +
            `fill="${escapeXml(theme.groupFill)}" stroke="none"` +
            (fi === entity.fields.length - 1 ? ` rx="${ENTITY_RX}" ry="${ENTITY_RX}"` : '') +
            `/>`,
        );
      }

      // Key prefix badge
      let prefix = '';
      if (field.key === 'pk') prefix = '#';
      else if (field.key === 'fk') prefix = '→';

      const textFill = field.key ? theme.nodeStrokes[nodeType] : theme.edgeColor;

      parts.push(
        `<text x="${x + 10}" y="${fieldY}" ` +
          `font-family="${escapeXml(theme.fontFamily)}" font-size="${FONT_SIZE}" ` +
          `fill="${escapeXml(textFill)}"` +
          (field.key ? ` font-weight="600"` : '') +
          `>${escapeXml((prefix ? prefix + ' ' : '') + field.name)}</text>`,
      );

      // Field type (right-aligned, monospace look)
      if (field.type) {
        parts.push(
          `<text x="${x + width - 8}" y="${fieldY}" text-anchor="end" ` +
            `font-family="${escapeXml(theme.fontFamily)}" font-size="${FONT_SIZE - 2}" ` +
            `fill="${escapeXml(theme.groupColor)}">${escapeXml(field.type)}</text>`,
        );
      }
    }

    // Border drawn on top of all fills (clean stroke, no fill — ensures visible rounded corners)
    parts.push(
      `<rect x="${x}" y="${y}" width="${width}" height="${height}" ` +
        `rx="${ENTITY_RX}" ry="${ENTITY_RX}" ` +
        `fill="none" stroke="${escapeXml(hdrStroke)}" stroke-width="1.5"/>`,
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
    `<svg xmlns="http://www.w3.org/2000/svg" width="${WIDTH}" height="${HEIGHT + titleH}" ` +
      `viewBox="0 0 ${WIDTH} ${HEIGHT + titleH}">`,
    ...bgParts,
    ...(titleSvg ? [titleSvg] : []),
    `<g class="er-diagram"${titleH > 0 ? ` transform="translate(0,${titleH})"` : ''}>`,
    ...parts,
    `</g>`,
    `</svg>`,
  ].join('\n');
}
