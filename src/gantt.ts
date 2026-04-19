import { resolveTheme } from './theme';
import { escapeXml, titleBlockHeight, renderTitleBlock } from './utils';
import type { GanttChartOptions, NodeType } from './types';

// ── Layout constants ────────────────────────────────────────────────────────
const LABEL_W    = 160;  // left label column width
const PLOT_W     = 620;  // chart area width (right of LABEL_W)
const PAD_RIGHT  = 24;   // right margin
const HEADER_H   = 44;   // time axis row height
const ROW_H      = 34;   // task / group-header row height
const BAR_H      = 20;   // task bar height (vertically centered in ROW_H)
const BAR_OFFSET = (ROW_H - BAR_H) / 2;
const PAD_BOTTOM = 24;   // bottom margin
const LABEL_PAD  = 8;    // left padding inside label column
const INDENT     = 14;   // indent for grouped tasks inside label column

const MILESTONE_HALF     = 7;    // half-size of the milestone diamond
const MILESTONE_Y_RATIO  = 0.68; // vertical position of milestone diamond in header (below tick labels)

// Total SVG width (label column + plot + right margin)
const SVG_W = LABEL_W + PLOT_W + PAD_RIGHT; // 804 px

// Milliseconds per day — used when computing date ranges and padding
const MS_PER_DAY = 86_400_000;

// Fraction of total date range added as visual padding on each side of the chart
const CHART_PADDING_RATIO = 0.04;

// Node types cycled by task index for automatic bar color assignment
const BAR_NODE_TYPES: NodeType[] = ['process', 'terminal', 'decision', 'io'];

// Per-diagram UID counter (prevents SVG defs ID collisions in multi-diagram pages)
let _ganttCount = 0;

// ── Date utilities ──────────────────────────────────────────────────────────

/** Parse a `"yyyy-mm-dd"` string into a local-timezone Date. */
function parseDate(s: string): Date {
  const [y, m, d] = s.split('-').map(Number);
  return new Date(y, m - 1, d);
}

/** Map a Date to an SVG x-coordinate inside the plot area. */
function dateToX(date: Date, minTime: number, totalMs: number): number {
  return LABEL_W + Math.round(((date.getTime() - minTime) / totalMs) * PLOT_W);
}

/** Build tick dates and a label formatter based on the total date range. */
function buildTicks(
  minDate: Date,
  maxDate: Date,
): { dates: Date[]; fmt: (d: Date) => string } {
  const totalDays = (maxDate.getTime() - minDate.getTime()) / MS_PER_DAY;

  if (totalDays <= 63) {
    // Weekly ticks — align to Monday
    const dates: Date[] = [];
    const cur = new Date(minDate);
    const dow = cur.getDay();
    cur.setDate(cur.getDate() - ((dow + 6) % 7)); // rewind to Monday
    while (cur <= maxDate) {
      if (cur >= minDate) dates.push(new Date(cur));
      cur.setDate(cur.getDate() + 7);
    }
    return {
      dates,
      fmt: (d: Date) => `${d.getMonth() + 1}/${d.getDate()}`,
    };
  }

  if (totalDays <= 400) {
    // Monthly ticks — 1st of each month
    const MONTHS = ['Jan','Feb','Mar','Apr','May','Jun',
                    'Jul','Aug','Sep','Oct','Nov','Dec'];
    const dates: Date[] = [];
    const cur = new Date(minDate.getFullYear(), minDate.getMonth(), 1);
    while (cur <= maxDate) {
      if (cur >= minDate) dates.push(new Date(cur));
      cur.setMonth(cur.getMonth() + 1);
    }
    return {
      dates,
      fmt: (d: Date) => `${MONTHS[d.getMonth()]} ${d.getFullYear()}`,
    };
  }

  // Quarterly ticks — 1st of Jan / Apr / Jul / Oct
  const dates: Date[] = [];
  const startQ = Math.floor(minDate.getMonth() / 3);
  const cur = new Date(minDate.getFullYear(), startQ * 3, 1);
  while (cur <= maxDate) {
    if (cur >= minDate) dates.push(new Date(cur));
    cur.setMonth(cur.getMonth() + 3);
  }
  return {
    dates,
    fmt: (d: Date) => {
      const q = Math.floor(d.getMonth() / 3) + 1;
      return `${d.getFullYear()} Q${q}`;
    },
  };
}

// ── Row model ───────────────────────────────────────────────────────────────

interface GroupRow { type: 'group'; id: string }
interface TaskRow  { type: 'task';  task: import('./types').GanttTask; indent: boolean; colorIdx: number }
type Row = GroupRow | TaskRow;

// ── Renderer ────────────────────────────────────────────────────────────────

/**
 * Generate a self-contained SVG Gantt chart.
 *
 * Canvas width is fixed at 804 px (160 px label column + 620 px chart area +
 * 24 px right margin). Height auto-adapts to the number of task/group rows.
 * A time axis is drawn across the top; task bars are colored by cycling through
 * the theme palette; milestones appear as amber diamonds with dashed vertical lines.
 */
export function createGanttChart(options: GanttChartOptions): string {
  const {
    tasks,
    milestones = [],
    theme: mode = 'light',
    palette,
    title,
    subtitle,
  } = options;

  const theme   = resolveTheme(palette, mode);
  const titleH  = titleBlockHeight(title, subtitle, theme.fontSize);

  // ── Gather all dates and compute chart time range ──────────────────────
  const allDates: Date[] = [
    ...tasks.flatMap(t => [parseDate(t.start), parseDate(t.end)]),
    ...milestones.map(m => parseDate(m.date)),
  ];

  if (allDates.length === 0) {
    // Empty chart — return minimal SVG with optional title block
    const svgH = titleH + HEADER_H + PAD_BOTTOM;
    const bgParts = theme.background
      ? [`<rect width="100%" height="100%" fill="${theme.background}"/>`]
      : [];
    const titleSvg = renderTitleBlock(
      title, subtitle, SVG_W / 2, 0,
      theme.fontFamily, theme.fontSize, theme.edgeColor, theme.groupColor,
    );
    return [
      `<svg xmlns="http://www.w3.org/2000/svg" width="${SVG_W}" height="${svgH}" viewBox="0 0 ${SVG_W} ${svgH}">`,
      ...bgParts,
      ...(titleSvg ? [titleSvg] : []),
      `</svg>`,
    ].join('\n');
  }

  // Extend the visible range by ≈4 % on each side (minimum 2 days) so bars
  // never touch the plot edges.
  const rawMin   = Math.min(...allDates.map(d => d.getTime()));
  const rawMax   = Math.max(...allDates.map(d => d.getTime()));
  const padMs    = Math.max((rawMax - rawMin) * CHART_PADDING_RATIO, MS_PER_DAY * 2);
  const minTime  = rawMin - padMs;
  const maxTime  = rawMax + padMs;
  const totalMs  = maxTime - minTime;
  const minDate  = new Date(minTime);
  const maxDate  = new Date(maxTime);

  // ── Build row list ────────────────────────────────────────────────────
  const rows: Row[] = [];
  const seenGroups = new Set<string>();
  let colorIdx = 0;

  // Ungrouped tasks first
  for (const task of tasks.filter(t => !t.groupId)) {
    rows.push({ type: 'task', task, indent: false, colorIdx: colorIdx++ });
  }

  // Grouped tasks: emit group-header row on first encounter, then the task
  for (const task of tasks.filter(t => !!t.groupId)) {
    const gid = task.groupId!;
    if (!seenGroups.has(gid)) {
      seenGroups.add(gid);
      rows.push({ type: 'group', id: gid });
    }
    rows.push({ type: 'task', task, indent: true, colorIdx: colorIdx++ });
  }

  // ── Dimensions ───────────────────────────────────────────────────────
  const diagramH = HEADER_H + rows.length * ROW_H + PAD_BOTTOM;
  const SVG_H    = titleH + diagramH;

  const uid   = `gantt-${++_ganttCount}`;
  const parts: string[] = [];

  // ── Defs ─────────────────────────────────────────────────────────────
  // Clip-path prevents label text from spilling into the chart area
  parts.push(
    `<defs>` +
      `<clipPath id="${uid}-lclip">` +
      `<rect x="0" y="0" width="${LABEL_W - 4}" height="${diagramH}"/>` +
      `</clipPath>` +
      `</defs>`,
  );

  // ── Header background ─────────────────────────────────────────────────
  parts.push(
    `<rect x="0" y="0" width="${SVG_W}" height="${HEADER_H}" ` +
      `fill="${escapeXml(theme.groupFill)}" stroke="none"/>`,
  );

  // Header bottom border
  parts.push(
    `<line x1="0" y1="${HEADER_H}" x2="${SVG_W}" y2="${HEADER_H}" ` +
      `stroke="${escapeXml(theme.groupColor)}" stroke-width="1" opacity="0.4"/>`,
  );

  // Column separator (label column | chart area)
  parts.push(
    `<line x1="${LABEL_W}" y1="0" x2="${LABEL_W}" y2="${diagramH}" ` +
      `stroke="${escapeXml(theme.groupColor)}" stroke-width="1" opacity="0.4"/>`,
  );

  // ── Time-axis ticks and vertical grid lines ────────────────────────
  const { dates: tickDates, fmt: tickFmt } = buildTicks(minDate, maxDate);

  // Approximate per-character pixel width for overlap detection.
  // Proportional sans-serif at (fontSize-2) ≈ 0.62 × fontSize.
  const CHAR_W = (theme.fontSize - 2) * 0.62;
  // Tracks the x position of the right edge of the last rendered label so we
  // can skip any label whose left edge would collide with it.
  let lastLabelRight = LABEL_W;

  for (const td of tickDates) {
    const tx = dateToX(td, minTime, totalMs);
    if (tx <= LABEL_W || tx >= LABEL_W + PLOT_W) continue;

    // Subtle dashed vertical grid line through chart rows
    parts.push(
      `<line x1="${tx}" y1="${HEADER_H}" x2="${tx}" y2="${diagramH - PAD_BOTTOM}" ` +
        `stroke="${escapeXml(theme.groupColor)}" stroke-width="1" ` +
        `stroke-dasharray="3 4" opacity="0.25"/>`,
    );

    // Tick mark in header area
    parts.push(
      `<line x1="${tx}" y1="${HEADER_H - 6}" x2="${tx}" y2="${HEADER_H}" ` +
        `stroke="${escapeXml(theme.groupColor)}" stroke-width="1" opacity="0.6"/>`,
    );

    // Tick label centered above tick mark — skipped when it would overlap
    // the previous visible label (2 px minimum gap between labels).
    const labelText  = tickFmt(td);
    const labelHalfW = (labelText.length * CHAR_W) / 2;
    if (tx - labelHalfW >= lastLabelRight + 2) {
      parts.push(
        `<text x="${tx}" y="${HEADER_H / 2 - 2}" ` +
          `text-anchor="middle" dominant-baseline="middle" ` +
          `font-family="${escapeXml(theme.fontFamily)}" font-size="${theme.fontSize - 2}" ` +
          `fill="${escapeXml(theme.edgeColor)}" opacity="0.7">${escapeXml(labelText)}</text>`,
      );
      lastLabelRight = tx + labelHalfW;
    }
  }

  // ── Task / group rows ─────────────────────────────────────────────────
  for (let i = 0; i < rows.length; i++) {
    const row  = rows[i];
    const rowY = HEADER_H + i * ROW_H;

    // Alternating row tint (even = subtle background)
    if (i % 2 === 0) {
      parts.push(
        `<rect x="0" y="${rowY}" width="${SVG_W}" height="${ROW_H}" ` +
          `fill="${escapeXml(theme.groupFill)}" stroke="none"/>`,
      );
    }

    // Row separator
    parts.push(
      `<line x1="0" y1="${rowY + ROW_H}" x2="${SVG_W}" y2="${rowY + ROW_H}" ` +
        `stroke="${escapeXml(theme.groupColor)}" stroke-width="1" opacity="0.15"/>`,
    );

    if (row.type === 'group') {
      // Group header label — bold, using edgeColor
      parts.push(
        `<text x="${LABEL_PAD}" y="${rowY + ROW_H / 2}" ` +
          `dominant-baseline="middle" ` +
          `font-family="${escapeXml(theme.fontFamily)}" font-size="${theme.fontSize - 1}" ` +
          `font-weight="700" fill="${escapeXml(theme.edgeColor)}" ` +
          `clip-path="url(#${uid}-lclip)">${escapeXml(row.id)}</text>`,
      );
    } else {
      // ── Task row ────────────────────────────────────────────────────
      const { task, indent, colorIdx: ci } = row;
      const nt = BAR_NODE_TYPES[ci % BAR_NODE_TYPES.length];

      // Determine bar colors: user-supplied hex overrides the theme cycle
      let barFill:   string;
      let barStroke: string;
      let textFill:  string;

      if (task.color) {
        const is6Hex = /^#[0-9a-fA-F]{6}$/.test(task.color);
        barFill   = is6Hex ? task.color + (mode === 'dark' ? '30' : '28') : task.color;
        barStroke = task.color;
        textFill  = task.color;
      } else {
        barFill   = theme.nodeFills[nt];
        barStroke = theme.nodeStrokes[nt];
        textFill  = theme.textColors[nt];
      }

      // Label in left column
      const labelX = indent ? LABEL_PAD + INDENT : LABEL_PAD;
      parts.push(
        `<text x="${labelX}" y="${rowY + ROW_H / 2}" ` +
          `dominant-baseline="middle" ` +
          `font-family="${escapeXml(theme.fontFamily)}" font-size="${theme.fontSize - 1}" ` +
          `fill="${escapeXml(theme.edgeColor)}" ` +
          `clip-path="url(#${uid}-lclip)">${escapeXml(task.label)}</text>`,
      );

      // Task bar
      const startX = dateToX(parseDate(task.start), minTime, totalMs);
      const endX   = dateToX(parseDate(task.end),   minTime, totalMs);
      const barW   = Math.max(4, endX - startX);
      const barY   = rowY + BAR_OFFSET;

      parts.push(
        `<rect x="${startX}" y="${barY}" width="${barW}" height="${BAR_H}" ` +
          `fill="${escapeXml(barFill)}" stroke="${escapeXml(barStroke)}" ` +
          `stroke-width="1.5" rx="${theme.cornerRadius}"/>`,
      );

      // Inline bar label when the bar is wide enough to fit text
      if (barW >= 64) {
        parts.push(
          `<text x="${startX + barW / 2}" y="${barY + BAR_H / 2}" ` +
            `text-anchor="middle" dominant-baseline="middle" ` +
            `font-family="${escapeXml(theme.fontFamily)}" font-size="${theme.fontSize - 3}" ` +
            `fill="${escapeXml(textFill)}">${escapeXml(task.label)}</text>`,
        );
      }
    }
  }

  // ── Milestones ────────────────────────────────────────────────────────
  // Render as a dashed vertical line + amber diamond in the header area + label
  const msColor = theme.nodeStrokes['decision']; // amber from default palette
  for (const ms of milestones) {
    const mx = dateToX(parseDate(ms.date), minTime, totalMs);
    if (mx <= LABEL_W || mx >= LABEL_W + PLOT_W) continue;

    // Dashed vertical line through all chart rows
    parts.push(
      `<line x1="${mx}" y1="${HEADER_H}" x2="${mx}" y2="${HEADER_H + rows.length * ROW_H}" ` +
        `stroke="${escapeXml(msColor)}" stroke-width="1.5" stroke-dasharray="4 3"/>`,
    );

    // Diamond in the lower portion of the header (clear of tick labels)
    const half = MILESTONE_HALF;
    const my   = Math.round(HEADER_H * MILESTONE_Y_RATIO);
    parts.push(
      `<polygon ` +
        `points="${mx},${my - half} ${mx + half},${my} ${mx},${my + half} ${mx - half},${my}" ` +
        `fill="${escapeXml(msColor)}" stroke="none"/>`,
    );

    // Milestone label in the bottom padding area (below all task rows, no overlap with bars)
    const msLabelY = HEADER_H + rows.length * ROW_H + 4;
    parts.push(
      `<text x="${mx}" y="${msLabelY}" ` +
        `text-anchor="middle" dominant-baseline="hanging" ` +
        `font-family="${escapeXml(theme.fontFamily)}" font-size="${theme.fontSize - 3}" ` +
        `fill="${escapeXml(msColor)}">${escapeXml(ms.label)}</text>`,
    );
  }

  // ── Outer border ───────────────────────────────────────────────────────
  parts.push(
    `<rect x="0" y="0" width="${SVG_W}" height="${diagramH}" ` +
      `fill="none" stroke="${escapeXml(theme.groupColor)}" stroke-width="1" opacity="0.4"/>`,
  );

  // ── Assemble final SVG ────────────────────────────────────────────────
  const bgParts: string[] = theme.background
    ? [`<rect width="100%" height="100%" fill="${theme.background}"/>`]
    : [];

  const titleSvg = renderTitleBlock(
    title, subtitle, SVG_W / 2, 0,
    theme.fontFamily, theme.fontSize, theme.edgeColor, theme.groupColor,
  );

  return [
    `<svg xmlns="http://www.w3.org/2000/svg" width="${SVG_W}" height="${SVG_H}" viewBox="0 0 ${SVG_W} ${SVG_H}">`,
    ...bgParts,
    ...(titleSvg ? [titleSvg] : []),
    `<g class="gantt-chart"${titleH > 0 ? ` transform="translate(0,${titleH})"` : ''}>`,
    ...parts,
    `</g>`,
    `</svg>`,
  ].join('\n');
}
