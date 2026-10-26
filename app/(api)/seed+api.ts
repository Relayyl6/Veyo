import { neon } from '@neondatabase/serverless';
import {
  users as mockUsers,
  driver_profiles as mockDrivers,
  vendors as mockVendors,
  menu_items as mockMenuItems,
  rides as mockRides,
  orders as mockOrders,
  order_items as mockOrderItems,
} from '@/constants/data';

export async function POST(request: Request) {
  try {
    const sql = neon(process.env.DATABASE_URL!);

    // 1. Seed Users
    let usersInserted = 0;
    for (const u of mockUsers.users) {
      await sql.query(
        `INSERT INTO users (
          id, clerk_id, email, first_name, last_name, phone_number, role,
          avatar_url, wallet_balance, home_address, home_latitude, home_longitude,
          is_active, is_deleted, created_at, updated_at
        ) VALUES (
          $1, $2, $3, $4, $5, $6, $7,
          $8, $9, $10, $11, $12,
          $13, $14, $15, $16
        )
        ON CONFLICT (id) DO NOTHING;`,
        [
          u.id, u.clerk_id, u.email, u.first_name, u.last_name, u.phone_number, u.role,
          u.avatar_url, u.wallet_balance, u.home_address, u.home_latitude, u.home_longitude,
          u.is_active, u.is_deleted, u.created_at, u.updated_at
        ]
      );
      usersInserted++;
    }

    // 2. Seed Drivers
    let driversInserted = 0;
    for (const d of mockDrivers.driver_profiles) {
      await sql.query(
        `INSERT INTO driver_profiles (
          id, user_id, license_number, license_expiry, vehicle_type, vehicle_make, vehicle_model,
          vehicle_year, vehicle_color, license_plate, is_verified, verified_at,
          current_latitude, current_longitude, last_location_update,
          is_online, is_available, rating, total_rides, total_orders,
          acceptance_rate, cancellation_rate, bank_account_name, bank_account_number, bank_name,
          is_deleted, created_at, updated_at
        ) VALUES (
          $1, $2, $3, $4, $5, $6, $7,
          $8, $9, $10, $11, $12,
          $13, $14, $15,
          $16, $17, $18, $19, $20,
          $21, $22, $23, $24, $25,
          $26, $27, $28
        )
        ON CONFLICT (id) DO NOTHING;`,
        [
          d.id, d.user_id, d.license_number, d.license_expiry, d.vehicle_type, d.vehicle_make, d.vehicle_model,
          d.vehicle_year, d.vehicle_color, d.license_plate, d.is_verified, d.verified_at,
          d.current_latitude, d.current_longitude, d.last_location_update,
          d.is_online, d.is_available, d.rating, d.total_rides, d.total_orders,
          d.acceptance_rate, d.cancellation_rate, d.bank_account_name, d.bank_account_number, d.bank_name,
          d.is_deleted, d.created_at, d.updated_at
        ]
      );
      driversInserted++;
    }

    // 3. Seed Vendors
    let vendorsInserted = 0;
    for (const v of mockVendors.vendors) {
      await sql.query(
        `INSERT INTO vendors (
          id, owner_id, business_name, business_category, description, address,
          latitude, longitude, phone, email, logo_url, cover_image_url,
          is_open, preparation_time_mins, delivery_fee, minimum_order,
          rating, total_orders, opening_time, closing_time, days_open,
          is_deleted, created_at, updated_at
        ) VALUES (
          $1, $2, $3, $4, $5, $6,
          $7, $8, $9, $10, $11, $12,
          $13, $14, $15, $16,
          $17, $18, $19, $20, $21,
          $22, $23, $24
        )
        ON CONFLICT (id) DO NOTHING;`,
        [
          v.id, v.owner_id, v.business_name, v.business_category, v.description, v.address,
          v.latitude, v.longitude, v.phone, v.email, v.logo_url, v.cover_image_url,
          v.is_open, v.preparation_time_mins, v.delivery_fee, v.minimum_order,
          v.rating, v.total_orders, v.opening_time, v.closing_time, v.days_open,
          v.is_deleted, v.created_at, v.updated_at
        ]
      );
      vendorsInserted++;
    }

    // 4. Seed Menu Items
    let menuItemsInserted = 0;
    for (const m of mockMenuItems.menu_items) {
      await sql.query(
        `INSERT INTO menu_items (
          id, vendor_id, name, description, category, price, discounted_price,
          is_available, is_popular, is_vegetarian, is_vegan, is_gluten_free,
          image_url, preparation_time_mins, created_at, updated_at
        ) VALUES (
          $1, $2, $3, $4, $5, $6, $7,
          $8, $9, $10, $11, $12,
          $13, $14, $15, $16
        )
        ON CONFLICT (id) DO NOTHING;`,
        [
          m.id, m.vendor_id, m.name, m.description, m.category, m.price, m.discounted_price,
          m.is_available, m.is_popular, m.is_vegetarian, m.is_vegan, m.is_gluten_free,
          m.image_url, m.preparation_time_mins, m.created_at, m.updated_at
        ]
      );
      menuItemsInserted++;
    }

    // 5. Seed Rides
    let ridesInserted = 0;
    for (const r of mockRides.rides) {
      await sql.query(
        `INSERT INTO rides (
          id, ride_number, user_id, driver_id, origin_address, destination_address,
          origin_latitude, origin_longitude, destination_latitude, destination_longitude,
          ride_status, distance_km, ride_time_mins,
          base_fare, distance_fare, time_fare, surge_multiplier, service_fee, tip_amount, total_fare,
          payment_status, payment_method, payment_intent_id,
          requested_at, accepted_at, arrived_at, started_at, completed_at,
          driver_rating, driver_review, customer_rating, customer_review,
          created_at, updated_at
        ) VALUES (
          $1, $2, $3, $4, $5, $6,
          $7, $8, $9, $10,
          $11, $12, $13,
          $14, $15, $16, $17, $18, $19, $20,
          $21, $22, $23,
          $24, $25, $26, $27, $28,
          $29, $30, $31, $32,
          $33, $34
        )
        ON CONFLICT (id) DO NOTHING;`,
        [
          r.id, r.ride_number, r.user_id, r.driver_id, r.origin_address, r.destination_address,
          r.origin_latitude, r.origin_longitude, r.destination_latitude, r.destination_longitude,
          r.ride_status, r.distance_km, r.ride_time_mins,
          r.base_fare, r.distance_fare, r.time_fare, r.surge_multiplier, r.service_fee, r.tip_amount, r.total_fare,
          r.payment_status, r.payment_method, r.payment_intent_id,
          r.requested_at, r.accepted_at, r.arrived_at, r.started_at, r.completed_at,
          r.driver_rating, r.driver_review, r.customer_rating, r.customer_review,
          r.created_at, r.updated_at
        ]
      );
      ridesInserted++;
    }

    // 6. Seed Orders & Order Items
    let ordersInserted = 0;
    for (const o of mockOrders.orders) {
      await sql.query(
        `INSERT INTO orders (
          id, order_number, user_id, vendor_id, driver_id, order_status,
          delivery_address, delivery_latitude, delivery_longitude, delivery_instructions,
          subtotal, tax, delivery_fee, service_fee, tip_amount, discount_amount, total_amount,
          payment_status, payment_method, payment_intent_id, special_requests,
          created_at, confirmed_at, preparing_at, ready_at, picked_up_at, delivered_at,
          vendor_rating, vendor_review, driver_rating, driver_review,
          estimated_delivery_time, actual_delivery_time, updated_at
        ) VALUES (
          $1, $2, $3, $4, $5, $6,
          $7, $8, $9, $10,
          $11, $12, $13, $14, $15, $16, $17,
          $18, $19, $20, $21,
          $22, $23, $24, $25, $26, $27,
          $28, $29, $30, $31,
          $32, $33, $34
        )
        ON CONFLICT (id) DO NOTHING;`,
        [
          o.id, o.order_number, o.user_id, o.vendor_id, o.driver_id, o.order_status,
          o.delivery_address, o.delivery_latitude, o.delivery_longitude, o.delivery_instructions,
          o.subtotal, o.tax, o.delivery_fee, o.service_fee, o.tip_amount, o.discount_amount, o.total_amount,
          o.payment_status, o.payment_method, o.payment_intent_id, o.special_requests,
          o.created_at, o.confirmed_at, o.preparing_at, o.ready_at, o.picked_up_at, o.delivered_at,
          o.vendor_rating, o.vendor_review, o.driver_rating, o.driver_review,
          o.estimated_delivery_time, o.actual_delivery_time, o.updated_at
        ]
      );
      ordersInserted++;
    }

    for (const oi of mockOrderItems.order_items) {
      await sql.query(
        `INSERT INTO order_items (
          id, order_id, menu_item_id, item_name, quantity, unit_price, total_price, special_instructions, created_at
        ) VALUES (
          $1, $2, $3, $4, $5, $6, $7, $8, $9
        )
        ON CONFLICT (id) DO NOTHING;`,
        [
          oi.id, oi.order_id, oi.menu_item_id, oi.item_name, oi.quantity, oi.unit_price, oi.total_price,
          oi.special_instructions, oi.created_at
        ]
      );
    }

    return Response.json({
      message: 'Database seeded successfully',
      seeded: {
        users: usersInserted,
        drivers: driversInserted,
        vendors: vendorsInserted,
        menuItems: menuItemsInserted,
        rides: ridesInserted,
        orders: ordersInserted,
      },
    }, { status: 200 });
  } catch (error: any) {
    console.error('[API /seed POST] Error:', error);
    return Response.json({ error: error.message || error }, { status: 500 });
  }
}
