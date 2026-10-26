import { neon } from '@neondatabase/serverless';

export async function POST(request: Request) {
  try {
    const sql = neon(process.env.DATABASE_URL!);
    const body = await request.json();
    const {
      userId,
      clerkId,
      vendorId,
      deliveryAddress,
      deliveryLatitude = 6.5244,
      deliveryLongitude = 3.3792,
      deliveryInstructions,
      specialRequests,
      items = [],
      subtotal,
      tax = 0,
      deliveryFee = 2.99,
      serviceFee = 1.0,
      tipAmount = 0,
      paymentMethod = 'wallet',
    } = body;

    let targetUserId = userId;
    if (!targetUserId && clerkId) {
      const uRes = await sql.query('SELECT id FROM users WHERE clerk_id = $1 LIMIT 1', [clerkId]);
      if (uRes.length > 0) targetUserId = uRes[0].id;
    }

    if (!targetUserId || !vendorId || !deliveryAddress || items.length === 0) {
      return Response.json(
        { error: 'Missing required order fields (userId, vendorId, deliveryAddress, items)' },
        { status: 400 }
      );
    }

    const calculatedSubtotal = subtotal || items.reduce((sum: number, it: any) => sum + (it.unitPrice * it.quantity), 0);
    const calculatedTax = tax || Number((calculatedSubtotal * 0.08).toFixed(2));
    const totalAmount = Number(calculatedSubtotal + calculatedTax + deliveryFee + serviceFee + tipAmount).toFixed(2);

    const dateStr = new Date().toISOString().slice(0, 10).replace(/-/g, '');
    const randNum = Math.floor(100 + Math.random() * 900);
    const orderNumber = `ORD-${dateStr}-${randNum}`;

    // 1. Insert Order
    const orderQuery = `
      INSERT INTO orders (
        order_number, user_id, vendor_id, order_status,
        delivery_address, delivery_latitude, delivery_longitude, delivery_instructions, special_requests,
        subtotal, tax, delivery_fee, service_fee, tip_amount, discount_amount, total_amount,
        payment_status, payment_method, created_at, updated_at
      ) VALUES (
        $1, $2, $3, 'pending',
        $4, $5, $6, $7, $8,
        $9, $10, $11, $12, $13, 0.00, $14,
        'paid', $15, NOW(), NOW()
      )
      RETURNING *;
    `;

    const orderRes = await sql.query(orderQuery, [
      orderNumber,
      targetUserId,
      vendorId,
      deliveryAddress,
      deliveryLatitude,
      deliveryLongitude,
      deliveryInstructions || null,
      specialRequests || null,
      calculatedSubtotal,
      calculatedTax,
      deliveryFee,
      serviceFee,
      tipAmount,
      totalAmount,
      paymentMethod,
    ]);

    const createdOrder = orderRes[0];

    // 2. Insert Order Items
    const insertedItems = [];
    for (const it of items) {
      const itemQuery = `
        INSERT INTO order_items (
          order_id, menu_item_id, item_name, quantity, unit_price, total_price, special_instructions, created_at
        ) VALUES (
          $1, $2, $3, $4, $5, $6, $7, NOW()
        )
        RETURNING *;
      `;
      const itemRes = await sql.query(itemQuery, [
        createdOrder.id,
        it.menuItemId || null,
        it.name || it.itemName || 'Food Item',
        it.quantity || 1,
        it.unitPrice || it.price || 0,
        Number((it.unitPrice || it.price || 0) * (it.quantity || 1)).toFixed(2),
        it.specialInstructions || null,
      ]);
      insertedItems.push(itemRes[0]);
    }

    return Response.json({ data: { ...createdOrder, items: insertedItems } }, { status: 201 });
  } catch (error: any) {
    console.error('[API /order POST] Error:', error);
    return Response.json({ error: error.message || error }, { status: 500 });
  }
}

export async function GET(request: Request) {
  try {
    const sql = neon(process.env.DATABASE_URL!);
    const { searchParams } = new URL(request.url);
    const orderId = searchParams.get('orderId');
    const userId = searchParams.get('userId');
    const clerkId = searchParams.get('clerkId');
    const vendorId = searchParams.get('vendorId');
    const driverId = searchParams.get('driverId');

    let targetUserId = userId;
    if (!targetUserId && clerkId) {
      const uRes = await sql.query('SELECT id FROM users WHERE clerk_id = $1 LIMIT 1', [clerkId]);
      if (uRes.length > 0) targetUserId = uRes[0].id;
    }

    if (orderId) {
      const orderRes = await sql.query(
        `SELECT o.*, v.business_name, v.logo_url, v.phone as vendor_phone
         FROM orders o
         JOIN vendors v ON o.vendor_id = v.id
         WHERE o.id = $1 LIMIT 1`,
        [orderId]
      );
      if (orderRes.length === 0) return Response.json({ error: 'Order not found' }, { status: 404 });

      const items = await sql.query('SELECT * FROM order_items WHERE order_id = $1', [orderId]);
      return Response.json({ data: { ...orderRes[0], items } }, { status: 200 });
    }

    let query = `
      SELECT o.*, v.business_name, v.logo_url, v.business_category
      FROM orders o
      JOIN vendors v ON o.vendor_id = v.id
      WHERE 1=1
    `;
    const params: any[] = [];

    if (targetUserId) {
      params.push(targetUserId);
      query += ` AND o.user_id = $${params.length}`;
    }

    if (vendorId) {
      params.push(vendorId);
      query += ` AND o.vendor_id = $${params.length}`;
    }

    if (driverId) {
      params.push(driverId);
      query += ` AND o.driver_id = $${params.length}`;
    }

    query += ' ORDER BY o.created_at DESC LIMIT 30';

    const orders = await sql.query(query, params);
    return Response.json({ data: orders }, { status: 200 });
  } catch (error: any) {
    console.error('[API /order GET] Error:', error);
    return Response.json({ error: error.message || error }, { status: 500 });
  }
}

export async function PATCH(request: Request) {
  try {
    const sql = neon(process.env.DATABASE_URL!);
    const body = await request.json();
    const { orderId, status, driverId, cancelReason } = body;

    if (!orderId) {
      return Response.json({ error: 'Missing orderId' }, { status: 400 });
    }

    const updates: string[] = ['updated_at = NOW()'];
    const params: any[] = [orderId];

    if (status) {
      params.push(status);
      updates.push(`order_status = $${params.length}`);

      if (status === 'confirming') updates.push('confirmed_at = NOW()');
      if (status === 'preparing') updates.push('preparing_at = NOW()');
      if (status === 'ready') updates.push('ready_at = NOW()');
      if (status === 'picked_up') updates.push('picked_up_at = NOW()');
      if (status === 'delivered') updates.push('delivered_at = NOW()');
      if (status === 'canceled') updates.push('canceled_at = NOW()');
    }

    if (driverId) {
      params.push(driverId);
      updates.push(`driver_id = $${params.length}`);
    }

    if (cancelReason) {
      params.push(cancelReason);
      updates.push(`cancel_reason = $${params.length}`);
    }

    const query = `
      UPDATE orders
      SET ${updates.join(', ')}
      WHERE id = $1
      RETURNING *;
    `;

    const result = await sql.query(query, params);
    return Response.json({ data: result[0] }, { status: 200 });
  } catch (error: any) {
    console.error('[API /order PATCH] Error:', error);
    return Response.json({ error: error.message || error }, { status: 500 });
  }
}

export async function DELETE(request: Request) {
  try {
    const sql = neon(process.env.DATABASE_URL!);
    const { searchParams } = new URL(request.url);
    const orderId = searchParams.get('orderId') || searchParams.get('id');

    if (!orderId) {
      return Response.json({ error: 'Missing orderId' }, { status: 400 });
    }

    const result = await sql.query(
      "UPDATE orders SET order_status = 'canceled', cancel_reason = 'Canceled by user', canceled_at = NOW(), updated_at = NOW() WHERE id = $1 RETURNING *;",
      [orderId]
    );

    if (result.length === 0) {
      return Response.json({ error: 'Order not found' }, { status: 404 });
    }

    return Response.json(
      { message: 'Order canceled successfully', data: result[0] },
      { status: 200 }
    );
  } catch (error: any) {
    console.error('[API /order DELETE] Error:', error);
    return Response.json({ error: error.message || error }, { status: 500 });
  }
}
