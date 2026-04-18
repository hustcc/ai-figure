import { themes } from './theme';
import { escapeXml, wrapText } from './utils';
import type { ArchDiagramOptions, NodeType } from './types';

const PAD = 24;         // outer SVG margin
const CARD_PAD = 14;    // padding inside each layer card
const LABEL_H = 40;     // layer label row height
const CELL_H = 72;      // node cell height
const CELL_GAP = 10;    // gap between adjacent node cells
const LAYER_GAP = 14;   // gap between layer cards
const CARD_RX = 10;     // card corner radius

/** Node types cycled per layer index to give each layer a distinct color. */
const LAYER_NODE_TYPES: NodeType[] = ['process', 'decision', 'terminal', 'io'];

/**
 * Generate an SVG architecture / tech-landscape diagram.
 *
 * Each layer is rendered as a rounded card with its own color.
 * TB: cards stacked vertically; LR: cards arranged horizontally.
 * Node cells inside each card use the layer's tinted fill with a colored border.
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

  const sw = theme.strokeWidth;

  if (direction === 'LR') {
    // Each layer is a column card placed left-to-right
    const maxRows = Math.max(...layers.map((l) => l.nodes.length));
    const totalCardArea = totalWidth - PAD * 2;
    const cardW = Math.floor(
      (totalCardArea - LAYER_GAP * (layers.length - 1)) / Math.max(layers.length, 1),
    );
    const nodeW = cardW - CARD_PAD * 2;
    const cardH =
      LABEL_H +
      CARD_PAD +
      maxRows * CELL_H +
      Math.max(maxRows - 1, 0) * CELL_GAP +
      CARD_PAD;
    const svgWidth =
      PAD * 2 + layers.length * cardW + LAYER_GAP * (layers.length - 1);
    const svgHeight = PAD * 2 + cardH;

    const parts: string[] = [];

    for (let li = 0; li < layers.length; li++) {
      const layer = layers[li];
      const nodeType = LAYER_NODE_TYPES[li % LAYER_NODE_TYPES.length];
      const layerFill = theme.nodeFills[nodeType];
      const layerStroke = theme.nodeStrokes[nodeType];
      const layerText = theme.textColors[nodeType];

      const cardX = PAD + li * (cardW + LAYER_GAP);
      const cardY = PAD;

      // Card background
      parts.push(
        `<rect x="${cardX}" y="${cardY}" width="${cardW}" height="${cardH}" ` +
          `rx="${CARD_RX}" fill="${escapeXml(layerFill)}" fill-opacity="0.08" ` +
          `stroke="${escapeXml(layerStroke)}" stroke-opacity="0.4" stroke-width="${sw}"/>`,
      );

      // Layer label
      parts.push(
        `<text x="${cardX + cardW / 2}" y="${cardY + LABEL_H / 2 + 2}" ` +
          `text-anchor="middle" dominant-baseline="middle" ` +
          `font-family="${escapeXml(theme.fontFamily)}" font-size="${theme.fontSize + 1}" ` +
          `fill="${escapeXml(layerStroke)}" font-weight="700">${escapeXml(layer.label)}</text>`,
      );

      // Separator below label
      parts.push(
        `<line x1="${cardX + 8}" y1="${cardY + LABEL_H}" ` +
          `x2="${cardX + cardW - 8}" y2="${cardY + LABEL_H}" ` +
          `stroke="${escapeXml(layerStroke)}" stroke-width="1" opacity="0.4"/>`,
      );

      // Node cells
      for (let ni = 0; ni < layer.nodes.length; ni++) {
        const node = layer.nodes[ni];
        const nx = cardX + CARD_PAD;
        const ny = cardY + LABEL_H + CARD_PAD + ni * (CELL_H + CELL_GAP);

        parts.push(
          `<rect x="${nx}" y="${ny}" width="${nodeW}" height="${CELL_H}" ` +
            `rx="${theme.cornerRadius}" fill="${escapeXml(layerFill)}" ` +
            `stroke="${escapeXml(layerStroke)}" stroke-opacity="0.6" stroke-width="${sw}"/>`,
        );

        const lines = wrapText(node.label, nodeW - 16, theme.fontSize);
        const lineHeight = theme.fontSize * 1.4;
        const totalH = lines.length * lineHeight;
        const startY = ny + CELL_H / 2 - totalH / 2 + lineHeight * 0.5;
        for (let idx = 0; idx < lines.length; idx++) {
          parts.push(
            `<text x="${nx + nodeW / 2}" y="${startY + idx * lineHeight}" ` +
              `text-anchor="middle" dominant-baseline="middle" ` +
              `font-family="${escapeXml(theme.fontFamily)}" font-size="${theme.fontSize}" ` +
              `fill="${escapeXml(layerText)}">${escapeXml(lines[idx])}</text>`,
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

  // TB (default): layers stacked top-to-bottom, each rendered as a card
  const innerW = totalWidth - PAD * 2;
  const maxCols = Math.max(...layers.map((l) => l.nodes.length));
  const availW = innerW - CARD_PAD * 2;
  const cellW = Math.floor(
    (availW - CELL_GAP * Math.max(maxCols - 1, 0)) / Math.max(maxCols, 1),
  );
  const cardH = LABEL_H + CARD_PAD + CELL_H + CARD_PAD;
  const totalHeight =
    PAD + layers.length * cardH + LAYER_GAP * (layers.length - 1) + PAD;

  const parts: string[] = [];

  for (let li = 0; li < layers.length; li++) {
    const layer = layers[li];
    const nodeType = LAYER_NODE_TYPES[li % LAYER_NODE_TYPES.length];
    const layerFill = theme.nodeFills[nodeType];
    const layerStroke = theme.nodeStrokes[nodeType];
    const layerText = theme.textColors[nodeType];

    const cardX = PAD;
    const cardY = PAD + li * (cardH + LAYER_GAP);

    // Card background
    parts.push(
      `<rect x="${cardX}" y="${cardY}" width="${innerW}" height="${cardH}" ` +
        `rx="${CARD_RX}" fill="${escapeXml(layerFill)}" fill-opacity="0.08" ` +
        `stroke="${escapeXml(layerStroke)}" stroke-opacity="0.4" stroke-width="${sw}"/>`,
    );

    // Layer label
    parts.push(
      `<text x="${cardX + 16}" y="${cardY + LABEL_H / 2 + 2}" ` +
        `dominant-baseline="middle" ` +
        `font-family="${escapeXml(theme.fontFamily)}" font-size="${theme.fontSize + 1}" ` +
        `fill="${escapeXml(layerStroke)}" font-weight="700">${escapeXml(layer.label)}</text>`,
    );

    // Separator below label
    parts.push(
      `<line x1="${cardX + 8}" y1="${cardY + LABEL_H}" ` +
        `x2="${cardX + innerW - 8}" y2="${cardY + LABEL_H}" ` +
        `stroke="${escapeXml(layerStroke)}" stroke-width="1" opacity="0.4"/>`,
    );

    // Node cells
    for (let ni = 0; ni < layer.nodes.length; ni++) {
      const node = layer.nodes[ni];
      const nx = cardX + CARD_PAD + ni * (cellW + CELL_GAP);
      const ny = cardY + LABEL_H + CARD_PAD;

      parts.push(
        `<rect x="${nx}" y="${ny}" width="${cellW}" height="${CELL_H}" ` +
          `rx="${theme.cornerRadius}" fill="${escapeXml(layerFill)}" ` +
          `stroke="${escapeXml(layerStroke)}" stroke-opacity="0.6" stroke-width="${sw}"/>`,
      );

      const lines = wrapText(node.label, cellW - 16, theme.fontSize);
      const lineHeight = theme.fontSize * 1.4;
      const totalLabelH = lines.length * lineHeight;
      const startY = ny + CELL_H / 2 - totalLabelH / 2 + lineHeight * 0.5;
      for (let idx = 0; idx < lines.length; idx++) {
        parts.push(
          `<text x="${nx + cellW / 2}" y="${startY + idx * lineHeight}" ` +
            `text-anchor="middle" dominant-baseline="middle" ` +
            `font-family="${escapeXml(theme.fontFamily)}" font-size="${theme.fontSize}" ` +
            `fill="${escapeXml(layerText)}">${escapeXml(lines[idx])}</text>`,
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
