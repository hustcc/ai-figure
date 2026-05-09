/**
 * Decodes a base64url+gzip-compressed markdown string in the browser.
 * Uses the Web Streams `DecompressionStream` API (supported in all modern browsers).
 * Throws a descriptive error if the API is unavailable.
 */
export async function decodeMarkdown(encoded: string): Promise<string> {
  if (typeof DecompressionStream === 'undefined') {
    throw new Error(
      'DecompressionStream is not supported in this browser. Please use a modern browser (Chrome 80+, Firefox 113+, Safari 16.4+).'
    );
  }

  const normalized = normalizeEncodedHash(encoded);

  // Reverse base64url → standard base64 → binary
  const base64 = normalized.replace(/-/g, '+').replace(/_/g, '/');
  const padded = base64 + '='.repeat((4 - (base64.length % 4)) % 4);

  if (!/^[A-Za-z0-9+/]*={0,2}$/.test(padded)) {
    throw new Error('Invalid share link data. Please regenerate the share URL.');
  }

  let binaryStr: string;
  try {
    binaryStr = atob(padded);
  } catch {
    throw new Error('Invalid share link data. Please regenerate the share URL.');
  }
  const bytes = new Uint8Array(binaryStr.length);
  for (let i = 0; i < binaryStr.length; i++) {
    bytes[i] = binaryStr.charCodeAt(i);
  }

  // Decompress: pipe a ReadableStream of the compressed bytes through DecompressionStream.
  // Using pipeThrough (instead of manual write/read) avoids a deadlock where awaiting
  // writer.write() blocks waiting for the reader to drain, while the reader hasn't started yet.
  const compressedStream = new ReadableStream({
    start(controller) {
      controller.enqueue(bytes);
      controller.close();
    },
  });

  return new Response(compressedStream.pipeThrough(new DecompressionStream('gzip'))).text();
}

function normalizeEncodedHash(encoded: string): string {
  const raw = encoded.trim().replace(/^#/, '');
  if (!raw) {
    throw new Error('No diagram encoded in the URL hash.');
  }

  let normalized = raw;
  try {
    normalized = decodeURIComponent(raw);
  } catch {
    // Keep original if hash is not percent-encoded.
  }

  return normalized.replace(/\s+/g, '');
}

/**
 * Encodes a markdown string as a base64url+gzip-compressed hash in the browser.
 * Uses the Web Streams `CompressionStream` API (supported in all modern browsers).
 * Produces output compatible with the server-side `encodeMarkdown` from encode.ts.
 */
export async function encodeMarkdownBrowser(text: string): Promise<string> {
  const bytes = new TextEncoder().encode(text);
  const compressed = await new Response(
    new ReadableStream({
      start(controller) {
        controller.enqueue(bytes);
        controller.close();
      },
    }).pipeThrough(new CompressionStream('gzip'))
  ).arrayBuffer();

  const ui8 = new Uint8Array(compressed);
  const binary = Array.from(ui8, (b) => String.fromCharCode(b)).join('');
  return btoa(binary).replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/g, '');
}
