import express from "express";
import path from "path";
import { createServer as createViteServer } from "vite";
import { createClient } from "@libsql/client";
import { S3Client, PutObjectCommand } from "@aws-sdk/client-s3";
import { getSignedUrl } from "@aws-sdk/s3-request-presigner";
import dotenv from "dotenv";
import { INITIAL_PROPERTIES } from "./src/data/mockProperties";

dotenv.config();

// Helper to sanitize environment variables that might contain quotes or export prefixes
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

// Default values provided by the user in .env.example
const tursoUrl = cleanEnv(process.env.TURSO_DATABASE_URL, 'TURSO_DATABASE_URL', 'libsql://ezy-homes-vercel-icfg-cnxx2242ugtirkjfrpb3fzwu.aws-ap-south-1.turso.io');
const tursoToken = cleanEnv(process.env.TURSO_AUTH_TOKEN, 'TURSO_AUTH_TOKEN', 'eyJhbGciOiJFZERTQSIsInR5cCI6IkpXVCJ9.eyJhIjoicnciLCJpYXQiOjE3ODU5OTA3OTUsImlkIjoiMDE5ZmQ1NTgtY2UwMS03ZTM1LWJjZmYtYmQwMWNmNmYxYmY5Iiwia2lkIjoiRHFFM252OEVEWXp6Z1hrMXQ5ODBINXR5MmJNUVpOOWcxMFF2RnhLM3BJcyIsInJpZCI6IjBlMzE0YzY3LThkYWItNDM2Ni1iOTBkLWYzYTc3M2I5NzRmNiJ9.qRocAor7xXLZaX_mpwNegNMq-3ukrzFzVl7hqrhPhQx10xchY2nZ3AJzYEawh5H9fQi-p4CJrTKEtfTe5ovxAg');

const db = createClient({
  url: tursoUrl,
  authToken: tursoToken,
});

// Setup R2 Client (AWS SDK V3)
const r2AccountId = cleanEnv(process.env.CLOUDFLARE_R2_ACCOUNT_ID, 'CLOUDFLARE_R2_ACCOUNT_ID', '3b25d6fc00d328f896be8a3382324774');
const r2AccessKeyId = cleanEnv(process.env.R2_ACCESS_KEY_ID, 'R2_ACCESS_KEY_ID', 'f14bb739067b7a74aaaff946cfe96681');
const r2SecretAccessKey = cleanEnv(process.env.R2_SECRET_ACCESS_KEY, 'R2_SECRET_ACCESS_KEY', 'f8f5fc924f6866009916004f63ed4c824367f866f64f16eb4f6590d67353bfaa');
const r2BucketName = cleanEnv(process.env.R2_BUCKET_NAME, 'R2_BUCKET_NAME', 'ezyhomes-images');
const r2PublicDomain = cleanEnv(process.env.R2_PUBLIC_DOMAIN, 'R2_PUBLIC_DOMAIN', 'https://pub-d98afd66f3284a9c98a71404da771d04.r2.dev');

let s3: S3Client | null = null;
if (r2AccessKeyId && r2SecretAccessKey && r2AccountId) {
  s3 = new S3Client({
    region: "auto",
    endpoint: `https://${r2AccountId}.r2.cloudflarestorage.com`,
    credentials: {
      accessKeyId: r2AccessKeyId,
      secretAccessKey: r2SecretAccessKey,
    }
  });
}

async function initDb() {
  await db.execute(`
    CREATE TABLE IF NOT EXISTS properties (
      id TEXT PRIMARY KEY,
      title TEXT NOT NULL,
      slug TEXT UNIQUE NOT NULL,
      description TEXT,
      category TEXT NOT NULL,
      city TEXT NOT NULL,
      country TEXT NOT NULL,
      address TEXT,
      latitude REAL,
      longitude REAL,
      price_per_night_usd REAL NOT NULL,
      cleaning_fee_usd REAL DEFAULT 0,
      max_guests INTEGER DEFAULT 2,
      bedrooms INTEGER DEFAULT 1,
      bathrooms INTEGER DEFAULT 1,
      owner_whatsapp TEXT NOT NULL,
      owner_phone TEXT,
      images_json TEXT,
      amenities_json TEXT,
      data_json TEXT
    )
  `);

  try {
    const countRes = await db.execute("SELECT COUNT(*) as count FROM properties");
    const count = Number(countRes.rows[0]?.count || 0);
    if (count === 0) {
      console.log("Seeding Turso database with initial properties...");
      for (const property of INITIAL_PROPERTIES) {
        await db.execute({
          sql: `INSERT INTO properties (
            id, title, slug, description, category, city, country, address,
            latitude, longitude, price_per_night_usd, cleaning_fee_usd, max_guests,
            bedrooms, bathrooms, owner_whatsapp, owner_phone, images_json, amenities_json, data_json
          ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
          ON CONFLICT(id) DO NOTHING`,
          args: [
            property.id,
            property.title,
            property.slug,
            property.description,
            property.category,
            property.location.city,
            property.location.country,
            property.location.address,
            property.location.lat,
            property.location.lng,
            property.pricePerNightUSD,
            property.cleaningFeeUSD,
            property.maxGuests,
            property.bedrooms,
            property.bathrooms,
            property.owner.whatsapp,
            property.owner.phone,
            JSON.stringify(property.images || []),
            JSON.stringify(property.amenities || []),
            JSON.stringify(property)
          ]
        });
      }
      console.log(`Successfully seeded ${INITIAL_PROPERTIES.length} properties into Turso database.`);
    }
  } catch (e) {
    console.error("Failed to seed initial properties into Turso:", e);
  }
}

async function startServer() {
  await initDb();
  const app = express();
  const PORT = 3000;

  // CORS Middleware for browser cross-origin requests
  app.use((req, res, next) => {
    res.header("Access-Control-Allow-Origin", "*");
    res.header("Access-Control-Allow-Methods", "GET, POST, PUT, DELETE, OPTIONS");
    res.header("Access-Control-Allow-Headers", "Content-Type, Authorization");
    if (req.method === "OPTIONS") {
      return res.sendStatus(200);
    }
    next();
  });

  app.use(express.json({ limit: "50mb" }));

  // API Health Check & R2 Diagnostic Route
  app.get("/api/r2-status", async (req, res) => {
    try {
      if (!s3) {
        return res.status(503).json({
          connected: false,
          error: "S3 Client not initialized. Check R2_ACCESS_KEY_ID and R2_SECRET_ACCESS_KEY."
        });
      }

      // Test PutObject with a tiny healthcheck file
      const testKey = `healthcheck_${Date.now()}.txt`;
      const testCmd = new PutObjectCommand({
        Bucket: r2BucketName,
        Key: testKey,
        Body: "Cloudflare R2 Healthcheck Connection OK",
        ContentType: "text/plain",
      });

      await s3.send(testCmd);

      return res.json({
        connected: true,
        bucket: r2BucketName,
        publicDomain: r2PublicDomain,
        accountId: r2AccountId,
        message: "Cloudflare R2 storage bucket connected and read/write verified!"
      });
    } catch (err: any) {
      console.error("R2 Healthcheck failed:", err);
      return res.status(500).json({
        connected: false,
        bucket: r2BucketName,
        error: err.message || String(err)
      });
    }
  });

  // API Routes
  app.get("/api/properties", async (req, res) => {
    res.setHeader("Cache-Control", "no-cache, no-store, must-revalidate");
    res.setHeader("Pragma", "no-cache");
    res.setHeader("Expires", "0");
    try {
      const result = await db.execute("SELECT data_json FROM properties");
      const properties = result.rows.map(r => JSON.parse(r.data_json as string));

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

      res.json(properties);
    } catch (e) {
      console.error("Failed to fetch properties from Turso:", e);
      res.status(500).json({ error: "Failed to fetch properties" });
    }
  });

  app.post("/api/properties", async (req, res) => {
    try {
      const property = req.body;
      if (!property || !property.id || !property.title) {
        return res.status(400).json({ error: "Invalid property object: id and title are required" });
      }

      // Generate collision-proof unique slug
      const propId = String(property.id);
      const rawTitle = String(property.title || 'property');
      const baseSlug = (property.slug || rawTitle).toLowerCase().trim().replace(/[^a-z0-9]+/g, '-').replace(/^-+|-+$/g, '') || 'property';
      
      let uniqueSlug = baseSlug;
      try {
        const selfRow = await db.execute({ sql: "SELECT slug FROM properties WHERE id = ?", args: [propId] });
        if (selfRow.rows && selfRow.rows.length > 0 && selfRow.rows[0].slug) {
          const existingSlug = String(selfRow.rows[0].slug);
          if (existingSlug === baseSlug || existingSlug.startsWith(baseSlug)) {
            uniqueSlug = existingSlug;
          }
        } else {
          const conflict = await db.execute({ sql: "SELECT id FROM properties WHERE slug = ? AND id != ?", args: [baseSlug, propId] });
          if (conflict.rows && conflict.rows.length > 0) {
            const suffix = propId.replace(/[^a-z0-9]/gi, '').slice(-6) || Math.random().toString(36).substring(2, 7);
            uniqueSlug = `${baseSlug}-${suffix}`;
          }
        }
      } catch (err) {
        uniqueSlug = `${baseSlug}-${Date.now().toString(36)}`;
      }
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
      
      console.log(`[Turso DB] Property "${property.title}" (${property.id}) successfully saved!`);
      res.json({ success: true, property });
    } catch (e) {
      console.error("Failed to save property to Turso:", e);
      res.status(500).json({ error: "Failed to save property to database", details: String(e) });
    }
  });

  app.delete("/api/properties/:id", async (req, res) => {
    try {
      const { id } = req.params;
      await db.execute({
        sql: "DELETE FROM properties WHERE id = ?",
        args: [id]
      });
      res.json({ success: true });
    } catch (e) {
      console.error("Failed to delete property from Turso:", e);
      res.status(500).json({ error: "Failed to delete property" });
    }
  });

  app.post("/api/upload-direct", express.raw({ type: "*/*", limit: "25mb" }), async (req, res) => {
    try {
      const fileName = req.query.fileName as string;
      const contentType = (req.headers['content-type'] as string) || 'image/webp';

      if (!fileName) {
        return res.status(400).json({ error: "fileName is required" });
      }

      if (!s3) {
        return res.status(503).json({ error: "Cloudflare R2 credentials not configured on server" });
      }

      const command = new PutObjectCommand({
        Bucket: r2BucketName,
        Key: fileName,
        Body: req.body,
        ContentType: contentType,
      });

      await s3.send(command);

      const publicUrl = `${r2PublicDomain}/${fileName}`;
      console.log(`[R2 Upload] Image successfully uploaded to R2: ${publicUrl}`);

      res.json({ success: true, url: publicUrl });
    } catch (e: any) {
      console.error("Failed to upload image directly to R2 via server proxy:", e);
      res.status(500).json({ error: "Server R2 upload failed", details: e?.message || String(e) });
    }
  });

  app.get("/api/upload-url", async (req, res) => {
    try {
      const fileName = req.query.fileName as string;
      const contentType = req.query.contentType as string || 'image/webp';
      
      if (!fileName) {
        return res.status(400).json({ error: "fileName is required" });
      }

      if (!s3) {
        return res.status(503).json({ error: "R2 credentials not configured on server" });
      }

      const command = new PutObjectCommand({
        Bucket: r2BucketName,
        Key: fileName,
        ContentType: contentType,
      });

      const uploadUrl = await getSignedUrl(s3, command, { expiresIn: 3600 });
      res.json({ uploadUrl });
    } catch (e) {
      console.error("Failed to generate presigned URL:", e);
      res.status(500).json({ error: "Failed to generate presigned URL" });
    }
  });

  // Dynamic Sitemap XML Endpoint for Google Search Engine Indexing
  app.get("/sitemap.xml", async (req, res) => {
    try {
      const result = await db.execute("SELECT id, slug, data_json FROM properties");
      const today = new Date().toISOString().split('T')[0];

      let xml = `<?xml version="1.0" encoding="UTF-8"?>\n`;
      xml += `<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n`;
      
      // Main Landing Pages
      xml += `  <url><loc>https://www.ezy.homes/</loc><lastmod>${today}</lastmod><changefreq>daily</changefreq><priority>1.0</priority></url>\n`;
      
      // Cities
      const cities = ['bengaluru', 'mumbai', 'hyderabad', 'delhi-ncr', 'pune', 'goa', 'chennai', 'kolkata'];
      for (const city of cities) {
        xml += `  <url><loc>https://www.ezy.homes/${city}</loc><lastmod>${today}</lastmod><changefreq>daily</changefreq><priority>0.9</priority></url>\n`;
      }

      // High-Value Keyword Categories
      const categories = ['rental-houses', 'free-rental-listing', 'property-listing', 'independent-room-stays', 'oyo-rooms', 'pg-hostel', 'mens-pg', 'womens-pg', 'monthly-rooms', 'daily-homestays'];
      for (const cat of categories) {
        xml += `  <url><loc>https://www.ezy.homes/${cat}</loc><lastmod>${today}</lastmod><changefreq>daily</changefreq><priority>0.85</priority></url>\n`;
      }

      // Dynamic Property Listings from Database
      result.rows.forEach(r => {
        const id = r.id as string;
        xml += `  <url><loc>https://www.ezy.homes/?property=${id}</loc><lastmod>${today}</lastmod><changefreq>weekly</changefreq><priority>0.8</priority></url>\n`;
      });

      xml += `</urlset>`;

      res.header('Content-Type', 'application/xml');
      res.send(xml);
    } catch (e) {
      console.error("Failed to generate dynamic sitemap.xml:", e);
      res.status(500).send("Error generating sitemap");
    }
  });

  // Vite middleware for development
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), 'dist');
    app.use(express.static(distPath));
    app.get('*', (req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`Server running on http://localhost:${PORT}`);
  });
}

startServer();
