import { brotliCompressSync } from 'zlib';

export function encodeMarkdown(text: string): string {
  const compressed = brotliCompressSync(Buffer.from(text, 'utf8'));
  return compressed.toString('base64').replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/g, '');
}
