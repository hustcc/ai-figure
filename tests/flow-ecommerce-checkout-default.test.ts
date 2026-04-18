import { it } from 'vitest';
import { fig } from '../src/index';
import { matchSvgSnapshot } from './helpers';

it('e-commerce checkout flow — default palette, TB direction', () => {
  const svg = fig({
    figure: 'flow',
    nodes: [
      { id: 'cart', label: 'View Cart', type: 'terminal' },
      { id: 'login_check', label: 'Logged In?', type: 'decision' },
      { id: 'login', label: 'Login / Register', type: 'io' },
      { id: 'address', label: 'Enter Address', type: 'io' },
      { id: 'shipping', label: 'Choose Shipping', type: 'process' },
      { id: 'payment', label: 'Enter Payment', type: 'io' },
      { id: 'validate', label: 'Payment Valid?', type: 'decision' },
      { id: 'confirm', label: 'Order Confirmed', type: 'terminal' },
      { id: 'retry', label: 'Retry Payment', type: 'process' },
    ],
    edges: [
      { from: 'cart', to: 'login_check' },
      { from: 'login_check', to: 'address', label: 'Yes' },
      { from: 'login_check', to: 'login', label: 'No' },
      { from: 'login', to: 'address' },
      { from: 'address', to: 'shipping' },
      { from: 'shipping', to: 'payment' },
      { from: 'payment', to: 'validate' },
      { from: 'validate', to: 'confirm', label: 'OK' },
      { from: 'validate', to: 'retry', label: 'Fail' },
      { from: 'retry', to: 'payment' },
    ],
    groups: [
      { id: 'checkout', label: 'Checkout', nodes: ['address', 'shipping', 'payment'] },
    ],
    palette: 'default',
    direction: 'TB',
  });
  matchSvgSnapshot('flow-ecommerce-checkout-default', svg);
});
