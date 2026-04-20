import { it } from 'vitest';
import { fig } from '../src/index';
import { matchSvgSnapshot } from './helpers';

it('state machine — user session lifecycle, dark theme', () => {
  const svg = fig({
    figure: 'state',
    title: 'User Session',
    subtitle: 'Auth token lifecycle with refresh',
    theme: 'dark',
    nodes: [
      { id: 'start',     label: '',            type: 'start' },
      { id: 'anon',      label: 'Anonymous',   type: 'state' },
      { id: 'active',    label: 'Active',      type: 'state', accent: true },
      { id: 'refreshing',label: 'Refreshing',  type: 'state' },
      { id: 'expired',   label: 'Expired',     type: 'state' },
      { id: 'done',      label: '',            type: 'end' },
    ],
    transitions: [
      { from: 'start',      to: 'anon' },
      { from: 'anon',       to: 'active',     label: 'login' },
      { from: 'active',     to: 'refreshing', label: 'token expiring' },
      { from: 'refreshing', to: 'active',     label: 'refresh ok' },
      { from: 'refreshing', to: 'expired',    label: 'refresh fail' },
      { from: 'active',     to: 'anon',       label: 'logout' },
      { from: 'expired',    to: 'done' },
    ],
    palette: 'antv',
  });
  matchSvgSnapshot('state-user-session-dark', svg);
});
