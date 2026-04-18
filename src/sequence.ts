import { themes } from './theme';
import { escapeXml, wrapText } from './utils';
import type { SequenceDiagramOptions, NodeType } from './types';

const ACTOR_W = 120;
const ACTOR_H = 44;
const ACTOR_SPACING = 180; // center-to-center
const MSG_SPACING = 56;    // vertical gap between messages
const TOP_PAD = 24;
const BOTTOM_PAD = 32;
const LIFELINE_DASH = '4 4';
const SELF_LOOP_W = 44;    // how far right a self-message loop extends
const SELF_LOOP_H = 28;    // height of the self-message loop

/** Node types cycled by actor index so each participant has a distinct color. */
const ACTOR_NODE_TYPES: NodeType[] = ['terminal', 'process', 'decision', 'io'];

/**
 * Generate an SVG sequence diagram with vertical lifelines and horizontal
 * message arrows. No Dagre — layout is fully hand-computed.
 * Each actor is assigned a distinct color from the theme palette.
 */
export function createSequenceDiagram(options: SequenceDiagramOptions): string {
  const { actors, messages, theme: themeName = 'excalidraw' } = options;

  if (actors.length === 0) {
    return `<svg xmlns="http://www.w3.org/2000/svg" width="200" height="100" viewBox="0 0 200 100"></svg>`;
  }

  const theme = Object.prototype.hasOwnProperty.call(themes, themeName)
    ? themes[themeName as keyof typeof themes]
    : themes['excalidraw'];

  const sw = theme.strokeWidth;

  // Helper: NodeType for actor at index i
  const actorType = (i: number): NodeType => ACTOR_NODE_TYPES[i % ACTOR_NODE_TYPES.length];

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

  // Arrowhead marker definitions + animation styles
  const arrowColor = theme.edgeColor;
  const defs =
    `<defs>\n` +
    `  <marker id="seq-arrow" markerWidth="8" markerHeight="6" refX="7" refY="3" orient="auto" markerUnits="strokeWidth">\n` +
    `    <polygon points="0 0, 8 3, 0 6, 1.5 3" fill="${escapeXml(arrowColor)}"/>\n` +
    `  </marker>\n` +
    `  <style>\n` +
    `    .seq-lifeline { animation: seq-lifeline-march 1.2s linear infinite; }\n` +
    `    .seq-return   { animation: seq-dash-march 0.8s linear infinite; }\n` +
    `    @keyframes seq-lifeline-march { to { stroke-dashoffset: -8; } }\n` +
    `    @keyframes seq-dash-march     { to { stroke-dashoffset: -10; } }\n` +
    `  </style>\n` +
    `</defs>`;

  // Lifelines (drawn first, behind everything) — colored per actor
  actors.forEach((actor, i) => {
    const cx = actorCenterX.get(actor)!;
    const lifelineColor = theme.nodeStrokes[actorType(i)];
    parts.push(
      `<line x1="${cx}" y1="${actorBottomY}" x2="${cx}" y2="${lifelineEndY}" ` +
        `stroke="${escapeXml(lifelineColor)}" stroke-width="1.5" ` +
        `stroke-dasharray="${LIFELINE_DASH}" opacity="0.4" class="seq-lifeline"/>`,
    );
  });

  // Actor boxes — each gets its own color
  actors.forEach((actor, i) => {
    const cx = actorCenterX.get(actor)!;
    const ax = cx - ACTOR_W / 2;
    const ay = actorTopY;
    const rx = Math.min(ACTOR_H / 2, 22);
    const actorFill = theme.nodeFills[actorType(i)];
    const actorStroke = theme.nodeStrokes[actorType(i)];
    const actorText = theme.textColors[actorType(i)];
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
  });

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
      isReturn ? `class="seq-return"` : '',
    ]
      .filter(Boolean)
      .join(' ');

    // Arrow line — self-messages rendered as a small right-down-left loop
    if (fromX === toX) {
      const loopX = fromX + SELF_LOOP_W;
      const loopBottomY = msgY + SELF_LOOP_H;
      // The last segment goes right→left so marker-end naturally points left
      const pathD = `M ${fromX},${msgY} H ${loopX} V ${loopBottomY} H ${fromX}`;
      parts.push(`<path d="${pathD}" ${pathAttrs}/>`);

      // Label: to the right of the loop, vertically centered on it
      if (msg.label) {
        const labelX = loopX + 6;
        const labelFontSize = theme.fontSize - 2;
        const padX = 5;
        const padY = 3;
        const labelW = msg.label.length * (labelFontSize * 0.58) + padX * 2;
        const labelH = labelFontSize + padY * 2;
        const labelMidY = msgY + SELF_LOOP_H / 2;
        parts.push(
          `<rect x="${labelX}" y="${labelMidY - labelH / 2}" ` +
            `width="${labelW}" height="${labelH}" fill="white" rx="3" opacity="0.9"/>`,
        );
        parts.push(
          `<text x="${labelX + labelW / 2}" y="${labelMidY}" ` +
            `text-anchor="middle" dominant-baseline="middle" ` +
            `font-family="${escapeXml(theme.fontFamily)}" font-size="${labelFontSize}" ` +
            `fill="${escapeXml(arrowColor)}">${escapeXml(msg.label)}</text>`,
        );
      }
    } else {
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
          `<text x="${midX}" y="${labelY - labelH / 2}" ` +
            `text-anchor="middle" dominant-baseline="middle" ` +
            `font-family="${escapeXml(theme.fontFamily)}" font-size="${labelFontSize}" ` +
            `fill="${escapeXml(arrowColor)}">${escapeXml(msg.label)}</text>`,
        );
      }
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
