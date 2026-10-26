import { neon } from '@neondatabase/serverless';

export async function GET(request: Request) {
  try {
    const sql = neon(process.env.DATABASE_URL!);
    const { searchParams } = new URL(request.url);
    const vendorId = searchParams.get('vendorId');
    const itemId = searchParams.get('itemId');
    const category = searchParams.get('category');

    if (itemId) {
      const res = await sql.query('SELECT * FROM menu_items WHERE id = $1 LIMIT 1', [itemId]);
      return Response.json({ data: res[0] || null }, { status: res.length ? 200 : 404 });
    }

    if (!vendorId) {
      return Response.json({ error: 'Provide vendorId' }, { status: 400 });
    }

    let query = 'SELECT * FROM menu_items WHERE vendor_id = $1';
    const params: any[] = [vendorId];

    if (category) {
      params.push(category);
      query += ` AND category = $${params.length}`;
    }

    query += ' ORDER BY is_popular DESC, category, name';

    const items = await sql.query(query, params);
    return Response.json({ data: items }, { status: 200 });
  } catch (error: any) {
    console.error('[API /menu GET] Error:', error);
    return Response.json({ error: error.message || error }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const sql = neon(process.env.DATABASE_URL!);
    const body = await request.json();
    const {
      vendorId,
      name,
      description,
      category = 'General',
      price,
      discountedPrice,
      isAvailable = true,
      isPopular = false,
      isVegetarian = false,
      isVegan = false,
      isGlutenFree = false,
      imageUrl,
      preparationTimeMins = 15,
    } = body;

    if (!vendorId || !name || price === undefined) {
      return Response.json({ error: 'Missing vendorId, name, or price' }, { status: 400 });
    }

    const query = `
      INSERT INTO menu_items (
        vendor_id, name, description, category, price, discounted_price,
        is_available, is_popular, is_vegetarian, is_vegan, is_gluten_free,
        image_url, preparation_time_mins, created_at, updated_at
      ) VALUES (
        $1, $2, $3, $4, $5, $6,
        $7, $8, $9, $10, $11,
        $12, $13, NOW(), NOW()
      )
      RETURNING *;
    `;

    const result = await sql.query(query, [
      vendorId,
      name,
      description || null,
      category,
      price,
      discountedPrice || null,
      isAvailable,
      isPopular,
      isVegetarian,
      isVegan,
      isGlutenFree,
      imageUrl || null,
      preparationTimeMins,
    ]);

    return Response.json({ data: result[0] }, { status: 201 });
  } catch (error: any) {
    console.error('[API /menu POST] Error:', error);
    return Response.json({ error: error.message || error }, { status: 500 });
  }
}
