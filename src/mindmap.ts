import { resolveTheme } from './theme';
import { escapeXml, wrapText, titleBlockHeight, renderTitleBlock } from './utils';
import type { MindmapDiagramOptions, MindmapNode, MindmapSide, NodeType } from './types';

const NODE_W = 160;
const NODE_H = 60;
const X_GAP = 260;
const Y_GAP = 44;
const PAD = 56;

const DEPTH_NODE_TYPES: NodeType[] = ['process', 'decision', 'io', 'terminal'];

interface Pos {
  x: number;
  y: number;
}

function average(nums: number[]): number {
  return nums.length ? nums.reduce((a, b) => a + b, 0) / nums.length : 0;
}

function buildSubtreeSizeMap(rootId: string, childrenMap: Map<string, string[]>): Map<string, number> {
  const sizeMap = new Map<string, number>();
  const visit = (id: string): number => {
    const children = childrenMap.get(id) ?? [];
    const total = 1 + children.reduce((sum, c) => sum + visit(c), 0);
    sizeMap.set(id, total);
    return total;
  };
  visit(rootId);
  return sizeMap;
}

function assignSides(
  nodes: MindmapNode[],
  rootId: string,
  childrenMap: Map<string, string[]>,
): Map<string, MindmapSide> {
  const sideMap = new Map<string, MindmapSide>();
  const nodeMap = new Map(nodes.map((n) => [n.id, n]));
  const sizeMap = buildSubtreeSizeMap(rootId, childrenMap);
  const rootChildren = childrenMap.get(rootId) ?? [];

  let leftWeight = 0;
  let rightWeight = 0;
  for (const childId of rootChildren) {
    const explicit = nodeMap.get(childId)?.side;
    if (explicit) {
      sideMap.set(childId, explicit);
      const w = sizeMap.get(childId) ?? 1;
      if (explicit === 'left') leftWeight += w;
      else rightWeight += w;
    }
  }

  const remaining = rootChildren
    .filter((id) => !sideMap.has(id))
    .sort((a, b) => (sizeMap.get(b) ?? 1) - (sizeMap.get(a) ?? 1));
  for (const childId of remaining) {
    const w = sizeMap.get(childId) ?? 1;
    if (leftWeight <= rightWeight) {
      sideMap.set(childId, 'left');
      leftWeight += w;
    } else {
      sideMap.set(childId, 'right');
      rightWeight += w;
    }
  }

  const propagate = (id: string, inherited: MindmapSide): void => {
    const own = nodeMap.get(id)?.side ?? inherited;
    sideMap.set(id, own);
    for (const c of childrenMap.get(id) ?? []) propagate(c, own);
  };
  for (const childId of rootChildren) propagate(childId, sideMap.get(childId) ?? 'right');

  return sideMap;
}

/** Mindmap renderer with root-centered, left/right split layout. */
export function createMindmapDiagram(options: MindmapDiagramOptions): string {
  const { nodes, theme: mode = 'light', palette, title, subtitle } = options;
  if (!nodes.length) {
    return '<svg xmlns="http://www.w3.org/2000/svg" width="200" height="100" viewBox="0 0 200 100"></svg>';
  }

  const theme = resolveTheme(palette, mode);
  const nodeMap = new Map(nodes.map((n) => [n.id, n]));
  const childrenMap = new Map<string, string[]>();
  for (const n of nodes) {
    if (!childrenMap.has(n.id)) childrenMap.set(n.id, []);
  }
  for (const n of nodes) {
    if (n.parent && nodeMap.has(n.parent)) (childrenMap.get(n.parent) ?? []).push(n.id);
  }

  const root = nodes.find((n) => !n.parent || !nodeMap.has(n.parent)) ?? nodes[0];
  const sideMap = assignSides(nodes, root.id, childrenMap);
  const posMap = new Map<string, Pos>();
  const depthMap = new Map<string, number>();
  const visited = new Set<string>();

  const layoutSide = (id: string, side: MindmapSide, depth: number, cursor: { y: number }): number => {
    if (visited.has(id)) return posMap.get(id)?.y ?? cursor.y;
    visited.add(id);
    depthMap.set(id, depth);

    const children = (childrenMap.get(id) ?? []).filter((c) => sideMap.get(c) === side);
    const childYs = children.map((c) => layoutSide(c, side, depth + 1, cursor));
    const y = childYs.length ? average(childYs) : (() => {
      const v = cursor.y;
      cursor.y += NODE_H + Y_GAP;
      return v;
    })();
    const x = side === 'right' ? depth * X_GAP : -depth * X_GAP;
    posMap.set(id, { x, y });
    return y;
  };

  const rootChildren = childrenMap.get(root.id) ?? [];
  const leftRoots = rootChildren.filter((id) => sideMap.get(id) === 'left');
  const rightRoots = rootChildren.filter((id) => sideMap.get(id) === 'right');
  const leftCursor = { y: 0 };
  const rightCursor = { y: 0 };

  for (const id of leftRoots) layoutSide(id, 'left', 1, leftCursor);
  for (const id of rightRoots) layoutSide(id, 'right', 1, rightCursor);

  const firstLevelYs = rootChildren.map((id) => posMap.get(id)?.y).filter((v): v is number => v !== undefined);
  const rootY = firstLevelYs.length ? average(firstLevelYs) : 0;
  posMap.set(root.id, { x: 0, y: rootY });
  depthMap.set(root.id, 0);

  const unresolved = nodes.filter((n) => !posMap.has(n.id));
  if (unresolved.length) {
    const fallbackCursor = { y: Math.max(leftCursor.y, rightCursor.y) };
    for (const n of unresolved) {
      depthMap.set(n.id, 1);
      posMap.set(n.id, { x: X_GAP, y: fallbackCursor.y });
      fallbackCursor.y += NODE_H + Y_GAP;
    }
  }

  let minX = Infinity, minY = Infinity, maxX = -Infinity, maxY = -Infinity;
  for (const n of nodes) {
    const p = posMap.get(n.id)!;
    minX = Math.min(minX, p.x - NODE_W / 2);
    minY = Math.min(minY, p.y - NODE_H / 2);
    maxX = Math.max(maxX, p.x + NODE_W / 2);
    maxY = Math.max(maxY, p.y + NODE_H / 2);
  }

  const vbX = minX - PAD;
  const vbY = minY - PAD;
  const vbW = maxX - minX + PAD * 2;
  const vbH = maxY - minY + PAD * 2;
  let width = vbW;
  let height = vbH;
  let viewY = vbY;
  let viewH = vbH;

  const titleH = titleBlockHeight(title, subtitle, theme.fontSize);
  let titleSvg = '';
  if (titleH > 0) {
    viewY -= titleH;
    viewH += titleH;
    height += titleH;
    titleSvg = renderTitleBlock(
      title, subtitle, vbX + vbW / 2, viewY,
      theme.fontFamily, theme.fontSize, theme.edgeColor, theme.groupColor,
    );
  }

  const bg = theme.background
    ? `<rect x="${vbX}" y="${viewY}" width="${vbW}" height="${viewH}" fill="${theme.background}"/>`
    : '';

  const edges = nodes
    .filter((n) => n.parent && posMap.has(n.parent))
    .map((n) => {
      const parent = posMap.get(n.parent!)!;
      const child = posMap.get(n.id)!;
      const sign = child.x >= parent.x ? 1 : -1;
      const sx = parent.x + sign * (NODE_W / 2);
      const sy = parent.y;
      const tx = child.x - sign * (NODE_W / 2);
      const ty = child.y;
      const gapX = Math.abs(tx - sx);
      const bend = Math.max(36, gapX * 0.45);
      const c1x = sx + sign * bend;
      const c2x = tx - sign * bend;
      return `<path d="M${sx},${sy} C${c1x},${sy} ${c2x},${ty} ${tx},${ty}" fill="none" stroke="${theme.edgeColor}" stroke-width="${theme.edgeWidth}" stroke-linecap="round"/>`;
    })
    .join('\n');

  const nodesSvg = nodes.map((n) => {
    const p = posMap.get(n.id)!;
    const depth = depthMap.get(n.id) ?? 1;
    const type: NodeType = depth === 0 ? 'terminal' : DEPTH_NODE_TYPES[(depth - 1) % DEPTH_NODE_TYPES.length];
    const x = p.x - NODE_W / 2;
    const y = p.y - NODE_H / 2;
    const fill = theme.nodeFills[type];
    const stroke = theme.nodeStrokes[type];
    const textColor = theme.textColors[type];

    let shape = '';
    if (type === 'terminal') {
      const rx = Math.min(NODE_H / 2, 28);
      shape = `<rect x="${x}" y="${y}" width="${NODE_W}" height="${NODE_H}" rx="${rx}" ry="${rx}" fill="${fill}" stroke="${stroke}" stroke-width="${theme.strokeWidth}"/>`;
    } else if (type === 'decision') {
      shape = `<polygon points="${p.x},${y} ${x + NODE_W},${p.y} ${p.x},${y + NODE_H} ${x},${p.y}" fill="${fill}" stroke="${stroke}" stroke-width="${theme.strokeWidth}" stroke-linejoin="round"/>`;
    } else if (type === 'io') {
      const skew = 14;
      shape = `<polygon points="${x + skew},${y} ${x + NODE_W},${y} ${x + NODE_W - skew},${y + NODE_H} ${x},${y + NODE_H}" fill="${fill}" stroke="${stroke}" stroke-width="${theme.strokeWidth}" stroke-linejoin="round"/>`;
    } else {
      shape = `<rect x="${x}" y="${y}" width="${NODE_W}" height="${NODE_H}" rx="${theme.cornerRadius}" ry="${theme.cornerRadius}" fill="${fill}" stroke="${stroke}" stroke-width="${theme.strokeWidth}"/>`;
    }

    const lines = wrapText(n.label, NODE_W - 16, theme.fontSize);
    const lineH = theme.fontSize * 1.4;
    const startY = p.y - (lines.length * lineH) / 2 + lineH * 0.5;
    const text = lines.map((line, i) =>
      `<text x="${p.x}" y="${startY + i * lineH}" text-anchor="middle" dominant-baseline="middle" font-family="${escapeXml(theme.fontFamily)}" font-size="${theme.fontSize}" fill="${escapeXml(textColor)}">${escapeXml(line)}</text>`,
    ).join('\n');

    return `<g class="node node-${type}" data-id="${escapeXml(n.id)}">\n${shape}\n${text}\n</g>`;
  }).join('\n');

  return [
    `<svg xmlns="http://www.w3.org/2000/svg" width="${width}" height="${height}" viewBox="${vbX} ${viewY} ${vbW} ${viewH}">`,
    bg,
    ...(titleSvg ? [titleSvg] : []),
    `<g class="mindmap">`,
    edges,
    nodesSvg,
    `</g>`,
    `</svg>`,
  ].join('\n');
}
