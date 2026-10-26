import { neon } from '@neondatabase/serverless';

export async function POST(request: Request) {
  try {
    const sql = neon(process.env.DATABASE_URL!);
    const body = await request.json();
    const { clerkId, email, firstName, lastName, avatarUrl, role = 'customer', phone } = body;

    if (!email || !clerkId) {
      return Response.json(
        { error: 'Missing Required Fields (clerkId, email)' },
        { status: 400 }
      );
    }

    // Upsert user based on clerk_id or email
    const query = `
      INSERT INTO users (
        email, clerk_id, first_name, last_name, avatar_url, role, phone_number, is_active, is_deleted, created_at, updated_at
      ) VALUES (
        $1, $2, $3, $4, $5, $6, $7, true, false, NOW(), NOW()
      )
      ON CONFLICT (clerk_id) 
      DO UPDATE SET
        email = EXCLUDED.email,
        first_name = COALESCE(EXCLUDED.first_name, users.first_name),
        last_name = COALESCE(EXCLUDED.last_name, users.last_name),
        avatar_url = COALESCE(EXCLUDED.avatar_url, users.avatar_url),
        role = EXCLUDED.role,
        phone_number = COALESCE(EXCLUDED.phone_number, users.phone_number),
        updated_at = NOW()
      RETURNING *;
    `;

    const result = await sql.query(query, [
      email,
      clerkId,
      firstName || null,
      lastName || null,
      avatarUrl || null,
      role,
      phone || null,
    ]);

    const user = result[0];

    // Also fetch associated role profile if exists
    let profile = null;
    if (role === 'driver') {
      const driverRes = await sql.query('SELECT * FROM driver_profiles WHERE user_id = $1 LIMIT 1', [user.id]);
      profile = driverRes[0] || null;
    } else if (role === 'vendor_admin') {
      const vendorRes = await sql.query('SELECT * FROM vendors WHERE owner_id = $1 LIMIT 1', [user.id]);
      profile = vendorRes[0] || null;
    }

    return Response.json({ data: { user, profile } }, { status: 201 });
  } catch (error: any) {
    console.error('[API /user POST] Error:', error);
    return Response.json({ error: error.message || error }, { status: 500 });
  }
}

export async function GET(request: Request) {
  try {
    const sql = neon(process.env.DATABASE_URL!);
    const { searchParams } = new URL(request.url);
    const clerkId = searchParams.get('clerkId');
    const userId = searchParams.get('userId');

    if (!clerkId && !userId) {
      return Response.json({ error: 'Provide clerkId or userId' }, { status: 400 });
    }

    const query = clerkId
      ? 'SELECT * FROM users WHERE clerk_id = $1 LIMIT 1'
      : 'SELECT * FROM users WHERE id = $1 LIMIT 1';

    const result = await sql.query(query, [clerkId || userId]);
    if (result.length === 0) {
      return Response.json({ error: 'User not found' }, { status: 404 });
    }

    const user = result[0];
    let profile = null;

    if (user.role === 'driver') {
      const driverRes = await sql.query('SELECT * FROM driver_profiles WHERE user_id = $1 LIMIT 1', [user.id]);
      profile = driverRes[0] || null;
    } else if (user.role === 'vendor_admin') {
      const vendorRes = await sql.query('SELECT * FROM vendors WHERE owner_id = $1 LIMIT 1', [user.id]);
      profile = vendorRes[0] || null;
    }

    return Response.json({ data: { user, profile } }, { status: 200 });
  } catch (error: any) {
    console.error('[API /user GET] Error:', error);
    return Response.json({ error: error.message || error }, { status: 500 });
  }
}
