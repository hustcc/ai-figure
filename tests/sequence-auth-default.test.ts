import { it } from 'vitest';
import { fig } from '../src/index';
import { matchSvgSnapshot } from './helpers';

it('sequence diagram — login auth flow, default palette', () => {
  const svg = fig({
    figure: 'sequence',
    actors: ['Browser', 'API Gateway', 'Auth Service', 'Database'],
    messages: [
      { from: 'Browser',      to: 'API Gateway',   label: 'POST /login' },
      { from: 'API Gateway',  to: 'Auth Service',  label: 'validateCredentials' },
      { from: 'Auth Service', to: 'Database',      label: 'SELECT user' },
      { from: 'Database',     to: 'Auth Service',  label: 'user row',        style: 'return' },
      { from: 'Auth Service', to: 'API Gateway',   label: 'JWT token',       style: 'return' },
      { from: 'API Gateway',  to: 'Browser',       label: '200 OK + token',  style: 'return' },
    ],
    palette: 'default',
  });
  matchSvgSnapshot('sequence-auth-default', svg);
});
