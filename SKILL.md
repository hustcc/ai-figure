---
name: ai-figure
version: "0.1.0"
description: Generate clean SVG diagrams (flowchart, tree, architecture, sequence, quadrant, gantt) from a JSON config via fig() or from a Mermaid-like markdown string via figmd(). Auto-layout, zero coordinates needed. Works in browser and Node.js.
author: hustcc
license: MIT
package: ai-figure
api: fig(options) → string (SVG); figmd(markdown) → string (SVG)
tags: [flowchart, tree-diagram, architecture-diagram, sequence-diagram, quadrant-chart, gantt-chart, svg, layout, visualization, markdown]
---

# ai-figure Skill

## What this skill does

Converts a declarative JSON config into a fully-rendered SVG diagram string. You never specify coordinates — the layout is computed automatically.

Two entry points:
- `fig(options)` — JSON/TypeScript config object (full type-safe API)
- `figmd(markdown)` — Mermaid-like text syntax (great for quick authoring)

## How to use

```typescript
import { fig, figmd } from 'ai-figure';

// JSON API
const svg1 = fig(config);

// Markdown API
const svg2 = figmd(`
  flow LR antv
  title: My Pipeline
  start((Start)) --> process[Process]
  process --> done((Done))
`);

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

## figmd() — Markdown Syntax

`figmd(markdown)` parses a Mermaid-like text string and renders it as SVG.
`parseFigmd(markdown)` parses the same string and returns a `FigOptions` object without rendering.

### Header line

```
<type> [direction] [theme] [palette]
```

- **type**: `flow`, `tree`, `arch`, `sequence`, `quadrant`, `gantt`
- **direction**: `TB` (default) or `LR` — applies to flow, tree, arch
- **theme**: `light` (default) or `dark`
- **palette**: any named palette (default: `"default"`)

Lines starting with `%%` are comments and are ignored.

### Node notation (flow / tree / arch)

| Notation | Shape |
|----------|-------|
| `id[label]` | process (rectangle) |
| `id{label}` | decision (diamond) |
| `id((label))` | terminal (pill) |
| `id[/label/]` | io (parallelogram) |
| `id` | process (bare id as label) |

### Markdown examples

**flow:**
```
flow LR dark antv
title: CI Pipeline
code[Write Code] --> test{Tests Pass?}
test -->|yes| build[Build Image]
test -->|no| fix((Fix Issues))
fix --> code
build --> deploy[/Deploy/]
group Pipeline: code, test, build
```

**tree:**
```
tree TB
title: Org Chart
ceo[CEO]
ceo --> cto[CTO]
ceo --> coo[COO]
cto --> dev[Developer]
```

**arch:**
```
arch TB antv
title: Cloud Architecture
layer frontend[Frontend]
web[Web App]
mobile[Mobile App]
layer backend[Backend]
api[API Server]
auth[Auth Service]
```

**sequence:**
```
sequence dark
title: Login Flow
actors: Browser, API, Auth, DB
Browser -> API: POST /login
API -> Auth: validateCredentials
Auth -> DB: SELECT user
DB --> Auth: user row
Auth --> API: JWT token
API --> Browser: 200 OK
```

**quadrant:**
```
quadrant dark figma
title: Feature Priority
x-axis Effort: Low .. High
y-axis Value: Low .. High
quadrant-1: Strategic
quadrant-2: Quick Wins
quadrant-3: Long Shots
quadrant-4: Low Priority
Auth Revamp: 0.25, 0.85
Dark Mode: 0.15, 0.35
Recommendations: 0.70, 0.80
```

**gantt:**
```
gantt light antv
title: Q1 Roadmap
section Design
Wireframes: t1, 2025-01-06, 2025-01-24
Mockups: t2, 2025-01-25, 2025-02-07
section Dev
Frontend: t3, 2025-02-03, 2025-02-28
milestone: Launch, 2025-03-01
```

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
