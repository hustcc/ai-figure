import { it } from 'vitest';
import { fig } from '../src/index';
import { matchSvgSnapshot } from './helpers';

it('state machine — vending machine, figma palette', () => {
  const svg = fig({
    figure: 'state',
    title: 'Vending Machine',
    subtitle: 'Coin-operated snack dispenser',
    nodes: [
      { id: 'start',      label: '',           type: 'start' },
      { id: 'idle',       label: 'Idle',        type: 'state' },
      { id: 'selecting',  label: 'Selecting',   type: 'state' },
      { id: 'paying',     label: 'Awaiting Pay', type: 'state', accent: true },
      { id: 'dispensing', label: 'Dispensing',   type: 'state' },
      { id: 'done',       label: '',             type: 'end' },
    ],
    transitions: [
      { from: 'start',      to: 'idle' },
      { from: 'idle',       to: 'selecting',  label: 'press button' },
      { from: 'selecting',  to: 'paying',     label: 'confirm item' },
      { from: 'selecting',  to: 'idle',       label: 'cancel' },
      { from: 'paying',     to: 'dispensing', label: 'coin inserted' },
      { from: 'paying',     to: 'idle',       label: 'timeout' },
      { from: 'dispensing', to: 'done' },
    ],
    palette: 'figma',
  });
  matchSvgSnapshot('state-vending-machine-figma', svg);
});
