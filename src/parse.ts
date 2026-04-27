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
  BubbleItem,
  Direction,
  ThemeType,
  PaletteType,
  NodeType,
} from './types';

/**
 * Parse a `figure <type>` markdown diagram definition and return {@link FigOptions}.
 *
 * Header: `figure <type>` (required). Config: `key: value` lines.
 * Data: `A --> B: label` arrows, `section Name`, `Label: x, y` points,
 * `yyyy-mm-dd: label [milestone]` date events, `Label: id, start, end` Gantt tasks.
 * Lines starting with `%%` are comments.
 *
 * Throws on empty input, missing `figure` header, or unknown type.
 * For a never-throwing render path use `fig(markdown)` instead.
 */
export function parseFigmd(markdown: string): FigOptions {
  const lines: string[] = [];
  for (const raw of markdown.split('\n')) {
    const line = raw.trim();
    if (line && !line.startsWith('%%')) lines.push(line);
  }
  if (lines.length === 0) throw new Error('figmd: empty diagram definition');

  const header = lines[0];
  if (!header.startsWith('figure ')) {
    throw new Error(`figmd: header must start with "figure <type>", got "${header}"`);
  }
  const figureType = header.slice('figure '.length).trim().toLowerCase();
  const body = lines.slice(1);

  switch (figureType) {
    case 'flow':      return parseFlow(body);
    case 'tree':      return parseTree(body);
    case 'arch':      return parseArch(body);
    case 'sequence':  return parseSequence(body);
    case 'quadrant':  return parseQuadrant(body);
    case 'gantt':     return parseGantt(body);
    case 'state':     return parseState(body);
    case 'er':        return parseEr(body);
    case 'timeline':  return parseTimeline(body);
    case 'swimlane':  return parseSwimlane(body);
    case 'bubble':    return parseBubble(body);
    default:
      throw new Error(
        `figmd: unknown figure type "${figureType}". ` +
          `Expected one of: flow, tree, arch, sequence, quadrant, gantt, state, er, timeline, swimlane, bubble`,
      );
  }
}

// --- shared utilities ---

interface CommonConfig {
  title?:     string;
  subtitle?:  string;
  theme?:     ThemeType;
  palette?:   PaletteType;
  direction?: Direction;
}

function applyCommonConfig(line: string, cfg: CommonConfig): boolean {
  const ci = line.indexOf(':');
  if (ci === -1) return false;
  const key = line.slice(0, ci).trim();
  const val = line.slice(ci + 1).trim();
  switch (key) {
    case 'title':     cfg.title     = val; return true;
    case 'subtitle':  cfg.subtitle  = val; return true;
    case 'theme':     cfg.theme     = val as ThemeType; return true;
    case 'palette':   cfg.palette   = val; return true;
    case 'direction': cfg.direction = val as Direction; return true;
    default: return false;
  }
}

const cfgSpread = (c: CommonConfig) =>
  Object.fromEntries(Object.entries(c).filter(([, v]) => v !== undefined)) as Partial<CommonConfig>;

/** Split on the first `arrow`; returns `[left, right]` trimmed, or `null`. */
function splitOnArrow(line: string, arrow: string): [string, string] | null {
  const idx = line.indexOf(arrow);
  if (idx === -1) return null;
  const left  = line.slice(0, idx).trim();
  const right = line.slice(idx + arrow.length).trim();
  if (!left || !right) return null;
  return [left, right];
}

/**
 * Parse a node expression `id[label]`, `id{label}`, `id((label))`, `id[/label/]`,
 * or a bare identifier. Uses indexOf/endsWith to avoid regex backtracking.
 */
function parseNodeExpr(expr: string): { id: string; label: string; type: NodeType } {
  const s = expr.trim();

  const dblOpen = s.indexOf('((');
  if (dblOpen > 0 && s.endsWith('))')) {
    const id = s.slice(0, dblOpen).trim();
    if (id) return { id, label: s.slice(dblOpen + 2, s.length - 2).trim() || id, type: 'terminal' };
  }

  const ioOpen = s.indexOf('[/');
  if (ioOpen > 0 && s.endsWith('/]')) {
    const id = s.slice(0, ioOpen).trim();
    if (id) return { id, label: s.slice(ioOpen + 2, s.length - 2).trim() || id, type: 'io' };
  }

  const sqOpen = s.indexOf('[');
  if (sqOpen > 0 && s.endsWith(']') && s[sqOpen + 1] !== '/') {
    const id = s.slice(0, sqOpen).trim();
    if (id) return { id, label: s.slice(sqOpen + 1, s.length - 1).trim() || id, type: 'process' };
  }

  const curlOpen = s.indexOf('{');
  if (curlOpen > 0 && s.endsWith('}')) {
    const id = s.slice(0, curlOpen).trim();
    if (id) return { id, label: s.slice(curlOpen + 1, s.length - 1).trim() || id, type: 'decision' };
  }

  return { id: s, label: s, type: 'process' };
}

/**
 * For flow right-hand sides: split `nodeExpr: edgeLabel` into node expression and
 * optional edge label.  The separator `:` must appear *after* the closing bracket.
 */
function splitFlowRight(s: string): [string, string | undefined] {
  const lastSq  = s.lastIndexOf(']');
  const lastCu  = s.lastIndexOf('}');
  const lastDbl = s.lastIndexOf('))');
  const term    = Math.max(lastSq, lastCu, lastDbl !== -1 ? lastDbl + 1 : -1);

  if (term > 0) {
    const after = s.slice(term + 1).trimStart();
    return after.startsWith(':')
      ? [s.slice(0, term + 1).trim(), after.slice(1).trim()]
      : [s, undefined];
  }
  const ci = s.indexOf(':');
  return ci !== -1 ? [s.slice(0, ci).trim(), s.slice(ci + 1).trim()] : [s, undefined];
}

/**
 * Parse `from --> to: label` (or with a custom arrow).
 * Returns `{ from, to, label? }` or `null` if the line doesn't contain the arrow.
 */
function parseEdge(line: string, arrow = '-->'): { from: string; to: string; label?: string } | null {
  if (!line.includes(arrow)) return null;
  const p = splitOnArrow(line, arrow);
  if (!p) return null;
  const [from, r] = p;
  const ci = r.indexOf(':');
  return ci !== -1
    ? { from, to: r.slice(0, ci).trim(), label: r.slice(ci + 1).trim() }
    : { from, to: r };
}

// --- flow ---

function parseFlow(lines: string[]): FigOptions {
  const cfg: CommonConfig = {};
  const nodeMap = new Map<string, FlowNode>();
  const edges: FlowEdge[] = [];
  const groups: FlowGroup[] = [];

  const ensureNode = (expr: string): string => {
    const { id, label, type } = parseNodeExpr(expr);
    if (!nodeMap.has(id) || expr.trim() !== id) nodeMap.set(id, { id, label, type });
    return id;
  };

  for (const line of lines) {
    if (applyCommonConfig(line, cfg)) continue;

    if (line.startsWith('group ')) {
      const body = line.slice('group '.length);
      const ci = body.indexOf(':');
      if (ci !== -1) {
        const label = body.slice(0, ci).trim();
        const nodes = body.slice(ci + 1).split(',').map((n) => n.trim()).filter(Boolean);
        if (nodes.length > 0) groups.push({ id: `grp-${groups.length}`, label, nodes });
      }
      continue;
    }

    if (line.includes('-->')) {
      const p = splitOnArrow(line, '-->');
      if (p) {
        const [left, rightRaw] = p;
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

  return { figure: 'flow', nodes: [...nodeMap.values()], edges, ...(groups.length ? { groups } : {}), ...cfgSpread(cfg) };
}

// --- tree ---

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
      const p = splitOnArrow(line, '-->');
      if (p) { ensureNode(p[1], ensureNode(p[0])); continue; }
    }
    ensureNode(line);
  }

  return { figure: 'tree', nodes: [...nodeMap.values()], ...cfgSpread(cfg) };
}

// --- arch ---

function parseArch(lines: string[]): FigOptions {
  const cfg: CommonConfig = {};
  const layers: ArchLayer[] = [];
  let cur: ArchLayer | null = null;

  for (const line of lines) {
    if (applyCommonConfig(line, cfg)) continue;
    if (line.startsWith('layer ')) {
      const label = line.slice('layer '.length).trim();
      cur = { id: label, label, nodes: [] };
      layers.push(cur);
      continue;
    }
    if (cur) { const { id, label } = parseNodeExpr(line); cur.nodes.push({ id, label }); }
  }

  return { figure: 'arch', layers, ...cfgSpread(cfg) };
}

// --- sequence ---

function parseSequence(lines: string[]): FigOptions {
  const cfg: CommonConfig = {};
  let actors: string[] = [];
  const messages: SeqMessage[] = [];

  const addMsg = (e: { from: string; to: string; label?: string } | null, style?: 'return') => {
    if (!e) return;
    messages.push({ from: e.from, to: e.to, ...(e.label ? { label: e.label } : {}), ...(style ? { style } : {}) });
  };

  for (const line of lines) {
    if (applyCommonConfig(line, cfg)) continue;
    if (line.startsWith('actors:')) {
      actors = line.slice('actors:'.length).split(',').map((a) => a.trim()).filter(Boolean);
      continue;
    }
    if (line.includes('-->')) { addMsg(parseEdge(line, '-->'), 'return'); continue; }
    if (line.includes('->'))  { addMsg(parseEdge(line, '->')); continue; }
  }

  if (actors.length === 0) {
    const seen = new Set<string>();
    for (const m of messages) {
      if (!seen.has(m.from)) { seen.add(m.from); actors.push(m.from); }
      if (!seen.has(m.to))   { seen.add(m.to);   actors.push(m.to);   }
    }
  }

  return { figure: 'sequence', actors, messages, ...cfgSpread(cfg) };
}

// --- quadrant ---

function parseAxisLine(line: string, prefix: string): { label: string; min: string; max: string } | null {
  if (!line.startsWith(prefix)) return null;
  const content = line.slice(prefix.length);
  const dotdot  = content.indexOf('..');
  if (dotdot === -1) return null;
  const left = content.slice(0, dotdot).trim();
  const max  = content.slice(dotdot + 2).trim();
  const ci   = left.indexOf(':');
  return ci !== -1
    ? { label: left.slice(0, ci).trim(), min: left.slice(ci + 1).trim(), max }
    : { label: '', min: left, max };
}

function parseQuadrant(lines: string[]): FigOptions {
  const cfg: CommonConfig = {};
  let xAxis = { label: '', min: '', max: '' };
  let yAxis = { label: '', min: '', max: '' };
  const quadrantLabels: [string, string, string, string] = ['', '', '', ''];
  const points: QuadrantPoint[] = [];

  for (const line of lines) {
    if (applyCommonConfig(line, cfg)) continue;

    const xa = parseAxisLine(line, 'x-axis');
    if (xa) { xAxis = xa; continue; }
    const ya = parseAxisLine(line, 'y-axis');
    if (ya) { yAxis = ya; continue; }

    if (line.startsWith('quadrant-')) {
      const body = line.slice('quadrant-'.length);
      const n = body.charCodeAt(0) - 48;
      if (n >= 1 && n <= 4 && body.charAt(1) === ':') { quadrantLabels[n - 1] = body.slice(2).trim(); continue; }
    }

    const lc = line.lastIndexOf(',');
    if (lc !== -1) {
      const y = Number(line.slice(lc + 1).trim());
      if (Number.isFinite(y) && y >= 0 && y <= 1) {
        const before = line.slice(0, lc);
        const ci = before.indexOf(':');
        if (ci !== -1) {
          const label = before.slice(0, ci).trim();
          const x     = Number(before.slice(ci + 1).trim());
          if (label && Number.isFinite(x) && x >= 0 && x <= 1) {
            points.push({ id: `p${points.length}`, label, x, y }); continue;
          }
        }
      }
    }
  }

  return { figure: 'quadrant', xAxis, yAxis, quadrants: quadrantLabels, points, ...cfgSpread(cfg) };
}

// --- gantt ---

function parseGantt(lines: string[]): FigOptions {
  const cfg: CommonConfig = {};
  const tasks: GanttTask[] = [];
  const milestones: GanttMilestone[] = [];
  let section: string | undefined;
  const DATE = /^\d{4}-\d{2}-\d{2}$/;

  for (const line of lines) {
    if (applyCommonConfig(line, cfg)) continue;

    if (line.startsWith('section ')) { section = line.slice('section '.length).trim(); continue; }

    if (line.startsWith('milestone:')) {
      const body = line.slice('milestone:'.length).trim();
      const lc   = body.lastIndexOf(',');
      if (lc !== -1) {
        const date = body.slice(lc + 1).trim();
        if (DATE.test(date)) milestones.push({ label: body.slice(0, lc).trim(), date });
      }
      continue;
    }

    const lc = line.lastIndexOf(',');
    if (lc === -1) continue;
    const end = line.slice(lc + 1).trim();
    if (!DATE.test(end)) continue;

    const before = line.slice(0, lc);
    const pc     = before.lastIndexOf(',');
    if (pc === -1) continue;
    const start = before.slice(pc + 1).trim();
    if (!DATE.test(start)) continue;

    const rest = before.slice(0, pc);
    const ci   = rest.indexOf(':');
    if (ci === -1) continue;
    const taskLabel = rest.slice(0, ci).trim();
    const taskId    = rest.slice(ci + 1).trim();
    if (!taskLabel || !taskId) continue;

    tasks.push({ id: taskId, label: taskLabel, start, end, ...(section !== undefined ? { groupId: section } : {}) });
  }

  return { figure: 'gantt', tasks, ...(milestones.length ? { milestones } : {}), ...cfgSpread(cfg) };
}

// --- state ---

function parseState(lines: string[]): FigOptions {
  const cfg: CommonConfig = {};
  const nodeMap = new Map<string, StateNode>();
  const transitions: StateTransition[] = [];
  const accentIds = new Set<string>();

  const ensureState = (expr: string): string => {
    const { id, label } = parseNodeExpr(expr);
    if (!nodeMap.has(id)) {
      const type = id === 'start' ? 'start' : id === 'end' ? 'end' : 'state';
      nodeMap.set(id, { id, label: type === 'state' ? label : '', type });
    } else if (expr.trim() !== id) {
      const node = nodeMap.get(id)!;
      if (node.type === 'state' && node.label === id) node.label = label;
    }
    return id;
  };

  for (const line of lines) {
    if (applyCommonConfig(line, cfg)) continue;
    if (line.startsWith('accent:')) {
      accentIds.add(line.slice('accent:'.length).trim());
      continue;
    }
    const e = parseEdge(line);
    if (e) {
      const from = ensureState(e.from);
      const to   = ensureState(e.to);
      transitions.push(e.label !== undefined ? { from, to, label: e.label } : { from, to });
      continue;
    }
    ensureState(line);
  }

  for (const id of accentIds) {
    const node = nodeMap.get(id);
    if (node) node.accent = true;
  }

  return { figure: 'state', nodes: [...nodeMap.values()], transitions, ...cfgSpread(cfg) };
}

// --- er ---

function parseEr(lines: string[]): FigOptions {
  const cfg: CommonConfig = {};
  const entities: ErEntity[] = [];
  const relations: ErRelation[] = [];
  let cur: ErEntity | null = null;
  let seenEntity = false;

  for (const line of lines) {
    if (!seenEntity && applyCommonConfig(line, cfg)) continue;
    if (line.startsWith('accent:')) {
      const ent = entities.find((e) => e.id === line.slice('accent:'.length).trim());
      if (ent) ent.accent = true;
      continue;
    }
    if (line.startsWith('entity ')) {
      seenEntity = true;
      const label = line.slice('entity '.length).trim();
      cur = { id: label, label, fields: [] };
      entities.push(cur);
      continue;
    }
    const e = parseEdge(line);
    if (e) {
      relations.push(e.label !== undefined ? { from: e.from, to: e.to, label: e.label } : { from: e.from, to: e.to });
      cur = null;
      continue;
    }
    if (cur) {
      let rest = line;
      let key: ErField['key'];
      let type: string | undefined;
      const ci = rest.indexOf(':');
      if (ci !== -1) { type = rest.slice(ci + 1).trim(); rest = rest.slice(0, ci).trim(); }
      const tokens = rest.split(/\s+/);
      const name   = tokens[0];
      for (let i = 1; i < tokens.length; i++) {
        const t = tokens[i].toLowerCase();
        if (t === 'pk' || t === 'fk') { key = t as ErField['key']; break; }
      }
      if (name) cur.fields.push({ name, ...(type ? { type } : {}), ...(key ? { key } : {}) });
    }
  }

  return { figure: 'er', entities, relations, ...cfgSpread(cfg) };
}

// --- timeline ---

function parseTimeline(lines: string[]): FigOptions {
  const cfg: CommonConfig = {};
  const events: TimelineEvent[] = [];
  const DATE = /^\d{4}-\d{2}-\d{2}$/;

  for (const line of lines) {
    if (applyCommonConfig(line, cfg)) continue;
    const ci = line.indexOf(':');
    if (ci === -1) continue;
    const date = line.slice(0, ci).trim();
    if (!DATE.test(date)) continue;
    let label = line.slice(ci + 1).trim();
    let milestone = false;
    if (label.endsWith(' milestone')) { milestone = true; label = label.slice(0, -' milestone'.length).trim(); }
    events.push({ id: `ev${events.length}`, label, date, ...(milestone ? { milestone: true } : {}) });
  }

  return { figure: 'timeline', events, ...cfgSpread(cfg) };
}

// --- swimlane ---

function parseSwimlane(lines: string[]): FigOptions {
  const cfg: CommonConfig = {};
  const lanesList: string[] = [];
  const nodes: SwimlaneNode[] = [];
  const edges: SwimlaneEdge[] = [];
  const nodeMap = new Map<string, SwimlaneNode>();
  let lane: string | null = null;

  for (const line of lines) {
    if (applyCommonConfig(line, cfg)) continue;
    if (line.startsWith('section ')) {
      lane = line.slice('section '.length).trim();
      if (!lanesList.includes(lane)) lanesList.push(lane);
      continue;
    }
    const e = parseEdge(line);
    if (e) {
      edges.push(e.label !== undefined ? { from: e.from, to: e.to, label: e.label } : { from: e.from, to: e.to });
      continue;
    }
    if (lane) {
      const { id, label, type } = parseNodeExpr(line);
      if (!nodeMap.has(id)) {
        const snode: SwimlaneNode = { id, label, lane, type };
        nodeMap.set(id, snode);
        nodes.push(snode);
      }
    }
  }

  return { figure: 'swimlane', lanes: lanesList, nodes, edges, ...cfgSpread(cfg) };
}

// --- bubble ---

function parseBubble(lines: string[]): FigOptions {
  const cfg: CommonConfig = {};
  const items: BubbleItem[] = [];

  for (const line of lines) {
    if (applyCommonConfig(line, cfg)) continue;

    // Bubble data line: `Label: value`
    const ci = line.indexOf(':');
    if (ci === -1) continue;
    const label    = line.slice(0, ci).trim();
    const valueStr = line.slice(ci + 1).trim();
    if (!label) continue;
    const value = Number(valueStr);
    if (!Number.isFinite(value) || value <= 0) continue;

    items.push({ label, value });
  }

  return { figure: 'bubble', items, ...cfgSpread(cfg) };
}
