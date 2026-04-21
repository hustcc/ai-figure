# ai-figure

> Clean SVG diagram renderer — define config, get beautiful diagrams. Works in browser **and** Node.js.

[![npm version](https://img.shields.io/npm/v/ai-figure.svg)](https://www.npmjs.com/package/ai-figure)
[![Build](https://github.com/hustcc/ai-figure/actions/workflows/build.yml/badge.svg)](https://github.com/hustcc/ai-figure/actions/workflows/build.yml)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](LICENSE)

## Features ✨

- 🎨 **Rich visual styles** — light/dark mode, nine built-in palettes (`default`, `antv`, `drawio`, `figma`, `vega`, `mono-blue`, `mono-green`, `mono-purple`, `mono-orange`) plus custom hex arrays; every diagram supports optional title & subtitle, node groups, and color-coded layers
- 📐 **Auto layout** — just describe the graph; x/y coordinates are computed automatically, and diagram dimensions scale to fit the content
- 🤖 **AI-friendly** — single `fig()` entry point accepts a markdown string **or** a JSON config; streaming-safe (partial input never throws); ships a [`SKILL.md`](https://github.com/hustcc/ai-figure/blob/main/SKILL.md) that AI agents (Copilot, Cursor, Claude, etc.) can load as context
- 📊 **10 diagram types** — flowchart, tree, architecture, sequence, quadrant, Gantt, state machine, ER data model, timeline, and swimlane; pure SVG output with zero DOM dependency, works in browser and Node.js

## Quick Start

### Install

```bash
npm install ai-figure
```

### Usage

```typescript
import { fig } from 'ai-figure';

// ── JSON config object (typed, programmatic) ────────────────────────────────
const svg = fig({
  figure: 'flow',
  nodes: [
    { id: 'start',    label: 'Start',        type: 'terminal' },
    { id: 'process1', label: 'Process Data', type: 'process'  },
    { id: 'decision', label: 'Is Valid?',    type: 'decision' },
    { id: 'end_yes',  label: 'Success',      type: 'terminal' },
    { id: 'end_no',   label: 'Failure',      type: 'terminal' },
  ],
  edges: [
    { from: 'start',    to: 'process1'              },
    { from: 'process1', to: 'decision'              },
    { from: 'decision', to: 'end_yes', label: 'Yes' },
    { from: 'decision', to: 'end_no',  label: 'No'  },
  ],
  theme: 'light',
  palette: 'default',
  direction: 'TB',
});

// ── Markdown string (compact, AI-friendly) ──────────────────────────────────
const svg2 = fig(`
  flow LR default
  title: Auth Flow
  start((Start)) --> login[Enter Credentials]
  login --> validate{Valid?}
  validate -->|yes| dashboard((Dashboard))
  validate -->|no| error[Show Error]
  error --> login
`);

// Browser: inject into the DOM
document.body.innerHTML = svg;

// Node.js: write to file
import { writeFileSync } from 'fs';
writeFileSync('diagram.svg', svg);
```

## API Reference

### `fig(input): string`

The single entry point. Returns a fully self-contained SVG string.

**`input`** is either:

- A **JSON config object** — typed `FigOptions` with the required `figure` field
- A **markdown string** — Mermaid-like syntax, streaming-safe (never throws; partial input returns a valid empty SVG)

```typescript
import { fig } from 'ai-figure';

// JSON config
fig({ figure: 'flow',     ...flowOptions     }); // flowchart
fig({ figure: 'tree',     ...treeOptions     }); // tree / hierarchy
fig({ figure: 'arch',     ...archOptions     }); // architecture diagram
fig({ figure: 'sequence', ...sequenceOptions }); // sequence diagram
fig({ figure: 'quadrant', ...quadrantOptions }); // quadrant chart
fig({ figure: 'gantt',    ...ganttOptions    }); // Gantt chart
fig({ figure: 'state',    ...stateOptions    }); // state machine
fig({ figure: 'er',       ...erOptions       }); // ER data model
fig({ figure: 'timeline', ...timelineOptions }); // timeline
fig({ figure: 'swimlane', ...swimlaneOptions }); // swimlane flow

// markdown string
fig(`flow LR\na[A] --> b[B]`);
```

### `figure: 'flow'` — Flowchart

![Flow](https://raw.githubusercontent.com/hustcc/ai-figure/main/assets/flow.svg)

| Field       | Type            | Default        | Description                              |
|-------------|-----------------|----------------|------------------------------------------|
| `figure`    | `'flow'`        | **required**   | Selects the flowchart renderer           |
| `nodes`     | `FlowNode[]`    | **required**   | List of nodes                            |
| `edges`     | `FlowEdge[]`    | **required**   | List of directed edges                   |
| `groups`    | `FlowGroup[]`   | `[]`           | Optional logical groups                  |
| `title`     | `string`        | `undefined`    | Optional centered title above the diagram |
| `subtitle`  | `string`        | `undefined`    | Optional centered subtitle below the title |
| `theme`     | `ThemeType`     | `'light'`    | Light or dark rendering mode (`'light'` \| `'dark'`) |
| `palette`   | `PaletteType`   | `'default'`    | Color palette — see [Palette API](#palette-api) below |
| `direction` | `Direction`     | `'TB'`         | Layout direction (`'TB'` or `'LR'`)      |

#### `FlowNode`

| Field   | Type       | Default      | Description                |
|---------|------------|--------------|----------------------------|
| `id`    | `string`   | **required** | Unique node identifier     |
| `label` | `string`   | **required** | Text displayed in the node |
| `type`  | `NodeType` | `'process'`  | Visual shape               |

**Node types (`NodeType`)**

| Value      | Shape               | Use case                  |
|------------|---------------------|---------------------------|
| `process`  | Rectangle           | Default step / action     |
| `decision` | Diamond             | Conditional / branch      |
| `terminal` | Rounded rectangle   | Start / End               |
| `io`       | Parallelogram       | Input / Output            |

#### `FlowEdge`

| Field   | Type     | Default      | Description         |
|---------|----------|--------------|---------------------|
| `from`  | `string` | **required** | Source node ID      |
| `to`    | `string` | **required** | Target node ID      |
| `label` | `string` | `undefined`  | Optional edge label |

#### `FlowGroup`

| Field   | Type       | Default      | Description                        |
|---------|------------|--------------|------------------------------------|
| `id`    | `string`   | **required** | Unique group identifier            |
| `label` | `string`   | **required** | Label shown above the group border |
| `nodes` | `string[]` | **required** | IDs of nodes inside this group     |

### `figure: 'tree'` — Tree Diagram

Renders a hierarchy from a flat node list with `parent` references. Uses Dagre for layout.

![Tree](https://raw.githubusercontent.com/hustcc/ai-figure/main/assets/tree.svg)

| Field       | Type          | Default        | Description                        |
|-------------|---------------|----------------|------------------------------------|
| `figure`    | `'tree'`      | **required**   | Selects the tree renderer          |
| `nodes`     | `TreeNode[]`  | **required**   | Flat list with optional parent ref |
| `title`     | `string`      | `undefined`    | Optional centered title above the diagram |
| `subtitle`  | `string`      | `undefined`    | Optional centered subtitle below the title |
| `theme`     | `ThemeType`   | `'light'`    | Light or dark rendering mode (`'light'` \| `'dark'`) |
| `palette`   | `PaletteType` | `'default'`    | Color palette — see [Palette API](#palette-api) below |
| `direction` | `Direction`   | `'TB'`         | Layout direction                   |

```typescript
fig({
  figure: 'tree',
  nodes: [
    { id: 'ceo', label: 'CEO' },
    { id: 'cto', label: 'CTO', parent: 'ceo' },
    { id: 'coo', label: 'COO', parent: 'ceo' },
  ],
  theme: 'light',
  palette: 'default',
});
```

### `figure: 'arch'` — Architecture Diagram

Renders a tech-stack landscape as layered, color-coded cards — no edges needed.

![Architecture](https://raw.githubusercontent.com/hustcc/ai-figure/main/assets/arch.svg)

| Field       | Type          | Default        | Description                              |
|-------------|---------------|----------------|------------------------------------------|
| `figure`    | `'arch'`      | **required**   | Selects the architecture renderer        |
| `layers`    | `ArchLayer[]` | **required**   | Layers from top to bottom (TB) or left to right (LR) |
| `title`     | `string`      | `undefined`    | Optional centered title above the diagram |
| `subtitle`  | `string`      | `undefined`    | Optional centered subtitle below the title |
| `theme`     | `ThemeType`   | `'light'`    | Light or dark rendering mode (`'light'` \| `'dark'`) |
| `palette`   | `PaletteType` | `'default'`    | Color palette — see [Palette API](#palette-api) below |
| `direction` | `Direction`   | `'TB'`         | `'TB'` = layers stacked, `'LR'` = layers side-by-side |

```typescript
fig({
  figure: 'arch',
  layers: [
    { id: 'fe', label: 'Frontend', nodes: [{ id: 'react', label: 'React' }, { id: 'vue', label: 'Vue' }] },
    { id: 'be', label: 'Backend',  nodes: [{ id: 'node', label: 'Node.js' }] },
  ],
});
```

### `figure: 'sequence'` — Sequence Diagram

Renders a sequence diagram with vertical lifelines and horizontal message arrows.

![Sequence](https://raw.githubusercontent.com/hustcc/ai-figure/main/assets/sequence.svg)

| Field      | Type           | Default        | Description                           |
|------------|----------------|----------------|---------------------------------------|
| `figure`   | `'sequence'`   | **required**   | Selects the sequence renderer         |
| `actors`   | `string[]`     | **required**   | Ordered list of participant names     |
| `messages` | `SeqMessage[]` | **required**   | Ordered list of message arrows        |
| `title`    | `string`       | `undefined`    | Optional centered title above the diagram |
| `subtitle` | `string`       | `undefined`    | Optional centered subtitle below the title |
| `theme`    | `ThemeType`    | `'light'`    | Light or dark rendering mode (`'light'` \| `'dark'`) |
| `palette`  | `PaletteType`  | `'default'`    | Color palette — see [Palette API](#palette-api) below |

```typescript
fig({
  figure: 'sequence',
  actors: ['Browser', 'API', 'DB'],
  messages: [
    { from: 'Browser', to: 'API', label: 'POST /login' },
    { from: 'API',     to: 'DB',  label: 'SELECT user' },
    { from: 'DB',      to: 'API', label: 'user row',  style: 'return' },
    { from: 'API',     to: 'Browser', label: '200 OK', style: 'return' },
  ],
});
```

### `figure: 'quadrant'` — Quadrant Chart

Renders a 2D quadrant scatter plot. Points are placed by normalized `x`/`y` values (0–1) and auto-colored by which quadrant they fall in.

![Quadrant](https://raw.githubusercontent.com/hustcc/ai-figure/main/assets/quadrant.svg)

| Field       | Type               | Default        | Description                                         |
|-------------|--------------------|----------------|-----------------------------------------------------|
| `figure`    | `'quadrant'`       | **required**   | Selects the quadrant renderer                       |
| `xAxis`     | `AxisConfig`       | **required**   | X-axis label, min and max tick labels               |
| `yAxis`     | `AxisConfig`       | **required**   | Y-axis label, min and max tick labels               |
| `quadrants` | `[TL, TR, BL, BR]` | **required**   | Corner labels: top-left, top-right, bottom-left, bottom-right |
| `points`    | `QuadrantPoint[]`  | **required**   | Data points to plot                                 |
| `title`     | `string`           | `undefined`    | Optional centered title above the diagram           |
| `subtitle`  | `string`           | `undefined`    | Optional centered subtitle below the title          |
| `theme`     | `ThemeType`        | `'light'`    | Light or dark rendering mode (`'light'` \| `'dark'`) |
| `palette`   | `PaletteType`      | `'default'`    | Color palette — see [Palette API](#palette-api) below |

#### `AxisConfig`

| Field   | Type     | Description              |
|---------|----------|--------------------------|
| `label` | `string` | Axis title               |
| `min`   | `string` | Label at the low end     |
| `max`   | `string` | Label at the high end    |

#### `QuadrantPoint`

| Field   | Type     | Description                             |
|---------|----------|-----------------------------------------|
| `id`    | `string` | Unique identifier                       |
| `label` | `string` | Text shown next to the point            |
| `x`     | `number` | Normalized X position (0 = left, 1 = right) |
| `y`     | `number` | Normalized Y position (0 = bottom, 1 = top) |

```typescript
fig({
  figure: 'quadrant',
  xAxis: { label: 'Effort', min: 'Low', max: 'High' },
  yAxis: { label: 'Value',  min: 'Low', max: 'High' },
  quadrants: ['Quick Wins', 'Major Projects', 'Fill-ins', 'Thankless Tasks'],
  points: [
    { id: 'a', label: 'Feature A', x: 0.2,  y: 0.85 },
    { id: 'b', label: 'Feature B', x: 0.75, y: 0.80 },
    { id: 'c', label: 'Feature C', x: 0.5,  y: 0.6  },
    { id: 'd', label: 'Feature D', x: 0.3,  y: 0.2  },
    { id: 'e', label: 'Feature E', x: 0.8,  y: 0.25 },
  ],
  theme: 'light',
  palette: 'default',
});
```

### `figure: 'gantt'` — Gantt Chart

Renders a project timeline with task bars, optional group headers, and milestone markers. Canvas width is fixed at 804 px; height auto-adapts to the number of rows. The time axis ticks adjust automatically to the date range (weekly / monthly / quarterly).

![Gantt](https://raw.githubusercontent.com/hustcc/ai-figure/main/assets/gantt.svg)

| Field        | Type               | Default      | Description                                  |
|--------------|--------------------|--------------|----------------------------------------------|
| `figure`     | `'gantt'`          | **required** | Selects the Gantt renderer                   |
| `tasks`      | `GanttTask[]`      | **required** | List of task bars                            |
| `milestones` | `GanttMilestone[]` | `[]`         | Optional milestone markers                   |
| `title`      | `string`           | `undefined`  | Optional centered title above the diagram    |
| `subtitle`   | `string`           | `undefined`  | Optional centered subtitle below the title   |
| `theme`      | `ThemeType`        | `'light'`    | Light or dark rendering mode                 |
| `palette`    | `PaletteType`      | `'default'`  | Color palette — see [Palette API](#palette-api) below |

#### `GanttTask`

| Field     | Type     | Default      | Description                                                        |
|-----------|----------|--------------|--------------------------------------------------------------------|
| `id`      | `string` | **required** | Unique task identifier                                             |
| `label`   | `string` | **required** | Task name shown in the label column and inside the bar            |
| `start`   | `string` | **required** | Start date `yyyy-mm-dd`                                           |
| `end`     | `string` | **required** | End date `yyyy-mm-dd`                                             |
| `groupId` | `string` | `undefined`  | Tasks sharing the same `groupId` are clustered under a group header |
| `color`   | `string` | `undefined`  | Optional custom bar color (6-digit hex, e.g. `'#e64980'`)         |

#### `GanttMilestone`

| Field   | Type     | Default      | Description                       |
|---------|----------|--------------|-----------------------------------|
| `date`  | `string` | **required** | Milestone date `yyyy-mm-dd`       |
| `label` | `string` | **required** | Short label near the diamond icon |

```typescript
fig({
  figure: 'gantt',
  title: 'Project Roadmap',
  tasks: [
    { id: 'design', label: 'Design',       start: '2025-01-06', end: '2025-01-24' },
    { id: 'fe',     label: 'Frontend Dev', start: '2025-01-20', end: '2025-02-28', groupId: 'dev' },
    { id: 'be',     label: 'Backend Dev',  start: '2025-01-13', end: '2025-03-07', groupId: 'dev' },
    { id: 'qa',     label: 'QA Testing',   start: '2025-02-24', end: '2025-03-14', groupId: 'qa'  },
    { id: 'deploy', label: 'Deploy',       start: '2025-03-17', end: '2025-03-21' },
  ],
  milestones: [
    { date: '2025-01-24', label: 'Design freeze' },
    { date: '2025-03-21', label: 'Launch' },
  ],
  theme: 'light',
  palette: 'default',
});
```

### `figure: 'state'` — State Machine

Renders a UML state machine with dagre layout. Supports start (●) and end (◎) pseudo-states, accent states, self-loops, and labeled transitions.

| Field         | Type                  | Default      | Description                                  |
|---------------|-----------------------|--------------|----------------------------------------------|
| `figure`      | `'state'`             | **required** | Selects the state machine renderer           |
| `nodes`       | `StateNode[]`         | **required** | List of states                               |
| `transitions` | `StateTransition[]`   | **required** | List of directed transitions                 |
| `title`       | `string`              | `undefined`  | Optional centered title above the diagram    |
| `subtitle`    | `string`              | `undefined`  | Optional centered subtitle below the title   |
| `theme`       | `ThemeType`           | `'light'`    | Light or dark rendering mode                 |
| `palette`     | `PaletteType`         | `'default'`  | Color palette — see [Palette API](#palette-api) below |

#### `StateNode`

| Field    | Type             | Default     | Description                                           |
|----------|------------------|-------------|-------------------------------------------------------|
| `id`     | `string`         | **required**| Unique state identifier                               |
| `label`  | `string`         | **required**| Text displayed in the state box                       |
| `type`   | `StateNodeType`  | `'state'`   | `'state'` \| `'start'` \| `'end'`                   |
| `accent` | `boolean`        | `false`     | Highlight this state with the accent color (max 1–2)  |

#### `StateTransition`

| Field   | Type     | Default      | Description                                           |
|---------|----------|--------------|-------------------------------------------------------|
| `from`  | `string` | **required** | Source state ID                                       |
| `to`    | `string` | **required** | Target state ID                                       |
| `label` | `string` | `undefined`  | Optional label — typically `event [guard] / action`   |

```typescript
fig({
  figure: 'state',
  title: 'Order Status',
  nodes: [
    { id: 'start',      label: '',           type: 'start' },
    { id: 'idle',       label: 'Idle' },
    { id: 'processing', label: 'Processing' },
    { id: 'shipped',    label: 'Shipped' },
    { id: 'failed',     label: 'Failed',     accent: true },
    { id: 'end',        label: '',           type: 'end' },
  ],
  transitions: [
    { from: 'start',      to: 'idle' },
    { from: 'idle',       to: 'processing', label: 'place order' },
    { from: 'processing', to: 'shipped',    label: 'confirmed' },
    { from: 'processing', to: 'failed',     label: 'error' },
    { from: 'failed',     to: 'idle',       label: 'retry' },
    { from: 'shipped',    to: 'end' },
  ],
});
```

### `figure: 'er'` — Entity-Relationship Diagram

Renders a database schema with entity boxes (header + field list) and relationship lines with optional cardinality annotations.

| Field      | Type           | Default      | Description                                  |
|------------|----------------|--------------|----------------------------------------------|
| `figure`   | `'er'`         | **required** | Selects the ER renderer                      |
| `entities` | `ErEntity[]`   | **required** | List of entities (tables)                    |
| `relations`| `ErRelation[]` | **required** | List of relationship lines                   |
| `title`    | `string`       | `undefined`  | Optional centered title above the diagram    |
| `subtitle` | `string`       | `undefined`  | Optional centered subtitle below the title   |
| `theme`    | `ThemeType`    | `'light'`    | Light or dark rendering mode                 |
| `palette`  | `PaletteType`  | `'default'`  | Color palette — see [Palette API](#palette-api) below |

#### `ErEntity`

| Field    | Type        | Default      | Description                                                  |
|----------|-------------|--------------|--------------------------------------------------------------|
| `id`     | `string`    | **required** | Unique entity identifier                                     |
| `label`  | `string`    | **required** | Entity display name shown in the header                      |
| `fields` | `ErField[]` | **required** | Ordered list of fields (columns)                             |
| `accent` | `boolean`   | `false`      | Highlight as the aggregate root (max 1)                      |

#### `ErField`

| Field  | Type          | Default      | Description                                     |
|--------|---------------|--------------|-------------------------------------------------|
| `name` | `string`      | **required** | Field name                                      |
| `type` | `string`      | `undefined`  | Data type string (e.g. `'uuid'`, `'text'`)      |
| `key`  | `'pk'\|'fk'`  | `undefined`  | `'pk'` = primary key (#), `'fk'` = foreign key (→) |

#### `ErRelation`

| Field      | Type     | Default      | Description                                        |
|------------|----------|--------------|----------------------------------------------------|
| `from`     | `string` | **required** | Source entity ID                                   |
| `to`       | `string` | **required** | Target entity ID                                   |
| `label`    | `string` | `undefined`  | Optional label centered on the line                |
| `fromCard` | `string` | `undefined`  | Cardinality at the `from` end (e.g. `'1'`, `'N'`) |
| `toCard`   | `string` | `undefined`  | Cardinality at the `to` end                        |

```typescript
fig({
  figure: 'er',
  title: 'Blog Schema',
  entities: [
    { id: 'user', label: 'User',
      fields: [{ name: 'id', type: 'uuid', key: 'pk' }, { name: 'email', type: 'text' }] },
    { id: 'post', label: 'Post',
      fields: [{ name: 'id', type: 'uuid', key: 'pk' }, { name: 'author_id', type: 'uuid', key: 'fk' }] },
  ],
  relations: [
    { from: 'user', to: 'post', label: 'writes', fromCard: '1', toCard: 'N' },
  ],
});
```

### `figure: 'timeline'` — Timeline

Renders a horizontal date axis with events spaced proportionally. Labels alternate above and below the axis to reduce collision. Major milestones are rendered with a larger accent dot.

| Field      | Type              | Default      | Description                                  |
|------------|-------------------|--------------|----------------------------------------------|
| `figure`   | `'timeline'`      | **required** | Selects the timeline renderer                |
| `events`   | `TimelineEvent[]` | **required** | List of events (auto-sorted by date)         |
| `title`    | `string`          | `undefined`  | Optional centered title above the diagram    |
| `subtitle` | `string`          | `undefined`  | Optional centered subtitle below the title   |
| `theme`    | `ThemeType`       | `'light'`    | Light or dark rendering mode                 |
| `palette`  | `PaletteType`     | `'default'`  | Color palette — see [Palette API](#palette-api) below |

#### `TimelineEvent`

| Field       | Type      | Default      | Description                                          |
|-------------|-----------|--------------|------------------------------------------------------|
| `id`        | `string`  | **required** | Unique event identifier                              |
| `label`     | `string`  | **required** | Short label displayed near the event dot             |
| `date`      | `string`  | **required** | Event date in `yyyy-mm-dd` format                    |
| `milestone` | `boolean` | `false`      | Render as a major milestone (larger accent-color dot)|

```typescript
fig({
  figure: 'timeline',
  title: 'Product History',
  events: [
    { id: 'v1',   label: 'v1.0 Launch',   date: '2020-01-15', milestone: true },
    { id: 'v15',  label: 'v1.5 Patch',    date: '2021-06-01' },
    { id: 'v2',   label: 'v2.0 Redesign', date: '2022-03-10', milestone: true },
    { id: 'v3',   label: 'v3.0 AI',       date: '2023-11-01', milestone: true },
  ],
});
```

### `figure: 'swimlane'` — Swimlane Flow

Renders a cross-functional flowchart with horizontal lane bands. Nodes are placed in their declared lane; cross-lane edges use S-curve routing.

| Field      | Type              | Default      | Description                                  |
|------------|-------------------|--------------|----------------------------------------------|
| `figure`   | `'swimlane'`      | **required** | Selects the swimlane renderer                |
| `lanes`    | `string[]`        | **required** | Lane labels in display order                 |
| `nodes`    | `SwimlaneNode[]`  | **required** | Nodes placed inside their respective lanes   |
| `edges`    | `SwimlaneEdge[]`  | **required** | Directed edges between nodes                 |
| `title`    | `string`          | `undefined`  | Optional centered title above the diagram    |
| `subtitle` | `string`          | `undefined`  | Optional centered subtitle below the title   |
| `theme`    | `ThemeType`       | `'light'`    | Light or dark rendering mode                 |
| `palette`  | `PaletteType`     | `'default'`  | Color palette — see [Palette API](#palette-api) below |

#### `SwimlaneNode`

| Field   | Type       | Default      | Description                              |
|---------|------------|--------------|------------------------------------------|
| `id`    | `string`   | **required** | Unique node identifier                   |
| `label` | `string`   | **required** | Text displayed in the node               |
| `lane`  | `string`   | **required** | Lane label this node belongs to          |
| `type`  | `NodeType` | `'process'`  | Visual shape (same as flowchart nodes)   |

#### `SwimlaneEdge`

| Field   | Type     | Default      | Description         |
|---------|----------|--------------|---------------------|
| `from`  | `string` | **required** | Source node ID      |
| `to`    | `string` | **required** | Target node ID      |
| `label` | `string` | `undefined`  | Optional edge label |

```typescript
fig({
  figure: 'swimlane',
  title: 'Order Processing',
  lanes: ['Customer', 'Warehouse', 'Shipping'],
  nodes: [
    { id: 'order',   label: 'Place Order',     lane: 'Customer'  },
    { id: 'pay',     label: 'Confirm Payment', lane: 'Customer'  },
    { id: 'receive', label: 'Receive Order',   lane: 'Warehouse' },
    { id: 'pack',    label: 'Pack Items',      lane: 'Warehouse' },
    { id: 'ship',    label: 'Ship Package',    lane: 'Shipping'  },
  ],
  edges: [
    { from: 'order',   to: 'pay'     },
    { from: 'pay',     to: 'receive' },
    { from: 'receive', to: 'pack'    },
    { from: 'pack',    to: 'ship'    },
  ],
});
```

### Palette API

All ten diagram types accept two independent styling parameters:

| Field     | Type                   | Default       | Description                          |
|-----------|------------------------|---------------|--------------------------------------|
| `theme`   | `'light' \| 'dark'`   | `'light'`     | Background and text rendering mode   |
| `palette` | `string \| string[]`  | `'default'`   | Color palette for nodes              |

**`palette` values:**

| Value | Description |
|-------|-------------|
| `'default'` | Built-in multi-hue palette — `process`=blue, `decision`=amber, `terminal`=green, `io`=purple |
| `'antv'` | AntV G2 categorical palette — cornflower-blue, coral-orange, mint-teal, violet |
| `'drawio'` | draw.io / diagrams.net shape palette — sky-blue, amber, sage, red |
| `'figma'` | Figma / design-tool palette — indigo, cyan, emerald, rose-pink |
| `'vega'` | Vega / Vega-Lite categorical palette — steel-blue, orange, teal, crimson |
| `'mono-blue'` | Monochrome blue — all four node types use blue-family shades |
| `'mono-green'` | Monochrome green — all four node types use green-family shades |
| `'mono-purple'` | Monochrome purple — all four node types use purple-family shades |
| `'mono-orange'` | Monochrome orange — all four node types use orange-family shades |
| `string[]` | 4-element hex array mapped to `[process, decision, terminal, io]` |

```typescript
// Built-in palette, dark mode
fig({ figure: 'flow', nodes, edges, theme: 'dark', palette: 'default' });

// AntV G2 palette
fig({ figure: 'flow', nodes, edges, palette: 'antv' });

// draw.io palette with dark background
fig({ figure: 'flow', nodes, edges, theme: 'dark', palette: 'drawio' });

// Monochrome blue
fig({ figure: 'flow', nodes, edges, palette: 'mono-blue' });

// Custom hex palette
fig({ figure: 'flow', nodes, edges, palette: ['#e64980', '#ae3ec9', '#7048e8', '#1098ad'] });
```

### Markdown syntax

`fig()` also accepts a plain **markdown string** as input. The first non-empty line is the header: `<type> [direction] [theme] [palette]`

| Token | Values | Default |
|-------|--------|---------|
| `type` | `flow` \| `tree` \| `arch` \| `sequence` \| `quadrant` \| `gantt` \| `state` \| `er` \| `timeline` \| `swimlane` | **required** |
| `direction` | `TB` \| `LR` | `TB` |
| `theme` | `light` \| `dark` | `light` |
| `palette` | any named palette (see [Palette API](#palette-api)) | `default` |

Lines starting with `%%` are comments. `title:` and `subtitle:` are supported in all diagram types.

#### Node notation (flow / tree / arch)

| Notation | Shape |
|----------|-------|
| `id[label]` | process (rectangle) |
| `id{label}` | decision (diamond) |
| `id((label))` | terminal (pill) |
| `id[/label/]` | io (parallelogram) |
| `id` | process (bare id used as label) |

#### Per-diagram syntax

<details>
<summary><strong>flow</strong></summary>

```
flow [LR|TB] [light|dark] [palette]
title: Optional Title
subtitle: Optional Subtitle
id[Label]                          %% standalone node definition
A[Source] --> B[Target]            %% edge
A -->|label| B                     %% labeled edge
group GroupName: id1, id2, id3     %% logical group
```
</details>

<details>
<summary><strong>tree</strong></summary>

```
tree [LR|TB] [light|dark] [palette]
title: Optional Title
root[Root]                   %% root node (no parent)
root --> child[Child]        %% parent → child relationship
```
</details>

<details>
<summary><strong>arch</strong></summary>

```
arch [LR|TB] [light|dark] [palette]
title: Optional Title
layer layerId[Layer Label]   %% layer declaration
  nodeId[Node Label]         %% node in current layer (indentation optional)
```
</details>

<details>
<summary><strong>sequence</strong></summary>

```
sequence [light|dark] [palette]
title: Optional Title
actors: Actor1, Actor2, Actor3     %% optional; inferred from messages if omitted
Actor1 -> Actor2: message          %% solid arrow
Actor2 --> Actor1: response        %% dashed return arrow
Actor1 -> Actor2                   %% arrow without label
```
</details>

<details>
<summary><strong>quadrant</strong></summary>

```
quadrant [light|dark] [palette]
title: Optional Title
x-axis: min .. max                 %% axis range (label defaults to "")
x-axis Label: min .. max           %% axis range with explicit axis label
y-axis: min .. max
quadrant-1: Top-Left Name          %% 1=TL, 2=TR, 3=BL, 4=BR
quadrant-2: Top-Right Name
quadrant-3: Bottom-Left Name
quadrant-4: Bottom-Right Name
Point Label: 0.3, 0.7             %% data point (x, y in [0, 1])
```
</details>

<details>
<summary><strong>gantt</strong></summary>

```
gantt [light|dark] [palette]
title: Optional Title
section Section Name               %% group header (applied to subsequent tasks)
  Task Label: id, start, end       %% task bar (dates: yyyy-mm-dd)
milestone: Label, date             %% milestone diamond
```
</details>

<details>
<summary><strong>state</strong></summary>

```
state [light|dark] [palette]
title: Optional Title
idle[Idle]                         %% normal state (rounded rectangle)
done((Done))                       %% end state (ringed circle)
failed[Failed] accent              %% highlight as focal/error state
[*] --> idle                       %% start pseudo-state → first state
idle --> processing: order placed  %% transition with optional label
```
</details>

<details>
<summary><strong>er</strong></summary>

```
er [light|dark] [palette]
title: Optional Title
entity User[User]                  %% entity declaration
  id pk: uuid                      %% field: name [pk|fk]: type
  email: text
  name                             %% bare field (no type)
entity Post[Post]
  id pk: uuid
  author_id fk: uuid
User --> Post: writes              %% relationship line
```
</details>

<details>
<summary><strong>timeline</strong></summary>

```
timeline [light|dark] [palette]
title: Optional Title
2020-01-15: v1.0 Launch milestone  %% major milestone (larger accent dot)
2021-06-01: v1.5 Patch
2022-03-10: v2.0 Redesign milestone
```
</details>

<details>
<summary><strong>swimlane</strong></summary>

```
swimlane [light|dark] [palette]
title: Optional Title
lanes: Customer, Warehouse, Shipping      %% declare lane labels
Customer: order[Place Order]              %% LaneName: id[Node Label]
Warehouse: pack[Pack Items]
Shipping: ship[Ship Package]
order --> pack                            %% edges between nodes
pack --> ship
```
</details>

## Syntax Comparison: Markdown vs JSON Config

`fig()` accepts two input styles. The table below evaluates every relevant dimension so you can choose the right one — or decide whether to support both.

### Same diagram, two styles

The auth-flow example below produces **identical SVG output**. The character counts illustrate the verbosity difference.

<table>
<tr>
<th>Markdown string&nbsp;&nbsp;(~170 chars)</th>
<th>JSON config&nbsp;&nbsp;(~590 chars)</th>
</tr>
<tr>
<td>

```
flow LR antv
title: Auth Flow
start((Start)) --> login[Enter Credentials]
login --> validate{Valid?}
validate -->|yes| dashboard((Dashboard))
validate -->|no| error[Show Error]
error --> login
```

</td>
<td>

```typescript
fig({
  figure: 'flow',
  direction: 'LR',
  palette: 'antv',
  title: 'Auth Flow',
  nodes: [
    { id: 'start',     label: 'Start',             type: 'terminal' },
    { id: 'login',     label: 'Enter Credentials', type: 'process'  },
    { id: 'validate',  label: 'Valid?',             type: 'decision' },
    { id: 'dashboard', label: 'Dashboard',          type: 'terminal' },
    { id: 'error',     label: 'Show Error',         type: 'process'  },
  ],
  edges: [
    { from: 'start',    to: 'login'               },
    { from: 'login',    to: 'validate'             },
    { from: 'validate', to: 'dashboard', label: 'yes' },
    { from: 'validate', to: 'error',     label: 'no'  },
    { from: 'error',    to: 'login'               },
  ],
});
```

</td>
</tr>
</table>

### Overall feature comparison

| Dimension | Markdown string | JSON config | Advantage |
|-----------|----------------|-------------|-----------|
| **Verbosity** | ~170 chars (5-node diagram) | ~590 chars (same diagram) | ✅ Markdown (~3–5× fewer chars) |
| **AI streaming safety** | Never throws; partial input renders as empty SVG that fills in progressively | Must be a complete, valid object to render | ✅ Markdown (critical for AI chat UIs) |
| **AI token cost** | Compact → fewer tokens consumed per diagram | Verbose → 3–5× more tokens per diagram | ✅ Markdown (matters for context windows) |
| **Human readability** | High — Mermaid-like, visually obvious | Moderate — correct but verbose | ✅ Markdown |
| **Learning curve** | Low — header + domain-specific lines, familiar to Mermaid users | Moderate — TypeScript interface knowledge required | ✅ Markdown |
| **Error tolerance** | Forgiving — unknown tokens silently ignored; best-effort render | Strict — missing required fields throw at call site | ✅ Markdown |
| **Mermaid familiarity** | Partial Mermaid syntax compatibility eases onboarding | N/A | ✅ Markdown |
| **Type safety** | None — strings only, errors caught at render time | Full TypeScript types — errors caught at compile time | ✅ JSON |
| **Programmatic generation** | String concatenation — fragile, no structure | Native object/array construction — loops, conditions, spread | ✅ JSON |
| **IDE & editor support** | No IntelliSense, no autocomplete | Full autocomplete, hover types, rename refactoring | ✅ JSON |
| **Compile-time validation** | ❌ All errors are runtime | ✅ TypeScript reports missing required fields | ✅ JSON |
| **Feature completeness** | Subset — most options covered, a few advanced fields absent (see below) | Full API — every option accessible | ✅ JSON |
| **Dynamic data integration** | Requires string templating — error-prone | Natural — pass computed arrays and objects directly | ✅ JSON |
| **Parser maintenance burden** | High — ~1,500 LOC custom parser in `src/parse.ts` | None — TypeScript types are the contract | ✅ JSON |

**Score: 7 dimensions favour Markdown · 6 dimensions favour JSON.**
The markdown wins are concentrated in the dimensions that matter most for the library's primary AI-generation use case (streaming, token cost, safety). The JSON wins matter most for programmatic/TypeScript applications.

### Per-diagram-type capability matrix

All ten diagram types are available in both styles with near-identical coverage. The only gaps are two advanced JSON-only fields:

| Diagram | Feature | Markdown | JSON config |
|---------|---------|:--------:|:-----------:|
| all | `title` and `subtitle` | ✅ | ✅ |
| all | `theme` (`light`/`dark`) | ✅ | ✅ |
| all | Named palette (`default`, `antv`, `drawio`, …) | ✅ | ✅ |
| all | **Custom hex-array palette** (`string[]`) | ❌ | ✅ |
| flow | nodes, edges, groups, direction | ✅ | ✅ |
| tree | nodes with parent refs, direction | ✅ | ✅ |
| arch | layers with nodes, direction | ✅ | ✅ |
| sequence | actors (inferred if omitted), solid/dashed messages | ✅ | ✅ |
| quadrant | axes, quadrant corner labels, data points | ✅ | ✅ |
| gantt | sections/groups, tasks, milestones | ✅ | ✅ |
| gantt | **Per-task custom bar color** (`GanttTask.color`) | ❌ | ✅ |
| state | states, transitions, accent, start/end pseudo-states | ✅ | ✅ |
| er | entities, fields (pk/fk), relations, cardinality, accent entity | ✅ | ✅ |
| timeline | events, milestone markers | ✅ | ✅ |
| swimlane | lanes, typed nodes, edges | ✅ | ✅ |

Only **two JSON-only features** exist: custom hex-array palettes and per-task Gantt bar colours. Every structural diagram element is fully expressible in markdown.

### Verdict

| Use case | Recommended style |
|----------|------------------|
| AI assistant generating a diagram in a chat response | **Markdown** — streaming-safe, compact, forgiving |
| LLM output passed directly to `fig()` during token streaming | **Markdown** — never throws on partial input |
| TypeScript application building diagrams from runtime data | **JSON** — type-safe, IDE-supported, programmatic |
| CI pipeline generating SVG reports from structured data | **JSON** — reliable, fully validated at compile time |
| Human author writing a diagram in a config file or README | **Markdown** — readable, concise |
| Diagram that requires a custom hex palette or per-task Gantt colour | **JSON** — only option |

**Recommendation: keep both syntaxes.** They target different audiences and neither is redundant. Removing markdown would eliminate the streaming-safe property that is unique to this library and central to its AI-focused positioning. Removing JSON would make programmatic and TypeScript use cases painful. The ~1,500 LOC parser cost is justified by the gains in token efficiency and streaming safety for AI workflows.

## Using with AI

This library ships a **[`SKILL.md`](https://github.com/hustcc/ai-figure/blob/main/SKILL.md)** — a machine-readable skill file that AI agents (Copilot, Cursor, Claude, etc.) can load as context.

```
# Load the skill into your AI context:
@SKILL.md
```

`fig()` accepts a plain markdown string, which makes it ideal for AI generation:
- **Streaming-safe** — partial output never throws; the diagram fills in progressively as more tokens arrive
- **Compact** — the markdown syntax is ~5× shorter than an equivalent JSON config

**Prompt example:**
> "Draw a flowchart showing the user login process."

**AI-generated code:**
```typescript
import { fig } from 'ai-figure';

const svg = fig(`
  flow TB default
  title: User Login
  start((Start)) --> creds[Enter Credentials]
  creds --> validate{Valid?}
  validate -->|yes| dashboard((Dashboard))
  validate -->|no| error[Show Error]
  error --> creds
  dashboard --> done((End))
`);
```

## Development

```bash
# Install dependencies
npm install

# Build (ESM + CJS)
npm run build

# Run tests
npm test

# Type check
npm run typecheck

# Start browser demo (after building)
npx serve .
# Then open: http://localhost:3000/index.html
```

## License

MIT © [hustcc](https://github.com/hustcc)

