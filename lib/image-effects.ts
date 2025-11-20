/**
 * Client-side image manipulation utilities using Canvas API
 */

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

  // Set canvas dimensions to match image
  canvas.width = imageElement.naturalWidth;
  canvas.height = imageElement.naturalHeight;

  // Draw original image
  ctx.drawImage(imageElement, 0, 0);

  // Get image data
  const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
  const data = imageData.data;

  // Apply grayscale transformation
  for (let i = 0; i < data.length; i += 4) {
    const avg = (data[i] + data[i + 1] + data[i + 2]) / 3;
    data[i] = avg; // Red
    data[i + 1] = avg; // Green
    data[i + 2] = avg; // Blue
    // data[i + 3] is alpha channel, leave unchanged
  }

  // Put modified image data back
  ctx.putImageData(imageData, 0, 0);

  // Return as data URL
  return canvas.toDataURL('image/jpeg', 0.95);
}

/**
 * Apply blur filter to an image
 * @param imageElement - HTMLImageElement to blur
 * @param radius - Blur radius (default: 10)
 * @returns Data URL of blurred image
 */
export function applyBlur(
  imageElement: HTMLImageElement,
  radius: number = 10
): string {
  const canvas = document.createElement('canvas');
  const ctx = canvas.getContext('2d');

  if (!ctx) {
    throw new Error('Canvas context not available');
  }

  // Set canvas dimensions to match image
  canvas.width = imageElement.naturalWidth;
  canvas.height = imageElement.naturalHeight;

  // Apply CSS filter blur via canvas
  ctx.filter = `blur(${radius}px)`;
  ctx.drawImage(imageElement, 0, 0);

  // Return as data URL
  return canvas.toDataURL('image/jpeg', 0.95);
}

/**
 * Download an image from a data URL or regular URL
 * @param imageUrl - URL or data URL of the image
 * @param filename - Desired filename for download
 */
export function downloadImage(imageUrl: string, filename: string): void {
  const link = document.createElement('a');
  link.href = imageUrl;
  link.download = filename;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
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
