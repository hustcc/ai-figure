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
 * Parse a markdown diagram definition and return a {@link FigOptions} object.
 *
 * **Syntax overview**
 *
 * The first non-empty line must be the header: `figure <type>`
 * where `<type>` is one of: `flow`, `tree`, `arch`, `sequence`, `quadrant`,
 * `gantt`, `state`, `er`, `timeline`, `swimlane`.
 *
 * Config lines (`key: value`) follow the header and set options shared by all
 * diagram types (`title`, `subtitle`, `theme`, `palette`) or diagram-specific
 * ones (`direction`, `actors`, `accent`, `milestone`, `group`).  All config
 * keys are parsed by the same unified `key: value` logic.
 *
 * Data lines use one of five structural patterns:
 * - **Arrow**  `A --> B: label`  or  `A -> B: label`  — directed edge / message
 * - **Section** `section Name`  — start a layer (arch), entity (er), lane (swimlane),
 *   or group (gantt); following lines belong to it until the next section
 * - **Point**  `Label: x, y`  — quadrant data point (x, y ∈ [0,1])
 * - **Date event**  `yyyy-mm-dd: label [milestone]`  — timeline event
 * - **Gantt task**  `Label: id, start, end`  — task bar
 *
 * Lines starting with `%%` are treated as comments and ignored.
 *
 * Throws if the input is empty, the `figure` header is missing, or the type is
 * unrecognised.  For a fault-tolerant render path that never throws (useful
 * with streaming AI output) use `fig(markdown)` instead.
 *
 * @example
 * ```
 * figure flow
 * direction: LR
 * palette: antv
 * title: CI Pipeline
 * code[Write Code] --> test{Tests Pass?}
 * test --> build[Build Image]: yes
 * test --> fix((Fix Issues)): no
 * build --> deploy[/Deploy/]
 * group Pipeline: code, test, build, deploy
 * ```
 */
export function parseFigmd(markdown: string): FigOptions {
  const lines: string[] = [];
  for (const rawLine of markdown.split('\n')) {
    const line = rawLine.trim();
    if (line && !line.startsWith('%%')) lines.push(line);
  }
  if (lines.length === 0) throw new Error('figmd: empty diagram definition');

  const header = lines[0];
  if (!header.startsWith('figure ')) {
    throw new Error(`figmd: header must start with "figure <type>", got "${header}"`);
  }
  const figureType = header.slice('figure '.length).trim().toLowerCase();
  const bodyLines  = lines.slice(1);

  switch (figureType) {
    case 'flow':      return parseFlow(bodyLines);
    case 'tree':      return parseTree(bodyLines);
    case 'arch':      return parseArch(bodyLines);
    case 'sequence':  return parseSequence(bodyLines);
    case 'quadrant':  return parseQuadrant(bodyLines);
    case 'gantt':     return parseGantt(bodyLines);
    case 'state':     return parseState(bodyLines);
    case 'er':        return parseEr(bodyLines);
    case 'timeline':  return parseTimeline(bodyLines);
    case 'swimlane':  return parseSwimlane(bodyLines);
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

interface CommonConfig {
  title?:     string;
  subtitle?:  string;
  theme?:     ThemeType;
  palette?:   PaletteType;
  direction?: Direction;
}

/**
 * Try to parse `line` as a `key: value` config line and write the recognised
 * keys into `cfg`.  Returns `true` if the line was consumed.
 *
 * Recognised keys: `title`, `subtitle`, `theme`, `palette`, `direction`.
 */
function applyCommonConfig(line: string, cfg: CommonConfig): boolean {
  const colonIdx = line.indexOf(':');
  if (colonIdx === -1) return false;
  const key = line.slice(0, colonIdx).trim();
  const val = line.slice(colonIdx + 1).trim();
  switch (key) {
    case 'title':     cfg.title     = val; return true;
    case 'subtitle':  cfg.subtitle  = val; return true;
    case 'theme':     cfg.theme     = val as ThemeType; return true;
    case 'palette':   cfg.palette   = val; return true;
    case 'direction': cfg.direction = val as Direction; return true;
    default: return false;
  }
}

/** Spread only defined fields from a CommonConfig into a return object. */
function cfgSpread(cfg: CommonConfig): Partial<CommonConfig> {
  const out: Partial<CommonConfig> = {};
  if (cfg.title     !== undefined) out.title     = cfg.title;
  if (cfg.subtitle  !== undefined) out.subtitle  = cfg.subtitle;
  if (cfg.theme     !== undefined) out.theme     = cfg.theme;
  if (cfg.palette   !== undefined) out.palette   = cfg.palette;
  if (cfg.direction !== undefined) out.direction = cfg.direction;
  return out;
}

/**
 * Split a line on the first occurrence of `arrow` and return `[left, right]`
 * trimmed, or `null` if the arrow is absent or either side is empty.
 *
 * Uses `indexOf` instead of a regex to avoid polynomial backtracking.
 */
function splitOnArrow(line: string, arrow: string): [string, string] | null {
  const idx = line.indexOf(arrow);
  if (idx === -1) return null;
  const left  = line.slice(0, idx).trim();
  const right = line.slice(idx + arrow.length).trim();
  if (!left || !right) return null;
  return [left, right];
}

/**
 * Parse a node expression such as `id[label]`, `id{label}`, `id((label))`,
 * `id[/label/]`, or a bare identifier.
 *
 * Uses `indexOf`/`endsWith`-based detection to avoid regex backtracking.
 *
 * | Notation        | Shape     |
 * |-----------------|-----------|
 * | `id[label]`     | process   |
 * | `id{label}`     | decision  |
 * | `id((label))`   | terminal  |
 * | `id[/label/]`   | io        |
 * | `id`            | process   |
 */
function parseNodeExpr(expr: string): { id: string; label: string; type: NodeType } {
  const s = expr.trim();

  // terminal: id((label))
  const dblOpenIdx = s.indexOf('((');
  if (dblOpenIdx > 0 && s.endsWith('))')) {
    const id    = s.slice(0, dblOpenIdx).trim();
    const label = s.slice(dblOpenIdx + 2, s.length - 2).trim();
    if (id) return { id, label: label || id, type: 'terminal' };
  }

  // io: id[/label/]
  const ioOpenIdx = s.indexOf('[/');
  if (ioOpenIdx > 0 && s.endsWith('/]')) {
    const id    = s.slice(0, ioOpenIdx).trim();
    const label = s.slice(ioOpenIdx + 2, s.length - 2).trim();
    if (id) return { id, label: label || id, type: 'io' };
  }

  // process: id[label]  (guard: must not start with [/ — already handled above)
  const sqOpenIdx = s.indexOf('[');
  if (sqOpenIdx > 0 && s.endsWith(']') && s[sqOpenIdx + 1] !== '/') {
    const id    = s.slice(0, sqOpenIdx).trim();
    const label = s.slice(sqOpenIdx + 1, s.length - 1).trim();
    if (id) return { id, label: label || id, type: 'process' };
  }

  // decision: id{label}
  const curlOpenIdx = s.indexOf('{');
  if (curlOpenIdx > 0 && s.endsWith('}')) {
    const id    = s.slice(0, curlOpenIdx).trim();
    const label = s.slice(curlOpenIdx + 1, s.length - 1).trim();
    if (id) return { id, label: label || id, type: 'decision' };
  }

  // bare identifier
  return { id: s, label: s, type: 'process' };
}

/**
 * For flow edge right-hand sides: split `"nodeExpr: edgeLabel"` into the node
 * expression and optional edge label.
 *
 * The edge label separator is the first `:` that appears *after* the end of
 * the node expression (i.e., after `]`, `}`, `))`, or at a bare-id boundary).
 * This correctly handles node labels that themselves contain colons.
 */
function splitFlowRight(s: string): [string, string | undefined] {
  const lastSq  = s.lastIndexOf(']');
  const lastCu  = s.lastIndexOf('}');
  const lastDbl = s.lastIndexOf('))');
  const termIdx = Math.max(lastSq, lastCu, lastDbl !== -1 ? lastDbl + 1 : -1);

  if (termIdx > 0) {
    const after = s.slice(termIdx + 1).trimStart();
    if (after.startsWith(':')) {
      return [s.slice(0, termIdx + 1).trim(), after.slice(1).trim()];
    }
    return [s, undefined];
  }

  // Bare id: "id" or "id: edgeLabel"
  const colonIdx = s.indexOf(':');
  if (colonIdx !== -1) {
    return [s.slice(0, colonIdx).trim(), s.slice(colonIdx + 1).trim()];
  }
  return [s, undefined];
}

// ---------------------------------------------------------------------------
// Flow parser
// ---------------------------------------------------------------------------

function parseFlow(lines: string[]): FigOptions {
  const cfg: CommonConfig = {};
  const nodeMap = new Map<string, FlowNode>();
  const edges: FlowEdge[] = [];
  const groups: FlowGroup[] = [];

  const ensureNode = (expr: string): string => {
    const { id, label, type } = parseNodeExpr(expr);
    if (!nodeMap.has(id)) {
      nodeMap.set(id, { id, label, type });
    } else if (expr.trim() !== id) {
      nodeMap.set(id, { id, label, type });
    }
    return id;
  };

  for (const line of lines) {
    if (applyCommonConfig(line, cfg)) continue;

    // group GroupLabel: id1, id2, ...
    if (line.startsWith('group ')) {
      const body = line.slice('group '.length);
      const colonIdx = body.indexOf(':');
      if (colonIdx !== -1) {
        const label = body.slice(0, colonIdx).trim();
        const nodes = body.slice(colonIdx + 1).split(',').map((n) => n.trim()).filter(Boolean);
        if (nodes.length > 0) groups.push({ id: `grp-${groups.length}`, label, nodes });
      }
      continue;
    }

    // Edge: A --> B[Label]: edgeLabel  or  A --> B: edgeLabel
    if (line.includes('-->')) {
      const parts = splitOnArrow(line, '-->');
      if (parts) {
        const [left, rightRaw] = parts;
        const [to, label] = splitFlowRight(rightRaw);
        if (to) {
          const fromId = ensureNode(left);
          const toId   = ensureNode(to);
          edges.push(label ? { from: fromId, to: toId, label } : { from: fromId, to: toId });
        }
        continue;
      }
    }

    ensureNode(line);
  }

  return {
    figure: 'flow',
    nodes: [...nodeMap.values()],
    edges,
    ...(groups.length > 0 ? { groups } : {}),
    ...cfgSpread(cfg),
  };
}

// ---------------------------------------------------------------------------
// Tree parser
// ---------------------------------------------------------------------------

function parseTree(lines: string[]): FigOptions {
  const cfg: CommonConfig = {};
  const nodeMap = new Map<string, TreeNode>();

  const ensureNode = (expr: string, parent?: string): string => {
    const { id, label } = parseNodeExpr(expr);
    const existing = nodeMap.get(id);
    if (!existing) {
      nodeMap.set(id, { id, label, ...(parent !== undefined ? { parent } : {}) });
    } else {
      if (expr.trim() !== id && existing.label === id) existing.label = label;
      if (parent !== undefined && existing.parent === undefined) existing.parent = parent;
    }
    return id;
  };

  for (const line of lines) {
    if (applyCommonConfig(line, cfg)) continue;

    if (line.includes('-->')) {
      const parts = splitOnArrow(line, '-->');
      if (parts) {
        const [left, right] = parts;
        const parentId = ensureNode(left);
        ensureNode(right, parentId);
        continue;
      }
    }

    ensureNode(line);
  }

  return {
    figure: 'tree',
    nodes: [...nodeMap.values()],
    ...cfgSpread(cfg),
  };
}

// ---------------------------------------------------------------------------
// Arch parser
// ---------------------------------------------------------------------------

function parseArch(lines: string[]): FigOptions {
  const cfg: CommonConfig = {};
  const layers: ArchLayer[] = [];
  let currentLayer: ArchLayer | null = null;

  for (const line of lines) {
    if (applyCommonConfig(line, cfg)) continue;

    if (line.startsWith('section ')) {
      const label = line.slice('section '.length).trim();
      currentLayer = { id: label, label, nodes: [] };
      layers.push(currentLayer);
      continue;
    }

    if (currentLayer) {
      const { id, label } = parseNodeExpr(line);
      currentLayer.nodes.push({ id, label });
    }
  }

  return {
    figure: 'arch',
    layers,
    ...cfgSpread(cfg),
  };
}

// ---------------------------------------------------------------------------
// Sequence parser
// ---------------------------------------------------------------------------

function parseSequence(lines: string[]): FigOptions {
  const cfg: CommonConfig = {};
  let actors: string[] = [];
  const messages: SeqMessage[] = [];

  for (const line of lines) {
    if (applyCommonConfig(line, cfg)) continue;

    if (line.startsWith('actors:')) {
      actors = line.slice('actors:'.length).split(',').map((a) => a.trim()).filter(Boolean);
      continue;
    }

    // Dashed return: '-->' (check before '->' since '-->' contains '->')
    if (line.includes('-->')) {
      const parts = splitOnArrow(line, '-->');
      if (parts) {
        const [from, rightRaw] = parts;
        const colonIdx = rightRaw.indexOf(':');
        if (colonIdx !== -1) {
          messages.push({
            from, to: rightRaw.slice(0, colonIdx).trim(),
            label: rightRaw.slice(colonIdx + 1).trim(), style: 'return',
          });
        } else {
          messages.push({ from, to: rightRaw, style: 'return' });
        }
        continue;
      }
    }

    // Solid request: '->'
    if (line.includes('->')) {
      const parts = splitOnArrow(line, '->');
      if (parts) {
        const [from, rightRaw] = parts;
        const colonIdx = rightRaw.indexOf(':');
        if (colonIdx !== -1) {
          messages.push({
            from, to: rightRaw.slice(0, colonIdx).trim(),
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
    ...cfgSpread(cfg),
  };
}

// ---------------------------------------------------------------------------
// Quadrant parser
// ---------------------------------------------------------------------------

/**
 * Parse an axis config line: `x-axis Label: min .. max` or `x-axis: min .. max`.
 * Uses indexOf to avoid regex backtracking.
 */
function parseAxisLine(line: string, prefix: string): { label: string; min: string; max: string } | null {
  if (!line.startsWith(prefix)) return null;
  const content   = line.slice(prefix.length);
  const dotdotIdx = content.indexOf('..');
  if (dotdotIdx === -1) return null;
  const leftPart = content.slice(0, dotdotIdx).trim();
  const max      = content.slice(dotdotIdx + 2).trim();
  const colonIdx = leftPart.indexOf(':');
  if (colonIdx !== -1) {
    return { label: leftPart.slice(0, colonIdx).trim(), min: leftPart.slice(colonIdx + 1).trim(), max };
  }
  return { label: '', min: leftPart, max };
}

function parseQuadrant(lines: string[]): FigOptions {
  const cfg: CommonConfig = {};
  let xAxis = { label: '', min: '', max: '' };
  let yAxis = { label: '', min: '', max: '' };
  const quadrantLabels: [string, string, string, string] = ['', '', '', ''];
  const points: QuadrantPoint[] = [];

  for (const line of lines) {
    if (applyCommonConfig(line, cfg)) continue;

    const xResult = parseAxisLine(line, 'x-axis');
    if (xResult) { xAxis = xResult; continue; }

    const yResult = parseAxisLine(line, 'y-axis');
    if (yResult) { yAxis = yResult; continue; }

    // quadrant-N: label  (N ∈ {1,2,3,4})
    if (line.startsWith('quadrant-')) {
      const body = line.slice('quadrant-'.length);
      const n = body.charCodeAt(0) - 48;
      if (n >= 1 && n <= 4 && body.charAt(1) === ':') {
        quadrantLabels[n - 1] = body.slice(2).trim();
        continue;
      }
    }

    // data point: "Label: x, y"
    const lastComma = line.lastIndexOf(',');
    if (lastComma !== -1) {
      const yStr = line.slice(lastComma + 1).trim();
      const y    = Number(yStr);
      if (Number.isFinite(y) && y >= 0 && y <= 1) {
        const beforeComma = line.slice(0, lastComma);
        const colonIdx    = beforeComma.indexOf(':');
        if (colonIdx !== -1) {
          const label = beforeComma.slice(0, colonIdx).trim();
          const x     = Number(beforeComma.slice(colonIdx + 1).trim());
          if (label && Number.isFinite(x) && x >= 0 && x <= 1) {
            points.push({ id: `p${points.length}`, label, x, y });
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
    ...cfgSpread(cfg),
  };
}

// ---------------------------------------------------------------------------
// Gantt parser
// ---------------------------------------------------------------------------

function parseGantt(lines: string[]): FigOptions {
  const cfg: CommonConfig = {};
  const tasks: GanttTask[] = [];
  const milestones: GanttMilestone[] = [];
  let currentSection: string | undefined;
  const DATE_RE = /^\d{4}-\d{2}-\d{2}$/;

  for (const line of lines) {
    if (applyCommonConfig(line, cfg)) continue;

    if (line.startsWith('section ')) {
      currentSection = line.slice('section '.length).trim();
      continue;
    }

    if (line.startsWith('milestone:')) {
      const body      = line.slice('milestone:'.length).trim();
      const lastComma = body.lastIndexOf(',');
      if (lastComma !== -1) {
        const date = body.slice(lastComma + 1).trim();
        if (DATE_RE.test(date)) {
          milestones.push({ label: body.slice(0, lastComma).trim(), date });
        }
      }
      continue;
    }

    // Task: "Label: id, start, end"
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
    const colonIdx   = labelAndId.indexOf(':');
    if (colonIdx === -1) continue;
    const taskLabel = labelAndId.slice(0, colonIdx).trim();
    const taskId    = labelAndId.slice(colonIdx + 1).trim();
    if (!taskLabel || !taskId) continue;

    tasks.push({
      id: taskId, label: taskLabel, start, end,
      ...(currentSection !== undefined ? { groupId: currentSection } : {}),
    });
  }

  return {
    figure: 'gantt',
    tasks,
    ...(milestones.length > 0 ? { milestones } : {}),
    ...cfgSpread(cfg),
  };
}

// ---------------------------------------------------------------------------
// State parser
// ---------------------------------------------------------------------------

/**
 * `start` and `end` are reserved identifiers that map to the UML pseudo-states.
 * All other identifiers are normal states (`type: 'state'`).
 */
function parseState(lines: string[]): FigOptions {
  const cfg: CommonConfig = {};
  const nodeMap = new Map<string, StateNode>();
  const transitions: StateTransition[] = [];

  const ensureState = (expr: string): string => {
    const { id, label } = parseNodeExpr(expr);
    if (!nodeMap.has(id)) {
      const type = id === 'start' ? 'start' : id === 'end' ? 'end' : 'state';
      const displayLabel = (type === 'start' || type === 'end') ? '' : label;
      nodeMap.set(id, { id, label: displayLabel, type });
    } else if (expr.trim() !== id) {
      const node = nodeMap.get(id)!;
      if (node.type === 'state' && node.label === id) node.label = label;
    }
    return id;
  };

  for (const line of lines) {
    if (applyCommonConfig(line, cfg)) continue;

    if (line.startsWith('accent:')) {
      const id   = line.slice('accent:'.length).trim();
      const node = nodeMap.get(id);
      if (node) node.accent = true;
      continue;
    }

    if (line.includes('-->')) {
      const parts = splitOnArrow(line, '-->');
      if (parts) {
        const [left, rightRaw] = parts;
        const colonIdx = rightRaw.indexOf(':');
        let to    = rightRaw;
        let label: string | undefined;
        if (colonIdx !== -1) {
          to    = rightRaw.slice(0, colonIdx).trim();
          label = rightRaw.slice(colonIdx + 1).trim();
        }
        const fromId = ensureState(left);
        const toId   = ensureState(to);
        transitions.push(label !== undefined
          ? { from: fromId, to: toId, label }
          : { from: fromId, to: toId });
        continue;
      }
    }

    ensureState(line);
  }

  return {
    figure: 'state',
    nodes: [...nodeMap.values()],
    transitions,
    ...cfgSpread(cfg),
  };
}

// ---------------------------------------------------------------------------
// ER parser
// ---------------------------------------------------------------------------

/**
 * Entities are declared with `section EntityName`.  Fields follow as indented
 * (or unindented) lines until the next `section` or a relation line.
 *
 * Config keys (`title`, `subtitle`, `theme`, `palette`) are only recognised
 * before the first `section` line, preventing entity field lines that look
 * like `key: type` from being misinterpreted as meta.
 */
function parseEr(lines: string[]): FigOptions {
  const cfg: CommonConfig = {};
  const entities: ErEntity[] = [];
  const relations: ErRelation[] = [];
  let currentEntity: ErEntity | null = null;
  let seenSection = false;

  for (const line of lines) {
    if (!seenSection && applyCommonConfig(line, cfg)) continue;

    if (line.startsWith('accent:')) {
      const id     = line.slice('accent:'.length).trim();
      const entity = entities.find((e) => e.id === id);
      if (entity) entity.accent = true;
      continue;
    }

    if (line.startsWith('section ')) {
      seenSection   = true;
      const label   = line.slice('section '.length).trim();
      currentEntity = { id: label, label, fields: [] };
      entities.push(currentEntity);
      continue;
    }

    if (line.includes('-->')) {
      const parts = splitOnArrow(line, '-->');
      if (parts) {
        const [from, rightRaw] = parts;
        const colonIdx = rightRaw.indexOf(':');
        if (colonIdx !== -1) {
          relations.push({
            from,
            to:    rightRaw.slice(0, colonIdx).trim(),
            label: rightRaw.slice(colonIdx + 1).trim(),
          });
        } else {
          relations.push({ from, to: rightRaw });
        }
        currentEntity = null;
        continue;
      }
    }

    if (currentEntity) {
      let rest = line;
      let key: ErField['key'];
      let type: string | undefined;

      const colonIdx = rest.indexOf(':');
      if (colonIdx !== -1) {
        type = rest.slice(colonIdx + 1).trim();
        rest = rest.slice(0, colonIdx).trim();
      }

      const tokens = rest.split(/\s+/);
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
    ...cfgSpread(cfg),
  };
}

// ---------------------------------------------------------------------------
// Timeline parser
// ---------------------------------------------------------------------------

function parseTimeline(lines: string[]): FigOptions {
  const cfg: CommonConfig = {};
  const events: TimelineEvent[] = [];
  const DATE_RE = /^\d{4}-\d{2}-\d{2}$/;

  for (const line of lines) {
    if (applyCommonConfig(line, cfg)) continue;

    const colonIdx = line.indexOf(':');
    if (colonIdx === -1) continue;
    const date = line.slice(0, colonIdx).trim();
    if (!DATE_RE.test(date)) continue;
    let label = line.slice(colonIdx + 1).trim();

    let milestone = false;
    if (label.endsWith(' milestone')) {
      milestone = true;
      label     = label.slice(0, -' milestone'.length).trim();
    }

    events.push({
      id: `ev${events.length}`, label, date,
      ...(milestone ? { milestone: true } : {}),
    });
  }

  return {
    figure: 'timeline',
    events,
    ...cfgSpread(cfg),
  };
}

// ---------------------------------------------------------------------------
// Swimlane parser
// ---------------------------------------------------------------------------

/**
 * Lanes are declared with `section LaneName`.  Node lines that follow belong
 * to the current lane until the next `section`.  Edge lines (`A --> B`) may
 * appear anywhere in the body.
 */
function parseSwimlane(lines: string[]): FigOptions {
  const cfg: CommonConfig = {};
  const lanesList: string[] = [];
  const nodes: SwimlaneNode[] = [];
  const edges: SwimlaneEdge[] = [];
  const nodeMap = new Map<string, SwimlaneNode>();
  let currentLane: string | null = null;

  for (const line of lines) {
    if (applyCommonConfig(line, cfg)) continue;

    if (line.startsWith('section ')) {
      currentLane = line.slice('section '.length).trim();
      if (!lanesList.includes(currentLane)) lanesList.push(currentLane);
      continue;
    }

    if (line.includes('-->')) {
      const parts = splitOnArrow(line, '-->');
      if (parts) {
        const [from, rightRaw] = parts;
        const colonIdx = rightRaw.indexOf(':');
        let to    = rightRaw;
        let label: string | undefined;
        if (colonIdx !== -1) {
          to    = rightRaw.slice(0, colonIdx).trim();
          label = rightRaw.slice(colonIdx + 1).trim();
        }
        edges.push(label !== undefined ? { from, to, label } : { from, to });
        continue;
      }
    }

    if (currentLane) {
      const { id, label, type } = parseNodeExpr(line);
      if (!nodeMap.has(id)) {
        const snode: SwimlaneNode = { id, label, lane: currentLane, type };
        nodeMap.set(id, snode);
        nodes.push(snode);
      }
    }
  }

  return {
    figure: 'swimlane',
    lanes: lanesList,
    nodes,
    edges,
    ...cfgSpread(cfg),
  };
}
