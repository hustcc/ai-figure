import { resolveTheme } from './theme';
import { escapeXml, titleBlockHeight, renderTitleBlock } from './utils';
import type { TimelineDiagramOptions, TimelineEvent } from './types';

/** Incrementing counter for unique per-diagram SVG IDs. */
let _timelineCount = 0;

// ── Layout constants ────────────────────────────────────────────────────────
const SVG_W       = 800;
const PAD_LEFT    = 48;
const PAD_RIGHT   = 48;
const AXIS_Y      = 160;    // Y of the horizontal baseline (more room below)
const ABOVE_Y     = AXIS_Y - 36;  // label Y for above-axis items (higher up)
const BELOW_Y     = AXIS_Y + 48;  // label Y for below-axis items (lower down)
const DROP_H      = 30;     // length of the drop-line from label to dot
const DOT_R       = 6;      // normal event dot radius
const MILESTONE_R = 9;      // milestone dot radius
const TICK_H      = 7;      // tick mark half-height
const LABEL_FS    = 13;     // event label font size
const TICK_FS     = 10;     // tick date label font size
const MIN_TICK_PX = 68;     // minimum pixel gap between consecutive tick labels
// Gap constants for label drop-line endpoints (space between text baseline/cap and line end)
const LABEL_LINE_GAP_ABOVE = 4;  // pixels below label baseline to end of drop-line (above axis)
const LABEL_LINE_GAP_BELOW = 2;  // pixels above label cap-height to end of drop-line (below axis)

/** Parse a date string to a timestamp (ms since epoch). Returns NaN on failure. */
function parseEventDate(s: string): number {
  const d = new Date(s);
  return isNaN(d.getTime()) ? NaN : d.getTime();
}

/** Format a Date for the axis tick. */
function fmtTick(d: Date): string {
  const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun',
                  'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
  return `${months[d.getMonth()]} ${d.getFullYear()}`;
}

/**
 * Generate an SVG timeline diagram.
 *
 * Events are plotted on a horizontal baseline with proportional spacing.
 * Labels alternate above and below to reduce collision. Milestone events
 * render as larger, accent-colored dots with bold labels.
 */
export function createTimelineDiagram(options: TimelineDiagramOptions): string {
  const {
    events: rawEvents,
    theme: mode = 'light',
    palette,
    title,
    subtitle,
  } = options;

  const theme  = resolveTheme(palette, mode);
  const titleH = titleBlockHeight(title, subtitle, theme.fontSize);
  const uid    = `tl-${++_timelineCount}`;

  // ── Sort events by date ──────────────────────────────────────────────────
  const events: (TimelineEvent & { ts: number })[] = rawEvents
    .map((e) => ({ ...e, ts: parseEventDate(e.date) }))
    .filter((e) => !isNaN(e.ts))
    .sort((a, b) => a.ts - b.ts);

  if (events.length === 0) {
    const h = 200 + titleH;
    return `<svg xmlns="http://www.w3.org/2000/svg" width="${SVG_W}" height="${h}" viewBox="0 0 ${SVG_W} ${h}"></svg>`;
  }

  const minTs = events[0].ts;
  const maxTs = events[events.length - 1].ts;
  const rangeMs = maxTs - minTs || 1;

  // Add 4 % padding on each side (same as gantt)
  const padMs = rangeMs * 0.04;
  const plotMin = minTs - padMs;
  const plotMax = maxTs + padMs;
  const plotMs  = plotMax - plotMin;

  const PLOT_W  = SVG_W - PAD_LEFT - PAD_RIGHT;

  /** Map a timestamp to an SVG x coordinate. */
  function tsToX(ts: number): number {
    return PAD_LEFT + ((ts - plotMin) / plotMs) * PLOT_W;
  }

  // ── SVG height: enough for above/below labels + title ────────────────────
  const SVG_H = AXIS_Y + DROP_H + 100;

  const accentStroke = theme.nodeStrokes['decision'];
  const accentFill   = theme.nodeFills['decision'];

  const parts: string[] = [];

  // ── Defs ─────────────────────────────────────────────────────────────────
  parts.push(`<defs/>`);

  // ── Baseline ─────────────────────────────────────────────────────────────
  parts.push(
    `<line x1="${PAD_LEFT}" y1="${AXIS_Y}" x2="${PAD_LEFT + PLOT_W}" y2="${AXIS_Y}" ` +
      `stroke="${escapeXml(theme.edgeColor)}" stroke-width="1.5"/>`,
  );

  // ── Tick marks (aligned to month/year boundaries, skipping crowded ones) ─
  const totalDays = rangeMs / 86_400_000;
  const tickDates: Date[] = [];

  if (totalDays <= 90) {
    // Monthly ticks
    const d = new Date(plotMin);
    d.setDate(1);
    d.setHours(0, 0, 0, 0);
    while (d.getTime() <= plotMax) {
      if (d.getTime() >= plotMin) tickDates.push(new Date(d));
      d.setMonth(d.getMonth() + 1);
    }
  } else if (totalDays <= 730) {
    // Quarterly ticks
    const d = new Date(plotMin);
    d.setDate(1);
    const startQ = Math.floor(d.getMonth() / 3) * 3;
    d.setMonth(startQ, 1);
    d.setHours(0, 0, 0, 0);
    while (d.getTime() <= plotMax) {
      if (d.getTime() >= plotMin) tickDates.push(new Date(d));
      d.setMonth(d.getMonth() + 3);
    }
  } else {
    // Yearly ticks
    const d = new Date(plotMin);
    d.setMonth(0, 1);
    d.setHours(0, 0, 0, 0);
    while (d.getTime() <= plotMax) {
      if (d.getTime() >= plotMin) tickDates.push(new Date(d));
      d.setFullYear(d.getFullYear() + 1);
    }
  }

  // Filter to minimum spacing to prevent label overlap
  let prevTx = -Infinity;
  for (const tick of tickDates) {
    const tx = tsToX(tick.getTime());
    if (tx - prevTx < MIN_TICK_PX) continue;
    prevTx = tx;
    parts.push(
      `<line x1="${tx}" y1="${AXIS_Y - TICK_H}" x2="${tx}" y2="${AXIS_Y + TICK_H}" ` +
        `stroke="${escapeXml(theme.edgeColor)}" stroke-width="1" opacity="0.5"/>`,
      `<text x="${tx}" y="${AXIS_Y + TICK_H + 14}" text-anchor="middle" ` +
        `font-family="${escapeXml(theme.fontFamily)}" font-size="${TICK_FS}" ` +
        `fill="${escapeXml(theme.groupColor)}">${escapeXml(fmtTick(tick))}</text>`,
    );
  }

  // ── Events ───────────────────────────────────────────────────────────────
  for (let i = 0; i < events.length; i++) {
    const ev     = events[i];
    const ex     = tsToX(ev.ts);
    const above  = i % 2 === 0;   // alternate above / below
    const r      = ev.milestone ? MILESTONE_R : DOT_R;
    const dotFill   = ev.milestone ? accentFill   : theme.nodeStrokes['process'];
    const dotStroke = ev.milestone ? accentStroke : 'none';
    const textFill  = ev.milestone ? accentStroke : theme.edgeColor;

    // Drop-line: from just outside the dot to the label anchor
    const dotY   = AXIS_Y;
    const lineY1 = above ? dotY - r - 1 : dotY + r + 1;
    const lineY2 = above ? ABOVE_Y + LABEL_FS + LABEL_LINE_GAP_ABOVE : BELOW_Y - LABEL_FS - LABEL_LINE_GAP_BELOW;
    const labelY = above ? ABOVE_Y : BELOW_Y;

    parts.push(
      `<line x1="${ex}" y1="${lineY1}" x2="${ex}" y2="${lineY2}" ` +
        `stroke="${escapeXml(theme.groupColor)}" stroke-width="1"/>`,
    );

    // Dot (drawn after line so it's on top)
    parts.push(
      `<circle cx="${ex}" cy="${dotY}" r="${r}" ` +
        `fill="${escapeXml(dotFill)}" stroke="${escapeXml(dotStroke)}" stroke-width="1.5"/>`,
    );

    // Label
    const fw = ev.milestone ? '700' : '400';
    parts.push(
      `<text x="${ex}" y="${labelY}" text-anchor="middle" ` +
        `font-family="${escapeXml(theme.fontFamily)}" font-size="${LABEL_FS}" ` +
        `font-weight="${fw}" fill="${escapeXml(textFill)}">${escapeXml(ev.label)}</text>`,
    );
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
      `viewBox="0 0 ${SVG_W} ${SVG_H + titleH}">`,
    ...bgParts,
    ...(titleSvg ? [titleSvg] : []),
    `<g class="timeline-diagram"${titleH > 0 ? ` transform="translate(0,${titleH})"` : ''}>`,
    ...parts,
    `</g>`,
    `</svg>`,
  ].join('\n');
}
