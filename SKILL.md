---
name: ai-figure
version: "0.1.0"
description: Generate clean SVG diagrams (flowchart, tree, architecture, sequence, quadrant, gantt) from a markdown string or a JSON config via fig(). Auto-layout, zero coordinates needed. Works in browser and Node.js.
author: hustcc
license: MIT
package: ai-figure
api: fig(markdown|options) → string (SVG)
tags: [flowchart, tree-diagram, architecture-diagram, sequence-diagram, quadrant-chart, gantt-chart, svg, layout, visualization, markdown]
---

# ai-figure Skill

Generates self-contained SVG diagrams. No coordinates needed — layout is computed automatically.

```typescript
import { fig } from 'ai-figure';

// Markdown string (preferred — compact, streaming-safe)
const svg = fig(`
  flow LR antv
  title: CI Pipeline
  code[Write Code] --> test{Tests Pass?}
  test -->|yes| build[Build Image]
  test -->|no| fix((Fix Issues))
  fix --> code
  build --> deploy[/Deploy/]
  group Pipeline: code, test, build
`);

// JSON config object (programmatic / strongly-typed)
const svg2 = fig({ figure: 'flow', nodes: [...], edges: [...] });

// DOM: document.getElementById('chart').innerHTML = svg;
// Node.js: fs.writeFileSync('chart.svg', svg);
```

`fig()` accepts either a **markdown string** or a **JSON config**. When given a string it never throws — partial or empty input (e.g. during AI streaming) returns a valid empty SVG that fills in progressively.

## Markdown syntax

**First non-empty line is the header:**

```figure
<type> [direction] [theme] [palette]
```

| Token | Values | Default |
|-------|--------|---------|
| `type` | `flow` `tree` `arch` `sequence` `quadrant` `gantt` | required |
| `direction` | `TB` `LR` | `TB` |
| `theme` | `light` `dark` | `light` |
| `palette` | `default` `antv` `drawio` `figma` `vega` `mono-blue` `mono-green` `mono-purple` `mono-orange` | `default` |

Lines starting with `%%` are comments. `title:` and `subtitle:` work in all types.

### Node notation (flow / tree / arch)

| Notation | Shape |
|----------|-------|
| `id[label]` | process (rectangle) |
| `id{label}` | decision (diamond) |
| `id((label))` | terminal (pill) |
| `id[/label/]` | io (parallelogram) |
| `id` | process, id used as label |

### flow

```figure
flow [LR|TB] [theme] [palette]
title: My Flow
A[Source] --> B[Target]          %% simple edge
A -->|label| B                   %% labeled edge
group Name: id1, id2, id3        %% logical group (dashed border)
```

### tree

```figure
tree [LR|TB] [theme] [palette]
title: Org Chart
root[Root]
root --> child[Child]
child --> leaf[Leaf]
```

### arch

```figure
arch TB antv
title: Web Stack
layer frontend[Frontend]
  ui[React App]
  assets[Static Assets]
layer backend[Backend]
  api[REST API]
  auth[Auth Service]
layer data[Data]
  db[PostgreSQL]
```

### sequence

```figure
sequence [theme] [palette]
title: Login
actors: Browser, API, DB         %% optional; inferred from messages if omitted
Browser -> API: POST /login      %% solid arrow
API --> Browser: 200 OK          %% dashed return arrow
```

### quadrant

```figure
quadrant [theme] [palette]
title: Priority
x-axis Effort: Low .. High
y-axis Value: Low .. High
quadrant-1: Quick Wins    %% top-left
quadrant-2: Strategic     %% top-right
quadrant-3: Low Prio      %% bottom-left
quadrant-4: Long Shots    %% bottom-right
Feature A: 0.2, 0.9       %% label: x, y  (x/y in [0,1])
```

### gantt

```figure
gantt [theme] [palette]
title: Q1 Roadmap
section Design
  Wireframes: t1, 2025-01-06, 2025-01-24    %% label: id, start, end
  Mockups: t2, 2025-01-25, 2025-02-07
section Dev
  Frontend: t3, 2025-02-03, 2025-02-28
milestone: Launch, 2025-03-01
```

- Task format: `<label>: <id>, <yyyy-mm-dd>, <yyyy-mm-dd>` — **id is required**, even if you don't reference it
- `end` ≥ `start`; `section` groups tasks under a bold header; `milestone: <label>, <date>` marks a point in time

## JSON config (fig(options))

Same result as markdown but typed. Use when building diagrams programmatically.

```typescript
interface FlowChartOptions {
  figure: 'flow';
  nodes: FlowNode[];        // { id, label, type?: 'process'|'decision'|'terminal'|'io' }
  edges: FlowEdge[];        // { from, to, label? }
  groups?: FlowGroup[];     // { id, label, nodes: string[] }
  direction?: 'TB'|'LR'; title?: string; subtitle?: string;
  theme?: 'light'|'dark'; palette?: string|string[];
}

interface TreeDiagramOptions {
  figure: 'tree';
  nodes: TreeNode[];        // { id, label, parent? }
  direction?: 'TB'|'LR'; title?: string; subtitle?: string;
  theme?: 'light'|'dark'; palette?: string|string[];
}

interface ArchDiagramOptions {
  figure: 'arch';
  layers: ArchLayer[];      // { id, label, nodes: { id, label }[] }
  direction?: 'TB'|'LR'; title?: string; subtitle?: string;
  theme?: 'light'|'dark'; palette?: string|string[];
}

interface SequenceDiagramOptions {
  figure: 'sequence';
  actors: string[];
  messages: SeqMessage[];   // { from, to, label?, style?: 'solid'|'return' }
  title?: string; subtitle?: string;
  theme?: 'light'|'dark'; palette?: string|string[];
}

interface QuadrantChartOptions {
  figure: 'quadrant';
  xAxis: { label: string; min: string; max: string };
  yAxis: { label: string; min: string; max: string };
  quadrants: [string, string, string, string]; // [TL, TR, BL, BR]
  points: QuadrantPoint[];  // { id, label, x, y }  x/y in [0,1]
  title?: string; subtitle?: string;
  theme?: 'light'|'dark'; palette?: string|string[];
}

interface GanttChartOptions {
  figure: 'gantt';
  tasks: GanttTask[];       // { id, label, start, end, groupId?, color? }
  milestones?: GanttMilestone[]; // { date, label }
  title?: string; subtitle?: string;
  theme?: 'light'|'dark'; palette?: string|string[];
}
```

**quadrants order:** `[top-left, top-right, bottom-left, bottom-right]` · `x=0` left, `x=1` right; `y=0` bottom, `y=1` top.

