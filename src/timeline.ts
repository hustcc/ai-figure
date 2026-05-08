import { resolveTheme } from './theme';
import { escapeXml, estimateTextWidth, titleBlockHeight, renderTitleBlock } from './utils';
import type { TimelineDiagramOptions, TimelineEvent } from './types';

/** Incrementing counter for unique per-diagram SVG IDs. */
let _timelineCount = 0;

// ── Layout constants ────────────────────────────────────────────────────────
const SVG_W       = 800;
const PAD_LEFT    = 48;
const PAD_RIGHT   = 48;
const BASE_AXIS_Y = 160;    // default Y of the horizontal baseline
const ABOVE_LABEL_OFFSET = 36;
const BELOW_LABEL_OFFSET = 48;
const LANE_STEP   = 28;     // extra vertical distance between stacked label lanes
const DOT_R       = 6;      // normal event dot radius
const MILESTONE_R = 9;      // milestone dot radius
const TICK_H      = 7;      // tick mark half-height
const LABEL_FS    = 13;     // event label font size
const TICK_FS     = 10;     // tick date label font size
const MIN_TICK_PX = 68;     // minimum pixel gap between consecutive tick labels
const LABEL_MIN_GAP = 12;   // minimum horizontal gap between labels on the same side
const TOP_PAD     = 24;     // minimum top padding above the highest label lane
const BASE_BOTTOM_PAD = 130; // default room for tick labels + bottom label lane
// Gap constants for label drop-line endpoints (space between text baseline/cap and line end)
const LABEL_LINE_GAP_ABOVE = 4;  // pixels below label baseline to end of drop-line (above axis)
const LABEL_LINE_GAP_BELOW = 2;  // pixels above label cap-height to end of drop-line (below axis)

type LabelAnchor = 'start' | 'middle' | 'end';

interface TimelineLabelLayout {
  ev: TimelineEvent & { ts: number };
  eventX: number;
  labelX: number;
  labelStart: number;
  labelEnd: number;
  anchor: LabelAnchor;
  above: boolean;
  lane: number;
  fontWeight: 400 | 700;
}

function findLane(lanes: number[], labelStart: number): number {
  for (let i = 0; i < lanes.length; i++) {
    if (labelStart >= lanes[i] + LABEL_MIN_GAP) return i;
  }
  return lanes.length;
}

function measureLabelSpan(
  x: number,
  width: number,
  plotLeft: number,
  plotRight: number,
): Pick<TimelineLabelLayout, 'labelX' | 'labelStart' | 'labelEnd' | 'anchor'> {
  const halfW = width / 2;
  if (x - halfW < plotLeft) {
    return {
      labelX: plotLeft,
      labelStart: plotLeft,
      labelEnd: Math.min(plotRight, plotLeft + width),
      anchor: 'start',
    };
  }
  if (x + halfW > plotRight) {
    return {
      labelX: plotRight,
      labelStart: Math.max(plotLeft, plotRight - width),
      labelEnd: plotRight,
      anchor: 'end',
    };
  }
  return {
    labelX: x,
    labelStart: x - halfW,
    labelEnd: x + halfW,
    anchor: 'middle',
  };
}

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

  const accentStroke = theme.nodeStrokes['decision'];
  const accentFill   = theme.nodeFills['decision'];
  const plotLeft = PAD_LEFT;
  const plotRight = PAD_LEFT + PLOT_W;

  const aboveLanes: number[] = [];
  const belowLanes: number[] = [];
  const layouts: TimelineLabelLayout[] = [];

  for (let i = 0; i < events.length; i++) {
    const ev = events[i];
    const eventX = tsToX(ev.ts);
    const fontWeight: 400 | 700 = ev.milestone ? 700 : 400;
    const labelWidth = estimateTextWidth(ev.label, LABEL_FS, fontWeight);
    const span = measureLabelSpan(eventX, labelWidth, plotLeft, plotRight);
    const preferredAbove = i % 2 === 0;
    const preferredLanes = preferredAbove ? aboveLanes : belowLanes;
    const alternateLanes = preferredAbove ? belowLanes : aboveLanes;
    const preferredLane = findLane(preferredLanes, span.labelStart);
    const alternateLane = findLane(alternateLanes, span.labelStart);

    // On ties, keep the original alternating side preference so stable inputs
    // produce stable output unless one side clearly offers a lower lane.
    const usePreferred = preferredLane < alternateLane
      || (preferredLane === alternateLane && preferredLanes.length <= alternateLanes.length);
    const above = usePreferred ? preferredAbove : !preferredAbove;
    const lane = usePreferred ? preferredLane : alternateLane;
    const sideLanes = above ? aboveLanes : belowLanes;
    sideLanes[lane] = span.labelEnd;

    layouts.push({
      ev,
      eventX,
      labelX: span.labelX,
      labelStart: span.labelStart,
      labelEnd: span.labelEnd,
      anchor: span.anchor,
      above,
      lane,
      fontWeight,
    });
  }

  const maxAboveLane = Math.max(0, aboveLanes.length - 1);
  const maxBelowLane = Math.max(0, belowLanes.length - 1);
  const AXIS_Y = Math.max(
    BASE_AXIS_Y,
    TOP_PAD + ABOVE_LABEL_OFFSET + LABEL_FS + maxAboveLane * LANE_STEP,
  );
  const SVG_H = AXIS_Y + BASE_BOTTOM_PAD + maxBelowLane * LANE_STEP;

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
  for (const layout of layouts) {
    const { ev, eventX: ex, labelX, anchor, above, lane, fontWeight } = layout;
    const r      = ev.milestone ? MILESTONE_R : DOT_R;
    const dotFill   = ev.milestone ? accentFill   : theme.nodeStrokes['process'];
    const dotStroke = ev.milestone ? accentStroke : 'none';
    const textFill  = ev.milestone ? accentStroke : theme.edgeColor;

    // Drop-line: from just outside the dot to the label anchor
    const dotY   = AXIS_Y;
    const lineY1 = above ? dotY - r - 1 : dotY + r + 1;
    const labelY = above
      ? AXIS_Y - ABOVE_LABEL_OFFSET - lane * LANE_STEP
      : AXIS_Y + BELOW_LABEL_OFFSET + lane * LANE_STEP;
    const lineY2 = above
      ? labelY + LABEL_FS + LABEL_LINE_GAP_ABOVE
      : labelY - LABEL_FS - LABEL_LINE_GAP_BELOW;

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
    parts.push(
      `<text x="${labelX}" y="${labelY}" text-anchor="${anchor}" ` +
        `font-family="${escapeXml(theme.fontFamily)}" font-size="${LABEL_FS}" ` +
        `font-weight="${fontWeight}" fill="${escapeXml(textFill)}">${escapeXml(ev.label)}</text>`,
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
