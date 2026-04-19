import { it } from 'vitest';
import { fig } from '../src/index';
import { matchSvgSnapshot } from './helpers';

it('sequence diagram — checkout payment flow, default palette, dark theme', () => {
  const svg = fig({
    figure: 'sequence',
    title: 'Checkout Payment Flow',
    actors: ['Customer', 'Frontend', 'Payment API', 'Bank', 'Order Service'],
    messages: [
      { from: 'Customer',     to: 'Frontend',      label: 'Click "Pay"' },
      { from: 'Frontend',     to: 'Payment API',   label: 'POST /charge { card, amount }' },
      { from: 'Payment API',  to: 'Bank',          label: 'authorise(card, amount)' },
      { from: 'Bank',         to: 'Payment API',   label: 'auth_code',             style: 'return' },
      { from: 'Payment API',  to: 'Order Service', label: 'markPaid(orderId)' },
      { from: 'Order Service', to: 'Payment API',  label: 'ok',                    style: 'return' },
      { from: 'Payment API',  to: 'Frontend',      label: '{ status: success }',   style: 'return' },
      { from: 'Frontend',     to: 'Customer',      label: 'Show confirmation',      style: 'return' },
    ],
    theme: 'dark',
    palette: 'default',
  });
  matchSvgSnapshot('sequence-checkout-dark', svg);
});
