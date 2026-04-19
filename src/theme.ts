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
// Shared structural defaults
// ---------------------------------------------------------------------------

type Mode = 'light' | 'dark';

const STRUCTURAL_LIGHT = {
  fontFamily: 'Inter, system-ui, -apple-system, sans-serif',
  fontSize: 14,
  strokeWidth: 2,
  cornerRadius: 6,
  edgeColor:  '#495057',
  edgeWidth:  1.5,
  groupColor: '#868e96',
  groupFill:  'rgba(134,142,150,0.06)',
  background: '',
} as const;

const STRUCTURAL_DARK = {
  fontFamily: 'Inter, system-ui, -apple-system, sans-serif',
  fontSize: 14,
  strokeWidth: 2,
  cornerRadius: 6,
  edgeColor:  '#adb5bd',
  edgeWidth:  1.5,
  groupColor: '#5c6370',
  groupFill:  'rgba(92,99,112,0.15)',
  background: '#1a1b1e',
} as const;

// ---------------------------------------------------------------------------
// Built-in named palettes — light and dark variants
// ---------------------------------------------------------------------------

/**
 * `'default'` — classic multi-hue palette.
 * process=blue, decision=amber, terminal=green, io=purple.
 */
const defaultPalette: Record<Mode, ThemeConfig> = {
  light: {
    ...STRUCTURAL_LIGHT,
    nodeFills:   { process: '#e7f5ff', decision: '#fff7e6', terminal: '#ebfbee', io: '#fdf4ff' },
    nodeStrokes: { process: '#339af0', decision: '#f59f00', terminal: '#51cf66', io: '#cc5de8' },
    textColors:  { process: '#1971c2', decision: '#e67700', terminal: '#2f9e44', io: '#862e9c' },
  },
  dark: {
    ...STRUCTURAL_DARK,
    nodeFills:   { process: '#1c2e44', decision: '#3d2800', terminal: '#1a3820', io: '#2d1a38' },
    nodeStrokes: { process: '#339af0', decision: '#f59f00', terminal: '#51cf66', io: '#cc5de8' },
    textColors:  { process: '#74c0fc', decision: '#ffd43b', terminal: '#8ce99a', io: '#e599f7' },
  },
};

/**
 * `'antv'` — AntV G2 / Ant Design Charts categorical palette.
 * process=cornflower-blue, decision=orange, terminal=teal, io=violet.
 */
const antvPalette: Record<Mode, ThemeConfig> = {
  light: {
    ...STRUCTURAL_LIGHT,
    nodeFills:   { process: '#eff4ff', decision: '#fff4ef', terminal: '#edfaf5', io: '#f5f0fd' },
    nodeStrokes: { process: '#5b8ff9', decision: '#e8684a', terminal: '#5ad8a6', io: '#9270ca' },
    textColors:  { process: '#1d5bc7', decision: '#bf3c22', terminal: '#1c9c6f', io: '#5e3b9e' },
  },
  dark: {
    ...STRUCTURAL_DARK,
    nodeFills:   { process: '#1a2740', decision: '#3d1a13', terminal: '#0f2b22', io: '#201436' },
    nodeStrokes: { process: '#5b8ff9', decision: '#e8684a', terminal: '#5ad8a6', io: '#9270ca' },
    textColors:  { process: '#8caff5', decision: '#f0987d', terminal: '#8de6c4', io: '#c4a7e8' },
  },
};

/**
 * `'drawio'` — draw.io / diagrams.net default shape palette.
 * process=blue, decision=amber, terminal=green, io=red.
 */
const drawioPalette: Record<Mode, ThemeConfig> = {
  light: {
    ...STRUCTURAL_LIGHT,
    nodeFills:   { process: '#dae8fc', decision: '#fff2cc', terminal: '#d5e8d4', io: '#f8cecc' },
    nodeStrokes: { process: '#6c8ebf', decision: '#d6b656', terminal: '#82b366', io: '#b85450' },
    textColors:  { process: '#23527c', decision: '#755e00', terminal: '#3b6e37', io: '#7a2829' },
  },
  dark: {
    ...STRUCTURAL_DARK,
    nodeFills:   { process: '#1a2d45', decision: '#3d3200', terminal: '#1a3024', io: '#3d1414' },
    nodeStrokes: { process: '#6c8ebf', decision: '#d6b656', terminal: '#82b366', io: '#b85450' },
    textColors:  { process: '#9ec5f0', decision: '#edd78f', terminal: '#a8d4a5', io: '#d99b99' },
  },
};

/**
 * `'notion'` — Notion block / highlight color palette.
 * process=blue, decision=yellow, terminal=green, io=purple.
 */
const notionPalette: Record<Mode, ThemeConfig> = {
  light: {
    ...STRUCTURAL_LIGHT,
    nodeFills:   { process: '#dbeafe', decision: '#fef9c3', terminal: '#dcfce7', io: '#fae8ff' },
    nodeStrokes: { process: '#3b82f6', decision: '#ca8a04', terminal: '#16a34a', io: '#a855f7' },
    textColors:  { process: '#1d4ed8', decision: '#854d0e', terminal: '#15803d', io: '#7e22ce' },
  },
  dark: {
    ...STRUCTURAL_DARK,
    nodeFills:   { process: '#1e3a5f', decision: '#3f3008', terminal: '#14301e', io: '#2e1040' },
    nodeStrokes: { process: '#60a5fa', decision: '#fbbf24', terminal: '#4ade80', io: '#c084fc' },
    textColors:  { process: '#93c5fd', decision: '#fde68a', terminal: '#86efac', io: '#d8b4fe' },
  },
};

/**
 * `'figma'` — Figma / Tailwind-inspired modern UI palette.
 * process=indigo, decision=amber, terminal=emerald, io=pink.
 */
const figmaPalette: Record<Mode, ThemeConfig> = {
  light: {
    ...STRUCTURAL_LIGHT,
    nodeFills:   { process: '#eef2ff', decision: '#fffbeb', terminal: '#ecfdf5', io: '#fdf2f8' },
    nodeStrokes: { process: '#6366f1', decision: '#f59e0b', terminal: '#10b981', io: '#ec4899' },
    textColors:  { process: '#4338ca', decision: '#b45309', terminal: '#047857', io: '#be185d' },
  },
  dark: {
    ...STRUCTURAL_DARK,
    nodeFills:   { process: '#1e1b4b', decision: '#3f2c00', terminal: '#022c22', io: '#4a044e' },
    nodeStrokes: { process: '#818cf8', decision: '#fcd34d', terminal: '#34d399', io: '#f472b6' },
    textColors:  { process: '#a5b4fc', decision: '#fde68a', terminal: '#6ee7b7', io: '#f9a8d4' },
  },
};

/**
 * `'github'` — GitHub Primer design system palette.
 * process=blue, decision=amber, terminal=green, io=purple.
 */
const githubPalette: Record<Mode, ThemeConfig> = {
  light: {
    ...STRUCTURAL_LIGHT,
    nodeFills:   { process: '#ddf4ff', decision: '#fff8c5', terminal: '#dafbe1', io: '#fbefff' },
    nodeStrokes: { process: '#0969da', decision: '#9a6700', terminal: '#1a7f37', io: '#8250df' },
    textColors:  { process: '#0550ae', decision: '#6e4f00', terminal: '#116329', io: '#5a32a3' },
  },
  dark: {
    ...STRUCTURAL_DARK,
    nodeFills:   { process: '#0d2d6f', decision: '#341a00', terminal: '#07270f', io: '#1b0a3f' },
    nodeStrokes: { process: '#4493f8', decision: '#d29922', terminal: '#3fb950', io: '#b187f9' },
    textColors:  { process: '#79c0ff', decision: '#f0b429', terminal: '#56d364', io: '#d2a8ff' },
  },
};

/** Map of all built-in named palettes. */
const NAMED_PALETTES: Record<string, Record<Mode, ThemeConfig>> = {
  default: defaultPalette,
  antv:    antvPalette,
  drawio:  drawioPalette,
  notion:  notionPalette,
  figma:   figmaPalette,
  github:  githubPalette,
};

// ---------------------------------------------------------------------------
// Color derivation from custom accent array
// ---------------------------------------------------------------------------

/**
 * Derive a full ThemeConfig from an array of accent colors.
 * The array maps to `[process, decision, terminal, io]` in order.
 * If fewer than 4 colors are provided, they are cycled.
 */
function deriveThemeFromColors(colors: string[], mode: Mode): ThemeConfig {
  const base = mode === 'dark' ? STRUCTURAL_DARK : STRUCTURAL_LIGHT;
  const fills: Record<NodeType, string> = {} as Record<NodeType, string>;
  const strokes: Record<NodeType, string> = {} as Record<NodeType, string>;
  const texts: Record<NodeType, string> = {} as Record<NodeType, string>;

  NODE_TYPES.forEach((type, i) => {
    const color = colors[i % colors.length];
    strokes[type] = color;
    // Fill: append low-opacity hex suffix only for 6-digit hex colors (#RRGGBB).
    // For other formats (rgb(), named colors, shorthand #RGB) use the color directly.
    const is6DigitHex = /^#[0-9a-fA-F]{6}$/.test(color);
    fills[type] = is6DigitHex ? color + (mode === 'dark' ? '30' : '1a') : color;
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
 * @param palette - One of:
 *   - `'default'` — built-in multi-hue palette (default when omitted)
 *   - `'antv'` — AntV G2 categorical palette
 *   - `'drawio'` — draw.io / diagrams.net shape palette
 *   - `'notion'` — Notion block color palette
 *   - `'figma'` — Figma / Tailwind modern UI palette
 *   - `'github'` — GitHub Primer palette
 *   - Custom hex array `[process, decision, terminal, io]`
 * @param mode - `'light'` or `'dark'`. Defaults to `'light'`.
 */
export function resolveTheme(
  palette: PaletteType | undefined,
  mode: ThemeType | undefined,
): ThemeConfig {
  const m: Mode = mode === 'dark' ? 'dark' : 'light';

  // Custom color array.
  if (Array.isArray(palette)) {
    return deriveThemeFromColors(palette, m);
  }

  if (typeof palette === 'string') {
    const named = NAMED_PALETTES[palette];
    if (named) return named[m];
  }

  // Fallback: built-in default palette.
  return defaultPalette[m];
}
