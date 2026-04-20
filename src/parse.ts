import type {
  FigOptions,
  FlowNode,
  FlowEdge,
  FlowGroup,
  TreeNode,
  ArchLayer,
  SeqMessage,
  QuadrantPoint,
  GanttTask,
  GanttMilestone,
  StateNode,
  StateTransition,
  ErEntity,
  ErField,
  ErRelation,
  TimelineEvent,
  SwimlaneNode,
  SwimlaneEdge,
  Direction,
  ThemeType,
  PaletteType,
  NodeType,
} from './types';

// ---------------------------------------------------------------------------
// Public API
// ---------------------------------------------------------------------------

/**
 * Parse a Mermaid-like markdown diagram definition and return a {@link FigOptions} object.
 *
 * The first non-empty line is the **header**: `<type> [direction] [theme] [palette]`
 *
 * - `type`      — one of `flow`, `tree`, `arch`, `sequence`, `quadrant`, `gantt`,
 *                 `state`, `er`, `timeline`, `swimlane`
 * - `direction` — `TB` (top→bottom) or `LR` (left→right); applies to flow / tree / arch
 * - `theme`     — `light` (default) or `dark`
 * - `palette`   — any named palette: `default`, `antv`, `drawio`, `figma`, `vega`,
 *                 `mono-blue`, `mono-green`, `mono-purple`, `mono-orange`
 *
 * Lines starting with `%%` are treated as comments and ignored.
 * `title:` and `subtitle:` meta-lines are supported in all diagram types.
 *
 * Throws if the input is empty or the figure type is not recognised.
 * For a fault-tolerant render path that never throws (useful with streaming AI output),
 * use `fig(markdown)` instead.
 *
 * @example
 * ```
 * parseFigmd(`
 *   flow LR antv
 *   title: CI Pipeline
 *   code[Write Code] --> test{Tests Pass?}
 *   test -->|yes| build[Build Image]
 *   test -->|no| fix((Fix Issues))
 *   build --> deploy[/Deploy/]
 *   group Pipeline: code, test, build, deploy
 * `);
 * ```
 */
export function parseFigmd(markdown: string): FigOptions {
  const lines = markdown.split('\n');

  // Find the first non-empty line (the header)
  let headerIdx = 0;
  while (headerIdx < lines.length && lines[headerIdx].trim() === '') headerIdx++;
  if (headerIdx >= lines.length) throw new Error('figmd: empty diagram definition');

  // Parse header: "<type> [options...]"
  const headerTokens = lines[headerIdx].trim().split(/\s+/);
  const figureType = headerTokens[0].toLowerCase();

  let direction: Direction | undefined;
  let theme: ThemeType | undefined;
  let palette: PaletteType | undefined;

  for (let j = 1; j < headerTokens.length; j++) {
    const t = headerTokens[j];
    if (t === 'TB' || t === 'LR') {
      direction = t as Direction;
    } else if (t === 'light' || t === 'dark') {
      theme = t as ThemeType;
    } else {
      palette = t;
    }
  }

  const bodyLines = lines.slice(headerIdx + 1);

  switch (figureType) {
    case 'flow':
      return parseFlow(bodyLines, direction, theme, palette);
    case 'tree':
      return parseTree(bodyLines, direction, theme, palette);
    case 'arch':
      return parseArch(bodyLines, direction, theme, palette);
    case 'sequence':
      return parseSequence(bodyLines, theme, palette);
    case 'quadrant':
      return parseQuadrant(bodyLines, theme, palette);
    case 'gantt':
      return parseGantt(bodyLines, theme, palette);
    case 'state':
      return parseState(bodyLines, theme, palette);
    case 'er':
      return parseEr(bodyLines, theme, palette);
    case 'timeline':
      return parseTimeline(bodyLines, theme, palette);
    case 'swimlane':
      return parseSwimlane(bodyLines, theme, palette);
    default:
      throw new Error(
        `figmd: unknown figure type "${figureType}". ` +
          `Expected one of: flow, tree, arch, sequence, quadrant, gantt, ` +
          `state, er, timeline, swimlane`,
      );
  }
}

// ---------------------------------------------------------------------------
// Shared utilities
// ---------------------------------------------------------------------------

interface Meta {
  title?: string;
  subtitle?: string;
  /** Body lines with comments and blank lines stripped, and title/subtitle removed. */
  rest: string[];
}

/** Strip blank lines and comments; extract title/subtitle meta-lines. */
function extractMeta(lines: string[]): Meta {
  let title: string | undefined;
  let subtitle: string | undefined;
  const rest: string[] = [];

  for (const rawLine of lines) {
    const line = rawLine.trim();
    if (!line || line.startsWith('%%')) continue;

    // Use startsWith + slice to avoid regex backtracking on meta-lines
    if (line.startsWith('title:')) {
      title = line.slice('title:'.length).trim();
      continue;
    }

    if (line.startsWith('subtitle:')) {
      subtitle = line.slice('subtitle:'.length).trim();
      continue;
    }

    rest.push(line);
  }

  return { title, subtitle, rest };
}

/**
 * Split a line on the first occurrence of `arrow` and return `[left, right]` after
 * trimming, or `null` if the arrow is absent or either side is empty.
 *
 * Using indexOf instead of a regex avoids polynomial backtracking on long lines.
 */
function splitOnArrow(line: string, arrow: string): [string, string] | null {
  const idx = line.indexOf(arrow);
  if (idx === -1) return null;
  const left = line.slice(0, idx).trim();
  const right = line.slice(idx + arrow.length).trim();
  if (!left || !right) return null;
  return [left, right];
}

/**
 * Parse a node expression such as `id[label]`, `id{label}`, `id((label))`, or `id[/label/]`.
 * Returns the node id, label, and shape type. A bare identifier (no brackets) defaults to
 * type `'process'` with the id used as the label.
 *
 * | Notation       | Shape      |
 * |----------------|------------|
 * | `id[label]`    | process    |
 * | `id{label}`    | decision   |
 * | `id((label))`  | terminal   |
 * | `id[/label/]`  | io         |
 * | `id`           | process    |
 */
function parseNodeExpr(expr: string): { id: string; label: string; type: NodeType } {
  expr = expr.trim();

  // terminal: id((label))
  const terminalMatch = expr.match(/^([\w-]+)\(\((.+)\)\)$/s);
  if (terminalMatch) return { id: terminalMatch[1], label: terminalMatch[2], type: 'terminal' };

  // io: id[/label/]
  const ioMatch = expr.match(/^([\w-]+)\[\/(.+)\/\]$/s);
  if (ioMatch) return { id: ioMatch[1], label: ioMatch[2], type: 'io' };

  // process: id[label]
  const processMatch = expr.match(/^([\w-]+)\[(.+)\]$/s);
  if (processMatch) return { id: processMatch[1], label: processMatch[2], type: 'process' };

  // decision: id{label}
  const decisionMatch = expr.match(/^([\w-]+)\{(.+)\}$/s);
  if (decisionMatch) return { id: decisionMatch[1], label: decisionMatch[2], type: 'decision' };

  // bare identifier — use as-is, default to process
  return { id: expr, label: expr, type: 'process' };
}

/** Returns true when the expression carries explicit label/shape notation (e.g. `id[label]`). */
function isExplicitNodeExpr(expr: string, id: string): boolean {
  return expr.trim() !== id;
}

// ---------------------------------------------------------------------------
// Flow parser
// ---------------------------------------------------------------------------

/**
 * Parse flow diagram body lines.
 *
 * **Node notation** (inline in edge statements or standalone):
 * - `id[label]`   — process (rectangle)
 * - `id{label}`   — decision (diamond)
 * - `id((label))` — terminal (pill)
 * - `id[/label/]` — io (parallelogram)
 *
 * **Edge statements:**
 * - `A --> B`           — simple edge
 * - `A -->|label| B`    — edge with label
 *
 * **Group statements:**
 * - `group GroupName: id1, id2, ...`
 *
 * @example
 * ```
 * flow LR antv
 * title: CI Pipeline
 * code[Write Code] --> test{Tests Pass?}
 * test -->|yes| build[Build Image]
 * test -->|no| fix((Fix Issues))
 * fix --> code
 * build --> deploy[/Deploy/]
 * group Pipeline: code, test, build
 * ```
 */
function parseFlow(
  lines: string[],
  direction?: Direction,
  theme?: ThemeType,
  palette?: PaletteType,
): FigOptions {
  const { title, subtitle, rest } = extractMeta(lines);
  const nodeMap = new Map<string, FlowNode>();
  const edges: FlowEdge[] = [];
  const groups: FlowGroup[] = [];

  const ensureNode = (expr: string): string => {
    const { id, label, type } = parseNodeExpr(expr);
    const existing = nodeMap.get(id);
    if (!existing) {
      nodeMap.set(id, { id, label, type });
    } else if (isExplicitNodeExpr(expr, id)) {
      // Later explicit definitions (e.g. `b[Build]`) refine earlier bare-id references.
      nodeMap.set(id, { id, label, type });
    }
    return id;
  };

  for (const line of rest) {
    // group GroupLabel: id1, id2, ...
    // Use startsWith + indexOf(':') to avoid backtracking
    if (line.startsWith('group ')) {
      const body = line.slice('group '.length);
      const colonIdx = body.indexOf(':');
      if (colonIdx !== -1) {
        const label = body.slice(0, colonIdx).trim();
        const nodeList = body.slice(colonIdx + 1).trim();
        const nodes = nodeList
          .split(',')
          .map((n) => n.trim())
          .filter((n) => n.length > 0);
        if (nodes.length === 0) continue;
        groups.push({
          id: `grp-${groups.length}`,
          label,
          nodes,
        });
      }
      continue;
    }

    // Edges: use splitOnArrow to avoid backtracking regex
    if (line.includes('-->')) {
      const parts = splitOnArrow(line, '-->');
      if (parts) {
        const [left, rightRaw] = parts;
        let right = rightRaw;
        let label: string | undefined;

        // labeled edge: right starts with |label|
        if (right.startsWith('|')) {
          const closePipe = right.indexOf('|', 1);
          if (closePipe !== -1) {
            label = right.slice(1, closePipe).trim();
            right = right.slice(closePipe + 1).trim();
          }
        }

        if (!right) continue;

        const fromId = ensureNode(left);
        const toId = ensureNode(right);
        edges.push(label !== undefined ? { from: fromId, to: toId, label } : { from: fromId, to: toId });
        continue;
      }
    }

    // standalone node definition
    ensureNode(line);
  }

  return {
    figure: 'flow',
    nodes: [...nodeMap.values()],
    edges,
    ...(groups.length > 0 ? { groups } : {}),
    ...(direction !== undefined ? { direction } : {}),
    ...(theme !== undefined ? { theme } : {}),
    ...(palette !== undefined ? { palette } : {}),
    ...(title !== undefined ? { title } : {}),
    ...(subtitle !== undefined ? { subtitle } : {}),
  };
}

// ---------------------------------------------------------------------------
// Tree parser
// ---------------------------------------------------------------------------

/**
 * Parse tree diagram body lines.
 *
 * Same node notation as the flow parser. Parent→child relationships are expressed
 * with `-->` edges. Root nodes (no parent) can be declared as standalone lines.
 *
 * @example
 * ```
 * tree TB
 * title: Org Chart
 * ceo[CEO]
 * ceo --> cto[CTO]
 * ceo --> coo[COO]
 * cto --> dev[Developer]
 * ```
 */
function parseTree(
  lines: string[],
  direction?: Direction,
  theme?: ThemeType,
  palette?: PaletteType,
): FigOptions {
  const { title, subtitle, rest } = extractMeta(lines);
  const nodeMap = new Map<string, TreeNode>();

  const ensureNode = (expr: string, parent?: string): string => {
    const { id, label } = parseNodeExpr(expr);
    const existing = nodeMap.get(id);
    if (!existing) {
      nodeMap.set(id, { id, label, ...(parent !== undefined ? { parent } : {}) });
      return id;
    }
    // Later explicit labels refine earlier bare-id references.
    if (isExplicitNodeExpr(expr, id) && existing.label === id) {
      existing.label = label;
    }
    // Allow a later declaration to supply the parent if it was not yet known.
    if (parent !== undefined) {
      if (existing.parent === undefined) {
        existing.parent = parent;
      }
      // Silently ignore conflicting parents (streaming fault-tolerance).
    }
    return id;
  };

  for (const line of rest) {
    // parent --> child: use splitOnArrow to avoid backtracking regex
    if (line.includes('-->')) {
      const parts = splitOnArrow(line, '-->');
      if (parts) {
        const [left, right] = parts;
        const parentId = ensureNode(left);
        ensureNode(right, parentId);
        continue;
      }
    }

    // standalone root node
    ensureNode(line);
  }

  return {
    figure: 'tree',
    nodes: [...nodeMap.values()],
    ...(direction !== undefined ? { direction } : {}),
    ...(theme !== undefined ? { theme } : {}),
    ...(palette !== undefined ? { palette } : {}),
    ...(title !== undefined ? { title } : {}),
    ...(subtitle !== undefined ? { subtitle } : {}),
  };
}

// ---------------------------------------------------------------------------
// Arch parser
// ---------------------------------------------------------------------------

/**
 * Parse architecture diagram body lines.
 *
 * Layer declarations use `layer id[Label]`. Any non-`layer` line following a layer
 * declaration is treated as a node belonging to that layer, using the same node
 * notation as the flow parser (the shape type is ignored — all arch nodes render
 * as rectangles).
 *
 * @example
 * ```
 * arch TB antv
 * title: Cloud Architecture
 * layer frontend[Frontend]
 *   web[Web App]
 *   mobile[Mobile]
 * layer backend[Backend]
 *   api[API Server]
 *   auth[Auth Service]
 * ```
 */
function parseArch(
  lines: string[],
  direction?: Direction,
  theme?: ThemeType,
  palette?: PaletteType,
): FigOptions {
  const { title, subtitle, rest } = extractMeta(lines);
  const layers: ArchLayer[] = [];
  let currentLayer: ArchLayer | null = null;

  for (const line of rest) {
    // layer id[Label] — use startsWith + slice to avoid backtracking
    if (line.startsWith('layer ')) {
      const layerExpr = line.slice('layer '.length).trim();
      const { id, label } = parseNodeExpr(layerExpr);
      currentLayer = { id, label, nodes: [] };
      layers.push(currentLayer);
      continue;
    }

    // node inside the current layer
    if (currentLayer) {
      const { id, label } = parseNodeExpr(line);
      currentLayer.nodes.push({ id, label });
    }
  }

  return {
    figure: 'arch',
    layers,
    ...(direction !== undefined ? { direction } : {}),
    ...(theme !== undefined ? { theme } : {}),
    ...(palette !== undefined ? { palette } : {}),
    ...(title !== undefined ? { title } : {}),
    ...(subtitle !== undefined ? { subtitle } : {}),
  };
}

// ---------------------------------------------------------------------------
// Sequence parser
// ---------------------------------------------------------------------------

/**
 * Parse sequence diagram body lines.
 *
 * - `actors: A, B, C` — declare participants in order (optional; inferred from messages)
 * - `A -> B: label`   — solid request arrow
 * - `A --> B: label`  — dashed return arrow
 * - Unlabelled arrows: `A -> B` / `A --> B`
 *
 * @example
 * ```
 * sequence dark
 * title: Login Flow
 * actors: User, API, DB
 * User -> API: POST /login
 * API -> DB: SELECT user
 * DB --> API: user row
 * API --> User: 200 OK
 * ```
 */
function parseSequence(
  lines: string[],
  theme?: ThemeType,
  palette?: PaletteType,
): FigOptions {
  const { title, subtitle, rest } = extractMeta(lines);
  let actors: string[] = [];
  const messages: SeqMessage[] = [];

  for (const line of rest) {
    // actors: A, B, C — use startsWith + slice to avoid backtracking
    if (line.startsWith('actors:')) {
      actors = line.slice('actors:'.length).split(',').map((a) => a.trim()).filter(Boolean);
      continue;
    }

    // Return/dashed: check for '-->' BEFORE '->' (since '-->' contains '->')
    if (line.includes('-->')) {
      const parts = splitOnArrow(line, '-->');
      if (parts) {
        const [from, rightRaw] = parts;
        const colonIdx = rightRaw.indexOf(':');
        if (colonIdx !== -1) {
          messages.push({
            from,
            to: rightRaw.slice(0, colonIdx).trim(),
            label: rightRaw.slice(colonIdx + 1).trim(),
            style: 'return',
          });
        } else {
          messages.push({ from, to: rightRaw, style: 'return' });
        }
        continue;
      }
    }

    // Solid: '->'
    if (line.includes('->')) {
      const parts = splitOnArrow(line, '->');
      if (parts) {
        const [from, rightRaw] = parts;
        const colonIdx = rightRaw.indexOf(':');
        if (colonIdx !== -1) {
          messages.push({
            from,
            to: rightRaw.slice(0, colonIdx).trim(),
            label: rightRaw.slice(colonIdx + 1).trim(),
          });
        } else {
          messages.push({ from, to: rightRaw });
        }
        continue;
      }
    }
  }

  // Infer actors from message order if not explicitly declared
  if (actors.length === 0) {
    const seen = new Set<string>();
    for (const msg of messages) {
      if (!seen.has(msg.from)) { seen.add(msg.from); actors.push(msg.from); }
      if (!seen.has(msg.to))   { seen.add(msg.to);   actors.push(msg.to);   }
    }
  }

  return {
    figure: 'sequence',
    actors,
    messages,
    ...(theme !== undefined ? { theme } : {}),
    ...(palette !== undefined ? { palette } : {}),
    ...(title !== undefined ? { title } : {}),
    ...(subtitle !== undefined ? { subtitle } : {}),
  };
}

// ---------------------------------------------------------------------------
// Quadrant parser
// ---------------------------------------------------------------------------

/**
 * Parse axis configuration from a line like `x-axis: min .. max` or
 * `x-axis Label: min .. max`. Uses indexOf to avoid regex backtracking.
 */
function parseAxisLine(line: string, prefix: string): { label: string; min: string; max: string } | null {
  if (!line.startsWith(prefix)) return null;
  const content = line.slice(prefix.length); // e.g. ": Low .. High" or " Label: Low .. High"
  const dotdotIdx = content.indexOf('..');
  if (dotdotIdx === -1) return null;
  const leftPart = content.slice(0, dotdotIdx).trim(); // e.g. ": Low" or "Label: Low"
  const max = content.slice(dotdotIdx + 2).trim();
  const colonIdx = leftPart.indexOf(':');
  if (colonIdx !== -1) {
    return {
      label: leftPart.slice(0, colonIdx).trim(),
      min: leftPart.slice(colonIdx + 1).trim(),
      max,
    };
  }
  return { label: '', min: leftPart, max };
}

/**
 * Parse quadrant chart body lines.
 *
 * - `x-axis: min .. max`         — X-axis min/max labels (axis label defaults to `""`)
 * - `x-axis Label: min .. max`   — explicit axis label followed by min/max
 * - `y-axis: min .. max`         — Y-axis min/max labels
 * - `y-axis Label: min .. max`   — explicit axis label
 * - `quadrant-1: label`          — top-left quadrant name
 * - `quadrant-2: label`          — top-right quadrant name
 * - `quadrant-3: label`          — bottom-left quadrant name
 * - `quadrant-4: label`          — bottom-right quadrant name
 * - `Label: x, y`                — data point (x, y in the range [0, 1])
 *
 * @example
 * ```
 * quadrant dark figma
 * title: Feature Priority
 * x-axis Effort: Low .. High
 * y-axis Value: Low .. High
 * quadrant-1: Strategic
 * quadrant-2: Quick Wins
 * quadrant-3: Long Shots
 * quadrant-4: Low Priority
 * Feature A: 0.3, 0.7
 * Feature B: 0.8, 0.4
 * ```
 */
function parseQuadrant(
  lines: string[],
  theme?: ThemeType,
  palette?: PaletteType,
): FigOptions {
  const { title, subtitle, rest } = extractMeta(lines);

  let xAxis = { label: '', min: '', max: '' };
  let yAxis = { label: '', min: '', max: '' };
  const quadrantLabels: [string, string, string, string] = ['', '', '', ''];
  const points: QuadrantPoint[] = [];

  for (const line of rest) {
    // x-axis [Label:] min .. max — use parseAxisLine to avoid backtracking
    const xResult = parseAxisLine(line, 'x-axis');
    if (xResult) { xAxis = xResult; continue; }

    const yResult = parseAxisLine(line, 'y-axis');
    if (yResult) { yAxis = yResult; continue; }

    // quadrant-N: label (N ∈ {1,2,3,4}) — use startsWith + slice
    if (line.startsWith('quadrant-')) {
      const body = line.slice('quadrant-'.length);
      const n = body.charCodeAt(0) - 48; // '1'=49 → 1, etc.
      if (n >= 1 && n <= 4 && body.charAt(1) === ':') {
        quadrantLabels[n - 1] = body.slice(2).trim();
        continue;
      }
    }

    // data point: "Label: x, y"  — one colon separates label from x, one comma separates x from y
    // Find the single comma (between x and y), then split label from x via the first colon
    const lastComma = line.lastIndexOf(',');
    if (lastComma !== -1) {
      const yStr = line.slice(lastComma + 1).trim();
      const y = Number(yStr);
      if (Number.isFinite(y) && y >= 0 && y <= 1) {
        const beforeComma = line.slice(0, lastComma);
        const colonIdx = beforeComma.indexOf(':');
        if (colonIdx !== -1) {
          const label = beforeComma.slice(0, colonIdx).trim();
          const xStr = beforeComma.slice(colonIdx + 1).trim();
          const x = Number(xStr);
          if (label && Number.isFinite(x) && x >= 0 && x <= 1) {
            points.push({
              id: `p${points.length}`,
              label,
              x,
              y,
            });
            continue;
          }
        }
      }
    }
  }

  return {
    figure: 'quadrant',
    xAxis,
    yAxis,
    quadrants: quadrantLabels,
    points,
    ...(theme !== undefined ? { theme } : {}),
    ...(palette !== undefined ? { palette } : {}),
    ...(title !== undefined ? { title } : {}),
    ...(subtitle !== undefined ? { subtitle } : {}),
  };
}

// ---------------------------------------------------------------------------
// Gantt parser
// ---------------------------------------------------------------------------

/**
 * Parse Gantt chart body lines.
 *
 * - `section SectionName`               — group header (applied to subsequent tasks)
 * - `Task Label: id, start, end`         — task bar (`start`/`end` in `yyyy-mm-dd`)
 * - `milestone: Label, date`             — milestone diamond
 *
 * @example
 * ```
 * gantt light drawio
 * title: Q1 Roadmap
 * section Design
 *   Wireframes: t1, 2025-01-06, 2025-01-24
 *   Mockups: t2, 2025-01-25, 2025-02-07
 * section Dev
 *   Frontend: t3, 2025-02-03, 2025-02-28
 * milestone: Launch, 2025-03-01
 * ```
 */
function parseGantt(
  lines: string[],
  theme?: ThemeType,
  palette?: PaletteType,
): FigOptions {
  const { title, subtitle, rest } = extractMeta(lines);
  const tasks: GanttTask[] = [];
  const milestones: GanttMilestone[] = [];
  let currentSection: string | undefined;

  // Matches a date value: yyyy-mm-dd
  const DATE_RE = /^\d{4}-\d{2}-\d{2}$/;

  for (const line of rest) {
    // section SectionName — use startsWith + slice to avoid backtracking
    if (line.startsWith('section ')) {
      currentSection = line.slice('section '.length).trim();
      continue;
    }

    // milestone: Label, date — use startsWith + lastIndexOf
    if (line.startsWith('milestone:')) {
      const body = line.slice('milestone:'.length).trim();
      const lastComma = body.lastIndexOf(',');
      if (lastComma !== -1) {
        const date = body.slice(lastComma + 1).trim();
        if (DATE_RE.test(date)) {
          milestones.push({ label: body.slice(0, lastComma).trim(), date });
          continue;
        }
      }
      continue;
    }

    // Task Label: id, start, end
    // Parse from the right: locate the two date fields anchored at the end
    const lastComma = line.lastIndexOf(',');
    if (lastComma === -1) continue;
    const end = line.slice(lastComma + 1).trim();
    if (!DATE_RE.test(end)) continue;

    const beforeEnd = line.slice(0, lastComma);
    const prevComma = beforeEnd.lastIndexOf(',');
    if (prevComma === -1) continue;
    const start = beforeEnd.slice(prevComma + 1).trim();
    if (!DATE_RE.test(start)) continue;

    const labelAndId = beforeEnd.slice(0, prevComma);
    const colonIdx = labelAndId.indexOf(':');
    if (colonIdx === -1) continue;
    const taskLabel = labelAndId.slice(0, colonIdx).trim();
    const taskId = labelAndId.slice(colonIdx + 1).trim();
    if (!taskLabel || !taskId) continue;

    tasks.push({
      id: taskId,
      label: taskLabel,
      start,
      end,
      ...(currentSection !== undefined ? { groupId: currentSection } : {}),
    });
  }

  return {
    figure: 'gantt',
    tasks,
    ...(milestones.length > 0 ? { milestones } : {}),
    ...(theme !== undefined ? { theme } : {}),
    ...(palette !== undefined ? { palette } : {}),
    ...(title !== undefined ? { title } : {}),
    ...(subtitle !== undefined ? { subtitle } : {}),
  };
}

// ---------------------------------------------------------------------------
// State parser
// ---------------------------------------------------------------------------

/**
 * Parse state machine body lines.
 *
 * - `id[Label]`       — normal state (rounded rectangle)
 * - `id((Label))`     — terminal / end state (ringed circle)
 * - `[*]`             — start pseudo-state
 * - `id --> id2: label` — transition with optional label
 * - `accent: id`      — mark a state as the accent/focal state
 *
 * @example
 * ```
 * state
 * title: Order Status
 * idle[Idle]
 * processing[Processing]
 * done((Done))
 * error[Error] accent
 * [*] --> idle
 * idle --> processing: order placed
 * processing --> done: shipped
 * processing --> error: payment failed
 * error --> idle: retry
 * ```
 */
function parseState(
  lines: string[],
  theme?: ThemeType,
  palette?: PaletteType,
): FigOptions {
  const { title, subtitle, rest } = extractMeta(lines);
  const nodeMap = new Map<string, StateNode>();
  const transitions: StateTransition[] = [];
  let startCounter = 0;
  let endCounter   = 0;

  const ensureState = (expr: string): string => {
    let e = expr.trim();

    // Strip inline accent suffix before any node parsing
    let markAccent = false;
    if (e.endsWith(' accent')) {
      markAccent = true;
      e = e.slice(0, -' accent'.length).trim();
    }

    // [*] — UML pseudo-state (start or end determined by usage, default start)
    if (e === '[*]') {
      const pid = `__start_${startCounter++}`;
      if (!nodeMap.has(pid)) {
        nodeMap.set(pid, { id: pid, label: '', type: 'start' });
      }
      // [*] pseudo-states can't be accented
      return pid;
    }

    // terminal: id((label)) — detect via indexOf to avoid regex backtracking
    const dblOpenIdx = e.indexOf('((');
    if (dblOpenIdx > 0 && e.endsWith('))')) {
      const id    = e.slice(0, dblOpenIdx).trim();
      const label = e.slice(dblOpenIdx + 2, e.length - 2).trim();
      if (id && /^[\w-]+$/.test(id)) {
        if (!nodeMap.has(id)) {
          nodeMap.set(id, { id, label, type: 'end' });
        }
        if (markAccent) { const n = nodeMap.get(id); if (n) n.accent = true; }
        return id;
      }
    }

    // process: id[label] or bare id
    const { id, label } = parseNodeExpr(e);
    if (!nodeMap.has(id)) {
      nodeMap.set(id, { id, label, type: 'state' });
    } else if (isExplicitNodeExpr(e, id)) {
      const existing = nodeMap.get(id)!;
      if (existing.label === id) existing.label = label;
    }
    if (markAccent) { const n = nodeMap.get(id); if (n) n.accent = true; }
    return id;
  };

  for (const line of rest) {
    // accent: id  — mark node as accent
    if (line.startsWith('accent:')) {
      const id = line.slice('accent:'.length).trim();
      const node = nodeMap.get(id);
      if (node) node.accent = true;
      continue;
    }

    // Transition with or without label: A --> B[:label] or A --> B: label
    if (line.includes('-->')) {
      const parts = splitOnArrow(line, '-->');
      if (parts) {
        const [left, rightRaw] = parts;
        const colonIdx = rightRaw.indexOf(':');
        let to = rightRaw;
        let label: string | undefined;
        if (colonIdx !== -1) {
          to    = rightRaw.slice(0, colonIdx).trim();
          label = rightRaw.slice(colonIdx + 1).trim();
        }
        const fromId = ensureState(left);
        const toId   = ensureState(to);
        transitions.push(label !== undefined ? { from: fromId, to: toId, label } : { from: fromId, to: toId });
        continue;
      }
    }

    // Inline accent flag: id[Label] accent
    if (line.endsWith(' accent')) {
      const expr = line.slice(0, -' accent'.length).trim();
      const id   = ensureState(expr);
      const node = nodeMap.get(id);
      if (node) node.accent = true;
      continue;
    }

    // Standalone node definition
    ensureState(line);
  }

  return {
    figure: 'state',
    nodes: [...nodeMap.values()],
    transitions,
    ...(theme !== undefined ? { theme } : {}),
    ...(palette !== undefined ? { palette } : {}),
    ...(title !== undefined ? { title } : {}),
    ...(subtitle !== undefined ? { subtitle } : {}),
  };
}

// ---------------------------------------------------------------------------
// ER parser
// ---------------------------------------------------------------------------

/**
 * Parse ER diagram body lines.
 *
 * - `entity id[Label]`     — declare an entity
 * - `  name pk: type`      — field inside an entity, PK flag
 * - `  name fk: type`      — field, FK flag
 * - `  name: type`         — plain field with type
 * - `  name`               — field without type
 * - `A --> B: label`       — relationship (with optional label and cardinality)
 * - `A ||--o{ B: label`    — crow's foot notation for cardinality
 * - `accent: id`           — mark entity as accent
 *
 * @example
 * ```
 * er
 * title: Blog Schema
 * entity User[User]
 *   id pk: uuid
 *   email: text
 *   name: text
 * entity Post[Post]
 *   id pk: uuid
 *   author_id fk: uuid
 *   title: text
 * User --> Post: writes
 * ```
 */
function parseEr(
  lines: string[],
  theme?: ThemeType,
  palette?: PaletteType,
): FigOptions {
  // Do NOT use extractMeta here — entity fields can look like "title: text"
  // and would be incorrectly grabbed as the diagram title. Instead, extract
  // title/subtitle inline only when we are NOT inside an entity block.
  let title: string | undefined;
  let subtitle: string | undefined;
  const cleanLines: string[] = [];
  for (const rawLine of lines) {
    const line = rawLine.trim();
    if (!line || line.startsWith('%%')) continue;
    cleanLines.push(line);
  }

  const entities: ErEntity[] = [];
  const relations: ErRelation[] = [];
  let currentEntity: ErEntity | null = null;

  // Parse cardinality from crow's foot shorthand like "||--o{" or "1..N"
  function parseCard(s: string): string {
    const trim = s.trim();
    if (trim === '||' || trim === '1') return '1';
    if (trim === 'o{' || trim === 'N' || trim === 'n') return 'N';
    if (trim === 'o|' || trim === '0..1') return '0..1';
    if (trim === '}|' || trim === '}o' || trim === '1..*') return '1..*';
    return trim;
  }

  for (const line of cleanLines) {
    // title/subtitle — only at top level (not inside an entity block)
    if (currentEntity === null) {
      if (line.startsWith('title:')) {
        title = line.slice('title:'.length).trim();
        continue;
      }
      if (line.startsWith('subtitle:')) {
        subtitle = line.slice('subtitle:'.length).trim();
        continue;
      }
    }

    // accent: id — use startsWith + slice to avoid backtracking
    if (line.startsWith('accent:')) {
      const id = line.slice('accent:'.length).trim();
      const entity = entities.find((e) => e.id === id);
      if (entity) entity.accent = true;
      continue;
    }

    // entity declaration: entity id[Label]  or  entity id
    if (line.startsWith('entity ')) {
      const expr = line.slice('entity '.length).trim();
      const { id, label } = parseNodeExpr(expr);
      currentEntity = { id, label, fields: [] };
      entities.push(currentEntity);
      continue;
    }

    // Relationship line using crow's foot: A ||--o{ B: label
    // Detect by looking for -- between two non-space sequences
    const cfIdx = line.indexOf('--');
    if (cfIdx !== -1) {
      const beforeDash = line.slice(0, cfIdx).trim();
      const afterDash  = line.slice(cfIdx + 2).trim();
      // afterDash should start with cardinality then entity id
      // Split on first whitespace to get cardinality token
      const spIdx = afterDash.indexOf(' ');
      if (spIdx !== -1 && beforeDash) {
        const fromParts = beforeDash.split(/\s+/);
        const fromId = fromParts[0];
        const fromCard = fromParts.length > 1 ? parseCard(fromParts[fromParts.length - 1]) : undefined;
        const toToken = afterDash.slice(0, spIdx);
        const toCard = parseCard(toToken);
        const rest2  = afterDash.slice(spIdx).trim();
        const colonIdx2 = rest2.indexOf(':');
        let toId: string;
        let label: string | undefined;
        if (colonIdx2 !== -1) {
          toId  = rest2.slice(0, colonIdx2).trim();
          label = rest2.slice(colonIdx2 + 1).trim();
        } else {
          toId = rest2;
        }
        if (fromId && toId) {
          relations.push({
            from: fromId,
            to: toId,
            ...(label ? { label } : {}),
            ...(fromCard ? { fromCard } : {}),
            ...(toCard  ? { toCard  } : {}),
          });
          currentEntity = null;
          continue;
        }
      }
    }

    // Simple relationship: A --> B: label or A --> B
    if (line.includes('-->')) {
      const parts = splitOnArrow(line, '-->');
      if (parts) {
        const [from, rightRaw] = parts;
        const colonIdx = rightRaw.indexOf(':');
        if (colonIdx !== -1) {
          relations.push({
            from,
            to: rightRaw.slice(0, colonIdx).trim(),
            label: rightRaw.slice(colonIdx + 1).trim(),
          });
        } else {
          relations.push({ from, to: rightRaw });
        }
        currentEntity = null;
        continue;
      }
    }

    // Field inside the current entity
    if (currentEntity) {
      // name [pk|fk] [: type]
      // Use startsWith-based parsing
      let rest3 = line;
      let key: ErField['key'];
      let type: string | undefined;

      // Extract type after ':'
      const colonIdx = rest3.indexOf(':');
      if (colonIdx !== -1) {
        type  = rest3.slice(colonIdx + 1).trim();
        rest3 = rest3.slice(0, colonIdx).trim();
      }

      // Check for key markers
      const tokens = rest3.split(/\s+/);
      const name   = tokens[0];
      for (let ti = 1; ti < tokens.length; ti++) {
        const tok = tokens[ti].toLowerCase();
        if (tok === 'pk') { key = 'pk'; break; }
        if (tok === 'fk') { key = 'fk'; break; }
      }

      if (name) {
        currentEntity.fields.push({
          name,
          ...(type ? { type } : {}),
          ...(key  ? { key  } : {}),
        });
      }
    }
  }

  return {
    figure: 'er',
    entities,
    relations,
    ...(theme !== undefined ? { theme } : {}),
    ...(palette !== undefined ? { palette } : {}),
    ...(title !== undefined ? { title } : {}),
    ...(subtitle !== undefined ? { subtitle } : {}),
  };
}

// ---------------------------------------------------------------------------
// Timeline parser
// ---------------------------------------------------------------------------

/**
 * Parse timeline body lines.
 *
 * Each line is either:
 * - `yyyy-mm-dd: label`              — regular event
 * - `yyyy-mm-dd: label milestone`    — major milestone (larger accent dot)
 *
 * @example
 * ```
 * timeline
 * title: Product History
 * 2020-01-01: v1.0 Launch milestone
 * 2021-06-15: v2.0 Redesign
 * 2022-11-01: v3.0 Mobile milestone
 * 2023-09-20: v4.0 AI Features
 * ```
 */
function parseTimeline(
  lines: string[],
  theme?: ThemeType,
  palette?: PaletteType,
): FigOptions {
  const { title, subtitle, rest } = extractMeta(lines);
  const events: TimelineEvent[] = [];
  const DATE_RE = /^\d{4}-\d{2}-\d{2}$/;

  for (const line of rest) {
    // date: label [milestone]
    const colonIdx = line.indexOf(':');
    if (colonIdx === -1) continue;
    const date = line.slice(0, colonIdx).trim();
    if (!DATE_RE.test(date)) continue;
    let label = line.slice(colonIdx + 1).trim();

    let milestone = false;
    if (label.endsWith(' milestone')) {
      milestone = true;
      label = label.slice(0, -' milestone'.length).trim();
    }

    events.push({
      id: `ev${events.length}`,
      label,
      date,
      ...(milestone ? { milestone: true } : {}),
    });
  }

  return {
    figure: 'timeline',
    events,
    ...(theme !== undefined ? { theme } : {}),
    ...(palette !== undefined ? { palette } : {}),
    ...(title !== undefined ? { title } : {}),
    ...(subtitle !== undefined ? { subtitle } : {}),
  };
}

// ---------------------------------------------------------------------------
// Swimlane parser
// ---------------------------------------------------------------------------

/**
 * Parse swimlane body lines.
 *
 * - `lanes: Lane A, Lane B, Lane C`        — declare lane labels (required)
 * - `LaneLabel: id[Node Label]`             — declare a node inside a lane
 * - `A --> B: label`                        — edge between nodes
 *
 * @example
 * ```
 * swimlane
 * title: Order Flow
 * lanes: Customer, Warehouse, Shipping
 * Customer: order[Place Order]
 * Customer: pay[Confirm Payment]
 * Warehouse: receive[Receive Order]
 * Warehouse: pack[Pack Items]
 * Shipping: ship[Ship Package]
 * order --> pay
 * pay --> receive
 * receive --> pack
 * pack --> ship
 * ```
 */
function parseSwimlane(
  lines: string[],
  theme?: ThemeType,
  palette?: PaletteType,
): FigOptions {
  const { title, subtitle, rest } = extractMeta(lines);
  const lanesList: string[] = [];
  const nodes: SwimlaneNode[] = [];
  const edges: SwimlaneEdge[] = [];
  const nodeMap = new Map<string, SwimlaneNode>();

  for (const line of rest) {
    // lanes: Lane A, Lane B — use startsWith + slice
    if (line.startsWith('lanes:')) {
      const raw = line.slice('lanes:'.length).split(',').map((l) => l.trim()).filter(Boolean);
      lanesList.push(...raw);
      continue;
    }

    // Edge: A --> B[:label]
    if (line.includes('-->')) {
      const parts = splitOnArrow(line, '-->');
      if (parts) {
        const [from, rightRaw] = parts;
        const colonIdx = rightRaw.indexOf(':');
        let to = rightRaw;
        let label: string | undefined;
        if (colonIdx !== -1) {
          to    = rightRaw.slice(0, colonIdx).trim();
          label = rightRaw.slice(colonIdx + 1).trim();
        }
        edges.push(label !== undefined ? { from, to, label } : { from, to });
        continue;
      }
    }

    // Node: LaneLabel: id[Node Label]
    // Find the FIRST colon to split lane from node expression
    const colonIdx = line.indexOf(':');
    if (colonIdx !== -1) {
      const laneLabel = line.slice(0, colonIdx).trim();
      const nodeExpr  = line.slice(colonIdx + 1).trim();
      if (nodeExpr) {
        const { id, label, type } = parseNodeExpr(nodeExpr);
        const snode: SwimlaneNode = { id, label, lane: laneLabel, type };
        if (!nodeMap.has(id)) {
          nodeMap.set(id, snode);
          nodes.push(snode);
        }
      }
    }
  }

  return {
    figure: 'swimlane',
    lanes: lanesList,
    nodes,
    edges,
    ...(theme !== undefined ? { theme } : {}),
    ...(palette !== undefined ? { palette } : {}),
    ...(title !== undefined ? { title } : {}),
    ...(subtitle !== undefined ? { subtitle } : {}),
  };
}
