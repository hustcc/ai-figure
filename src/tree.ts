import { renderFlowChart } from './render';
import type { TreeDiagramOptions } from './types';

/**
 * Generate an SVG tree diagram from a flat node array with parent references.
 * Internally converts to FlowChartOptions and delegates to renderFlowChart.
 */
export function createTreeDiagram(options: TreeDiagramOptions): string {
  const { nodes, theme, direction = 'TB' } = options;

  const flowNodes = nodes.map((n) => ({
    id: n.id,
    label: n.label,
    type: 'process' as const,
  }));

  const edges = nodes
    .filter((n) => n.parent !== undefined)
    .map((n) => ({ from: n.parent!, to: n.id }));

  return renderFlowChart({ nodes: flowNodes, edges, theme, direction });
}
