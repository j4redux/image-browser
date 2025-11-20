/**
 * Picsum Photos API v2 Image Response Type
 * Based on https://picsum.photos/v2/list
 */
export interface PicsumImage {
  id: string;
  author: string;
  width: number;
  height: number;
  url: string;
  download_url: string;
}

/**
 * API fetch parameters
 */
export interface PicsumListParams {
  page: number;
  limit: number;
}

/**
 * Parsed Link header for pagination
 */
export interface PaginationLinks {
  next?: string;
  prev?: string;
}
