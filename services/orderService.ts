import { fetchAPI } from '@/lib/fetch';
import { Order, OrderItem } from '@/types/data';
import { orders as mockOrders } from '@/constants/data';

export interface CartLineItem {
  menuItemId?: string;
  name: string;
  quantity: number;
  unitPrice: number;
  specialInstructions?: string;
}

export interface PlaceOrderParams {
  userId?: string;
  clerkId?: string;
  vendorId: string;
  deliveryAddress: string;
  deliveryLatitude?: number;
  deliveryLongitude?: number;
  deliveryInstructions?: string;
  specialRequests?: string;
  items: CartLineItem[];
  subtotal?: number;
  tax?: number;
  deliveryFee?: number;
  serviceFee?: number;
  tipAmount?: number;
  paymentMethod?: 'wallet' | 'credit_card' | 'debit_card' | 'cash';
}

/**
 * Place a multi-item food delivery order.
 */
export async function placeFoodOrder(params: PlaceOrderParams): Promise<Order & { items: OrderItem[] }> {
  try {
    const res = await fetchAPI('/(api)/order', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(params),
    });
    return res.data;
  } catch (err) {
    console.warn('[orderService] API fallback for place order:', err);
    const mockOrder: any = {
      ...mockOrders.orders[0],
      id: `ord-${Date.now()}`,
      order_number: `ORD-${Date.now().toString().slice(-6)}`,
      order_status: 'pending',
      delivery_address: params.deliveryAddress,
      created_at: new Date().toISOString(),
      items: params.items.map((it, idx) => ({
        id: `oi-${idx}`,
        order_id: `ord-${Date.now()}`,
        menu_item_id: it.menuItemId || `mi-${idx}`,
        item_name: it.name,
        quantity: it.quantity,
        unit_price: it.unitPrice,
        total_price: it.unitPrice * it.quantity,
        special_instructions: it.specialInstructions || null,
        created_at: new Date().toISOString(),
      })),
    };
    return mockOrder;
  }
}

/**
 * Fetch orders for a user.
 */
export async function fetchUserOrders(identifier: { userId?: string; clerkId?: string }): Promise<Order[]> {
  try {
    const qs = identifier.clerkId
      ? `?clerkId=${encodeURIComponent(identifier.clerkId)}`
      : `?userId=${encodeURIComponent(identifier.userId!)}`;
    const res = await fetchAPI(`/(api)/order${qs}`);
    return res.data || [];
  } catch (err) {
    console.warn('[orderService] API fallback for user orders:', err);
    return mockOrders.orders;
  }
}

/**
 * Update the status of an order.
 */
export async function updateOrderStatus(
  orderId: string,
  status: 'confirming' | 'preparing' | 'ready' | 'picked_up' | 'delivered' | 'canceled',
  driverId?: string
): Promise<Order> {
  try {
    const res = await fetchAPI('/(api)/order', {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ orderId, status, driverId }),
    });
    return res.data;
  } catch (err) {
    console.warn('[orderService] API fallback for update order status:', err);
    return {
      ...mockOrders.orders[0],
      id: orderId,
      order_status: status as any,
    };
  }
}
