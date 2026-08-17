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

  const fileName = (req.query.fileName as string) || (req.query.filename as string);
  const contentType = (req.headers['content-type'] as string) || 'image/webp';

  if (!fileName) {
    return res.status(400).json({ error: "fileName query parameter is required" });
  }

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

    const body = req.body;
    const buffer = Buffer.isBuffer(body)
      ? body
      : typeof body === 'string'
      ? Buffer.from(body)
      : Buffer.from(JSON.stringify(body || {}));

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
