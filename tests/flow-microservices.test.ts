import { it } from 'vitest';
import { fig } from '../src/index';
import { matchSvgSnapshot } from './helpers';

it('microservices request flow — colorful theme, TB direction, 2 groups', () => {
  const svg = fig({
    figure: 'flow',
    nodes: [
      { id: 'client', label: 'Client', type: 'terminal' },
      { id: 'gateway', label: 'API Gateway', type: 'process' },
      { id: 'auth_svc', label: 'Auth Service', type: 'process' },
      { id: 'rate_limit', label: 'Rate Limit?', type: 'decision' },
      { id: 'user_svc', label: 'User Service', type: 'process' },
      { id: 'order_svc', label: 'Order Service', type: 'process' },
      { id: 'inventory_svc', label: 'Inventory Service', type: 'process' },
      { id: 'notify_svc', label: 'Notify Service', type: 'io' },
      { id: 'response', label: 'Response', type: 'terminal' },
      { id: 'throttle', label: '429 Too Many Requests', type: 'terminal' },
    ],
    edges: [
      { from: 'client', to: 'gateway' },
      { from: 'gateway', to: 'auth_svc' },
      { from: 'auth_svc', to: 'rate_limit' },
      { from: 'rate_limit', to: 'user_svc', label: 'OK' },
      { from: 'rate_limit', to: 'throttle', label: 'Exceeded' },
      { from: 'user_svc', to: 'order_svc' },
      { from: 'order_svc', to: 'inventory_svc' },
      { from: 'inventory_svc', to: 'notify_svc' },
      { from: 'notify_svc', to: 'response' },
    ],
    groups: [
      { id: 'edge_layer', label: 'Edge Layer', nodes: ['gateway', 'auth_svc', 'rate_limit'] },
      { id: 'business', label: 'Business Services', nodes: ['user_svc', 'order_svc', 'inventory_svc', 'notify_svc'] },
    ],
    theme: 'colorful',
    direction: 'TB',
  });
  matchSvgSnapshot('flow-microservices', svg);
});
