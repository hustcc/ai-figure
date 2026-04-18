import { it } from 'vitest';
import { fig } from '../src/index';
import { matchSvgSnapshot } from './helpers';

it('sequence diagram — order payment flow, paired palette', () => {
  const svg = fig({
    figure: 'sequence',
    actors: ['User', 'Order Service', 'Payment Service', 'Inventory', 'Notify Service'],
    messages: [
      { from: 'User',            to: 'Order Service',   label: 'POST /checkout' },
      { from: 'Order Service',   to: 'Inventory',       label: 'reserveStock' },
      { from: 'Inventory',       to: 'Order Service',   label: 'reserved',        style: 'return' },
      { from: 'Order Service',   to: 'Payment Service', label: 'chargeCard' },
      { from: 'Payment Service', to: 'Order Service',   label: 'txn success',     style: 'return' },
      { from: 'Order Service',   to: 'Notify Service',  label: 'sendConfirmation' },
      { from: 'Order Service',   to: 'User',            label: '200 Order placed', style: 'return' },
    ],
    palette: 'paired',
  });
  matchSvgSnapshot('sequence-order-paired', svg);
});
