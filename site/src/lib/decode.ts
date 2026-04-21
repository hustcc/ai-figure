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

  // Reverse base64url → standard base64 → binary
  const base64 = encoded.replace(/-/g, '+').replace(/_/g, '/');
  const padded = base64 + '='.repeat((4 - (base64.length % 4)) % 4);

  const binaryStr = atob(padded);
  const bytes = new Uint8Array(binaryStr.length);
  for (let i = 0; i < binaryStr.length; i++) {
    bytes[i] = binaryStr.charCodeAt(i);
  }

  // Decompress with gzip using DecompressionStream
  const ds = new DecompressionStream('gzip');
  const writer = ds.writable.getWriter();
  const reader = ds.readable.getReader();

  await writer.write(bytes);
  await writer.close();

  const chunks: Uint8Array[] = [];
  let done = false;
  while (!done) {
    const { value, done: d } = await reader.read();
    if (value) chunks.push(value);
    done = d;
  }

  const totalLength = chunks.reduce((acc, c) => acc + c.length, 0);
  const result = new Uint8Array(totalLength);
  let offset = 0;
  for (const chunk of chunks) {
    result.set(chunk, offset);
    offset += chunk.length;
  }

  return new TextDecoder().decode(result);
}
