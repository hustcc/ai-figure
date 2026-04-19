import { it } from 'vitest';
import { fig } from '../src/index';
import { matchSvgSnapshot } from './helpers';

it('order processing flow — default palette, dark theme, TB direction', () => {
  const svg = fig({
    figure: 'flow',
    title: 'Order Processing',
    subtitle: 'E-commerce fulfillment flow',
    nodes: [
      { id: 'order',    label: 'Place Order',        type: 'terminal' },
      { id: 'payment',  label: 'Process Payment',    type: 'process' },
      { id: 'paid',     label: 'Payment OK?',        type: 'decision' },
      { id: 'reserve',  label: 'Reserve Inventory',  type: 'process' },
      { id: 'instock',  label: 'In Stock?',          type: 'decision' },
      { id: 'pick',     label: 'Pick & Pack',        type: 'process' },
      { id: 'ship',     label: 'Ship Order',         type: 'io' },
      { id: 'notify',   label: 'Notify Customer',    type: 'io' },
      { id: 'refund',   label: 'Refund & Cancel',    type: 'terminal' },
      { id: 'backorder', label: 'Backorder',         type: 'terminal' },
      { id: 'done',     label: 'Order Complete',     type: 'terminal' },
    ],
    edges: [
      { from: 'order',    to: 'payment' },
      { from: 'payment',  to: 'paid' },
      { from: 'paid',     to: 'reserve',   label: 'Yes' },
      { from: 'paid',     to: 'refund',    label: 'No' },
      { from: 'reserve',  to: 'instock' },
      { from: 'instock',  to: 'pick',      label: 'Yes' },
      { from: 'instock',  to: 'backorder', label: 'No' },
      { from: 'pick',     to: 'ship' },
      { from: 'ship',     to: 'notify' },
      { from: 'notify',   to: 'done' },
    ],
    theme: 'dark',
    palette: 'default',
    direction: 'TB',
  });
  matchSvgSnapshot('flow-order-processing-dark', svg);
});
