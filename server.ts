import express from "express";
import path from "path";
import { createServer as createViteServer } from "vite";
import { createClient } from "@libsql/client";
import { S3Client, PutObjectCommand } from "@aws-sdk/client-s3";
import { getSignedUrl } from "@aws-sdk/s3-request-presigner";
import dotenv from "dotenv";

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
let s3: S3Client | null = null;
if (process.env.R2_ACCESS_KEY_ID && process.env.R2_SECRET_ACCESS_KEY) {
  s3 = new S3Client({
    region: "auto",
    endpoint: `https://${process.env.CLOUDFLARE_R2_ACCOUNT_ID}.r2.cloudflarestorage.com`,
    credentials: {
      accessKeyId: process.env.R2_ACCESS_KEY_ID,
      secretAccessKey: process.env.R2_SECRET_ACCESS_KEY,
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
}

async function startServer() {
  await initDb();
  const app = express();
  const PORT = 3000;

  app.use(express.json({ limit: "50mb" }));

  // API Routes
  app.get("/api/properties", async (req, res) => {
    try {
      const result = await db.execute("SELECT data_json FROM properties");
      const properties = result.rows.map(r => JSON.parse(r.data_json as string));
      res.json(properties);
    } catch (e) {
      console.error("Failed to fetch properties from Turso:", e);
      res.status(500).json({ error: "Failed to fetch properties" });
    }
  });

  app.post("/api/properties", async (req, res) => {
    try {
      const property = req.body;
      
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
      
      res.json({ success: true, property });
    } catch (e) {
      console.error("Failed to save property to Turso:", e);
      res.status(500).json({ error: "Failed to save property" });
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

  app.get("/api/upload-url", async (req, res) => {
    try {
      const fileName = req.query.fileName as string;
      const contentType = req.query.contentType as string || 'image/webp';
      
      if (!fileName) {
        return res.status(400).json({ error: "fileName is required" });
      }

      if (!s3) {
        // If R2 isn't configured with credentials, fallback to instructing client to use Data URLs
        return res.status(503).json({ error: "R2 credentials not configured on server" });
      }

      const bucketName = process.env.R2_BUCKET_NAME || 'ezyhomes-images';
      const command = new PutObjectCommand({
        Bucket: bucketName,
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
