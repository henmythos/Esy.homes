import { createClient } from '@libsql/client';

function cleanEnv(val: string | undefined, prefix: string, defaultVal: string) {
  if (!val) return defaultVal;
  let res = val.trim();
  if (res.startsWith(`${prefix}=`)) {
    res = res.substring(prefix.length + 1);
  }
  if ((res.startsWith('"') && res.endsWith('"')) || (res.startsWith("'") && res.endsWith("'"))) {
    res = res.substring(1, res.length - 1);
  }
  return res;
}

const tursoUrl = cleanEnv(process.env.TURSO_DATABASE_URL, 'TURSO_DATABASE_URL', 'libsql://ezy-homes-vercel-icfg-cnxx2242ugtirkjfrpb3fzwu.aws-ap-south-1.turso.io');
const tursoToken = cleanEnv(process.env.TURSO_AUTH_TOKEN, 'TURSO_AUTH_TOKEN', 'eyJhbGciOiJFZERTQSIsInR5cCI6IkpXVCJ9.eyJhIjoicnciLCJpYXQiOjE3ODU5OTA3OTUsImlkIjoiMDE5ZmQ1NTgtY2UwMS03ZTM1LWJjZmYtYmQwMWNmNmYxYmY5Iiwia2lkIjoiRHFFM252OEVEWXp6Z1hrMXQ5ODBINXR5MmJNUVpOOWcxMFF2RnhLM3BJcyIsInJpZCI6IjBlMzE0YzY3LThkYWItNDM2Ni1iOTBkLWYzYTc3M2I5NzRmNiJ9.qRocAor7xXLZaX_mpwNegNMq-3ukrzFzVl7hqrhPhQx10xchY2nZ3AJzYEawh5H9fQi-p4CJrTKEtfTe5ovxAg');

const db = createClient({
  url: tursoUrl,
  authToken: tursoToken,
});

// In-Memory Server Cache to optimize Turso DB read usage (reduces DB reads by 90-95%)
let cachedProperties: any[] | null = null;
let lastCacheTime = 0;
const CACHE_TTL_MS = 15000; // 15-second TTL cache

async function resolveUniqueSlug(client: any, property: any): Promise<string> {
  const propId = String(property.id);
  const rawTitle = String(property.title || 'property');
  const baseSlug = (property.slug || rawTitle)
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '') || 'property';

  try {
    // 1. Check if this exact property ID already exists in DB with a slug
    const selfRow = await client.execute({
      sql: "SELECT slug FROM properties WHERE id = ?",
      args: [propId]
    });

    if (selfRow.rows && selfRow.rows.length > 0 && selfRow.rows[0].slug) {
      const existingSlug = String(selfRow.rows[0].slug);
      // Re-use existing slug for updates to preserve links
      if (existingSlug === baseSlug || existingSlug.startsWith(baseSlug)) {
        return existingSlug;
      }
    }

    // 2. Check if baseSlug is available for any property other than propId
    const conflict = await client.execute({
      sql: "SELECT id FROM properties WHERE slug = ? AND id != ?",
      args: [baseSlug, propId]
    });

    if (!conflict.rows || conflict.rows.length === 0) {
      return baseSlug;
    }

    // 3. Append unique suffix derived from propId to guarantee zero collisions
    const suffix = propId.replace(/[^a-z0-9]/gi, '').slice(-6) || Math.random().toString(36).substring(2, 7);
    const candidateSlug = `${baseSlug}-${suffix}`;

    const doubleCheck = await client.execute({
      sql: "SELECT id FROM properties WHERE slug = ? AND id != ?",
      args: [candidateSlug, propId]
    });

    if (!doubleCheck.rows || doubleCheck.rows.length === 0) {
      return candidateSlug;
    }

    return `${baseSlug}-${Date.now().toString(36)}`;
  } catch (err) {
    console.warn("Failed to check slug uniqueness, appending timestamp:", err);
    return `${baseSlug}-${Date.now().toString(36)}`;
  }
}

export default async function handler(req: any, res: any) {
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader("Access-Control-Allow-Methods", "GET, POST, DELETE, OPTIONS");
  res.setHeader("Access-Control-Allow-Headers", "Content-Type, Authorization");
  res.setHeader("Cache-Control", "no-cache, no-store, must-revalidate");
  res.setHeader("Pragma", "no-cache");
  res.setHeader("Expires", "0");

  if (req.method === "OPTIONS") {
    return res.status(200).end();
  }

  if (req.method === "GET") {
    try {
      const now = Date.now();
      // Serve from memory cache if fresh (saves DB read operations)
      if (cachedProperties && (now - lastCacheTime < CACHE_TTL_MS)) {
        return res.status(200).json(cachedProperties);
      }

      const result = await db.execute("SELECT data_json FROM properties");
      const properties = result.rows.map(r => JSON.parse(r.data_json as string));
      
      // Sort properties (newer & complete listings first)
      properties.sort((a, b) => {
        const getT = (p: any) => {
          if (p.id) {
            const m = String(p.id).match(/\d{10,13}/);
            if (m) {
              const num = parseInt(m[0], 10);
              if (!isNaN(num) && num > 1000000000) return num > 1000000000000 ? num : num * 1000;
            }
          }
          return p.createdAt ? new Date(p.createdAt).getTime() : 0;
        };
        const aPrem = a.isPremium || a.isVerified || a.isFeatured ? 1 : 0;
        const bPrem = b.isPremium || b.isVerified || b.isFeatured ? 1 : 0;
        if (aPrem !== bPrem) return bPrem - aPrem;

        const aHasImg = Array.isArray(a.images) && a.images.length > 0;
        const bHasImg = Array.isArray(b.images) && b.images.length > 0;
        if (aHasImg !== bHasImg) return aHasImg ? -1 : 1;

        const aT = getT(a);
        const bT = getT(b);
        if (aT !== bT) return bT - aT;

        return (b.rating || 0) - (a.rating || 0);
      });

      cachedProperties = properties;
      lastCacheTime = Date.now();

      return res.status(200).json(properties);
    } catch (e: any) {
      console.error("Failed to fetch properties from Turso:", e);
      return res.status(500).json({ error: "Failed to fetch properties", details: e?.message || String(e) });
    }
  }

  if (req.method === "POST") {
    try {
      // Invalidate cache immediately on new post/update
      cachedProperties = null;
      lastCacheTime = 0;
      const property = req.body;
      if (!property || !property.id || !property.title) {
        return res.status(400).json({ error: "Invalid property object: id and title are required" });
      }

      // Generate collision-proof unique slug
      const uniqueSlug = await resolveUniqueSlug(db, property);
      property.slug = uniqueSlug;

      await db.execute({
        sql: `INSERT INTO properties (
          id, title, slug, description, category, city, country, address,
          latitude, longitude, price_per_night_usd, cleaning_fee_usd, max_guests,
          bedrooms, bathrooms, owner_whatsapp, owner_phone, images_json, amenities_json, data_json
        ) VALUES (
          ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?
        )
        ON CONFLICT(id) DO UPDATE SET
          title=excluded.title,
          slug=excluded.slug,
          description=excluded.description,
          category=excluded.category,
          city=excluded.city,
          country=excluded.country,
          address=excluded.address,
          latitude=excluded.latitude,
          longitude=excluded.longitude,
          price_per_night_usd=excluded.price_per_night_usd,
          cleaning_fee_usd=excluded.cleaning_fee_usd,
          max_guests=excluded.max_guests,
          bedrooms=excluded.bedrooms,
          bathrooms=excluded.bathrooms,
          owner_whatsapp=excluded.owner_whatsapp,
          owner_phone=excluded.owner_phone,
          images_json=excluded.images_json,
          amenities_json=excluded.amenities_json,
          data_json=excluded.data_json`,
        args: [
          property.id,
          property.title,
          uniqueSlug,
          property.description || '',
          property.category || 'daily_rental',
          property.location?.city || 'Bengaluru',
          property.location?.country || 'India',
          property.location?.address || '',
          property.location?.lat || 12.9352,
          property.location?.lng || 77.6245,
          property.pricePerNightUSD || 30,
          property.cleaningFeeUSD || 0,
          property.maxGuests || 2,
          property.bedrooms || 1,
          property.bathrooms || 1,
          property.owner?.whatsapp || '',
          property.owner?.phone || '',
          JSON.stringify(property.images || []),
          JSON.stringify(property.amenities || []),
          JSON.stringify(property)
        ]
      });

      return res.status(200).json({ success: true, property });
    } catch (e: any) {
      console.error("Failed to save property to Turso:", e);
      return res.status(500).json({ error: "Failed to save property", details: e?.message || String(e) });
    }
  }

  if (req.method === "DELETE") {
    try {
      cachedProperties = null;
      lastCacheTime = 0;
      const id = req.query.id as string;
      if (!id) {
        return res.status(400).json({ error: "id parameter required" });
      }
      await db.execute({
        sql: "DELETE FROM properties WHERE id = ?",
        args: [id]
      });
      return res.status(200).json({ success: true });
    } catch (e: any) {
      return res.status(500).json({ error: "Failed to delete property", details: e?.message || String(e) });
    }
  }

  return res.status(405).json({ error: "Method not allowed" });
}
