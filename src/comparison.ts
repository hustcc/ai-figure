import { themes } from './theme';
import { escapeXml, wrapText } from './utils';
import type { ComparisonTableOptions } from './types';

const ROW_H = 44;        // data row height
const HEADER_H = 48;     // header row height
const CELL_PAD_X = 12;   // horizontal cell padding
const OUTER_RX = 8;      // outer border radius
const FEATURE_COL_W = 200;  // first (feature) column width — fixed
const DATA_COL_W = 140;     // each subsequent column width — fixed

// Special-value colours (not from theme — semantically fixed)
const COLOR_CHECK = '#22c55e';   // ✓
const COLOR_CROSS = '#ef4444';   // ✗

/**
 * Generate an SVG comparison table.
 *
 * Width is auto-calculated from the number of columns; no need to specify it.
 * The first column shows feature names; subsequent columns are the items being
 * compared.  Special values (✓ ✗ ★) receive distinct colours.
 */
export function createComparisonTable(options: ComparisonTableOptions): string {
  const {
    columns,
    rows,
    theme: themeName = 'excalidraw',
  } = options;

  const theme = Object.prototype.hasOwnProperty.call(themes, themeName)
    ? themes[themeName as keyof typeof themes]
    : themes['excalidraw'];

  const sw = theme.strokeWidth;
  const borderColor = theme.groupColor;
  const headerAccent = theme.nodeStrokes['process'];
  const starColor = theme.nodeStrokes['terminal'];
  const textMain = theme.edgeColor;

  // Auto-calculated dimensions
  const dataColCount = Math.max(columns.length - 1, 1);
  const width = FEATURE_COL_W + dataColCount * DATA_COL_W;
  const featureColW = FEATURE_COL_W;
  const dataColW = DATA_COL_W;

  // Actual SVG height = header + all rows
  const totalHeight = HEADER_H + rows.length * ROW_H;

  const parts: string[] = [];

  // ── Outer border ─────────────────────────────────────────────────────────
  parts.push(
    `<rect x="0" y="0" width="${width}" height="${totalHeight}" ` +
      `rx="${OUTER_RX}" fill="none" ` +
      `stroke="${escapeXml(borderColor)}" stroke-width="${sw}"/>`,
  );

  // ── Header row background ────────────────────────────────────────────────
  parts.push(
    `<rect x="0" y="0" width="${width}" height="${HEADER_H}" ` +
      `rx="${OUTER_RX}" fill="${escapeXml(headerAccent)}" fill-opacity="0.12" stroke="none"/>`,
    // Square off the bottom corners of the header background
    `<rect x="0" y="${HEADER_H / 2}" width="${width}" height="${HEADER_H / 2}" ` +
      `fill="${escapeXml(headerAccent)}" fill-opacity="0.12" stroke="none"/>`,
  );

  // ── Data row backgrounds (alternating) ──────────────────────────────────
  const rowFill = theme.nodeFills['process'];
  for (let ri = 0; ri < rows.length; ri++) {
    const ry = HEADER_H + ri * ROW_H;
    const opacity = ri % 2 === 0 ? 0.06 : 0.12;
    const isLast = ri === rows.length - 1;
    if (isLast) {
      // Clip bottom corners for last row
      parts.push(
        `<rect x="0" y="${ry}" width="${width}" height="${ROW_H}" ` +
          `fill="${escapeXml(rowFill)}" fill-opacity="${opacity}" stroke="none"/>`,
        // Round bottom corners by overdrawing a rect then clipping with rx
        `<rect x="0" y="${ry + ROW_H / 2}" width="${width}" height="${ROW_H / 2}" ` +
          `fill="${escapeXml(rowFill)}" fill-opacity="${opacity}" stroke="none"/>`,
        `<rect x="${OUTER_RX}" y="${ry + ROW_H / 2}" width="${width - OUTER_RX * 2}" height="${ROW_H / 2}" ` +
          `fill="${escapeXml(rowFill)}" fill-opacity="${opacity}" stroke="none"/>`,
      );
    } else {
      parts.push(
        `<rect x="1" y="${ry}" width="${width - 2}" height="${ROW_H}" ` +
          `fill="${escapeXml(rowFill)}" fill-opacity="${opacity}" stroke="none"/>`,
      );
    }
  }

  // ── Column separator lines ────────────────────────────────────────────────
  // After feature column
  parts.push(
    `<line x1="${featureColW}" y1="0" x2="${featureColW}" y2="${totalHeight}" ` +
      `stroke="${escapeXml(borderColor)}" stroke-width="1" opacity="0.35"/>`,
  );
  // Between data columns
  for (let ci = 1; ci < dataColCount; ci++) {
    const lx = featureColW + ci * dataColW;
    parts.push(
      `<line x1="${lx}" y1="0" x2="${lx}" y2="${totalHeight}" ` +
        `stroke="${escapeXml(borderColor)}" stroke-width="1" opacity="0.25"/>`,
    );
  }

  // ── Row separator lines ────────────────────────────────────────────────
  for (let ri = 0; ri <= rows.length; ri++) {
    const ly = HEADER_H + ri * ROW_H;
    if (ly === 0 || ly === totalHeight) continue;
    parts.push(
      `<line x1="1" y1="${ly}" x2="${width - 1}" y2="${ly}" ` +
        `stroke="${escapeXml(borderColor)}" stroke-width="1" opacity="0.2"/>`,
    );
  }

  // ── Header cells ─────────────────────────────────────────────────────────
  const headerY = HEADER_H / 2;
  for (let ci = 0; ci < columns.length; ci++) {
    const cx = ci === 0
      ? featureColW / 2
      : featureColW + (ci - 1) * dataColW + dataColW / 2;
    const colW = ci === 0 ? featureColW : dataColW;
    const label = columns[ci];
    const lines = wrapText(label, colW - CELL_PAD_X * 2, theme.fontSize);
    const lineH = theme.fontSize * 1.4;
    const totalLabelH = lines.length * lineH;
    const startY = headerY - totalLabelH / 2 + lineH * 0.5;
    for (let li = 0; li < lines.length; li++) {
      parts.push(
        `<text x="${cx}" y="${startY + li * lineH}" ` +
          `text-anchor="middle" dominant-baseline="middle" ` +
          `font-family="${escapeXml(theme.fontFamily)}" font-size="${theme.fontSize}" ` +
          `font-weight="700" fill="${escapeXml(headerAccent)}">${escapeXml(lines[li])}</text>`,
      );
    }
  }

  // ── Data rows ─────────────────────────────────────────────────────────────
  for (let ri = 0; ri < rows.length; ri++) {
    const row = rows[ri];
    const ry = HEADER_H + ri * ROW_H + ROW_H / 2;

    // Feature cell (first column)
    const featureLines = wrapText(row.feature, featureColW - CELL_PAD_X * 2, theme.fontSize);
    const lineH = theme.fontSize * 1.4;
    const totalFeatureH = featureLines.length * lineH;
    const featureStartY = ry - totalFeatureH / 2 + lineH * 0.5;
    for (let li = 0; li < featureLines.length; li++) {
      parts.push(
        `<text x="${CELL_PAD_X}" y="${featureStartY + li * lineH}" ` +
          `dominant-baseline="middle" ` +
          `font-family="${escapeXml(theme.fontFamily)}" font-size="${theme.fontSize}" ` +
          `fill="${escapeXml(textMain)}">${escapeXml(featureLines[li])}</text>`,
      );
    }

    // Value cells
    for (let ci = 0; ci < row.values.length; ci++) {
      const val = row.values[ci];
      const cx = featureColW + ci * dataColW + dataColW / 2;
      const colW = dataColW;

      // Determine rendering style
      if (val === '✓') {
        parts.push(
          `<text x="${cx}" y="${ry}" ` +
            `text-anchor="middle" dominant-baseline="middle" ` +
            `font-family="${escapeXml(theme.fontFamily)}" font-size="${theme.fontSize + 2}" ` +
            `fill="${COLOR_CHECK}" font-weight="700">✓</text>`,
        );
      } else if (val === '✗') {
        parts.push(
          `<text x="${cx}" y="${ry}" ` +
            `text-anchor="middle" dominant-baseline="middle" ` +
            `font-family="${escapeXml(theme.fontFamily)}" font-size="${theme.fontSize + 2}" ` +
            `fill="${COLOR_CROSS}" font-weight="700">✗</text>`,
        );
      } else if (/^★+$/.test(val)) {
        // Pure star rating — colour with terminal accent
        parts.push(
          `<text x="${cx}" y="${ry}" ` +
            `text-anchor="middle" dominant-baseline="middle" ` +
            `font-family="${escapeXml(theme.fontFamily)}" font-size="${theme.fontSize}" ` +
            `fill="${escapeXml(starColor)}">${val}</text>`,
        );
      } else {
        // Regular text — may contain mixed content; escape & wrap
        const lines = wrapText(val, colW - CELL_PAD_X * 2, theme.fontSize);
        const lineHeight = theme.fontSize * 1.4;
        const totalH = lines.length * lineHeight;
        const startY = ry - totalH / 2 + lineHeight * 0.5;
        for (let li = 0; li < lines.length; li++) {
          parts.push(
            `<text x="${cx}" y="${startY + li * lineHeight}" ` +
              `text-anchor="middle" dominant-baseline="middle" ` +
              `font-family="${escapeXml(theme.fontFamily)}" font-size="${theme.fontSize}" ` +
              `fill="${escapeXml(textMain)}">${escapeXml(lines[li])}</text>`,
          );
        }
      }
    }
  }

  return [
    `<svg xmlns="http://www.w3.org/2000/svg" width="${width}" height="${totalHeight}" viewBox="0 0 ${width} ${totalHeight}">`,
    `<g class="comparison-table">`,
    ...parts,
    `</g>`,
    `</svg>`,
  ].join('\n');
}
