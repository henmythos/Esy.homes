/**
 * Client-Side WebP Converter & Cloudflare R2 Uploader for ezy.homes
 * 
 * Automatically converts uploaded files (JPG, PNG, HEIC, etc.) to optimized WebP format
 * in the browser before uploading to Cloudflare R2 storage.
 */

import { getSelfHostConfig } from './storage';
import { getApiUrl } from './apiConfig';

export const R2_CONFIG = {
  bucketName: 'ezyhomes-images',
  endpoint: 'https://3b25d6fc00d328f896be8a3382324774.r2.cloudflarestorage.com/ezyhomes-images',
  publicDevUrl: 'https://pub-d98afd66f3284a9c98a71404da771d04.r2.dev',
  maxImagesPerProperty: 5,
};

export function getR2PublicDomain(): string {
  const cfg = getSelfHostConfig();
  if (cfg && cfg.cloudflareR2PublicDomain) {
    return cfg.cloudflareR2PublicDomain.replace(/\/$/, '');
  }
  return R2_CONFIG.publicDevUrl;
}

export interface WebpConversionResult {
  blob: Blob;
  dataUrl: string;
  width: number;
  height: number;
  originalSize: number;
  webpSize: number;
  fileName: string;
}

/**
 * Converts any image File into a WebP Blob using HTML5 Canvas.
 * Optionally resizes image to max 1400px width/height for fast web loading.
 */
export async function convertToWebP(
  file: File,
  quality: number = 0.78,
  maxDimension: number = 1400
): Promise<WebpConversionResult> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();

    reader.onload = (e) => {
      const img = new Image();
      img.onload = () => {
        // Calculate aspect-ratio preserving dimensions
        let width = img.width;
        let height = img.height;

        if (width > maxDimension || height > maxDimension) {
          if (width > height) {
            height = Math.round((height * maxDimension) / width);
            width = maxDimension;
          } else {
            width = Math.round((width * maxDimension) / height);
            height = maxDimension;
          }
        }

        const canvas = document.createElement('canvas');
        canvas.width = width;
        canvas.height = height;

        const ctx = canvas.getContext('2d');
        if (!ctx) {
          reject(new Error('Canvas context 2d not supported'));
          return;
        }

        // Draw image on canvas
        ctx.drawImage(img, 0, 0, width, height);

        // Convert canvas content to image/webp
        const dataUrl = canvas.toDataURL('image/webp', quality);

        canvas.toBlob(
          (blob) => {
            if (!blob) {
              reject(new Error('WebP conversion failed'));
              return;
            }

            const cleanName = file.name
              .toLowerCase()
              .replace(/\.[^/.]+$/, '')
              .replace(/[^a-z0-9]+/g, '-');
            
            const uniqueName = `prop_${Date.now()}_${Math.random().toString(36).substring(2, 7)}_${cleanName}.webp`;

            resolve({
              blob,
              dataUrl,
              width,
              height,
              originalSize: file.size,
              webpSize: blob.size,
              fileName: uniqueName,
            });
          },
          'image/webp',
          quality
        );
      };

      img.onerror = () => reject(new Error('Failed to load image for WebP conversion'));
      img.src = e.target?.result as string;
    };

    reader.onerror = () => reject(new Error('FileReader failed to read image file'));
    reader.readAsDataURL(file);
  });
}

/**
 * Uploads a WebP converted image to Cloudflare R2 bucket "ezyhomes-images"
 */
export async function uploadWebPToR2(
  file: File,
  onProgress?: (percent: number) => void
): Promise<{ r2Url: string; webpResult: WebpConversionResult }> {
  if (onProgress) onProgress(20);
  const webpResult = await convertToWebP(file, 0.78, 1400);
  
  if (onProgress) onProgress(60);
  const publicDomain = getR2PublicDomain();
  const targetR2PublicUrl = `${publicDomain}/${webpResult.fileName}`;
  
  let lastErrorMsg = '';

  // 1. Primary Method: Upload via server proxy (/api/upload-direct)
  try {
    const uploadApiEndpoint = getApiUrl(`/api/upload-direct?fileName=${encodeURIComponent(webpResult.fileName)}`);
    const res = await fetch(uploadApiEndpoint, {
      method: 'POST',
      headers: {
        'Content-Type': 'image/webp',
      },
      body: webpResult.blob,
    });

    if (res.ok) {
      const data = await res.json();
      if (data.url) {
        if (onProgress) onProgress(100);
        return { r2Url: data.url, webpResult };
      }
    } else {
      const errJson = await res.json().catch(() => ({}));
      lastErrorMsg = errJson.error || errJson.details || `Server upload returned status ${res.status}`;
      console.warn('Server proxy R2 upload returned error:', lastErrorMsg);
    }
  } catch (err: any) {
    lastErrorMsg = err.message || String(err);
    console.warn('Server proxy R2 upload fetch failed:', err);
  }

  // 2. Secondary Method: Try presigned URL directly from browser
  try {
    const presignApiEndpoint = getApiUrl(`/api/upload-url?fileName=${encodeURIComponent(webpResult.fileName)}&contentType=image/webp`);
    const presignRes = await fetch(presignApiEndpoint);
    if (presignRes.ok) {
      const { uploadUrl } = await presignRes.json();
      
      const response = await fetch(uploadUrl, {
        method: 'PUT',
        headers: {
          'Content-Type': 'image/webp',
        },
        body: webpResult.blob,
      });

      if (response.ok) {
        if (onProgress) onProgress(100);
        return { r2Url: targetR2PublicUrl, webpResult };
      }
    }
  } catch (err) {
    console.warn('Presigned URL fetch failed:', err);
  }

  // If R2 upload failed, throw clear error so user knows R2 connection or server endpoint failed
  if (onProgress) onProgress(100);
  throw new Error(`Cloudflare R2 image upload failed: ${lastErrorMsg || 'Server R2 upload endpoint unreachable. Please verify R2 credentials.'}`);
}