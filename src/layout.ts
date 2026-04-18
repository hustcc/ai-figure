import * as dagre from 'dagre';
import type { FlowNode, FlowEdge, Direction, NodeType } from './types';

/** Width and height of each node type in pixels. */
const NODE_DIMS: Record<NodeType, { width: number; height: number }> = {
  process: { width: 160, height: 60 },
  decision: { width: 160, height: 80 },
  terminal: { width: 160, height: 56 },
  io: { width: 160, height: 60 },
};

export interface LayoutNode {
  id: string;
  /** Top-left x. */
  x: number;
  /** Top-left y. */
  y: number;
  width: number;
  height: number;
}

export interface LayoutEdge {
  from: string;
  to: string;
  /** Original input edge index — matches the position in the `edges` array passed to computeLayout. */
  index: number;
  points: { x: number; y: number }[];
  label?: string;
}

export interface LayoutResult {
  nodes: Map<string, LayoutNode>;
  edges: LayoutEdge[];
  viewBox: { x: number; y: number; width: number; height: number };
  width: number;
  height: number;
}

export function computeLayout(
  nodes: FlowNode[],
  edges: FlowEdge[],
  direction: Direction,
): LayoutResult {
  const g = new dagre.graphlib.Graph({ multigraph: true });
  g.setGraph({
    rankdir: direction,
    marginx: 20,
    marginy: 20,
    nodesep: 50,
    ranksep: 60,
    edgesep: 20,
  });
  g.setDefaultEdgeLabel(() => ({}));

  const nodeIds = new Set<string>();
  for (const node of nodes) {
    // Fall back to 'process' dims when an unknown or missing type is supplied (JS callers).
    const dims = NODE_DIMS[node.type as NodeType] ?? NODE_DIMS['process'];
    g.setNode(node.id, { width: dims.width, height: dims.height });
    nodeIds.add(node.id);
  }

  for (let i = 0; i < edges.length; i++) {
    const edge = edges[i];
    // Validate that both endpoints exist so dagre doesn't silently create
    // dimension-less phantom nodes that produce NaN coordinates.
    const missing: string[] = [];
    if (!nodeIds.has(edge.from)) missing.push(`from "${edge.from}"`);
    if (!nodeIds.has(edge.to)) missing.push(`to "${edge.to}"`);
    if (missing.length > 0) {
      throw new Error(
        `computeLayout: edge at index ${i} references unknown node(s): ${missing.join(', ')}`,
      );
    }
    // Use index as edge name to support multiple edges between the same pair
    g.setEdge(edge.from, edge.to, { label: edge.label }, String(i));
  }

  dagre.layout(g);

  const layoutNodes = new Map<string, LayoutNode>();
  for (const nodeId of g.nodes()) {
    const n = g.node(nodeId) as dagre.Node;
    layoutNodes.set(nodeId, {
      id: nodeId,
      x: n.x - n.width / 2,
      y: n.y - n.height / 2,
      width: n.width,
      height: n.height,
    });
  }

  const layoutEdges: LayoutEdge[] = [];
  for (const { v, w, name } of g.edges()) {
    const e = g.edge(v, w, name) as dagre.GraphEdge;
    // Edge names are always set to String(i) above, so parseInt is always valid.
    const idx = parseInt(name ?? '', 10);
    if (isNaN(idx)) continue; // skip any edge without a valid index (should not happen)
    layoutEdges.push({
      from: v,
      to: w,
      index: idx,
      points: (e.points ?? []) as { x: number; y: number }[],
      label: edges[idx]?.label,
    });
  }

  // Compute tight bounding box from all node positions and edge waypoints.
  const PAD_X = 40;
  const PAD_Y = 20;
  let minX = Infinity, minY = Infinity, maxX = -Infinity, maxY = -Infinity;
  for (const n of layoutNodes.values()) {
    minX = Math.min(minX, n.x);
    minY = Math.min(minY, n.y);
    maxX = Math.max(maxX, n.x + n.width);
    maxY = Math.max(maxY, n.y + n.height);
  }
  for (const e of layoutEdges) {
    for (const p of e.points) {
      minX = Math.min(minX, p.x);
      minY = Math.min(minY, p.y);
      maxX = Math.max(maxX, p.x);
      maxY = Math.max(maxY, p.y);
    }
  }

  return {
    nodes: layoutNodes,
    edges: layoutEdges,
    // viewBox origin and size for the tight bounding box + padding
    viewBox: { x: minX - PAD_X, y: minY - PAD_Y, width: maxX - minX + PAD_X * 2, height: maxY - minY + PAD_Y * 2 },
    width: maxX - minX + PAD_X * 2,
    height: maxY - minY + PAD_Y * 2,
  };
}
