import { it } from 'vitest';
import { fig } from '../src/index';
import { matchSvgSnapshot } from './helpers';

it('ER diagram — e-commerce schema, antv palette', () => {
  const svg = fig({
    figure: 'er',
    title: 'E-Commerce Schema',
    subtitle: 'Order management data model',
    entities: [
      {
        id: 'Customer',
        label: 'Customer',
        accent: true,
        fields: [
          { name: 'id',    key: 'pk', type: 'uuid' },
          { name: 'email',            type: 'text' },
          { name: 'name',             type: 'text' },
        ],
      },
      {
        id: 'Order',
        label: 'Order',
        fields: [
          { name: 'id',          key: 'pk', type: 'uuid' },
          { name: 'customer_id', key: 'fk', type: 'uuid' },
          { name: 'status',                 type: 'text' },
          { name: 'total',                  type: 'decimal' },
        ],
      },
      {
        id: 'Product',
        label: 'Product',
        fields: [
          { name: 'id',    key: 'pk', type: 'uuid' },
          { name: 'name',            type: 'text' },
          { name: 'price',           type: 'decimal' },
        ],
      },
      {
        id: 'OrderItem',
        label: 'Order Item',
        fields: [
          { name: 'order_id',   key: 'fk', type: 'uuid' },
          { name: 'product_id', key: 'fk', type: 'uuid' },
          { name: 'qty',                   type: 'int' },
        ],
      },
    ],
    relations: [
      { from: 'Customer',  to: 'Order',     label: 'places', fromCard: '1', toCard: 'N' },
      { from: 'Order',     to: 'OrderItem', label: 'has',    fromCard: '1', toCard: 'N' },
      { from: 'Product',   to: 'OrderItem', label: 'in',     fromCard: '1', toCard: 'N' },
    ],
    palette: 'antv',
  });
  matchSvgSnapshot('er-ecommerce-schema-antv', svg);
});
