import { renderFlowChart } from './render';
import type { TreeDiagramOptions, NodeType } from './types';

/** Node types cycled by depth level for visual color variation. */
const DEPTH_NODE_TYPES: NodeType[] = ['terminal', 'process', 'decision', 'io'];

/**
 * Generate an SVG tree diagram from a flat node array with parent references.
 * Nodes are colored by their depth level so each generation has a distinct hue.
 * Internally converts to FlowChartOptions and delegates to renderFlowChart.
 */
export function createTreeDiagram(options: TreeDiagramOptions): string {
  const { nodes, theme, palette, direction = 'TB' } = options;

  // Build child→parent map for depth computation
  const parentMap = new Map<string, string>();
  nodes.forEach((n) => { if (n.parent !== undefined) parentMap.set(n.id, n.parent); });

  const depthMap = new Map<string, number>();
  const getDepth = (id: string, visiting = new Set<string>()): number => {
    if (depthMap.has(id)) return depthMap.get(id)!;
    if (visiting.has(id)) {
      throw new Error(`Tree cycle detected at node "${id}". Nodes must form a tree, not a graph.`);
    }
    visiting.add(id);
    const parent = parentMap.get(id);
    const depth = parent === undefined ? 0 : getDepth(parent, visiting) + 1;
    depthMap.set(id, depth);
    return depth;
  };
  nodes.forEach((n) => getDepth(n.id));

  const flowNodes = nodes.map((n) => ({
    id: n.id,
    label: n.label,
    type: DEPTH_NODE_TYPES[getDepth(n.id) % DEPTH_NODE_TYPES.length],
  }));

  const edges = nodes
    .filter((n) => n.parent !== undefined)
    .map((n) => ({ from: n.parent!, to: n.id }));

  return renderFlowChart({ nodes: flowNodes, edges, theme, palette, direction });
}
