import { defineConfig } from 'tsup';

export default defineConfig([
  {
    entry: ['src/index.ts'],
    format: ['esm', 'cjs'],
    dts: true,
    clean: true,
    sourcemap: true,
    splitting: false,
    treeshake: true,
    minify: false,
    outDir: 'dist',
    target: 'es2020',
    noExternal: ['dagre'],
  },
  {
    entry: ['src/index.ts'],
    format: ['iife'],
    globalName: 'AiFigure',
    dts: false,
    clean: false,
    sourcemap: true,
    splitting: false,
    treeshake: true,
    minify: true,
    outDir: 'dist',
    target: 'es2020',
    noExternal: ['dagre'],
  },
]);
