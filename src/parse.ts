import { fig } from './index';
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
  Direction,
  ThemeType,
  PaletteType,
  NodeType,
} from './types';

// ---------------------------------------------------------------------------
// Public API
// ---------------------------------------------------------------------------

/**
 * Parse a Mermaid-like markdown diagram definition and render it as an SVG string.
 *
 * The first non-empty line is the **header**: `<type> [direction] [theme] [palette]`
 *
 * - `type`      — one of `flow`, `tree`, `arch`, `sequence`, `quadrant`, `gantt`
 * - `direction` — `TB` (top→bottom) or `LR` (left→right); applies to flow / tree / arch
 * - `theme`     — `light` (default) or `dark`
 * - `palette`   — any named palette: `default`, `antv`, `drawio`, `figma`, `vega`,
 *                 `mono-blue`, `mono-green`, `mono-purple`, `mono-orange`
 *
 * Lines starting with `%%` are treated as comments and ignored.
 * `title:` and `subtitle:` meta-lines are supported in all diagram types.
 *
 * @example
 * ```
 * figmd(`
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
export function figmd(markdown: string): string {
  return fig(parseFigmd(markdown));
}

/**
 * Parse a Mermaid-like markdown diagram definition and return a {@link FigOptions} object.
 *
 * Useful when you want to inspect or modify the parsed options before rendering.
 * See {@link figmd} for the full syntax reference.
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
    default:
      throw new Error(
        `figmd: unknown figure type "${figureType}". ` +
          `Expected one of: flow, tree, arch, sequence, quadrant, gantt`,
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

    const titleMatch = line.match(/^title:\s*(.+)$/);
    if (titleMatch) {
      title = titleMatch[1].trim();
      continue;
    }

    const subtitleMatch = line.match(/^subtitle:\s*(.+)$/);
    if (subtitleMatch) {
      subtitle = subtitleMatch[1].trim();
      continue;
    }

    rest.push(line);
  }

  return { title, subtitle, rest };
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
 * build --> deploy[/Deploy/]
 * group Pipeline: code, test, build, deploy
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
    if (!nodeMap.has(id)) nodeMap.set(id, { id, label, type });
    return id;
  };

  for (const line of rest) {
    // group GroupLabel: id1, id2, ...
    const groupMatch = line.match(/^group\s+(.+?):\s*(.+)$/);
    if (groupMatch) {
      const label = groupMatch[1].trim();
      groups.push({
        id: `grp-${groups.length}`,
        label,
        nodes: groupMatch[2].split(',').map((n) => n.trim()),
      });
      continue;
    }

    // labeled edge: A -->|label| B  (check before simple edge)
    const labeledEdge = line.match(/^(.+?)\s*-->\s*\|([^|]+)\|\s*(.+)$/);
    if (labeledEdge) {
      const fromId = ensureNode(labeledEdge[1].trim());
      const toId = ensureNode(labeledEdge[3].trim());
      edges.push({ from: fromId, to: toId, label: labeledEdge[2] });
      continue;
    }

    // simple edge: A --> B
    const simpleEdge = line.match(/^(.+?)\s*-->\s*(.+)$/);
    if (simpleEdge) {
      const fromId = ensureNode(simpleEdge[1].trim());
      const toId = ensureNode(simpleEdge[2].trim());
      edges.push({ from: fromId, to: toId });
      continue;
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
    if (!nodeMap.has(id)) {
      nodeMap.set(id, { id, label, ...(parent !== undefined ? { parent } : {}) });
    }
    return id;
  };

  for (const line of rest) {
    // parent --> child
    const edgeMatch = line.match(/^(.+?)\s*-->\s*(.+)$/);
    if (edgeMatch) {
      const parentId = ensureNode(edgeMatch[1].trim());
      ensureNode(edgeMatch[2].trim(), parentId);
      continue;
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
    // layer id[Label]  or  layer id (bare id becomes both id and label)
    const layerMatch = line.match(/^layer\s+(.+)$/);
    if (layerMatch) {
      const { id, label } = parseNodeExpr(layerMatch[1].trim());
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
    // actors: A, B, C
    const actorsMatch = line.match(/^actors:\s*(.+)$/);
    if (actorsMatch) {
      actors = actorsMatch[1].split(',').map((a) => a.trim());
      continue;
    }

    // return/dashed: A --> B: label  (must be checked BEFORE solid -> pattern)
    const returnWithLabel = line.match(/^(.+?)\s*-->\s*(.+?):\s*(.+)$/);
    if (returnWithLabel) {
      messages.push({
        from: returnWithLabel[1].trim(),
        to: returnWithLabel[2].trim(),
        label: returnWithLabel[3].trim(),
        style: 'return',
      });
      continue;
    }

    // return/dashed without label: A --> B
    const returnNoLabel = line.match(/^(.+?)\s*-->\s*(.+)$/);
    if (returnNoLabel) {
      messages.push({
        from: returnNoLabel[1].trim(),
        to: returnNoLabel[2].trim(),
        style: 'return',
      });
      continue;
    }

    // solid with label: A -> B: label
    const solidWithLabel = line.match(/^(.+?)\s*->\s*(.+?):\s*(.+)$/);
    if (solidWithLabel) {
      messages.push({
        from: solidWithLabel[1].trim(),
        to: solidWithLabel[2].trim(),
        label: solidWithLabel[3].trim(),
      });
      continue;
    }

    // solid without label: A -> B
    const solidNoLabel = line.match(/^(.+?)\s*->\s*(.+)$/);
    if (solidNoLabel) {
      messages.push({ from: solidNoLabel[1].trim(), to: solidNoLabel[2].trim() });
      continue;
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
    // x-axis [Label:] min .. max
    // Supports "x-axis: min .. max" and "x-axis Label: min .. max"
    const xRangeMatch = line.match(/^x-axis(?:\s+([^:]+))?:\s*(.+?)\s*\.\.\s*(.+)$/);
    if (xRangeMatch) {
      xAxis = {
        label: xRangeMatch[1] ? xRangeMatch[1].trim() : '',
        min: xRangeMatch[2].trim(),
        max: xRangeMatch[3].trim(),
      };
      continue;
    }

    // y-axis [Label:] min .. max
    const yRangeMatch = line.match(/^y-axis(?:\s+([^:]+))?:\s*(.+?)\s*\.\.\s*(.+)$/);
    if (yRangeMatch) {
      yAxis = {
        label: yRangeMatch[1] ? yRangeMatch[1].trim() : '',
        min: yRangeMatch[2].trim(),
        max: yRangeMatch[3].trim(),
      };
      continue;
    }

    // quadrant-N: label  (1=TL, 2=TR, 3=BL, 4=BR)
    const quadMatch = line.match(/^quadrant-([1-4]):\s*(.+)$/);
    if (quadMatch) {
      quadrantLabels[parseInt(quadMatch[1], 10) - 1] = quadMatch[2].trim();
      continue;
    }

    // data point: Label: x, y
    const pointMatch = line.match(/^(.+?):\s*([\d.]+)\s*,\s*([\d.]+)$/);
    if (pointMatch) {
      points.push({
        id: `p${points.length}`,
        label: pointMatch[1].trim(),
        x: parseFloat(pointMatch[2]),
        y: parseFloat(pointMatch[3]),
      });
      continue;
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

  for (const line of rest) {
    // section SectionName
    const sectionMatch = line.match(/^section\s+(.+)$/);
    if (sectionMatch) {
      currentSection = sectionMatch[1].trim();
      continue;
    }

    // milestone: Label, date
    const milestoneMatch = line.match(/^milestone:\s*(.+?),\s*([\d-]+)$/);
    if (milestoneMatch) {
      milestones.push({ label: milestoneMatch[1].trim(), date: milestoneMatch[2].trim() });
      continue;
    }

    // Task Label: id, start, end
    const taskMatch = line.match(/^(.+?):\s*([\w-]+)\s*,\s*([\d-]+)\s*,\s*([\d-]+)$/);
    if (taskMatch) {
      tasks.push({
        id: taskMatch[2].trim(),
        label: taskMatch[1].trim(),
        start: taskMatch[3].trim(),
        end: taskMatch[4].trim(),
        ...(currentSection !== undefined ? { groupId: currentSection } : {}),
      });
      continue;
    }
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
