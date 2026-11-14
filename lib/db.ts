import { neon } from '@neondatabase/serverless';

let sqlClient: ReturnType<typeof neon> | null = null;

export function getDb() {
  if (!sqlClient) {
    const dbUrl = process.env.EXPO_PUBLIC_DATABASE_URL || process.env.DATABASE_URL;
    if (!dbUrl) {
      throw new Error('DATABASE_URL / EXPO_PUBLIC_DATABASE_URL environment variable is missing.');
    }
    sqlClient = neon(dbUrl);
  }
  return sqlClient;
}

export interface AdvertRecord {
  id: string;
  title: string;
  subtitle: string;
  cta_text: string;
  route: string;
  image_url: string;
  gradient_start: string;
  gradient_end: string;
  cta_bg: string;
  display_order: number;
}

export interface AiPredictionRecord {
  id: string;
  title: string;
  subtitle: string;
  tag: string;
  image_url: string;
  route: string;
  display_order: number;
}

export interface ServiceOptionRecord {
  id: string;
  state_id: string;
  item_type: 'square' | 'rectangle';
  title: string;
  subtitle?: string | null;
  icon_name?: string | null;
  icon_type?: 'ion' | 'fa5' | 'feather' | null;
  icon_color?: string | null;
  icon_bg?: string | null;
  bg_color?: string | null;
  route: string;
  image_order?: 'before' | 'after' | null;
  display_order: number;
}

/**
 * Neon DB Dynamic Content Queries
 * Loads real-time adverts, predictions, services, and live records directly from Neon DB.
 */
export const dbContent = {
  async getAdverts(): Promise<AdvertRecord[]> {
    try {
      const sql = getDb();
      const res = (await sql.query(
        'SELECT * FROM adverts WHERE is_active = true ORDER BY display_order ASC, created_at DESC'
      )) as Record<string, any>[];
      return res as AdvertRecord[];
    } catch (err) {
      console.error('[dbContent.getAdverts] Error:', err);
      return [];
    }
  },

  async getAiPredictions(): Promise<AiPredictionRecord[]> {
    try {
      const sql = getDb();
      const res = (await sql.query(
        'SELECT * FROM ai_predictions WHERE is_active = true ORDER BY display_order ASC, created_at DESC'
      )) as Record<string, any>[];
      return res as AiPredictionRecord[];
    } catch (err) {
      console.error('[dbContent.getAiPredictions] Error:', err);
      return [];
    }
  },

  async getServiceOptions(stateId?: string): Promise<ServiceOptionRecord[]> {
    try {
      const sql = getDb();
      let query = 'SELECT * FROM service_options WHERE is_active = true';
      const params: any[] = [];
      if (stateId) {
        query += ' AND state_id = $1';
        params.push(stateId);
      }
      query += ' ORDER BY display_order ASC';
      const res = (await sql.query(query, params)) as Record<string, any>[];
      return res as ServiceOptionRecord[];
    } catch (err) {
      console.error('[dbContent.getServiceOptions] Error:', err);
      return [];
    }
  },

  async getRides(userId?: string): Promise<any[]> {
    try {
      const sql = getDb();
      if (userId) {
        return (await sql.query(
          'SELECT * FROM vw_customer_rides WHERE customer_id = $1 ORDER BY requested_at DESC',
          [userId]
        )) as Record<string, any>[];
      }
      return (await sql.query(
        'SELECT * FROM vw_customer_rides ORDER BY requested_at DESC LIMIT 10'
      )) as Record<string, any>[];
    } catch (err) {
      console.error('[dbContent.getRides] Error:', err);
      return [];
    }
  },

  async getOnlineDrivers(): Promise<any[]> {
    try {
      const sql = getDb();
      return (await sql.query(
        `SELECT d.*, u.first_name, u.last_name, u.avatar_url, u.phone_number
         FROM driver_profiles d
         JOIN users u ON d.user_id = u.id
         WHERE d.is_online = true AND d.is_available = true`
      )) as Record<string, any>[];
    } catch (err) {
      console.error('[dbContent.getOnlineDrivers] Error:', err);
      return [];
    }
  },

  async getVendors(): Promise<any[]> {
    try {
      const sql = getDb();
      return (await sql.query(
        'SELECT * FROM vendors WHERE is_deleted = false AND is_open = true ORDER BY rating DESC'
      )) as Record<string, any>[];
    } catch (err) {
      console.error('[dbContent.getVendors] Error:', err);
      return [];
    }
  },
};

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
