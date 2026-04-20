import { it } from 'vitest';
import { fig } from '../src/index';
import { matchSvgSnapshot } from './helpers';

it('state machine — order status, default palette', () => {
  const svg = fig({
    figure: 'state',
    title: 'Order Status',
    nodes: [
      { id: 'start', label: '', type: 'start' },
      { id: 'pending',    label: 'Pending',    type: 'state' },
      { id: 'processing', label: 'Processing', type: 'state' },
      { id: 'shipped',    label: 'Shipped',    type: 'state' },
      { id: 'delivered',  label: 'Delivered',  type: 'state' },
      { id: 'failed',     label: 'Failed',     type: 'state', accent: true },
      { id: 'done',       label: '', type: 'end' },
    ],
    transitions: [
      { from: 'start',      to: 'pending',    label: '' },
      { from: 'pending',    to: 'processing', label: 'payment confirmed' },
      { from: 'processing', to: 'shipped',    label: 'fulfillment' },
      { from: 'processing', to: 'failed',     label: 'payment error' },
      { from: 'failed',     to: 'pending',    label: 'retry' },
      { from: 'shipped',    to: 'delivered',  label: 'delivered' },
      { from: 'delivered',  to: 'done',       label: '' },
    ],
    palette: 'default',
  });
  matchSvgSnapshot('state-order-status-default', svg);
});
