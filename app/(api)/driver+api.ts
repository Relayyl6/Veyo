import { neon } from '@neondatabase/serverless';

export async function POST(request: Request) {
  try {
    const sql = neon(process.env.DATABASE_URL!);
    const body = await request.json();
    const {
      userId,
      clerkId,
      licenseNumber,
      licenseExpiry = '2028-12-31',
      vehicleType = 'standard',
      vehicleMake,
      vehicleModel,
      vehicleYear = new Date().getFullYear(),
      vehicleColor = 'Silver',
      licensePlate,
      bankAccountName,
      bankAccountNumber,
      bankName,
    } = body;

    let targetUserId = userId;

    if (!targetUserId && clerkId) {
      const uRes = await sql.query('SELECT id FROM users WHERE clerk_id = $1 LIMIT 1', [clerkId]);
      if (uRes.length > 0) {
        targetUserId = uRes[0].id;
      }
    }

    if (!targetUserId || !licenseNumber || !licensePlate || !vehicleMake || !vehicleModel) {
      return Response.json(
        { error: 'Missing Required Driver Fields (targetUserId, licenseNumber, licensePlate, vehicleMake, vehicleModel)' },
        { status: 400 }
      );
    }

    // Ensure user role is updated to driver
    await sql.query("UPDATE users SET role = 'driver', updated_at = NOW() WHERE id = $1", [targetUserId]);

    const query = `
      INSERT INTO driver_profiles (
        user_id, license_number, license_expiry, vehicle_type, vehicle_make, vehicle_model,
        vehicle_year, vehicle_color, license_plate, is_verified, verified_at,
        current_latitude, current_longitude, last_location_update,
        is_online, is_available, rating, total_rides, total_orders,
        acceptance_rate, cancellation_rate, bank_account_name, bank_account_number, bank_name,
        is_deleted, created_at, updated_at
      ) VALUES (
        $1, $2, $3, $4, $5, $6,
        $7, $8, $9, true, NOW(),
        6.5244, 3.3792, NOW(),
        true, true, 5.00, 0, 0,
        100.00, 0.00, $10, $11, $12,
        false, NOW(), NOW()
      )
      ON CONFLICT (user_id)
      DO UPDATE SET
        license_number = EXCLUDED.license_number,
        license_expiry = EXCLUDED.license_expiry,
        vehicle_type = EXCLUDED.vehicle_type,
        vehicle_make = EXCLUDED.vehicle_make,
        vehicle_model = EXCLUDED.vehicle_model,
        vehicle_year = EXCLUDED.vehicle_year,
        vehicle_color = EXCLUDED.vehicle_color,
        license_plate = EXCLUDED.license_plate,
        updated_at = NOW()
      RETURNING *;
    `;

    const result = await sql.query(query, [
      targetUserId,
      licenseNumber,
      licenseExpiry,
      vehicleType,
      vehicleMake,
      vehicleModel,
      vehicleYear,
      vehicleColor,
      licensePlate,
      bankAccountName || null,
      bankAccountNumber || null,
      bankName || null,
    ]);

    return Response.json({ data: result[0] }, { status: 201 });
  } catch (error: any) {
    console.error('[API /driver POST] Error:', error);
    return Response.json({ error: error.message || error }, { status: 500 });
  }
}

export async function GET(request: Request) {
  try {
    const sql = neon(process.env.DATABASE_URL!);
    const { searchParams } = new URL(request.url);
    const userId = searchParams.get('userId');
    const driverId = searchParams.get('driverId');
    const onlineOnly = searchParams.get('onlineOnly') === 'true';

    if (driverId) {
      const res = await sql.query(
        `SELECT dp.*, u.first_name, u.last_name, u.phone_number, u.avatar_url, u.email
         FROM driver_profiles dp
         JOIN users u ON dp.user_id = u.id
         WHERE dp.id = $1 LIMIT 1`,
        [driverId]
      );
      return Response.json({ data: res[0] || null }, { status: res.length ? 200 : 404 });
    }

    if (userId) {
      const res = await sql.query(
        `SELECT dp.*, u.first_name, u.last_name, u.phone_number, u.avatar_url, u.email
         FROM driver_profiles dp
         JOIN users u ON dp.user_id = u.id
         WHERE dp.user_id = $1 LIMIT 1`,
        [userId]
      );
      return Response.json({ data: res[0] || null }, { status: res.length ? 200 : 404 });
    }

    // List drivers (for map and radar)
    const query = onlineOnly
      ? `SELECT dp.*, u.first_name, u.last_name, u.phone_number, u.avatar_url
         FROM driver_profiles dp
         JOIN users u ON dp.user_id = u.id
         WHERE dp.is_online = true AND dp.is_deleted = false
         LIMIT 25`
      : `SELECT dp.*, u.first_name, u.last_name, u.phone_number, u.avatar_url
         FROM driver_profiles dp
         JOIN users u ON dp.user_id = u.id
         WHERE dp.is_deleted = false
         LIMIT 25`;

    const drivers = await sql.query(query);
    return Response.json({ data: drivers }, { status: 200 });
  } catch (error: any) {
    console.error('[API /driver GET] Error:', error);
    return Response.json({ error: error.message || error }, { status: 500 });
  }
}

export async function PATCH(request: Request) {
  try {
    const sql = neon(process.env.DATABASE_URL!);
    const body = await request.json();
    const { driverId, userId, latitude, longitude, isOnline, isAvailable } = body;

    const conditionCol = driverId ? 'id' : 'user_id';
    const conditionVal = driverId || userId;

    if (!conditionVal) {
      return Response.json({ error: 'Provide driverId or userId' }, { status: 400 });
    }

    const updates: string[] = ['updated_at = NOW()'];
    const params: any[] = [conditionVal];

    if (typeof latitude === 'number' && typeof longitude === 'number') {
      params.push(latitude, longitude);
      updates.push(`current_latitude = $${params.length - 1}`);
      updates.push(`current_longitude = $${params.length}`);
      updates.push(`last_location_update = NOW()`);
    }

    if (typeof isOnline === 'boolean') {
      params.push(isOnline);
      updates.push(`is_online = $${params.length}`);
    }

    if (typeof isAvailable === 'boolean') {
      params.push(isAvailable);
      updates.push(`is_available = $${params.length}`);
    }

    const query = `
      UPDATE driver_profiles
      SET ${updates.join(', ')}
      WHERE ${conditionCol} = $1
      RETURNING *;
    `;

    const result = await sql.query(query, params);
    return Response.json({ data: result[0] }, { status: 200 });
  } catch (error: any) {
    console.error('[API /driver PATCH] Error:', error);
    return Response.json({ error: error.message || error }, { status: 500 });
  }
}
