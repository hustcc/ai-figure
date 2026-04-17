import type { NodeType, ThemeType } from './types';

export interface ThemeConfig {
  fontFamily: string;
  fontSize: number;
  nodeFills: Record<NodeType, string>;
  nodeStrokes: Record<NodeType, string>;
  edgeColor: string;
  groupColor: string;
  roughness: number;
  bowing: number;
  seed: number;
}

export const themes: Record<ThemeType, ThemeConfig> = {
  excalidraw: {
    fontFamily: "'Segoe UI', 'Comic Sans MS', cursive",
    fontSize: 14,
    nodeFills: {
      process: '#fff8f0',
      decision: '#f0f8ff',
      terminal: '#f0fff4',
      io: '#fff0f8',
    },
    nodeStrokes: {
      process: '#1a1a2e',
      decision: '#1a1a2e',
      terminal: '#1a1a2e',
      io: '#1a1a2e',
    },
    edgeColor: '#1a1a2e',
    groupColor: '#6c757d',
    roughness: 1.5,
    bowing: 1.2,
    seed: 42,
  },
  clean: {
    fontFamily: "'Segoe UI', Arial, sans-serif",
    fontSize: 14,
    nodeFills: {
      process: '#e8f4fd',
      decision: '#fef9e7',
      terminal: '#eafaf1',
      io: '#fdf2f8',
    },
    nodeStrokes: {
      process: '#2196f3',
      decision: '#f39c12',
      terminal: '#27ae60',
      io: '#8e44ad',
    },
    edgeColor: '#555555',
    groupColor: '#aaaaaa',
    roughness: 0.3,
    bowing: 0,
    seed: 1,
  },
};
