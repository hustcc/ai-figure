import { it } from 'vitest';
import { fig } from '../src/index';
import { matchSvgSnapshot } from './helpers';

it('sequence diagram — WebSocket handshake, colorful theme', () => {
  const svg = fig({
    figure: 'sequence',
    actors: ['Client', 'Server'],
    messages: [
      { from: 'Client', to: 'Server', label: 'GET /ws (Upgrade)' },
      { from: 'Server', to: 'Client', label: '101 Switching',  style: 'return' },
      { from: 'Client', to: 'Server', label: 'send message' },
      { from: 'Server', to: 'Client', label: 'broadcast',     style: 'return' },
      { from: 'Client', to: 'Server', label: 'close frame' },
      { from: 'Server', to: 'Client', label: 'close ack',     style: 'return' },
    ],
    theme: 'colorful',
  });
  matchSvgSnapshot('sequence-websocket', svg);
});
