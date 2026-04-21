import { gzipSync } from 'zlib';

export function encodeMarkdown(text: string): string {
  const compressed = gzipSync(Buffer.from(text, 'utf8'));
  return compressed.toString('base64').replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/g, '');
}
