import { it } from 'vitest';
import { createFlowChart } from '../src/index';
import { matchSvgSnapshot } from './helpers';

it('order fulfillment workflow — excalidraw theme, TB direction, 3 groups', () => {
  const svg = createFlowChart({
    nodes: [
      { id: 'order', label: 'New Order', type: 'terminal' },
      { id: 'fraud', label: 'Fraud Check', type: 'process' },
      { id: 'fraud_ok', label: 'Fraud Detected?', type: 'decision' },
      { id: 'cancel', label: 'Cancel & Notify', type: 'terminal' },
      { id: 'payment', label: 'Charge Payment', type: 'process' },
      { id: 'pay_ok', label: 'Payment OK?', type: 'decision' },
      { id: 'refund', label: 'Notify Failure', type: 'io' },
      { id: 'reserve', label: 'Reserve Inventory', type: 'process' },
      { id: 'pick', label: 'Pick & Pack', type: 'process' },
      { id: 'label', label: 'Print Shipping Label', type: 'process' },
      { id: 'ship', label: 'Ship', type: 'process' },
      { id: 'delivered', label: 'Delivered', type: 'terminal' },
    ],
    edges: [
      { from: 'order', to: 'fraud' },
      { from: 'fraud', to: 'fraud_ok' },
      { from: 'fraud_ok', to: 'cancel', label: 'Yes' },
      { from: 'fraud_ok', to: 'payment', label: 'No' },
      { from: 'payment', to: 'pay_ok' },
      { from: 'pay_ok', to: 'reserve', label: 'OK' },
      { from: 'pay_ok', to: 'refund', label: 'Fail' },
      { from: 'reserve', to: 'pick' },
      { from: 'pick', to: 'label' },
      { from: 'label', to: 'ship' },
      { from: 'ship', to: 'delivered' },
    ],
    groups: [
      { id: 'risk', label: 'Risk', nodes: ['fraud', 'fraud_ok'] },
      { id: 'payment_grp', label: 'Payment', nodes: ['payment', 'pay_ok'] },
      { id: 'fulfillment', label: 'Fulfillment', nodes: ['reserve', 'pick', 'label', 'ship'] },
    ],
    theme: 'excalidraw',
    direction: 'TB',
  });
  matchSvgSnapshot('flow-order-fulfillment', svg);
});
