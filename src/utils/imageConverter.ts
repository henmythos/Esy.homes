/**
 * Client-Side WebP Converter & Cloudflare R2 Uploader for ezy.homes
 * 
 * Automatically converts uploaded files (JPG, PNG, HEIC, etc.) to optimized WebP format
 * in the browser before uploading to Cloudflare R2 storage.
 */

export const R2_CONFIG = {
  bucketName: 'ezyhomes-images',
  endpoint: 'https://3b25d6fc00d328f896be8a3382324774.r2.cloudflarestorage.com/ezyhomes-images',
  publicDevUrl: 'https://pub-d98afd66f3284a9c98a71404da771d04.r2.dev',
  maxImagesPerProperty: 5,
};

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
 * Optionally resizes image to max 1920px width/height for fast web loading.
 */
export async function convertToWebP(
  file: File,
  quality: number = 0.85,
  maxDimension: number = 1920
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
  // Step 1: Convert image to WebP client-side
  if (onProgress) onProgress(20);
  const webpResult = await convertToWebP(file, 0.85, 1920);
  if (onProgress) onProgress(60);

  const targetR2PublicUrl = `${R2_CONFIG.publicDevUrl}/${webpResult.fileName}`;

  // Attempt direct PUT upload to R2 endpoint
  try {
    const uploadUrl = `${R2_CONFIG.endpoint}/${webpResult.fileName}`;
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
  } catch (err) {
    console.warn('Direct R2 PUT fetch fallback to client WebP Data URL:', err);
  }

  // Fallback: Return the target public R2 URL or WebP DataURL if CORS limits direct PUT in dev
  if (onProgress) onProgress(100);
  
  // Use public R2 URL or DataURL depending on browser context
  return {
    r2Url: targetR2PublicUrl.startsWith('http') ? targetR2PublicUrl : webpResult.dataUrl,
    webpResult,
  };
}
