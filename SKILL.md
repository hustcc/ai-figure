---
name: ai-figure
version: "0.1.0"
description: Generate clean SVG diagrams (flowchart, tree, architecture, sequence, quadrant, gantt) from a JSON config via a single fig() API. Auto-layout, zero coordinates needed. Works in browser and Node.js.
author: hustcc
license: MIT
package: ai-figure
api: fig(options) → string (SVG)
tags: [flowchart, tree-diagram, architecture-diagram, sequence-diagram, quadrant-chart, gantt-chart, svg, layout, visualization]
---

# ai-figure Skill

## What this skill does

Converts a declarative JSON config into a fully-rendered SVG diagram string. You never specify coordinates — the layout is computed automatically.

A single `fig()` function handles all diagram types. Select the type via the required `figure` field.

## How to use

```typescript
import { fig } from 'ai-figure';

const svg = fig(config);
// DOM: document.getElementById('chart').innerHTML = svg;
// Node.js: fs.writeFileSync('chart.svg', svg);
```

| `figure` value | Diagram type       | Key fields                                    |
|----------------|--------------------|-----------------------------------------------|
| `'flow'`       | Flowchart          | `nodes`, `edges`, `groups?`                   |
| `'tree'`       | Tree / hierarchy   | `nodes` (with `parent` refs)                  |
| `'arch'`       | Architecture grid  | `layers`                                      |
| `'sequence'`   | Sequence diagram   | `actors`, `messages`                          |
| `'quadrant'`   | Quadrant chart     | `xAxis`, `yAxis`, `quadrants`, `points`       |
| `'gantt'`      | Gantt chart        | `tasks`, `milestones?`                        |

### Common options (all diagram types)

| Field      | Type          | Default      | Description                                           |
|------------|---------------|--------------|-------------------------------------------------------|
| `title`    | string        | `undefined`  | Centered title above the diagram                      |
| `subtitle` | string        | `undefined`  | Centered subtitle below the title                     |
| `theme`    | string        | `"light"`    | `"light"` or `"dark"` rendering mode                 |
| `palette`  | string\|array | `"default"`  | `"default"`, `"antv"`, `"drawio"`, `"figma"`, `"vega"`, `"mono-blue"`, `"mono-green"`, `"mono-purple"`, `"mono-orange"`, or 4-element hex array |

---

## figure: 'flow' — Flowchart

```json
{
  "figure": "flow",
  "nodes": [
    { "id": "start",  "label": "Start",           "type": "terminal" },
    { "id": "req",    "label": "HTTP Request",     "type": "io"       },
    { "id": "auth",   "label": "Authenticate",     "type": "process"  },
    { "id": "check",  "label": "Authorized?",      "type": "decision" },
    { "id": "handle", "label": "Handle Request",   "type": "process"  },
    { "id": "ok",     "label": "200 OK",           "type": "terminal" },
    { "id": "deny",   "label": "403 Forbidden",    "type": "terminal" }
  ],
  "edges": [
    { "from": "start",  "to": "req"                    },
    { "from": "req",    "to": "auth"                   },
    { "from": "auth",   "to": "check"                  },
    { "from": "check",  "to": "handle", "label": "Yes" },
    { "from": "check",  "to": "deny",   "label": "No"  },
    { "from": "handle", "to": "ok"                     }
  ],
  "groups": [{ "id": "g1", "label": "Auth Layer", "nodes": ["auth", "check"] }],
  "direction": "TB"
}
```

**Node types** — `process` (rectangle, default), `decision` (diamond), `terminal` (pill — start/end only), `io` (parallelogram).

**Key rules:**
- Use `type: "terminal"` for start and end nodes; all branches must terminate at a terminal node.
- Label `decision` outgoing edges (`"Yes"` / `"No"`).
- Use `"LR"` direction for pipelines, `"TB"` for trees/branches.
- Node labels ≤ 20 chars fit without wrapping.

```typescript
interface FlowChartOptions {
  nodes: FlowNode[]; edges: FlowEdge[]; groups?: FlowGroup[];
  title?: string; subtitle?: string; theme?: 'light'|'dark'; palette?: string|string[]; direction?: 'TB'|'LR';
}
interface FlowNode  { id: string; label: string; type?: 'process'|'decision'|'terminal'|'io' }
interface FlowEdge  { from: string; to: string; label?: string }
interface FlowGroup { id: string; label: string; nodes: string[] }
```

---

## figure: 'tree' — Tree Diagram

Renders a hierarchy from a flat node list with `parent` references. Nodes are colored by depth level.

```json
{
  "figure": "tree",
  "nodes": [
    { "id": "ceo", "label": "CEO" },
    { "id": "cto", "label": "CTO", "parent": "ceo" },
    { "id": "coo", "label": "COO", "parent": "ceo" },
    { "id": "fe",  "label": "FE Lead", "parent": "cto" }
  ],
  "direction": "TB"
}
```

```typescript
interface TreeDiagramOptions {
  nodes: TreeNode[]; title?: string; subtitle?: string;
  theme?: 'light'|'dark'; palette?: string|string[]; direction?: 'TB'|'LR';
}
interface TreeNode { id: string; label: string; parent?: string }
```

---

## figure: 'arch' — Architecture Diagram

Renders a tech-stack landscape as layered, color-coded cards — no edges needed. Width auto-sizes from the layer/node count.

```json
{
  "figure": "arch",
  "layers": [
    { "id": "fe", "label": "Frontend", "nodes": [{ "id": "react", "label": "React" }, { "id": "vue", "label": "Vue" }] },
    { "id": "be", "label": "Backend",  "nodes": [{ "id": "node",  "label": "Node.js" }] }
  ],
  "direction": "TB"
}
```

`direction: "TB"` stacks layers top-to-bottom; `"LR"` places them side-by-side.

```typescript
interface ArchDiagramOptions {
  layers: ArchLayer[]; title?: string; subtitle?: string;
  theme?: 'light'|'dark'; palette?: string|string[]; direction?: 'TB'|'LR';
}
interface ArchLayer { id: string; label: string; nodes: ArchNode[] }
interface ArchNode  { id: string; label: string }
```

---

## figure: 'sequence' — Sequence Diagram

Renders a sequence diagram with vertical lifelines and horizontal message arrows.

```json
{
  "figure": "sequence",
  "actors": ["Browser", "API", "DB"],
  "messages": [
    { "from": "Browser", "to": "API", "label": "POST /login" },
    { "from": "API",     "to": "DB",  "label": "SELECT user" },
    { "from": "DB",      "to": "API", "label": "user row",   "style": "return" },
    { "from": "API",     "to": "Browser", "label": "200 OK", "style": "return" }
  ]
}
```

Use `"style": "return"` for dashed response arrows; omit for solid request arrows.

```typescript
interface SequenceDiagramOptions {
  actors: string[]; messages: SeqMessage[];
  title?: string; subtitle?: string; theme?: 'light'|'dark'; palette?: string|string[];
}
interface SeqMessage { from: string; to: string; label?: string; style?: 'solid'|'return' }
```

---

## figure: 'quadrant' — Quadrant Chart

2×2 matrix with axes and data points by normalized `x`/`y` (0–1). Canvas auto-sizes from 640×640 up to 1024×1024.

```json
{
  "figure": "quadrant",
  "xAxis": { "label": "Effort", "min": "Low", "max": "High" },
  "yAxis": { "label": "Value",  "min": "Low", "max": "High" },
  "quadrants": ["Quick Wins", "Major Projects", "Fill-ins", "Thankless Tasks"],
  "points": [
    { "id": "a", "label": "Feature A", "x": 0.2, "y": 0.9 },
    { "id": "b", "label": "Feature B", "x": 0.8, "y": 0.8 },
    { "id": "c", "label": "Feature C", "x": 0.3, "y": 0.2 }
  ]
}
```

`quadrants` order: **[top-left, top-right, bottom-left, bottom-right]**. `x=0` left, `x=1` right; `y=0` bottom, `y=1` top.

```typescript
interface QuadrantChartOptions {
  xAxis: { label: string; min: string; max: string };
  yAxis: { label: string; min: string; max: string };
  quadrants: [string, string, string, string];
  points: QuadrantPoint[];
  title?: string; subtitle?: string; theme?: 'light'|'dark'; palette?: string|string[];
}
interface QuadrantPoint { id: string; label: string; x: number; y: number }
```

---

## figure: 'gantt' — Gantt Chart

Project timeline with task bars, optional group headers, and milestone markers. Width fixed at 804 px; height auto-adapts. Time axis ticks adjust automatically: weekly (≤63 days), monthly (≤400 days), quarterly otherwise.

```json
{
  "figure": "gantt",
  "title": "Project Roadmap",
  "subtitle": "Q1 2025",
  "tasks": [
    { "id": "design", "label": "Design",       "start": "2025-01-06", "end": "2025-01-24" },
    { "id": "fe",     "label": "Frontend Dev", "start": "2025-01-20", "end": "2025-02-28", "groupId": "dev" },
    { "id": "be",     "label": "Backend Dev",  "start": "2025-01-13", "end": "2025-03-07", "groupId": "dev" },
    { "id": "qa",     "label": "QA Testing",   "start": "2025-02-24", "end": "2025-03-14", "groupId": "qa"  },
    { "id": "deploy", "label": "Deploy",       "start": "2025-03-17", "end": "2025-03-21" }
  ],
  "milestones": [
    { "date": "2025-01-24", "label": "Design freeze" },
    { "date": "2025-03-21", "label": "Launch" }
  ]
}
```

**Key rules:**
- Dates must be `yyyy-mm-dd`. `end` must be ≥ `start`.
- `groupId` clusters tasks under a bold header row; the `groupId` value is used as the header label.
- Ungrouped tasks render first, then grouped tasks.
- Label column is 160 px — keep labels ≤ 18 chars to avoid clipping.
- `color` accepts 6-digit hex only (e.g. `"#e64980"`).

```typescript
interface GanttChartOptions {
  tasks: GanttTask[]; milestones?: GanttMilestone[];
  title?: string; subtitle?: string; theme?: 'light'|'dark'; palette?: string|string[];
}
interface GanttTask {
  id: string; label: string; start: string; end: string; // yyyy-mm-dd
  groupId?: string; color?: string; // 6-digit hex
}
interface GanttMilestone { date: string; label: string } // yyyy-mm-dd
```
