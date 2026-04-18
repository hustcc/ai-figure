import type { NodeType, ThemeType, PaletteType } from './types';

export interface ThemeConfig {
  fontFamily: string;
  fontSize: number;
  strokeWidth: number;
  cornerRadius: number;
  nodeFills: Record<NodeType, string>;
  nodeStrokes: Record<NodeType, string>;
  textColors: Record<NodeType, string>;
  edgeColor: string;
  edgeWidth: number;
  groupColor: string;
  groupFill: string;
  /** SVG canvas background color. Empty string means transparent (no rect rendered). */
  background: string;
}

// Ordered node types for array-based palette mapping.
const NODE_TYPES: NodeType[] = ['process', 'decision', 'terminal', 'io'];

// ---------------------------------------------------------------------------
// Built-in palettes — each with light and dark variants
// ---------------------------------------------------------------------------

type Mode = 'light' | 'dark';

const palettes: Record<string, Record<Mode, ThemeConfig>> = {
  /**
   * Colorful palette — vibrant pastel fills with semantically consistent colors.
   * process=blue, decision=amber, terminal=green, io=purple.
   */
  colorful: {
    light: {
      fontFamily: 'Inter, system-ui, -apple-system, sans-serif',
      fontSize: 14,
      strokeWidth: 2,
      cornerRadius: 6,
      nodeFills: {
        process:  '#e7f5ff',
        decision: '#fff7e6',
        terminal: '#ebfbee',
        io:       '#fdf4ff',
      },
      nodeStrokes: {
        process:  '#339af0',
        decision: '#f59f00',
        terminal: '#51cf66',
        io:       '#cc5de8',
      },
      textColors: {
        process:  '#1971c2',
        decision: '#e67700',
        terminal: '#2f9e44',
        io:       '#862e9c',
      },
      edgeColor:  '#495057',
      edgeWidth:  1.5,
      groupColor: '#868e96',
      groupFill:  'rgba(134,142,150,0.06)',
      background: '',
    },
    dark: {
      fontFamily: 'Inter, system-ui, -apple-system, sans-serif',
      fontSize: 14,
      strokeWidth: 2,
      cornerRadius: 6,
      nodeFills: {
        process:  '#1c2e44',
        decision: '#3d2800',
        terminal: '#1a3820',
        io:       '#2d1a38',
      },
      nodeStrokes: {
        process:  '#339af0',
        decision: '#f59f00',
        terminal: '#51cf66',
        io:       '#cc5de8',
      },
      textColors: {
        process:  '#74c0fc',
        decision: '#ffd43b',
        terminal: '#8ce99a',
        io:       '#e599f7',
      },
      edgeColor:  '#adb5bd',
      edgeWidth:  1.5,
      groupColor: '#5c6370',
      groupFill:  'rgba(92,99,112,0.15)',
      background: '#1a1b1e',
    },
  },

  /**
   * Minimal palette — single blue hue family; fill depth (not hue) differentiates
   * node types. Thin 1px strokes, larger corner radius, neutral group/edge colors.
   */
  minimal: {
    light: {
      fontFamily: 'Inter, system-ui, -apple-system, sans-serif',
      fontSize: 14,
      strokeWidth: 1,
      cornerRadius: 8,
      nodeFills: {
        process:  '#e8f4fd',
        decision: '#d4eaf9',
        terminal: '#bbdefb',
        io:       '#f0f8ff',
      },
      nodeStrokes: {
        process:  '#42a5f5',
        decision: '#1976d2',
        terminal: '#1565c0',
        io:       '#90caf9',
      },
      textColors: {
        process:  '#1565c0',
        decision: '#0d47a1',
        terminal: '#0a3566',
        io:       '#1976d2',
      },
      edgeColor:  '#555555',
      edgeWidth:  1.5,
      groupColor: '#adb5bd',
      groupFill:  'rgba(173,181,189,0.06)',
      background: '',
    },
    dark: {
      fontFamily: 'Inter, system-ui, -apple-system, sans-serif',
      fontSize: 14,
      strokeWidth: 1,
      cornerRadius: 8,
      nodeFills: {
        process:  '#1a2a3d',
        decision: '#152034',
        terminal: '#0f1a28',
        io:       '#1e2f42',
      },
      nodeStrokes: {
        process:  '#4dabf7',
        decision: '#74c0fc',
        terminal: '#a5d8ff',
        io:       '#339af0',
      },
      textColors: {
        process:  '#a5d8ff',
        decision: '#74c0fc',
        terminal: '#4dabf7',
        io:       '#bde0fe',
      },
      edgeColor:  '#6c757d',
      edgeWidth:  1.5,
      groupColor: '#495057',
      groupFill:  'rgba(73,80,87,0.2)',
      background: '#1a1b1e',
    },
  },
};

// ---------------------------------------------------------------------------
// Custom palette derivation
// ---------------------------------------------------------------------------

/**
 * Derive a full ThemeConfig from an array of accent colors.
 * The array maps to [process, decision, terminal, io] in order.
 * If fewer than 4 colors are provided, they are cycled.
 */
function deriveThemeFromColors(colors: string[], mode: Mode): ThemeConfig {
  const base = palettes['colorful'][mode];
  const fills: Record<NodeType, string> = {} as Record<NodeType, string>;
  const strokes: Record<NodeType, string> = {} as Record<NodeType, string>;
  const texts: Record<NodeType, string> = {} as Record<NodeType, string>;

  NODE_TYPES.forEach((type, i) => {
    const color = colors[i % colors.length];
    strokes[type] = color;
    // Fill: color + low-opacity hex suffix (works for 6-digit hex colors).
    fills[type] = color + (mode === 'dark' ? '30' : '1a');
    texts[type] = color;
  });

  return { ...base, nodeFills: fills, nodeStrokes: strokes, textColors: texts };
}

// ---------------------------------------------------------------------------
// Public API
// ---------------------------------------------------------------------------

/**
 * Resolve the final ThemeConfig from palette and mode options.
 *
 * @param palette - Built-in palette name (`'colorful'` | `'minimal'`) or a
 *   custom hex array `[process, decision, terminal, io]`.
 *   Defaults to `'colorful'`.
 * @param mode - `'light'` or `'dark'`. Defaults to `'light'`.
 */
export function resolveTheme(
  palette: PaletteType | undefined,
  mode: ThemeType | undefined,
): ThemeConfig {
  const m: Mode = mode === 'dark' ? 'dark' : 'light';

  if (Array.isArray(palette)) {
    return deriveThemeFromColors(palette, m);
  }

  const paletteName = (typeof palette === 'string' && palette in palettes)
    ? palette
    : 'colorful';

  return palettes[paletteName][m];
}
