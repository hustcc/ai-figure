import { it } from 'vitest';
import { fig } from '../src/index';
import { matchSvgSnapshot } from './helpers';

it('state machine — traffic light, antv palette', () => {
  const svg = fig({
    figure: 'state',
    title: 'Traffic Light',
    subtitle: 'Pedestrian crossing FSM',
    nodes: [
      { id: 'start', label: '', type: 'start' },
      { id: 'red',    label: 'Red',    type: 'state', accent: true },
      { id: 'green',  label: 'Green',  type: 'state' },
      { id: 'yellow', label: 'Yellow', type: 'state' },
    ],
    transitions: [
      { from: 'start',  to: 'red' },
      { from: 'red',    to: 'green',  label: 'timer' },
      { from: 'green',  to: 'yellow', label: 'timer' },
      { from: 'yellow', to: 'red',    label: 'timer' },
    ],
    palette: 'antv',
  });
  matchSvgSnapshot('state-traffic-light-antv', svg);
});
