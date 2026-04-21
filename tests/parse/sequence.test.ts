/**
 * Parse tests for the sequence diagram markdown syntax.
 *
 *   figure sequence
 *   theme: dark
 *   title: Login Flow
 *   actors: User, API, DB
 *   User -> API: POST /login
 *   API -> DB: SELECT user
 *   DB --> API: user row
 *   API --> User: 200 OK
 */
import { describe, it, expect } from 'vitest';
import { fig } from '../../src/index';

describe('sequence — markdown parse', () => {
  it('renders a basic sequence diagram from string input', () => {
    const svg = fig(`
      figure sequence
      title: Login Flow
      actors: User, API, DB
      User -> API: POST /login
      API -> DB: SELECT user
      DB --> API: user row
      API --> User: 200 OK
    `);
    expect(svg).toContain('<svg');
    expect(svg).toContain('Login Flow');
    expect(svg).toContain('User');
    expect(svg).toContain('API');
    expect(svg).toContain('POST /login');
    expect(svg).toContain('200 OK');
  });

  it('config: title and subtitle', () => {
    const svg = fig(`
      figure sequence
      title: Auth
      subtitle: OAuth2 handshake
      actors: Client, Server
      Client -> Server: request
    `);
    expect(svg).toContain('Auth');
    expect(svg).toContain('OAuth2 handshake');
  });

  it('config: dark theme renders dark background', () => {
    const svg = fig(`
      figure sequence
      theme: dark
      actors: A, B
      A -> B: hi
    `);
    expect(svg).toContain('#1a1b1e');
  });

  it('config: palette drawio is applied', () => {
    const svg = fig(`
      figure sequence
      palette: drawio
      actors: A, B
      A -> B: hello
    `);
    expect(svg).toContain('<svg');
  });

  it('solid arrow -> and dashed return arrow -->', () => {
    const svg = fig(`
      figure sequence
      actors: A, B
      A -> B: request
      B --> A: response
    `);
    expect(svg).toContain('request');
    expect(svg).toContain('response');
  });

  it('actors inferred from messages when not declared', () => {
    const svg = fig(`
      figure sequence
      Browser -> Server: GET /
      Server --> Browser: 200
    `);
    expect(svg).toContain('Browser');
    expect(svg).toContain('Server');
  });

  it('unlabelled messages', () => {
    const svg = fig(`
      figure sequence
      actors: A, B
      A -> B
      B --> A
    `);
    expect(svg).toContain('A');
    expect(svg).toContain('B');
  });

  it('streaming safety: header-only returns valid SVG', () => {
    expect(() => fig('figure sequence')).not.toThrow();
    expect(fig('figure sequence')).toContain('<svg');
  });

  it('%% comment lines are ignored', () => {
    const svg = fig(`
      figure sequence
      %% login flow
      actors: A, B
      A -> B: hello
    `);
    expect(svg).toContain('hello');
  });
});
