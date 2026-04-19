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
 * Monochrome palettes — all four node types share the same hue family.
 * Fills, strokes, and text use progressively deeper shades to keep types visually distinct.
 */

/**
 * `'mono-blue'` — four shades of blue (Tailwind blue scale).
 * process=blue-600 stroke, decision=blue-300 stroke, terminal=blue-700 stroke, io=blue-300 fill / blue-900 stroke.
 */
const monoBluePalette: Record<Mode, ThemeConfig> = {
  light: {
    ...STRUCTURAL_LIGHT,
    nodeFills:   { process: '#dbeafe', decision: '#eff6ff', terminal: '#bfdbfe', io: '#93c5fd' },
    nodeStrokes: { process: '#2563eb', decision: '#93c5fd', terminal: '#1d4ed8', io: '#1e3a8a' },
    textColors:  { process: '#1e3a8a', decision: '#1d4ed8', terminal: '#1e40af', io: '#172554' },
  },
  dark: {
    ...STRUCTURAL_DARK,
    nodeFills:   { process: '#0c1938', decision: '#071128', terminal: '#162040', io: '#1e2d5a' },
    nodeStrokes: { process: '#60a5fa', decision: '#93c5fd', terminal: '#3b82f6', io: '#bfdbfe' },
    textColors:  { process: '#93c5fd', decision: '#bfdbfe', terminal: '#bfdbfe', io: '#dbeafe' },
  },
};

/**
 * `'mono-green'` — four shades of green (Tailwind green scale).
 * process=green-600 stroke, decision=green-400 stroke, terminal=green-700 stroke, io=green-300 fill / green-800 stroke.
 */
const monoGreenPalette: Record<Mode, ThemeConfig> = {
  light: {
    ...STRUCTURAL_LIGHT,
    nodeFills:   { process: '#dcfce7', decision: '#f0fdf4', terminal: '#bbf7d0', io: '#86efac' },
    nodeStrokes: { process: '#16a34a', decision: '#4ade80', terminal: '#15803d', io: '#166534' },
    textColors:  { process: '#14532d', decision: '#15803d', terminal: '#166534', io: '#052e16' },
  },
  dark: {
    ...STRUCTURAL_DARK,
    nodeFills:   { process: '#052e16', decision: '#021a0e', terminal: '#083820', io: '#0f4d2d' },
    nodeStrokes: { process: '#4ade80', decision: '#86efac', terminal: '#22c55e', io: '#bbf7d0' },
    textColors:  { process: '#86efac', decision: '#bbf7d0', terminal: '#bbf7d0', io: '#dcfce7' },
  },
};

/**
 * `'mono-purple'` — four shades of purple (Tailwind purple scale).
 * process=purple-600 stroke, decision=purple-400 stroke, terminal=purple-700 stroke, io=purple-300 fill / purple-800 stroke.
 */
const monoPurplePalette: Record<Mode, ThemeConfig> = {
  light: {
    ...STRUCTURAL_LIGHT,
    nodeFills:   { process: '#f3e8ff', decision: '#faf5ff', terminal: '#e9d5ff', io: '#d8b4fe' },
    nodeStrokes: { process: '#9333ea', decision: '#c084fc', terminal: '#7e22ce', io: '#6b21a8' },
    textColors:  { process: '#581c87', decision: '#7e22ce', terminal: '#6b21a8', io: '#4a044e' },
  },
  dark: {
    ...STRUCTURAL_DARK,
    nodeFills:   { process: '#2e1065', decision: '#1a0843', terminal: '#3b0764', io: '#4a044e' },
    nodeStrokes: { process: '#c084fc', decision: '#d8b4fe', terminal: '#a855f7', io: '#e9d5ff' },
    textColors:  { process: '#d8b4fe', decision: '#e9d5ff', terminal: '#e9d5ff', io: '#f3e8ff' },
  },
};

/**
 * `'mono-orange'` — four shades of orange (Tailwind orange scale).
 * process=orange-600 stroke, decision=orange-400 stroke, terminal=orange-700 stroke, io=orange-300 fill / orange-800 stroke.
 */
const monoOrangePalette: Record<Mode, ThemeConfig> = {
  light: {
    ...STRUCTURAL_LIGHT,
    nodeFills:   { process: '#ffedd5', decision: '#fff7ed', terminal: '#fed7aa', io: '#fdba74' },
    nodeStrokes: { process: '#ea580c', decision: '#fb923c', terminal: '#c2410c', io: '#9a3412' },
    textColors:  { process: '#7c2d12', decision: '#c2410c', terminal: '#9a3412', io: '#431407' },
  },
  dark: {
    ...STRUCTURAL_DARK,
    nodeFills:   { process: '#3d1700', decision: '#220e00', terminal: '#4d1f00', io: '#652700' },
    nodeStrokes: { process: '#fb923c', decision: '#fdba74', terminal: '#f97316', io: '#fed7aa' },
    textColors:  { process: '#fdba74', decision: '#fed7aa', terminal: '#fed7aa', io: '#ffedd5' },
  },
};

/**
 * `'figma'` — Figma / design-tool palette.
 * process=indigo, decision=cyan, terminal=emerald, io=rose-pink.
 * No amber overlap with 'default'; cyan decision makes it instantly recognisable.
 */
const figmaPalette: Record<Mode, ThemeConfig> = {
  light: {
    ...STRUCTURAL_LIGHT,
    nodeFills:   { process: '#eef2ff', decision: '#ecfeff', terminal: '#ecfdf5', io: '#fdf2f8' },
    nodeStrokes: { process: '#6366f1', decision: '#06b6d4', terminal: '#10b981', io: '#ec4899' },
    textColors:  { process: '#4338ca', decision: '#0891b2', terminal: '#047857', io: '#be185d' },
  },
  dark: {
    ...STRUCTURAL_DARK,
    nodeFills:   { process: '#1e1b4b', decision: '#012030', terminal: '#022c22', io: '#4a044e' },
    nodeStrokes: { process: '#818cf8', decision: '#22d3ee', terminal: '#34d399', io: '#f472b6' },
    textColors:  { process: '#a5b4fc', decision: '#67e8f9', terminal: '#6ee7b7', io: '#f9a8d4' },
  },
};

/**
 * `'vega'` — Vega / Vega-Lite default categorical palette.
 * Uses the first four colors of Vega's well-known categorical scheme:
 * process=steel-blue, decision=orange, terminal=teal, io=crimson-red.
 * Muted, data-visualization-friendly hues — distinct from all other palettes.
 */
const vegaPalette: Record<Mode, ThemeConfig> = {
  light: {
    ...STRUCTURAL_LIGHT,
    nodeFills:   { process: '#e8eff7', decision: '#fff0e0', terminal: '#e4f3f3', io: '#fce8e8' },
    nodeStrokes: { process: '#4c78a8', decision: '#f58518', terminal: '#72b7b2', io: '#e45756' },
    textColors:  { process: '#2b4d6e', decision: '#9b5100', terminal: '#2e6e6a', io: '#9b1c1c' },
  },
  dark: {
    ...STRUCTURAL_DARK,
    nodeFills:   { process: '#162536', decision: '#3a2000', terminal: '#0e2928', io: '#3a0e0e' },
    nodeStrokes: { process: '#7aadce', decision: '#f5a54e', terminal: '#90ccc9', io: '#eb8080' },
    textColors:  { process: '#a8cce4', decision: '#f7c78a', terminal: '#b0dbd8', io: '#f0aaaa' },
  },
};

/** Map of all built-in named palettes. */
const NAMED_PALETTES: Record<string, Record<Mode, ThemeConfig>> = {
  default:      defaultPalette,
  antv:         antvPalette,
  drawio:       drawioPalette,
  figma:        figmaPalette,
  vega:         vegaPalette,
  'mono-blue':  monoBluePalette,
  'mono-green': monoGreenPalette,
  'mono-purple':monoPurplePalette,
  'mono-orange':monoOrangePalette,
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
 *   - `'figma'` — Figma / Tailwind modern UI palette
 *   - `'vega'` — Vega / Vega-Lite default categorical palette
 *   - `'mono-blue'` — four shades of blue (monochrome)
 *   - `'mono-green'` — four shades of green (monochrome)
 *   - `'mono-purple'` — four shades of purple (monochrome)
 *   - `'mono-orange'` — four shades of orange (monochrome)
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
