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
  mimeType: string;
}

/**
 * Converts any image File into WebP (or graceful fallback JPEG / original format).
 * Gracefully handles canvas errors, unsupported WebP browser engines, and EXIF issues.
 */
export async function convertToWebP(
  file: File,
  quality: number = 0.78,
  maxDimension: number = 1400
): Promise<WebpConversionResult> {
  const cleanName = file.name
    .toLowerCase()
    .replace(/\.[^/.]+$/, '')
    .replace(/[^a-z0-9]+/g, '-');

  const createOriginalFallback = (fallbackBlob: Blob, ext: string, mime: string): Promise<WebpConversionResult> => {
    return new Promise((resolve) => {
      const reader = new FileReader();
      reader.onload = (e) => {
        resolve({
          blob: fallbackBlob,
          dataUrl: (e.target?.result as string) || '',
          width: 800,
          height: 600,
          originalSize: file.size,
          webpSize: fallbackBlob.size,
          fileName: `prop_${Date.now()}_${Math.random().toString(36).substring(2, 7)}_${cleanName}.${ext}`,
          mimeType: mime,
        });
      };
      reader.onerror = () => {
        resolve({
          blob: fallbackBlob,
          dataUrl: '',
          width: 800,
          height: 600,
          originalSize: file.size,
          webpSize: fallbackBlob.size,
          fileName: `prop_${Date.now()}_${Math.random().toString(36).substring(2, 7)}_${cleanName}.${ext}`,
          mimeType: mime,
        });
      };
      reader.readAsDataURL(fallbackBlob);
    });
  };

  return new Promise((resolve) => {
    const reader = new FileReader();

    reader.onload = (e) => {
      const img = new Image();
      img.onload = () => {
        let width = img.width || 800;
        let height = img.height || 600;

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
          console.warn('[ImageConverter] 2D canvas context unavailable, falling back to original file format');
          createOriginalFallback(file, file.name.split('.').pop() || 'jpg', file.type || 'image/jpeg').then(resolve);
          return;
        }

        ctx.drawImage(img, 0, 0, width, height);

        // 1. Primary: Convert canvas to image/webp blob
        canvas.toBlob(
          (webpBlob) => {
            if (webpBlob && webpBlob.size > 0) {
              const dataUrl = canvas.toDataURL('image/webp', quality);
              resolve({
                blob: webpBlob,
                dataUrl,
                width,
                height,
                originalSize: file.size,
                webpSize: webpBlob.size,
                fileName: `prop_${Date.now()}_${Math.random().toString(36).substring(2, 7)}_${cleanName}.webp`,
                mimeType: 'image/webp',
              });
            } else {
              // 2. Secondary Fallback: Convert canvas to JPEG blob
              console.warn('[ImageConverter] WebP blob conversion returned empty, falling back to JPEG');
              canvas.toBlob(
                (jpegBlob) => {
                  if (jpegBlob && jpegBlob.size > 0) {
                    const dataUrl = canvas.toDataURL('image/jpeg', 0.85);
                    resolve({
                      blob: jpegBlob,
                      dataUrl,
                      width,
                      height,
                      originalSize: file.size,
                      webpSize: jpegBlob.size,
                      fileName: `prop_${Date.now()}_${Math.random().toString(36).substring(2, 7)}_${cleanName}.jpg`,
                      mimeType: 'image/jpeg',
                    });
                  } else {
                    // 3. Final Fallback: Original File
                    createOriginalFallback(file, 'jpg', 'image/jpeg').then(resolve);
                  }
                },
                'image/jpeg',
                0.85
              );
            }
          },
          'image/webp',
          quality
        );
      };

      img.onerror = () => {
        console.warn('[ImageConverter] Failed to load image element, falling back to original file format');
        createOriginalFallback(file, file.name.split('.').pop() || 'jpg', file.type || 'image/jpeg').then(resolve);
      };

      img.src = e.target?.result as string;
    };

    reader.onerror = () => {
      console.warn('[ImageConverter] FileReader error, falling back to original file format');
      createOriginalFallback(file, file.name.split('.').pop() || 'jpg', file.type || 'image/jpeg').then(resolve);
    };

    reader.readAsDataURL(file);
  });
}

/**
 * Uploads an image to Cloudflare R2 bucket "ezyhomes-images"
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
        'Content-Type': webpResult.mimeType || 'image/webp',
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
    const presignApiEndpoint = getApiUrl(`/api/upload-url?fileName=${encodeURIComponent(webpResult.fileName)}&contentType=${encodeURIComponent(webpResult.mimeType || 'image/webp')}`);
    const presignRes = await fetch(presignApiEndpoint);
    if (presignRes.ok) {
      const { uploadUrl } = await presignRes.json();
      
      const response = await fetch(uploadUrl, {
        method: 'PUT',
        headers: {
          'Content-Type': webpResult.mimeType || 'image/webp',
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

  if (onProgress) onProgress(100);
  throw new Error(`Cloudflare R2 image upload failed: ${lastErrorMsg || 'Server R2 upload endpoint unreachable. Please verify R2 credentials.'}`);
}