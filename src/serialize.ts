import type { FigOptions, NodeType, PaletteType } from './types';

// --- helpers ---

/**
 * Serialize a node id/label/type into the bracket expression used by the
 * parser's `parseNodeExpr`:
 *   process → `id` (when id === label) or `id[label]`
 *   decision → `id{label}`
 *   terminal → `id((label))`
 *   io       → `id[/label/]`
 */
function nodeExpr(id: string, label: string, type?: NodeType): string {
  const t = type ?? 'process';
  if (t === 'decision') return `${id}{${label}}`;
  if (t === 'terminal') return `${id}((${label}))`;
  if (t === 'io')       return `${id}[/${label}/]`;
  return id === label ? id : `${id}[${label}]`;
}

/** Emit `key: value` lines for the common config fields. */
function commonLines(opts: {
  title?:     string;
  subtitle?:  string;
  theme?:     string;
  palette?:   PaletteType;
  direction?: string;
}): string[] {
  const lines: string[] = [];
  if (opts.title)     lines.push(`title: ${opts.title}`);
  if (opts.subtitle)  lines.push(`subtitle: ${opts.subtitle}`);
  if (opts.theme)     lines.push(`theme: ${opts.theme}`);
  if (opts.palette != null) {
    const p = Array.isArray(opts.palette) ? opts.palette.join(',') : opts.palette;
    lines.push(`palette: ${p}`);
  }
  if (opts.direction) lines.push(`direction: ${opts.direction}`);
  return lines;
}

// ---------------------------------------------------------------------------
// Public API
// ---------------------------------------------------------------------------

/**
 * Serialize a {@link FigOptions} config object to the ai-figure markdown syntax.
 *
 * The resulting string is accepted by `parseFigmd` (and therefore `fig`) and
 * is round-trip safe: `parseFigmd(figToMarkdown(opts))` yields an equivalent
 * diagram config.
 *
 * Syntax summary:
 * - Header:  `figure <type>`
 * - Config:  `key: value`  (title / subtitle / theme / palette / direction)
 * - Nodes:   `id[label]` · `id{label}` · `id((label))` · `id[/label/]`
 * - Edges:   `from --> to` or `from --> to: label`
 * - Groups:  `group Label: id1, id2, …`
 * - Layers:  `layer Label`
 * - Sections:`section Name`
 * - Actors:  `actors: A, B, C`
 * - Axes:    `x-axis Label: min..max`
 * - Gantt task: `Label: id, start, end`
 * - Milestone: `milestone: label, date`
 * - Timeline event: `date: label [milestone]`
 * - Accent:  `accent: id`
 * - Bubble item: `Label: value`
 */
export function figToMarkdown(options: FigOptions): string {
  const out: string[] = [`figure ${options.figure}`];

  switch (options.figure) {

    // -----------------------------------------------------------------------
    case 'flow': {
      out.push(...commonLines(options));
      const byId = new Map(options.nodes.map(n => [n.id, n]));
      // Nodes not referenced by any edge need standalone declarations.
      const inEdge = new Set<string>();
      for (const e of options.edges) { inEdge.add(e.from); inEdge.add(e.to); }
      for (const n of options.nodes) {
        if (!inEdge.has(n.id)) out.push(nodeExpr(n.id, n.label, n.type));
      }
      // Edges — inline node expressions encode type + label.
      for (const e of options.edges) {
        const fn = byId.get(e.from) ?? { id: e.from, label: e.from, type: 'process' as NodeType };
        const tn = byId.get(e.to)   ?? { id: e.to,   label: e.to,   type: 'process' as NodeType };
        const line = `${nodeExpr(fn.id, fn.label, fn.type)} --> ${nodeExpr(tn.id, tn.label, tn.type)}`;
        out.push(e.label ? `${line}: ${e.label}` : line);
      }
      // Groups
      if (options.groups) {
        for (const g of options.groups) {
          out.push(`group ${g.label}: ${g.nodes.join(', ')}`);
        }
      }
      break;
    }

    // -----------------------------------------------------------------------
    case 'tree': {
      out.push(...commonLines(options));
      const byId = new Map(options.nodes.map(n => [n.id, n]));
      // Roots that have children appear implicitly as the left-side of edge
      // lines; only roots with no children need an explicit standalone line.
      const parentIds = new Set(options.nodes.filter(n => n.parent).map(n => n.parent!));
      for (const n of options.nodes) {
        if (n.parent) {
          const par = byId.get(n.parent) ?? { id: n.parent, label: n.parent };
          out.push(`${nodeExpr(par.id, par.label)} --> ${nodeExpr(n.id, n.label)}`);
        } else if (!parentIds.has(n.id)) {
          // Isolated root — needs explicit declaration.
          out.push(nodeExpr(n.id, n.label));
        }
      }
      break;
    }

    // -----------------------------------------------------------------------
    case 'arch': {
      out.push(...commonLines(options));
      for (const layer of options.layers) {
        out.push(`layer ${layer.label}`);
        for (const n of layer.nodes) {
          out.push(n.id === n.label ? n.id : `${n.id}[${n.label}]`);
        }
      }
      break;
    }

    // -----------------------------------------------------------------------
    case 'sequence': {
      out.push(...commonLines(options));
      if (options.actors.length > 0) {
        out.push(`actors: ${options.actors.join(', ')}`);
      }
      for (const m of options.messages) {
        const arrow = m.style === 'return' ? '-->' : '->';
        const base  = `${m.from} ${arrow} ${m.to}`;
        out.push(m.label ? `${base}: ${m.label}` : base);
      }
      break;
    }

    // -----------------------------------------------------------------------
    case 'quadrant': {
      out.push(...commonLines(options));
      const xa = options.xAxis;
      const ya = options.yAxis;
      out.push(xa.label ? `x-axis ${xa.label}: ${xa.min}..${xa.max}` : `x-axis ${xa.min}..${xa.max}`);
      out.push(ya.label ? `y-axis ${ya.label}: ${ya.min}..${ya.max}` : `y-axis ${ya.min}..${ya.max}`);
      options.quadrants.forEach((label, i) => out.push(`quadrant-${i + 1}: ${label}`));
      for (const p of options.points) {
        out.push(`${p.label}: ${p.x}, ${p.y}`);
      }
      break;
    }

    // -----------------------------------------------------------------------
    case 'gantt': {
      out.push(...commonLines(options));
      // Preserve first-seen groupId order.
      const order: (string | undefined)[] = [];
      const seen  = new Set<string | undefined>();
      for (const t of options.tasks) {
        if (!seen.has(t.groupId)) { seen.add(t.groupId); order.push(t.groupId); }
      }
      for (const gid of order) {
        if (gid !== undefined) out.push(`section ${gid}`);
        for (const t of options.tasks) {
          if (t.groupId === gid) out.push(`${t.label}: ${t.id}, ${t.start}, ${t.end}`);
        }
      }
      if (options.milestones) {
        for (const m of options.milestones) out.push(`milestone: ${m.label}, ${m.date}`);
      }
      break;
    }

    // -----------------------------------------------------------------------
    case 'state': {
      out.push(...commonLines(options));
      for (const n of options.nodes) {
        if (n.type === 'start' || n.type === 'end') {
          out.push(n.id);
        } else {
          out.push(nodeExpr(n.id, n.label));
        }
      }
      for (const t of options.transitions) {
        out.push(t.label ? `${t.from} --> ${t.to}: ${t.label}` : `${t.from} --> ${t.to}`);
      }
      for (const n of options.nodes) {
        if (n.accent) out.push(`accent: ${n.id}`);
      }
      break;
    }

    // -----------------------------------------------------------------------
    case 'er': {
      // Config MUST come before the first `entity` line (parser locks out
      // common-config processing after the first entity).
      out.push(...commonLines(options));
      for (const entity of options.entities) {
        out.push(`entity ${entity.label}`);
        for (const f of entity.fields) {
          let line = f.name;
          if (f.key)  line += ` ${f.key}`;
          if (f.type) line += `: ${f.type}`;
          out.push(line);
        }
      }
      for (const r of options.relations) {
        out.push(r.label ? `${r.from} --> ${r.to}: ${r.label}` : `${r.from} --> ${r.to}`);
      }
      // accent must appear after entity declarations so the parser can find them.
      for (const e of options.entities) {
        if (e.accent) out.push(`accent: ${e.id}`);
      }
      break;
    }

    // -----------------------------------------------------------------------
    case 'timeline': {
      out.push(...commonLines(options));
      for (const ev of options.events) {
        out.push(ev.milestone ? `${ev.date}: ${ev.label} milestone` : `${ev.date}: ${ev.label}`);
      }
      break;
    }

    // -----------------------------------------------------------------------
    case 'swimlane': {
      out.push(...commonLines(options));
      // Group nodes by lane, preserving the lanes order.
      const byLane = new Map<string, typeof options.nodes>();
      for (const lane of options.lanes) byLane.set(lane, []);
      for (const n of options.nodes) {
        if (!byLane.has(n.lane)) byLane.set(n.lane, []);
        byLane.get(n.lane)!.push(n);
      }
      for (const [lane, nodes] of byLane) {
        out.push(`section ${lane}`);
        for (const n of nodes) out.push(nodeExpr(n.id, n.label, n.type));
      }
      for (const e of options.edges) {
        out.push(e.label ? `${e.from} --> ${e.to}: ${e.label}` : `${e.from} --> ${e.to}`);
      }
      break;
    }

    // -----------------------------------------------------------------------
    case 'bubble': {
      out.push(...commonLines(options));
      for (const item of options.items) {
        out.push(`${item.label}: ${item.value}`);
      }
      break;
    }
  }

  return out.join('\n');
}
