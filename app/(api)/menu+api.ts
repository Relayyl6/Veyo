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

export async function PATCH(request: Request) {
  try {
    const sql = neon(process.env.DATABASE_URL!);
    const body = await request.json();
    const {
      id,
      itemId,
      name,
      description,
      category,
      price,
      discountedPrice,
      isAvailable,
      isPopular,
      isVegetarian,
      isVegan,
      isGlutenFree,
      imageUrl,
      preparationTimeMins,
    } = body;

    const targetId = id || itemId;
    if (!targetId) {
      return Response.json({ error: 'Missing menu item id' }, { status: 400 });
    }

    const updates: string[] = ['updated_at = NOW()'];
    const params: any[] = [targetId];

    if (name !== undefined) {
      params.push(name);
      updates.push(`name = $${params.length}`);
    }
    if (description !== undefined) {
      params.push(description);
      updates.push(`description = $${params.length}`);
    }
    if (category !== undefined) {
      params.push(category);
      updates.push(`category = $${params.length}`);
    }
    if (price !== undefined) {
      params.push(price);
      updates.push(`price = $${params.length}`);
    }
    if (discountedPrice !== undefined) {
      params.push(discountedPrice);
      updates.push(`discounted_price = $${params.length}`);
    }
    if (isAvailable !== undefined) {
      params.push(isAvailable);
      updates.push(`is_available = $${params.length}`);
    }
    if (isPopular !== undefined) {
      params.push(isPopular);
      updates.push(`is_popular = $${params.length}`);
    }
    if (isVegetarian !== undefined) {
      params.push(isVegetarian);
      updates.push(`is_vegetarian = $${params.length}`);
    }
    if (isVegan !== undefined) {
      params.push(isVegan);
      updates.push(`is_vegan = $${params.length}`);
    }
    if (isGlutenFree !== undefined) {
      params.push(isGlutenFree);
      updates.push(`is_gluten_free = $${params.length}`);
    }
    if (imageUrl !== undefined) {
      params.push(imageUrl);
      updates.push(`image_url = $${params.length}`);
    }
    if (preparationTimeMins !== undefined) {
      params.push(preparationTimeMins);
      updates.push(`preparation_time_mins = $${params.length}`);
    }

    const query = `
      UPDATE menu_items
      SET ${updates.join(', ')}
      WHERE id = $1
      RETURNING *;
    `;

    const result = await sql.query(query, params);
    if (result.length === 0) {
      return Response.json({ error: 'Menu item not found' }, { status: 404 });
    }

    return Response.json({ data: result[0] }, { status: 200 });
  } catch (error: any) {
    console.error('[API /menu PATCH] Error:', error);
    return Response.json({ error: error.message || error }, { status: 500 });
  }
}

export async function DELETE(request: Request) {
  try {
    const sql = neon(process.env.DATABASE_URL!);
    const { searchParams } = new URL(request.url);
    const itemId = searchParams.get('id') || searchParams.get('itemId');

    if (!itemId) {
      return Response.json({ error: 'Missing menu item id' }, { status: 400 });
    }

    const result = await sql.query(
      'DELETE FROM menu_items WHERE id = $1 RETURNING *;',
      [itemId]
    );

    if (result.length === 0) {
      return Response.json({ error: 'Menu item not found or already deleted' }, { status: 404 });
    }

    return Response.json(
      { message: 'Menu item deleted successfully', data: result[0] },
      { status: 200 }
    );
  } catch (error: any) {
    console.error('[API /menu DELETE] Error:', error);
    return Response.json({ error: error.message || error }, { status: 500 });
  }
}
