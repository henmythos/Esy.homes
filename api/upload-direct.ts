import { S3Client, PutObjectCommand } from '@aws-sdk/client-s3';

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

export const config = {
  api: {
    bodyParser: false,
  },
};

export default async function handler(req: any, res: any) {
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader("Access-Control-Allow-Methods", "GET, POST, OPTIONS");
  res.setHeader("Access-Control-Allow-Headers", "Content-Type, Authorization");

  if (req.method === "OPTIONS") {
    return res.status(200).end();
  }

  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  // Use WHATWG URL API to parse query parameters safely (resolves DEP0169 url.parse deprecation warnings)
  let rawFileName = '';
  try {
    const fullUrl = new URL(req.url || '', `https://${req.headers?.host || 'ezy.homes'}`);
    rawFileName = fullUrl.searchParams.get('fileName') || fullUrl.searchParams.get('filename') || '';
  } catch (e) {
    // Fallback if req.url is a relative path
  }
  if (!rawFileName) {
    rawFileName = (req.query?.fileName as string) || (req.query?.filename as string) || '';
  }

  if (!rawFileName) {
    return res.status(400).json({ error: "fileName query parameter is required" });
  }

  // Sanitize filename to prevent path traversal or S3 key collisions
  const fileName = rawFileName.replace(/[^a-zA-Z0-9_.-]/g, '_');
  const contentType = (req.headers['content-type'] as string) || 'image/webp';

  const r2AccountId = cleanEnv(process.env.CLOUDFLARE_R2_ACCOUNT_ID, 'CLOUDFLARE_R2_ACCOUNT_ID', '3b25d6fc00d328f896be8a3382324774');
  const r2AccessKeyId = cleanEnv(process.env.R2_ACCESS_KEY_ID, 'R2_ACCESS_KEY_ID', 'f14bb739067b7a74aaaff946cfe96681');
  const r2SecretAccessKey = cleanEnv(process.env.R2_SECRET_ACCESS_KEY, 'R2_SECRET_ACCESS_KEY', 'f8f5fc924f6866009916004f63ed4c824367f866f64f16eb4f6590d67353bfaa');
  const r2BucketName = cleanEnv(process.env.R2_BUCKET_NAME, 'R2_BUCKET_NAME', 'ezyhomes-images');
  const r2PublicDomain = cleanEnv(process.env.R2_PUBLIC_DOMAIN, 'R2_PUBLIC_DOMAIN', 'https://pub-d98afd66f3284a9c98a71404da771d04.r2.dev');

  try {
    const s3 = new S3Client({
      region: "auto",
      endpoint: `https://${r2AccountId}.r2.cloudflarestorage.com`,
      credentials: {
        accessKeyId: r2AccessKeyId,
        secretAccessKey: r2SecretAccessKey,
      }
    });

    let buffer: Buffer;
    if (Buffer.isBuffer(req.body)) {
      buffer = req.body;
    } else {
      const chunks: Buffer[] = [];
      for await (const chunk of req) {
        chunks.push(typeof chunk === 'string' ? Buffer.from(chunk) : chunk);
      }
      buffer = Buffer.concat(chunks);
    }

    if (buffer.length === 0 && req.body) {
      if (typeof req.body === 'string') {
        buffer = Buffer.from(req.body, 'base64');
      }
    }

    const command = new PutObjectCommand({
      Bucket: r2BucketName,
      Key: fileName,
      Body: buffer,
      ContentType: contentType,
    });

    await s3.send(command);

    const publicUrl = `${r2PublicDomain}/${fileName}`;
    return res.status(200).json({ success: true, url: publicUrl });
  } catch (err: any) {
    console.error("Vercel R2 upload error:", err);
    return res.status(500).json({ error: "R2 upload failed", details: err?.message || String(err) });
  }
}
