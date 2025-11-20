/**
 * Client-side image manipulation utilities using Canvas API
 */

const JPEG_QUALITY = 0.95;
const DEFAULT_BLUR_RADIUS = 10;
const BLOB_CLEANUP_DELAY_MS = 100;

/**
 * Apply grayscale filter to an image
 * @param imageElement - HTMLImageElement to convert
 * @returns Data URL of grayscale image
 */
export function applyGrayscale(imageElement: HTMLImageElement): string {
  const canvas = document.createElement('canvas');
  const ctx = canvas.getContext('2d');

  if (!ctx) {
    throw new Error('Canvas context not available');
  }

  canvas.width = imageElement.naturalWidth;
  canvas.height = imageElement.naturalHeight;

  ctx.drawImage(imageElement, 0, 0);

  const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
  const data = imageData.data;

  // Convert to grayscale using average method
  for (let i = 0; i < data.length; i += 4) {
    const avg = (data[i] + data[i + 1] + data[i + 2]) / 3;
    data[i] = avg;
    data[i + 1] = avg;
    data[i + 2] = avg;
  }

  ctx.putImageData(imageData, 0, 0);

  return canvas.toDataURL('image/jpeg', JPEG_QUALITY);
}

/**
 * Apply blur filter to an image
 * @param imageElement - HTMLImageElement to blur
 * @param radius - Blur radius in pixels
 * @returns Data URL of blurred image
 */
export function applyBlur(
  imageElement: HTMLImageElement,
  radius: number = DEFAULT_BLUR_RADIUS
): string {
  const canvas = document.createElement('canvas');
  const ctx = canvas.getContext('2d');

  if (!ctx) {
    throw new Error('Canvas context not available');
  }

  canvas.width = imageElement.naturalWidth;
  canvas.height = imageElement.naturalHeight;

  ctx.filter = `blur(${radius}px)`;
  ctx.drawImage(imageElement, 0, 0);

  return canvas.toDataURL('image/jpeg', JPEG_QUALITY);
}

/**
 * Download an image from a data URL or regular URL
 * For cross-origin URLs, fetches the image and converts to blob
 * @param imageUrl - URL or data URL of the image
 * @param filename - Desired filename for download
 */
export async function downloadImage(
  imageUrl: string,
  filename: string
): Promise<void> {
  if (imageUrl.startsWith('data:')) {
    const link = document.createElement('a');
    link.href = imageUrl;
    link.download = filename;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    return;
  }

  // For cross-origin URLs, fetch and convert to blob
  try {
    const response = await fetch(imageUrl);
    const blob = await response.blob();
    const blobUrl = URL.createObjectURL(blob);

    const link = document.createElement('a');
    link.href = blobUrl;
    link.download = filename;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);

    setTimeout(() => URL.revokeObjectURL(blobUrl), BLOB_CLEANUP_DELAY_MS);
  } catch (error) {
    console.error('Download failed:', error);
    throw new Error('Failed to download image');
  }
}

/**
 * Load image from URL and return as HTMLImageElement
 * @param url - Image URL to load
 * @returns Promise that resolves with loaded image element
 */
export function loadImage(url: string): Promise<HTMLImageElement> {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.crossOrigin = 'anonymous'; // Enable CORS for canvas manipulation
    img.onload = () => resolve(img);
    img.onerror = () => reject(new Error('Failed to load image'));
    img.src = url;
  });
}
