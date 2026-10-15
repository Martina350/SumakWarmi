import { Order } from '../types/index.ts';

const order101History = [
  { id: 'h1', orderId: 'ord-101', eventType: 'ORDER_CREATED', previousStatus: 'CREATED' as const, newStatus: 'PAYMENT_PENDING' as const, createdAt: '2026-10-14T14:30:00.000Z', actor: 'Martina León', origin: 'CUSTOMER' as const, comment: 'Pedido generado por el cliente', isPublic: true },
  { id: 'h2', orderId: 'ord-101', eventType: 'TRANSFER_UPLOADED', previousStatus: 'PAYMENT_PENDING' as const, newStatus: 'PAYMENT_PENDING' as const, createdAt: '2026-10-14T14:35:00.000Z', actor: 'Martina León', origin: 'CUSTOMER' as const, comment: 'Comprobante Banco Pichincha #98234 adjuntado', isPublic: true },
];

const order102History = [
  { id: 'h3', orderId: 'ord-102', eventType: 'PAYMENT_APPROVED', previousStatus: 'PAYMENT_PENDING' as const, newStatus: 'CONFIRMED' as const, createdAt: '2026-10-13T10:02:00.000Z', actor: 'PayPhone DEMO', origin: 'MOCK_PROVIDER' as const, comment: 'Pago aprobado con tarjeta de prueba', isPublic: true },
  { id: 'h4', orderId: 'ord-102', eventType: 'DISPATCHED', previousStatus: 'READY_FOR_SHIPMENT' as const, newStatus: 'READY_FOR_SHIPMENT' as const, createdAt: '2026-10-13T16:20:00.000Z', actor: 'Andrea Morales', origin: 'SELLER' as const, comment: 'Entregado a Servientrega con guía SER-8492018', isPublic: true },
];

export const INITIAL_ORDERS: Order[] = [
  {
    id: 'ord-101',
    orderNumber: 'SW-000101',
    customerId: 'usr-cust-martina',
    customerName: 'Martina León',
    customerEmail: 'martinacamilaleon@gmail.com',
    customerPhone: '+593998877665',
    items: [
      { productId: 'prod-copa-menstrual', variantId: 'var-copa-s', productName: 'Copa menstrual', variantName: 'Talla S', sku: 'SW-COP-S', unitPrice: 16.0, quantity: 1, subtotal: 16.0 },
      { productId: 'prod-vaso-esterilizador', variantId: 'var-vaso-ros', productName: 'Vaso esterilizador', variantName: 'Rosa Empolvado', sku: 'SW-VAS-RO', unitPrice: 13.0, quantity: 1, subtotal: 13.0 },
    ],
    subtotal: 29.0,
    shippingCost: 3.5,
    total: 32.5,
    status: 'PAYMENT_PENDING',
    paymentStatus: 'PENDING_VERIFICATION',
    shipmentStatus: 'NOT_CREATED',
    paymentMethod: 'TRANSFER',
    shippingAddressSnapshot: {
      id: 'snap-1', recipientName: 'Martina León', phone: '+593998877665', country: 'Ecuador', province: 'Pichincha', city: 'Quito', parish: 'Iñaquito', mainStreet: 'Av. República de El Salvador 890', reference: 'Edificio Bristol, Apto 402', isDefault: true,
    },
    createdAt: '2026-10-14T14:30:00.000Z',
    updatedAt: '2026-10-14T14:35:00.000Z',
    history: order101History,
  },
  {
    id: 'ord-102',
    orderNumber: 'SW-000102',
    customerId: 'usr-cust-camila',
    customerName: 'Camila Paredes',
    customerEmail: 'camila.paredes@gmail.com',
    customerPhone: '+593981122334',
    items: [
      { productId: 'prod-compresa-electrica', variantId: 'var-com-elec', productName: 'Compresa de agua eléctrica', variantName: 'Estándar 110V', sku: 'SW-COM-EL', unitPrice: 25.0, quantity: 1, subtotal: 25.0 },
      { productId: 'prod-te-femenino', variantId: 'var-te-fem', productName: 'Té femenino', variantName: 'Lata 60g a granel', sku: 'SW-TE-FEM', unitPrice: 5.0, quantity: 1, subtotal: 5.0 },
    ],
    subtotal: 30.0,
    shippingCost: 4.5,
    total: 34.5,
    status: 'READY_FOR_SHIPMENT',
    paymentStatus: 'APPROVED',
    shipmentStatus: 'DISPATCHED',
    paymentMethod: 'PAYPHONE',
    assignedSellerId: 'usr-seller-andrea',
    assignedSellerName: 'Andrea Morales',
    shippingAddressSnapshot: {
      id: 'snap-2', recipientName: 'Camila Paredes', phone: '+593981122334', country: 'Ecuador', province: 'Azuay', city: 'Cuenca', parish: 'San Blas', mainStreet: 'Calle Larga 5-24', isDefault: true,
    },
    createdAt: '2026-10-13T10:00:00.000Z',
    updatedAt: '2026-10-13T16:20:00.000Z',
    history: order102History,
  },
];
