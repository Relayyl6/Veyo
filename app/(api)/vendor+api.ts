import { neon } from '@neondatabase/serverless';

export async function POST(request: Request) {
  try {
    const sql = neon(process.env.DATABASE_URL!);
    const body = await request.json();
    const {
      ownerId,
      clerkId,
      businessName,
      businessCategory = 'fast_food',
      description,
      address,
      latitude = 6.5244,
      longitude = 3.3792,
      phone,
      email,
      logoUrl,
      coverImageUrl,
      preparationTimeMins = 20,
      deliveryFee = 2.99,
      minimumOrder = 10.0,
      openingTime = '08:00',
      closingTime = '22:00',
      daysOpen = ['monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday', 'sunday'],
    } = body;

    let targetOwnerId = ownerId;

    if (!targetOwnerId && clerkId) {
      const uRes = await sql.query('SELECT id FROM users WHERE clerk_id = $1 LIMIT 1', [clerkId]);
      if (uRes.length > 0) {
        targetOwnerId = uRes[0].id;
      }
    }

    if (!targetOwnerId || !businessName || !address || !phone) {
      return Response.json(
        { error: 'Missing Required Vendor Fields (targetOwnerId, businessName, address, phone)' },
        { status: 400 }
      );
    }

    // Update user role to vendor_admin
    await sql.query("UPDATE users SET role = 'vendor_admin', updated_at = NOW() WHERE id = $1", [targetOwnerId]);

    const query = `
      INSERT INTO vendors (
        owner_id, business_name, business_category, description, address,
        latitude, longitude, phone, email, logo_url, cover_image_url,
        is_open, preparation_time_mins, delivery_fee, minimum_order,
        rating, total_orders, opening_time, closing_time, days_open,
        is_deleted, created_at, updated_at
      ) VALUES (
        $1, $2, $3, $4, $5,
        $6, $7, $8, $9, $10, $11,
        true, $12, $13, $14,
        5.00, 0, $15, $16, $17,
        false, NOW(), NOW()
      )
      RETURNING *;
    `;

    const result = await sql.query(query, [
      targetOwnerId,
      businessName,
      businessCategory,
      description || `${businessName} on Veyo`,
      address,
      latitude,
      longitude,
      phone,
      email || null,
      logoUrl || null,
      coverImageUrl || null,
      preparationTimeMins,
      deliveryFee,
      minimumOrder,
      openingTime,
      closingTime,
      daysOpen,
    ]);

    return Response.json({ data: result[0] }, { status: 201 });
  } catch (error: any) {
    console.error('[API /vendor POST] Error:', error);
    return Response.json({ error: error.message || error }, { status: 500 });
  }
}

export async function GET(request: Request) {
  try {
    const sql = neon(process.env.DATABASE_URL!);
    const { searchParams } = new URL(request.url);
    const vendorId = searchParams.get('vendorId');
    const ownerId = searchParams.get('ownerId');
    const category = searchParams.get('category');
    const q = searchParams.get('q');

    if (vendorId) {
      const res = await sql.query('SELECT * FROM vendors WHERE id = $1 AND is_deleted = false LIMIT 1', [vendorId]);
      if (res.length === 0) return Response.json({ error: 'Vendor not found' }, { status: 404 });

      // Attach menu items
      const items = await sql.query('SELECT * FROM menu_items WHERE vendor_id = $1 AND is_available = true ORDER BY category, name', [vendorId]);
      return Response.json({ data: { ...res[0], menu_items: items } }, { status: 200 });
    }

    if (ownerId) {
      const res = await sql.query('SELECT * FROM vendors WHERE owner_id = $1 AND is_deleted = false LIMIT 1', [ownerId]);
      return Response.json({ data: res[0] || null }, { status: res.length ? 200 : 404 });
    }

    let query = 'SELECT * FROM vendors WHERE is_deleted = false';
    const params: any[] = [];

    if (category) {
      params.push(category);
      query += ` AND business_category = $${params.length}`;
    }

    if (q) {
      params.push(`%${q}%`);
      query += ` AND (business_name ILIKE $${params.length} OR description ILIKE $${params.length})`;
    }

    query += ' ORDER BY rating DESC, total_orders DESC LIMIT 30';

    const vendors = await sql.query(query, params);
    return Response.json({ data: vendors }, { status: 200 });
  } catch (error: any) {
    console.error('[API /vendor GET] Error:', error);
    return Response.json({ error: error.message || error }, { status: 500 });
  }
}
