import { it } from 'vitest';
import { fig } from '../src/index';
import { matchSvgSnapshot } from './helpers';

it('swimlane diagram — order flow, antv palette', () => {
  const svg = fig({
    figure: 'swimlane',
    title: 'Order Processing',
    lanes: ['Customer', 'Warehouse', 'Shipping'],
    nodes: [
      { id: 'order',   label: 'Place Order',      lane: 'Customer'  },
      { id: 'pay',     label: 'Confirm Payment',  lane: 'Customer'  },
      { id: 'receive', label: 'Receive Order',    lane: 'Warehouse' },
      { id: 'pack',    label: 'Pack Items',       lane: 'Warehouse' },
      { id: 'ship',    label: 'Ship Package',     lane: 'Shipping'  },
      { id: 'deliver', label: 'Deliver',          lane: 'Shipping'  },
    ],
    edges: [
      { from: 'order',   to: 'pay'     },
      { from: 'pay',     to: 'receive' },
      { from: 'receive', to: 'pack'    },
      { from: 'pack',    to: 'ship'    },
      { from: 'ship',    to: 'deliver' },
    ],
    palette: 'antv',
  });
  matchSvgSnapshot('swimlane-order-flow-antv', svg);
});
