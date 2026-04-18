import { themes } from './theme';
import { escapeXml, wrapText } from './utils';
import type { SequenceDiagramOptions } from './types';

const ACTOR_W = 120;
const ACTOR_H = 44;
const ACTOR_SPACING = 180; // center-to-center
const MSG_SPACING = 56;    // vertical gap between messages
const TOP_PAD = 24;
const BOTTOM_PAD = 32;
const LIFELINE_DASH = '4 4';

/**
 * Generate an SVG sequence diagram with vertical lifelines and horizontal
 * message arrows. No Dagre — layout is fully hand-computed.
 */
export function createSequenceDiagram(options: SequenceDiagramOptions): string {
  const { actors, messages, theme: themeName = 'excalidraw' } = options;

  if (actors.length === 0) {
    return `<svg xmlns="http://www.w3.org/2000/svg" width="200" height="100" viewBox="0 0 200 100"></svg>`;
  }

  const theme = Object.prototype.hasOwnProperty.call(themes, themeName)
    ? themes[themeName as keyof typeof themes]
    : themes['excalidraw'];

  const actorFill = theme.nodeFills['terminal'];
  const actorStroke = theme.nodeStrokes['terminal'];
  const actorText = theme.textColors['terminal'];
  const sw = theme.strokeWidth;

  // Actor center X positions (left-to-right)
  const sideMargin = ACTOR_W / 2 + 20;
  const actorCenterX: Map<string, number> = new Map();
  actors.forEach((a, i) => {
    actorCenterX.set(a, sideMargin + i * ACTOR_SPACING);
  });

  const svgWidth = sideMargin * 2 + (actors.length - 1) * ACTOR_SPACING;

  // Y positions
  const actorTopY = TOP_PAD;
  const actorBottomY = actorTopY + ACTOR_H;
  const firstMsgY = actorBottomY + MSG_SPACING;
  const lifelineEndY = firstMsgY + Math.max(messages.length, 1) * MSG_SPACING + BOTTOM_PAD;
  const svgHeight = lifelineEndY + BOTTOM_PAD;

  const parts: string[] = [];

  // Arrowhead marker definitions
  const arrowColor = theme.edgeColor;
  const defs =
    `<defs>\n` +
    `  <marker id="seq-arrow" markerWidth="8" markerHeight="6" refX="7" refY="3" orient="auto" markerUnits="strokeWidth">\n` +
    `    <polygon points="0 0, 8 3, 0 6, 1.5 3" fill="${escapeXml(arrowColor)}"/>\n` +
    `  </marker>\n` +
    `</defs>`;

  // Lifelines (drawn first, behind everything)
  for (const actor of actors) {
    const cx = actorCenterX.get(actor)!;
    parts.push(
      `<line x1="${cx}" y1="${actorBottomY}" x2="${cx}" y2="${lifelineEndY}" ` +
        `stroke="${escapeXml(arrowColor)}" stroke-width="1.5" ` +
        `stroke-dasharray="${LIFELINE_DASH}" opacity="0.4"/>`,
    );
  }

  // Actor boxes
  for (const actor of actors) {
    const cx = actorCenterX.get(actor)!;
    const ax = cx - ACTOR_W / 2;
    const ay = actorTopY;
    const rx = Math.min(ACTOR_H / 2, 22);
    parts.push(
      `<rect x="${ax}" y="${ay}" width="${ACTOR_W}" height="${ACTOR_H}" ` +
        `rx="${rx}" ry="${rx}" fill="${escapeXml(actorFill)}" ` +
        `stroke="${escapeXml(actorStroke)}" stroke-width="${sw}"/>`,
    );
    const lines = wrapText(actor, ACTOR_W - 12, theme.fontSize);
    const lineHeight = theme.fontSize * 1.4;
    const totalH = lines.length * lineHeight;
    const startY = ay + ACTOR_H / 2 - totalH / 2 + lineHeight * 0.5;
    for (let idx = 0; idx < lines.length; idx++) {
      parts.push(
        `<text x="${cx}" y="${startY + idx * lineHeight}" ` +
          `text-anchor="middle" dominant-baseline="middle" ` +
          `font-family="${escapeXml(theme.fontFamily)}" font-size="${theme.fontSize}" ` +
          `fill="${escapeXml(actorText)}">${escapeXml(lines[idx])}</text>`,
      );
    }
  }

  // Message arrows
  for (let mi = 0; mi < messages.length; mi++) {
    const msg = messages[mi];
    const fromX = actorCenterX.get(msg.from);
    const toX = actorCenterX.get(msg.to);
    if (fromX === undefined || toX === undefined) continue;

    const msgY = firstMsgY + mi * MSG_SPACING;
    const isReturn = msg.style === 'return';
    const dashArray = isReturn ? '6 4' : undefined;

    // Arrow line
    const pathAttrs = [
      `stroke="${escapeXml(arrowColor)}"`,
      `stroke-width="1.5"`,
      `fill="none"`,
      `marker-end="url(#seq-arrow)"`,
      dashArray ? `stroke-dasharray="${dashArray}"` : '',
    ]
      .filter(Boolean)
      .join(' ');

    parts.push(`<line x1="${fromX}" y1="${msgY}" x2="${toX}" y2="${msgY}" ${pathAttrs}/>`);

    // Label (above midpoint)
    if (msg.label) {
      const midX = (fromX + toX) / 2;
      const labelFontSize = theme.fontSize - 2;
      const padX = 5;
      const padY = 3;
      const labelW = msg.label.length * (labelFontSize * 0.58) + padX * 2;
      const labelH = labelFontSize + padY * 2;
      const labelY = msgY - 6;
      parts.push(
        `<rect x="${midX - labelW / 2}" y="${labelY - labelH}" ` +
          `width="${labelW}" height="${labelH}" fill="white" rx="3" opacity="0.9"/>`,
      );
      parts.push(
        `<text x="${midX}" y="${labelY - padY}" ` +
          `text-anchor="middle" dominant-baseline="auto" ` +
          `font-family="${escapeXml(theme.fontFamily)}" font-size="${labelFontSize}" ` +
          `fill="${escapeXml(arrowColor)}">${escapeXml(msg.label)}</text>`,
      );
    }
  }

  return [
    `<svg xmlns="http://www.w3.org/2000/svg" width="${svgWidth}" height="${svgHeight}" viewBox="0 0 ${svgWidth} ${svgHeight}">`,
    defs,
    `<g class="sequence-diagram">`,
    ...parts,
    `</g>`,
    `</svg>`,
  ].join('\n');
}
