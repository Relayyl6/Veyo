import { neon } from '@neondatabase/serverless';

let sqlClient: ReturnType<typeof neon> | null = null;

export function getDb() {
  if (!sqlClient) {
    const dbUrl = process.env.DATABASE_URL;
    if (!dbUrl) {
      throw new Error('DATABASE_URL environment variable is missing.');
    }
    sqlClient = neon(dbUrl);
  }
  return sqlClient;
}

/**
 * Multi-tier Partition Helpers
 * Directly interfaces with PostgreSQL partitioned views:
 * - vw_customer_tier
 * - vw_driver_tier
 * - vw_merchant_tier
 * - vw_customer_rides
 * - vw_merchant_orders
 */
export const dbTiers = {
  // Customer Tier Partition Queries
  customer: {
    async getProfile(userId: string) {
      const sql = getDb();
      const res = (await sql.query('SELECT * FROM vw_customer_tier WHERE user_id = $1 LIMIT 1', [userId])) as Record<string, any>[];
      return res[0] || null;
    },
    async getRides(userId: string) {
      const sql = getDb();
      return (await sql.query('SELECT * FROM vw_customer_rides WHERE customer_id = $1 ORDER BY requested_at DESC', [userId])) as Record<string, any>[];
    },
    async getTransactions(userId: string) {
      const sql = getDb();
      return (await sql.query('SELECT * FROM wallet_transactions WHERE user_id = $1 ORDER BY created_at DESC', [userId])) as Record<string, any>[];
    },
  },

  // Driver Tier Partition Queries
  driver: {
    async getProfile(driverId: string) {
      const sql = getDb();
      const res = (await sql.query('SELECT * FROM vw_driver_tier WHERE driver_id = $1 LIMIT 1', [driverId])) as Record<string, any>[];
      return res[0] || null;
    },
    async getEarnings(driverId: string) {
      const sql = getDb();
      return (await sql.query('SELECT * FROM driver_earnings WHERE driver_id = $1 ORDER BY created_at DESC', [driverId])) as Record<string, any>[];
    },
    async getRides(driverId: string) {
      const sql = getDb();
      return (await sql.query('SELECT * FROM vw_customer_rides WHERE driver_id = $1 ORDER BY requested_at DESC', [driverId])) as Record<string, any>[];
    },
  },

  // Merchant Tier Partition Queries
  merchant: {
    async getProfile(vendorId: string) {
      const sql = getDb();
      const res = (await sql.query('SELECT * FROM vw_merchant_tier WHERE vendor_id = $1 LIMIT 1', [vendorId])) as Record<string, any>[];
      return res[0] || null;
    },
    async getOrders(vendorId: string) {
      const sql = getDb();
      return (await sql.query('SELECT * FROM vw_merchant_orders WHERE vendor_id = $1 ORDER BY created_at DESC', [vendorId])) as Record<string, any>[];
    },
    async getMenuItems(vendorId: string) {
      const sql = getDb();
      return (await sql.query('SELECT * FROM menu_items WHERE vendor_id = $1 ORDER BY display_order ASC, name ASC', [vendorId])) as Record<string, any>[];
    },
  },
};
