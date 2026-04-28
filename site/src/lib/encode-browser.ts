/**
 * Browser-compatible gzip + base64url encoding.
 * Uses the Web Streams CompressionStream API (Chrome 80+, Firefox 113+, Safari 16.4+).
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
