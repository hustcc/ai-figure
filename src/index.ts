import { renderFlowChart } from './render';
import { createTreeDiagram } from './tree';
import { createArchDiagram } from './arch';
import { createSequenceDiagram } from './sequence';
import { createQuadrantChart } from './quadrant';
import { createGanttChart } from './gantt';
import { createStateDiagram } from './state';
import { createErDiagram } from './er';
import { createTimelineDiagram } from './timeline';
import { createSwimlaneDiagram } from './swimlane';
import { createBubbleChart } from './bubble';
import { parseFigmd } from './parse';
import type { FigOptions } from './types';

/** Minimal valid SVG returned when a string input cannot be rendered yet (e.g. during streaming). */
const EMPTY_SVG = '<svg xmlns="http://www.w3.org/2000/svg" width="1" height="1"></svg>';

/**
 * Generate an SVG diagram from either a Mermaid-like markdown string or a JSON config object.
 *
 * **String input** — treated as a markdown diagram definition (see below).
 * Fault-tolerant: never throws. If the input is empty, partial, or unparseable
 * (e.g. while an AI is still streaming output) a 1×1 empty SVG is returned.
 * As more content is appended the diagram renders progressively.
 *
 * **Object input** — a typed {@link FigOptions} config. The `figure` field selects
 * the diagram type:
 * - `'flow'`     — flowchart (nodes + edges + optional groups)
 * - `'tree'`     — tree / hierarchy (flat node list with parent refs)
 * - `'arch'`     — architecture diagram (layered grid, no edges)
 * - `'sequence'` — sequence diagram (actors + message arrows)
 * - `'quadrant'` — quadrant chart (2×2 matrix with data points)
 * - `'gantt'`    — Gantt chart (task bars, optional milestones, optional groups)
 * - `'state'`    — state machine (states + transitions, UML pseudo-states)
 * - `'er'`       — ER / data model (entities with fields, relationships)
 * - `'timeline'` — timeline (events plotted on a horizontal date axis)
 * - `'swimlane'` — swimlane (cross-functional flow with lane bands)
 *
 * Returns a fully self-contained SVG string; no coordinates needed.
 *
 * @example
 * ```ts
 * // Markdown string (AI-friendly, streaming-safe)
 * fig(`
 *   flow LR antv
 *   title: CI Pipeline
 *   code[Write Code] --> test{Tests Pass?}
 *   test -->|yes| build[Build Image]
 *   test -->|no| fix((Fix Issues))
 * `);
 *
 * // JSON config object (typed, programmatic)
 * fig({ figure: 'flow', nodes: [...], edges: [...] });
 * ```
 */
export { parseFigmd };
export function fig(input: string | FigOptions): string {
  if (typeof input === 'string') {
    try {
      return figDispatch(parseFigmd(input));
    } catch {
      return EMPTY_SVG;
    }
  }
  return figDispatch(input);
}

function figDispatch(options: FigOptions): string {
  switch (options.figure) {
    case 'flow':
      return renderFlowChart(options);
    case 'tree':
      return createTreeDiagram(options);
    case 'arch':
      return createArchDiagram(options);
    case 'sequence':
      return createSequenceDiagram(options);
    case 'quadrant':
      return createQuadrantChart(options);
    case 'gantt':
      return createGanttChart(options);
    case 'state':
      return createStateDiagram(options);
    case 'er':
      return createErDiagram(options);
    case 'timeline':
      return createTimelineDiagram(options);
    case 'swimlane':
      return createSwimlaneDiagram(options);
    case 'bubble':
      return createBubbleChart(options);
    default: {
      const _exhaustive: never = options;
      throw new Error(`Unknown figure type: ${(_exhaustive as FigOptions).figure}`);
    }
  }
}

export type {
  FigOptions,
  FlowNode,
  FlowEdge,
  FlowGroup,
  FlowChartOptions,
  NodeType,
  Direction,
  ThemeType,
  TreeNode,
  TreeDiagramOptions,
  ArchNode,
  ArchLayer,
  ArchDiagramOptions,
  SeqMessage,
  SequenceDiagramOptions,
  QuadrantPoint,
  QuadrantChartOptions,
  GanttTask,
  GanttMilestone,
  GanttChartOptions,
  StateNodeType,
  StateNode,
  StateTransition,
  StateDiagramOptions,
  ErFieldKey,
  ErField,
  ErEntity,
  ErRelation,
  ErDiagramOptions,
  TimelineEvent,
  TimelineDiagramOptions,
  SwimlaneNode,
  SwimlaneEdge,
  SwimlaneDiagramOptions,
  BubbleItem,
  BubbleChartOptions,
} from './types';
