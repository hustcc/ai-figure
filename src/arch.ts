import { themes } from './theme';
import { escapeXml, wrapText } from './utils';
import type { ArchDiagramOptions } from './types';

const PAD = 20;
const LABEL_H = 28;
const CELL_H = 70;
const NODE_PAD = 8;
const LAYER_GAP = 0; // layers are separated by a divider line, no extra gap

/**
 * Generate an SVG architecture / tech-landscape diagram.
 * Layers are rendered as rows (TB) or columns (LR) of equal-width node cells
 * with no connecting lines.
 */
export function createArchDiagram(options: ArchDiagramOptions): string {
  const {
    layers,
    theme: themeName = 'excalidraw',
    direction = 'TB',
    width: totalWidth = 800,
  } = options;

  if (layers.length === 0) {
    return `<svg xmlns="http://www.w3.org/2000/svg" width="200" height="100" viewBox="0 0 200 100"></svg>`;
  }

  const theme = Object.prototype.hasOwnProperty.call(themes, themeName)
    ? themes[themeName as keyof typeof themes]
    : themes['excalidraw'];

  const nodeFill = theme.nodeFills['process'];
  const nodeStroke = theme.nodeStrokes['process'];
  const textColor = theme.textColors['process'];
  const sw = theme.strokeWidth;

  if (direction === 'LR') {
    // Layers placed left-to-right (each layer is a column)
    const maxRows = Math.max(...layers.map((l) => l.nodes.length));
    // For LR: width dimension corresponds to per-layer column width
    // totalWidth is interpreted as total height in LR mode; we use it for height
    const totalHeight = totalWidth; // reuse the width param as height in LR
    const colW = Math.floor((totalHeight - PAD * 2) / layers.length);
    const cellW = colW - NODE_PAD * 2;
    const rowH = Math.floor(
      (totalHeight - PAD * 2 - LABEL_H - NODE_PAD) / Math.max(maxRows, 1),
    );
    const cellHeight = Math.min(CELL_H, rowH - NODE_PAD);
    const svgHeight = LABEL_H + maxRows * (cellHeight + NODE_PAD) + PAD * 2;
    const svgWidth = layers.length * colW + PAD * 2;

    const parts: string[] = [];

    // Outer border
    parts.push(
      `<rect x="${PAD}" y="${PAD}" width="${svgWidth - PAD * 2}" height="${svgHeight - PAD * 2}" ` +
        `rx="8" fill="none" stroke="${escapeXml(theme.groupColor)}" stroke-width="1.5"/>`,
    );

    for (let li = 0; li < layers.length; li++) {
      const layer = layers[li];
      const colX = PAD + li * colW;

      // Vertical divider (except before first column)
      if (li > 0) {
        parts.push(
          `<line x1="${colX}" y1="${PAD}" x2="${colX}" y2="${svgHeight - PAD}" ` +
            `stroke="${escapeXml(theme.groupColor)}" stroke-width="1"/>`,
        );
      }

      // Layer label
      parts.push(
        `<text x="${colX + colW / 2}" y="${PAD + LABEL_H / 2 + 4}" ` +
          `text-anchor="middle" dominant-baseline="middle" ` +
          `font-family="${escapeXml(theme.fontFamily)}" font-size="${theme.fontSize}" ` +
          `fill="${escapeXml(theme.groupColor)}" font-weight="600">${escapeXml(layer.label)}</text>`,
      );

      // Nodes
      for (let ni = 0; ni < layer.nodes.length; ni++) {
        const node = layer.nodes[ni];
        const nx = colX + NODE_PAD;
        const ny = PAD + LABEL_H + ni * (cellHeight + NODE_PAD) + NODE_PAD;

        parts.push(
          `<rect x="${nx}" y="${ny}" width="${cellW}" height="${cellHeight}" ` +
            `rx="${theme.cornerRadius}" fill="${escapeXml(nodeFill)}" ` +
            `stroke="${escapeXml(nodeStroke)}" stroke-width="${sw}"/>`,
        );

        const lines = wrapText(node.label, cellW - 12, theme.fontSize);
        const lineHeight = theme.fontSize * 1.4;
        const totalH = lines.length * lineHeight;
        const startY = ny + cellHeight / 2 - totalH / 2 + lineHeight * 0.5;
        for (let idx = 0; idx < lines.length; idx++) {
          parts.push(
            `<text x="${nx + cellW / 2}" y="${startY + idx * lineHeight}" ` +
              `text-anchor="middle" dominant-baseline="middle" ` +
              `font-family="${escapeXml(theme.fontFamily)}" font-size="${theme.fontSize}" ` +
              `fill="${escapeXml(textColor)}">${escapeXml(lines[idx])}</text>`,
          );
        }
      }
    }

    return [
      `<svg xmlns="http://www.w3.org/2000/svg" width="${svgWidth}" height="${svgHeight}" viewBox="0 0 ${svgWidth} ${svgHeight}">`,
      `<g class="arch-diagram">`,
      ...parts,
      `</g>`,
      `</svg>`,
    ].join('\n');
  }

  // TB (default): layers stacked top-to-bottom
  const maxCols = Math.max(...layers.map((l) => l.nodes.length));
  const innerW = totalWidth - PAD * 2;
  const cellW = Math.floor(innerW / Math.max(maxCols, 1));

  const parts: string[] = [];

  // Compute total height first (need it for outer border)
  const layerH = LABEL_H + CELL_H + NODE_PAD * 2;
  const totalHeight = PAD * 2 + layers.length * layerH + LAYER_GAP * (layers.length - 1);

  // Outer border
  parts.push(
    `<rect x="${PAD}" y="${PAD}" width="${innerW}" height="${totalHeight - PAD * 2}" ` +
      `rx="8" fill="none" stroke="${escapeXml(theme.groupColor)}" stroke-width="1.5"/>`,
  );

  for (let li = 0; li < layers.length; li++) {
    const layer = layers[li];
    const layerY = PAD + li * layerH;

    // Horizontal divider (except before first row)
    if (li > 0) {
      parts.push(
        `<line x1="${PAD}" y1="${layerY}" x2="${PAD + innerW}" y2="${layerY}" ` +
          `stroke="${escapeXml(theme.groupColor)}" stroke-width="1"/>`,
      );
    }

    // Layer label
    parts.push(
      `<text x="${PAD + 12}" y="${layerY + LABEL_H / 2 + 4}" ` +
        `dominant-baseline="middle" ` +
        `font-family="${escapeXml(theme.fontFamily)}" font-size="${theme.fontSize}" ` +
        `fill="${escapeXml(theme.groupColor)}" font-weight="600">${escapeXml(layer.label)}</text>`,
    );

    // Nodes
    for (let ni = 0; ni < layer.nodes.length; ni++) {
      const node = layer.nodes[ni];
      const nx = PAD + ni * cellW + NODE_PAD;
      const ny = layerY + LABEL_H + NODE_PAD;
      const nodeW = cellW - NODE_PAD * 2;

      parts.push(
        `<rect x="${nx}" y="${ny}" width="${nodeW}" height="${CELL_H}" ` +
          `rx="${theme.cornerRadius}" fill="${escapeXml(nodeFill)}" ` +
          `stroke="${escapeXml(nodeStroke)}" stroke-width="${sw}"/>`,
      );

      const lines = wrapText(node.label, nodeW - 12, theme.fontSize);
      const lineHeight = theme.fontSize * 1.4;
      const totalLabelH = lines.length * lineHeight;
      const startY = ny + CELL_H / 2 - totalLabelH / 2 + lineHeight * 0.5;
      for (let idx = 0; idx < lines.length; idx++) {
        parts.push(
          `<text x="${nx + nodeW / 2}" y="${startY + idx * lineHeight}" ` +
            `text-anchor="middle" dominant-baseline="middle" ` +
            `font-family="${escapeXml(theme.fontFamily)}" font-size="${theme.fontSize}" ` +
            `fill="${escapeXml(textColor)}">${escapeXml(lines[idx])}</text>`,
        );
      }
    }
  }

  return [
    `<svg xmlns="http://www.w3.org/2000/svg" width="${totalWidth}" height="${totalHeight}" viewBox="0 0 ${totalWidth} ${totalHeight}">`,
    `<g class="arch-diagram">`,
    ...parts,
    `</g>`,
    `</svg>`,
  ].join('\n');
}
