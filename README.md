# antvis

> Excalidraw-style flowchart renderer — define nodes & edges, get beautiful SVG. Works in browser **and** Node.js.

[![npm version](https://img.shields.io/npm/v/antvis.svg)](https://www.npmjs.com/package/antvis)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](LICENSE)

---

## Features ✨

- 🎨 **Excalidraw hand-drawn style** — slightly imperfect lines, soft fills, rounded shapes
- 📐 **Auto layout** — powered by [Dagre](https://github.com/dagrejs/dagre), no manual coordinates
- 📦 **Groups** — logical node groups rendered with dashed borders and labels
- 🌐 **Browser + Node.js** — pure SVG output, zero DOM dependency
- 🤖 **AI-friendly API** — simple, semantic, TypeScript-first
- 🎭 **Two themes** — `excalidraw` (hand-drawn) or `clean` (flat/modern)

---

## Quick Start

### Install

```bash
npm install antvis
```

### Usage

```typescript
import { createFlowChart } from 'antvis';

const svg = createFlowChart({
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
  groups: [
    { id: 'g1', label: 'Validation', nodes: ['process1', 'decision'] },
  ],
  theme: 'excalidraw', // 'excalidraw' | 'clean'
  direction: 'TB',     // 'TB' (top→bottom) | 'LR' (left→right)
});

// Browser: inject into the DOM
document.body.innerHTML = svg;

// Node.js: write to file
import { writeFileSync } from 'fs';
writeFileSync('flowchart.svg', svg);
```

---

## API Reference

### `createFlowChart(options): string`

Returns an SVG string. All layout is computed automatically.

#### `FlowChartOptions`

| Field       | Type            | Default        | Description                              |
|-------------|-----------------|----------------|------------------------------------------|
| `nodes`     | `FlowNode[]`    | **required**   | List of nodes                            |
| `edges`     | `FlowEdge[]`    | **required**   | List of directed edges                   |
| `groups`    | `FlowGroup[]`   | `[]`           | Optional logical groups                  |
| `theme`     | `ThemeType`     | `'excalidraw'` | Visual theme (`'excalidraw'` or `'clean'`) |
| `direction` | `Direction`     | `'TB'`         | Layout direction (`'TB'` or `'LR'`)       |

---

#### `FlowNode`

| Field   | Type       | Default     | Description                |
|---------|------------|-------------|----------------------------|
| `id`    | `string`   | **required** | Unique node identifier     |
| `label` | `string`   | **required** | Text displayed in the node |
| `type`  | `NodeType` | `'process'` | Visual shape               |

**Node types (`NodeType`)**

| Value      | Shape               | Use case                  |
|------------|---------------------|---------------------------|
| `process`  | Rectangle           | Default step / action     |
| `decision` | Diamond             | Conditional / branch      |
| `terminal` | Rounded rectangle   | Start / End               |
| `io`       | Parallelogram       | Input / Output            |

---

#### `FlowEdge`

| Field   | Type     | Default      | Description              |
|---------|----------|--------------|--------------------------|
| `from`  | `string` | **required** | Source node ID           |
| `to`    | `string` | **required** | Target node ID           |
| `label` | `string` | `undefined`  | Optional edge label      |

---

#### `FlowGroup`

| Field   | Type       | Default      | Description                        |
|---------|------------|--------------|------------------------------------|
| `id`    | `string`   | **required** | Unique group identifier            |
| `label` | `string`   | **required** | Label shown above the group border |
| `nodes` | `string[]` | **required** | IDs of nodes inside this group     |

---

## Examples

### Simple linear flow

```typescript
const svg = createFlowChart({
  nodes: [
    { id: 'a', label: 'Start',   type: 'terminal' },
    { id: 'b', label: 'Process', type: 'process'  },
    { id: 'c', label: 'End',     type: 'terminal' },
  ],
  edges: [
    { from: 'a', to: 'b' },
    { from: 'b', to: 'c' },
  ],
});
```

---

### Decision branch

```typescript
const svg = createFlowChart({
  nodes: [
    { id: 'start',    label: 'Start',        type: 'terminal' },
    { id: 'proc',     label: 'Process',      type: 'process'  },
    { id: 'decision', label: 'Is Valid?',    type: 'decision' },
    { id: 'ok',       label: 'Success',      type: 'terminal' },
    { id: 'fail',     label: 'Failure',      type: 'terminal' },
  ],
  edges: [
    { from: 'start',    to: 'proc'                 },
    { from: 'proc',     to: 'decision'             },
    { from: 'decision', to: 'ok',   label: 'Yes'  },
    { from: 'decision', to: 'fail', label: 'No'   },
  ],
});
```

---

### Groups + clean theme + horizontal layout

```typescript
const svg = createFlowChart({
  nodes: [
    { id: 'input',   label: 'User Input',   type: 'io'       },
    { id: 'parse',   label: 'Parse',        type: 'process'  },
    { id: 'valid',   label: 'Valid?',       type: 'decision' },
    { id: 'store',   label: 'Store in DB',  type: 'process'  },
    { id: 'error',   label: 'Return Error', type: 'terminal' },
  ],
  edges: [
    { from: 'input', to: 'parse'              },
    { from: 'parse', to: 'valid'              },
    { from: 'valid', to: 'store', label: '✓' },
    { from: 'valid', to: 'error', label: '✗' },
  ],
  groups: [
    { id: 'g1', label: 'Validation Layer', nodes: ['parse', 'valid'] },
  ],
  theme: 'clean',
  direction: 'LR',
});
```

---

## Using with AI

This API is designed to be easy for AI agents to call. Just describe the flow in natural language and ask the AI to generate the `createFlowChart(...)` call.

**Prompt example:**
> "Draw a flowchart showing the user login process: start → enter credentials → validate → if valid go to dashboard, if invalid show error → end."

**AI-generated code:**
```typescript
import { createFlowChart } from 'antvis';

const svg = createFlowChart({
  nodes: [
    { id: 'start',       label: 'Start',             type: 'terminal' },
    { id: 'credentials', label: 'Enter Credentials', type: 'io'       },
    { id: 'validate',    label: 'Validate',          type: 'process'  },
    { id: 'check',       label: 'Valid?',            type: 'decision' },
    { id: 'dashboard',   label: 'Go to Dashboard',  type: 'terminal' },
    { id: 'error',       label: 'Show Error',        type: 'terminal' },
  ],
  edges: [
    { from: 'start',       to: 'credentials'                    },
    { from: 'credentials', to: 'validate'                       },
    { from: 'validate',    to: 'check'                         },
    { from: 'check',       to: 'dashboard', label: 'Valid'     },
    { from: 'check',       to: 'error',     label: 'Invalid'   },
  ],
  theme: 'excalidraw',
  direction: 'TB',
});
```

---

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
# Then open: http://localhost:3000/examples/basic.html
```

---

## Tech Stack

| Concern        | Library                                     |
|----------------|---------------------------------------------|
| Language       | TypeScript                                  |
| Layout         | [dagre](https://github.com/dagrejs/dagre)   |
| Hand-drawn SVG | [roughjs](https://roughjs.com/)             |
| Build          | [tsup](https://tsup.egoist.dev/) (ESM + CJS)|
| Tests          | [vitest](https://vitest.dev/)               |

---

## License

MIT © [hustcc](https://github.com/hustcc)

---

# antvis（中文文档）

> Excalidraw 手绘风格流程图渲染器 — 只需定义节点与边，自动生成美观的 SVG。支持浏览器与 Node.js 双环境。

## 核心特性

- 🎨 **Excalidraw 手绘风格** — 略带抖动的线条、柔和的填充色
- 📐 **自动布局** — 基于 Dagre 算法，无需手动指定坐标
- 📦 **分组支持** — 用虚线框包裹节点组，自动计算边界
- 🌐 **双环境运行** — 纯 SVG 输出，不依赖 DOM
- 🤖 **AI 友好 API** — 语义清晰，TypeScript 类型完整

## 快速使用

```typescript
import { createFlowChart } from 'antvis';

const svg = createFlowChart({
  nodes: [
    { id: 'start',    label: '开始',     type: 'terminal' },
    { id: 'process',  label: '处理数据', type: 'process'  },
    { id: 'decision', label: '是否有效?', type: 'decision' },
    { id: 'yes',      label: '成功',     type: 'terminal' },
    { id: 'no',       label: '失败',     type: 'terminal' },
  ],
  edges: [
    { from: 'start',    to: 'process'              },
    { from: 'process',  to: 'decision'             },
    { from: 'decision', to: 'yes', label: '是'    },
    { from: 'decision', to: 'no',  label: '否'    },
  ],
  groups: [
    { id: 'g1', label: '验证流程', nodes: ['process', 'decision'] },
  ],
  theme: 'excalidraw',
  direction: 'TB',
});

document.body.innerHTML = svg; // 浏览器
// 或
import { writeFileSync } from 'fs';
writeFileSync('chart.svg', svg); // Node.js
```

## 节点类型

| 类型         | 形状         | 适用场景       |
|-------------|-------------|---------------|
| `process`   | 矩形         | 默认步骤/操作  |
| `decision`  | 菱形         | 条件判断/分支  |
| `terminal`  | 圆角矩形     | 开始/结束      |
| `io`        | 平行四边形   | 输入/输出      |

## 主题

- `excalidraw`（默认）：手绘风格，略微不规则的线条
- `clean`：扁平现代风格，整洁线条

## 布局方向

- `TB`（默认）：从上到下
- `LR`：从左到右
