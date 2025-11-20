import { PicsumImage, PicsumListParams } from '@/types/picsum';

const PICSUM_API_BASE = 'https://picsum.photos/v2';

/**
 * Fetch a paginated list of images from Picsum Photos API
 * @param params - Page number and limit per page
 * @param cache - Cache strategy for fetch request
 * @returns Array of image objects
 * @throws Error if API request fails
 */
export async function fetchPicsumImages(
  params: PicsumListParams,
  cache: RequestCache = 'no-store'
): Promise<PicsumImage[]> {
  const { page, limit } = params;
  const url = `${PICSUM_API_BASE}/list?page=${page}&limit=${limit}`;

  try {
    const response = await fetch(url, { cache });

    if (!response.ok) {
      throw new Error(
        `Picsum API error: ${response.status} ${response.statusText}`
      );
    }

    const data: PicsumImage[] = await response.json();
    return data;
  } catch (error) {
    if (error instanceof Error) {
      throw new Error(`Failed to fetch images: ${error.message}`);
    }
    throw new Error('Failed to fetch images: Unknown error');
  }
}

/**
 * Generate optimized image URL with specific dimensions
 * @param imageId - Picsum image ID
 * @param width - Desired width in pixels
 * @param height - Desired height in pixels
 * @returns Optimized image URL
 */
export function getOptimizedImageUrl(
  imageId: string,
  width: number,
  height: number
): string {
  return `https://picsum.photos/id/${imageId}/${width}/${height}`;
}

/**
 * Fetch details for a single image by ID
 * 
 * Uses the undocumented /id/{id}/info endpoint for fast single-image lookup.
 * This is more efficient than paginating through the list endpoint.
 * 
 * @param imageId - Picsum image ID
 * @param cache - Cache strategy for fetch request
 * @returns Image object with metadata
 * @throws Error if image not found or API request fails
 */
export async function fetchSingleImage(
  imageId: string,
  cache: RequestCache = 'force-cache'
): Promise<PicsumImage> {
  const url = `https://picsum.photos/id/${imageId}/info`;

  try {
    const response = await fetch(url, { cache });

    if (!response.ok) {
      if (response.status === 404) {
        throw new Error(`Image with ID "${imageId}" not found`);
      }
      throw new Error(
        `Picsum API error: ${response.status} ${response.statusText}`
      );
    }

    const data: PicsumImage = await response.json();
    return data;
  } catch (error) {
    if (error instanceof Error) {
      throw error;
    }
    throw new Error('Failed to fetch image details');
  }
}
