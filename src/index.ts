import { renderFlowChart } from './render';
import { createTreeDiagram } from './tree';
import { createArchDiagram } from './arch';
import { createSequenceDiagram } from './sequence';
import { createQuadrantChart } from './quadrant';
import { createGanttChart } from './gantt';
import type { FigOptions } from './types';

/**
 * Generate an SVG diagram. The `figure` field selects the diagram type:
 * - `'flow'`     — flowchart (nodes + edges + optional groups)
 * - `'tree'`     — tree / hierarchy (flat node list with parent refs)
 * - `'arch'`     — architecture diagram (layered grid, no edges)
 * - `'sequence'` — sequence diagram (actors + message arrows)
 * - `'quadrant'` — quadrant chart (2×2 matrix with data points)
 * - `'gantt'`    — Gantt chart (task bars, optional milestones, optional groups)
 *
 * Returns a fully self-contained SVG string; no coordinates needed.
 */
export function fig(options: FigOptions): string {
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
} from './types';
