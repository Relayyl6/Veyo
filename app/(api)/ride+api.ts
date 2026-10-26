import { neon } from '@neondatabase/serverless';

export async function POST(request: Request) {
  try {
    const sql = neon(process.env.DATABASE_URL!);
    const body = await request.json();
    const {
      userId,
      clerkId,
      originAddress,
      destinationAddress,
      originLatitude,
      originLongitude,
      destinationLatitude,
      destinationLongitude,
      distanceKm = 5.0,
      rideTimeMins = 18,
      baseFare = 3.0,
      distanceFare = 7.0,
      timeFare = 2.5,
      surgeMultiplier = 1.0,
      serviceFee = 1.5,
      tipAmount = 0.0,
      paymentMethod = 'wallet',
    } = body;

    let targetUserId = userId;
    if (!targetUserId && clerkId) {
      const uRes = await sql.query('SELECT id FROM users WHERE clerk_id = $1 LIMIT 1', [clerkId]);
      if (uRes.length > 0) targetUserId = uRes[0].id;
    }

    if (!targetUserId || !originAddress || !destinationAddress || originLatitude === undefined || originLongitude === undefined) {
      return Response.json(
        { error: 'Missing Required Ride Fields (targetUserId, originAddress, destinationAddress, coordinates)' },
        { status: 400 }
      );
    }

    const totalFare = Number((baseFare + distanceFare + timeFare) * surgeMultiplier + serviceFee + tipAmount).toFixed(2);
    const dateStr = new Date().toISOString().slice(0, 10).replace(/-/g, '');
    const randNum = Math.floor(100 + Math.random() * 900);
    const rideNumber = `RD-${dateStr}-${randNum}`;

    const query = `
      INSERT INTO rides (
        ride_number, user_id, origin_address, destination_address,
        origin_latitude, origin_longitude, destination_latitude, destination_longitude,
        ride_status, distance_km, ride_time_mins,
        base_fare, distance_fare, time_fare, surge_multiplier, service_fee, tip_amount, total_fare,
        payment_status, payment_method, requested_at, created_at, updated_at
      ) VALUES (
        $1, $2, $3, $4,
        $5, $6, $7, $8,
        'searching', $9, $10,
        $11, $12, $13, $14, $15, $16, $17,
        'pending', $18, NOW(), NOW(), NOW()
      )
      RETURNING *;
    `;

    const result = await sql.query(query, [
      rideNumber,
      targetUserId,
      originAddress,
      destinationAddress,
      originLatitude,
      originLongitude,
      destinationLatitude,
      destinationLongitude,
      distanceKm,
      rideTimeMins,
      baseFare,
      distanceFare,
      timeFare,
      surgeMultiplier,
      serviceFee,
      tipAmount,
      totalFare,
      paymentMethod,
    ]);

    return Response.json({ data: result[0] }, { status: 201 });
  } catch (error: any) {
    console.error('[API /ride POST] Error:', error);
    return Response.json({ error: error.message || error }, { status: 500 });
  }
}

export async function GET(request: Request) {
  try {
    const sql = neon(process.env.DATABASE_URL!);
    const { searchParams } = new URL(request.url);
    const rideId = searchParams.get('rideId');
    const userId = searchParams.get('userId');
    const clerkId = searchParams.get('clerkId');
    const driverId = searchParams.get('driverId');

    let targetUserId = userId;
    if (!targetUserId && clerkId) {
      const uRes = await sql.query('SELECT id FROM users WHERE clerk_id = $1 LIMIT 1', [clerkId]);
      if (uRes.length > 0) targetUserId = uRes[0].id;
    }

    if (rideId) {
      const query = `
        SELECT r.*,
               u.first_name as customer_first_name, u.last_name as customer_last_name, u.avatar_url as customer_avatar,
               dp.vehicle_make, dp.vehicle_model, dp.license_plate, dp.rating as driver_rating_score,
               du.first_name as driver_first_name, du.last_name as driver_last_name, du.phone_number as driver_phone
        FROM rides r
        LEFT JOIN users u ON r.user_id = u.id
        LEFT JOIN driver_profiles dp ON r.driver_id = dp.id
        LEFT JOIN users du ON dp.user_id = du.id
        WHERE r.id = $1 LIMIT 1;
      `;
      const res = await sql.query(query, [rideId]);
      return Response.json({ data: res[0] || null }, { status: res.length ? 200 : 404 });
    }

    let query = `
      SELECT r.*,
             dp.vehicle_make, dp.vehicle_model, dp.license_plate,
             du.first_name as driver_first_name, du.last_name as driver_last_name, du.avatar_url as driver_avatar
      FROM rides r
      LEFT JOIN driver_profiles dp ON r.driver_id = dp.id
      LEFT JOIN users du ON dp.user_id = du.id
      WHERE 1=1
    `;
    const params: any[] = [];

    if (targetUserId) {
      params.push(targetUserId);
      query += ` AND r.user_id = $${params.length}`;
    }

    if (driverId) {
      params.push(driverId);
      query += ` AND r.driver_id = $${params.length}`;
    }

    query += ' ORDER BY r.created_at DESC LIMIT 30';

    const rides = await sql.query(query, params);
    return Response.json({ data: rides }, { status: 200 });
  } catch (error: any) {
    console.error('[API /ride GET] Error:', error);
    return Response.json({ error: error.message || error }, { status: 500 });
  }
}

export async function PATCH(request: Request) {
  try {
    const sql = neon(process.env.DATABASE_URL!);
    const body = await request.json();
    const { rideId, status, driverId, cancelReason, rating, review } = body;

    if (!rideId) {
      return Response.json({ error: 'Missing rideId' }, { status: 400 });
    }

    const updates: string[] = ['updated_at = NOW()'];
    const params: any[] = [rideId];

    if (status) {
      params.push(status);
      updates.push(`ride_status = $${params.length}`);

      if (status === 'accepted') updates.push('accepted_at = NOW()');
      if (status === 'arrived') updates.push('arrived_at = NOW()');
      if (status === 'in_transit') updates.push('started_at = NOW()');
      if (status === 'completed') {
        updates.push('completed_at = NOW()');
        updates.push("payment_status = 'paid'");
      }
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

    if (rating) {
      params.push(rating);
      updates.push(`customer_rating = $${params.length}`);
    }

    if (review) {
      params.push(review);
      updates.push(`customer_review = $${params.length}`);
    }

    const query = `
      UPDATE rides
      SET ${updates.join(', ')}
      WHERE id = $1
      RETURNING *;
    `;

    const result = await sql.query(query, params);
    return Response.json({ data: result[0] }, { status: 200 });
  } catch (error: any) {
    console.error('[API /ride PATCH] Error:', error);
    return Response.json({ error: error.message || error }, { status: 500 });
  }
}
