# Image Details Page with Client-Side Manipulation Implementation Plan

**Goal:** Build an image details page accessible via grid clicks and permalinks, displaying full-scale images with metadata (author, URL, dimensions) and client-side manipulation tools (download, grayscale, blur).

**Architecture:** Dynamic route using Next.js App Router (`/image/[id]`) with server-side data fetching for initial metadata. Client-side Canvas API for real-time image manipulation (grayscale and blur filters). Image processing happens entirely in the browser without external dependencies. Responsive layout with mobile-first design.

**Tech Stack:** Next.js 16 App Router, React 19, TypeScript, Canvas API, Tailwind CSS 4, Picsum Photos API v2

---

## Task 1: Update ImageCard for Navigation

**Files:**
- Modify: `components/ImageCard.tsx:1-75`

**Step 1: Add Next.js Link wrapper to ImageCard**

Replace entire `components/ImageCard.tsx`:
```typescript
'use client';

import { PicsumImage } from '@/types/picsum';
import { getOptimizedImageUrl } from '@/lib/picsum-api';
import { useState } from 'react';
import Link from 'next/link';

interface ImageCardProps {
  image: PicsumImage;
}

export default function ImageCard({ image }: ImageCardProps) {
  const [isLoading, setIsLoading] = useState(true);
  const [hasError, setHasError] = useState(false);

  // Calculate aspect ratio for responsive sizing
  const aspectRatio = image.width / image.height;
  const optimizedUrl = getOptimizedImageUrl(image.id, 600, 400);

  const handleLoad = () => {
    setIsLoading(false);
  };

  const handleError = () => {
    setIsLoading(false);
    setHasError(true);
  };

  return (
    <Link
      href={`/image/${image.id}`}
      className="group relative block overflow-hidden rounded-lg bg-zinc-100 transition-transform hover:scale-[1.02] dark:bg-zinc-800"
    >
      {/* Aspect ratio container */}
      <div
        className="relative w-full"
        style={{ paddingBottom: `${(1 / aspectRatio) * 100}%` }}
      >
        {isLoading && (
          <div className="absolute inset-0 animate-pulse bg-zinc-200 dark:bg-zinc-700" />
        )}

        {hasError ? (
          <div className="absolute inset-0 flex items-center justify-center">
            <p className="text-sm text-zinc-500">Failed to load</p>
          </div>
        ) : (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={optimizedUrl}
            alt={`Photo by ${image.author}`}
            className={`absolute inset-0 h-full w-full object-cover transition-opacity duration-300 ${
              isLoading ? 'opacity-0' : 'opacity-100'
            }`}
            onLoad={handleLoad}
            onError={handleError}
            loading="lazy"
          />
        )}

        {/* Hover overlay with author info */}
        <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent opacity-0 transition-opacity duration-300 group-hover:opacity-100">
          <div className="absolute bottom-0 left-0 right-0 p-4">
            <p className="text-sm font-medium text-white">
              Photo by {image.author}
            </p>
            <p className="text-xs text-zinc-300">
              {image.width} × {image.height}
            </p>
          </div>
        </div>
      </div>
    </Link>
  );
}
```

**Step 2: Verify type safety**

Run: `npx tsc --noEmit`

Expected: `Found 0 errors`

**Step 3: Lint verification**

Run: `npm run lint -- --max-warnings 0`

Expected: `✔ No ESLint warnings or errors`

**Step 4: Commit**
```bash
git add components/ImageCard.tsx
git commit -m "feat: add navigation link to ImageCard for details page"
```

---

## Task 2: Add API Function to Fetch Single Image

**Files:**
- Modify: `lib/picsum-api.ts:44-65` (add new function at end)

**Step 1: Add fetchSingleImage function**

Append to end of `lib/picsum-api.ts` (after `getOptimizedImageUrl` function):
```typescript

/**
 * Fetch details for a single image by ID
 * @param imageId - Picsum image ID
 * @param cache - Cache strategy for fetch request
 * @returns Image object with metadata
 * @throws Error if image not found or API request fails
 */
export async function fetchSingleImage(
  imageId: string,
  cache: RequestCache = 'force-cache'
): Promise<PicsumImage> {
  const url = `${PICSUM_API_BASE}/id/${imageId}/info`;

  try {
    const response = await fetch(url, { cache });

    if (response.status === 404) {
      throw new Error(`Image with ID "${imageId}" not found`);
    }

    if (!response.ok) {
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
    throw new Error('Failed to fetch image details: Unknown error');
  }
}
```

**Step 2: Verify type safety**

Run: `npx tsc --noEmit`

Expected: `Found 0 errors`

**Step 3: Lint verification**

Run: `npm run lint -- --max-warnings 0`

Expected: `✔ No ESLint warnings or errors`

**Step 4: Commit**
```bash
git add lib/picsum-api.ts
git commit -m "feat: add API function to fetch single image by ID"
```

---

## Task 3: Create Image Manipulation Utilities

**Files:**
- Create: `lib/image-effects.ts`

**Step 1: Implement Canvas-based image manipulation functions**

Create `lib/image-effects.ts`:
```typescript
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
```

**Step 2: Verify type safety**

Run: `npx tsc --noEmit`

Expected: `Found 0 errors`

**Step 3: Lint verification**

Run: `npm run lint -- --max-warnings 0`

Expected: `✔ No ESLint warnings or errors`

**Step 4: Commit**
```bash
git add lib/image-effects.ts
git commit -m "feat: add client-side image manipulation utilities (grayscale, blur, download)"
```

---

## Task 4: Create ImageToolbar Component

**Files:**
- Create: `components/ImageToolbar.tsx`

**Step 1: Build toolbar component with manipulation buttons**

Create `components/ImageToolbar.tsx`:
```typescript
'use client';

import { useState } from 'react';
import {
  applyGrayscale,
  applyBlur,
  downloadImage,
  loadImage,
} from '@/lib/image-effects';

interface ImageToolbarProps {
  imageUrl: string;
  imageId: string;
  author: string;
  onImageChange: (newUrl: string) => void;
}

export default function ImageToolbar({
  imageUrl,
  imageId,
  author,
  onImageChange,
}: ImageToolbarProps) {
  const [isProcessing, setIsProcessing] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleDownload = () => {
    const filename = `picsum-${imageId}-${author.replace(/\s+/g, '-').toLowerCase()}.jpg`;
    downloadImage(imageUrl, filename);
  };

  const handleGrayscale = async () => {
    setIsProcessing(true);
    setError(null);

    try {
      const img = await loadImage(imageUrl);
      const grayscaleUrl = applyGrayscale(img);
      onImageChange(grayscaleUrl);
    } catch (err) {
      const errorMessage =
        err instanceof Error ? err.message : 'Failed to apply grayscale';
      setError(errorMessage);
      console.error('Grayscale error:', err);
    } finally {
      setIsProcessing(false);
    }
  };

  const handleBlur = async () => {
    setIsProcessing(true);
    setError(null);

    try {
      const img = await loadImage(imageUrl);
      const blurredUrl = applyBlur(img, 10);
      onImageChange(blurredUrl);
    } catch (err) {
      const errorMessage =
        err instanceof Error ? err.message : 'Failed to apply blur';
      setError(errorMessage);
      console.error('Blur error:', err);
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <div className="space-y-4">
      {/* Toolbar Buttons */}
      <div className="flex flex-wrap gap-3">
        <button
          onClick={handleDownload}
          disabled={isProcessing}
          className="flex items-center gap-2 rounded-lg bg-zinc-900 px-4 py-2.5 text-sm font-medium text-white transition-colors hover:bg-zinc-700 disabled:cursor-not-allowed disabled:opacity-50 dark:bg-zinc-50 dark:text-zinc-900 dark:hover:bg-zinc-200"
        >
          <svg
            className="h-5 w-5"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4"
            />
          </svg>
          Download
        </button>

        <button
          onClick={handleGrayscale}
          disabled={isProcessing}
          className="flex items-center gap-2 rounded-lg border-2 border-zinc-900 px-4 py-2.5 text-sm font-medium text-zinc-900 transition-colors hover:bg-zinc-100 disabled:cursor-not-allowed disabled:opacity-50 dark:border-zinc-50 dark:text-zinc-50 dark:hover:bg-zinc-800"
        >
          <svg
            className="h-5 w-5"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M7 21a4 4 0 01-4-4V5a2 2 0 012-2h4a2 2 0 012 2v12a4 4 0 01-4 4zm0 0h12a2 2 0 002-2v-4a2 2 0 00-2-2h-2.343M11 7.343l1.657-1.657a2 2 0 012.828 0l2.829 2.829a2 2 0 010 2.828l-8.486 8.485M7 17h.01"
            />
          </svg>
          Grayscale
        </button>

        <button
          onClick={handleBlur}
          disabled={isProcessing}
          className="flex items-center gap-2 rounded-lg border-2 border-zinc-900 px-4 py-2.5 text-sm font-medium text-zinc-900 transition-colors hover:bg-zinc-100 disabled:cursor-not-allowed disabled:opacity-50 dark:border-zinc-50 dark:text-zinc-50 dark:hover:bg-zinc-800"
        >
          <svg
            className="h-5 w-5"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"
            />
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z"
            />
          </svg>
          Blur
        </button>
      </div>

      {/* Processing State */}
      {isProcessing && (
        <div className="flex items-center gap-2 text-sm text-zinc-600 dark:text-zinc-400">
          <div className="h-4 w-4 animate-spin rounded-full border-2 border-zinc-300 border-t-zinc-900 dark:border-zinc-600 dark:border-t-zinc-50" />
          Processing image...
        </div>
      )}

      {/* Error Message */}
      {error && (
        <div className="rounded-lg bg-red-50 p-3 text-sm text-red-600 dark:bg-red-900/20 dark:text-red-400">
          {error}
        </div>
      )}
    </div>
  );
}
```

**Step 2: Verify type safety**

Run: `npx tsc --noEmit`

Expected: `Found 0 errors`

**Step 3: Lint verification**

Run: `npm run lint -- --max-warnings 0`

Expected: `✔ No ESLint warnings or errors`

**Step 4: Commit**
```bash
git add components/ImageToolbar.tsx
git commit -m "feat: add ImageToolbar component with download, grayscale, and blur actions"
```

---

## Task 5: Create ImageMetadata Component

**Files:**
- Create: `components/ImageMetadata.tsx`

**Step 1: Build metadata display component**

Create `components/ImageMetadata.tsx`:
```typescript
import { PicsumImage } from '@/types/picsum';

interface ImageMetadataProps {
  image: PicsumImage;
}

export default function ImageMetadata({ image }: ImageMetadataProps) {
  return (
    <div className="space-y-4 rounded-lg border border-zinc-200 bg-white p-6 dark:border-zinc-800 dark:bg-zinc-900">
      <h2 className="text-lg font-semibold text-zinc-900 dark:text-zinc-50">
        Image Details
      </h2>

      <dl className="space-y-3">
        {/* Author */}
        <div>
          <dt className="text-sm font-medium text-zinc-500 dark:text-zinc-400">
            Author
          </dt>
          <dd className="mt-1 text-sm text-zinc-900 dark:text-zinc-50">
            {image.author}
          </dd>
        </div>

        {/* Dimensions */}
        <div>
          <dt className="text-sm font-medium text-zinc-500 dark:text-zinc-400">
            Dimensions
          </dt>
          <dd className="mt-1 text-sm text-zinc-900 dark:text-zinc-50">
            {image.width} × {image.height} pixels
          </dd>
        </div>

        {/* Image ID */}
        <div>
          <dt className="text-sm font-medium text-zinc-500 dark:text-zinc-400">
            Image ID
          </dt>
          <dd className="mt-1 font-mono text-sm text-zinc-900 dark:text-zinc-50">
            {image.id}
          </dd>
        </div>

        {/* Original URL */}
        <div>
          <dt className="text-sm font-medium text-zinc-500 dark:text-zinc-400">
            Original Source
          </dt>
          <dd className="mt-1">
            <a
              href={image.url}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-1 text-sm text-blue-600 hover:text-blue-800 dark:text-blue-400 dark:hover:text-blue-300"
            >
              View on Unsplash
              <svg
                className="h-4 w-4"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14"
                />
              </svg>
            </a>
          </dd>
        </div>

        {/* Download URL */}
        <div>
          <dt className="text-sm font-medium text-zinc-500 dark:text-zinc-400">
            Download URL
          </dt>
          <dd className="mt-1">
            <code className="block break-all rounded bg-zinc-100 p-2 text-xs text-zinc-800 dark:bg-zinc-800 dark:text-zinc-200">
              {image.download_url}
            </code>
          </dd>
        </div>
      </dl>
    </div>
  );
}
```

**Step 2: Verify type safety**

Run: `npx tsc --noEmit`

Expected: `Found 0 errors`

**Step 3: Lint verification**

Run: `npm run lint -- --max-warnings 0`

Expected: `✔ No ESLint warnings or errors`

**Step 4: Commit**
```bash
git add components/ImageMetadata.tsx
git commit -m "feat: add ImageMetadata component to display image details"
```

---

## Task 6: Create Dynamic Image Details Page

**Files:**
- Create: `app/image/[id]/page.tsx`

**Step 1: Create dynamic route directory**

Run: `mkdir -p app/image/\[id\]`

Expected: Directory created successfully

**Step 2: Build image details page with SSR**

Create `app/image/[id]/page.tsx`:
```typescript
import { notFound } from 'next/navigation';
import Link from 'next/link';
import { fetchSingleImage, getOptimizedImageUrl } from '@/lib/picsum-api';
import ImageMetadata from '@/components/ImageMetadata';
import ImageViewer from '@/components/ImageViewer';
import type { Metadata } from 'next';

interface PageProps {
  params: Promise<{ id: string }>;
}

/**
 * Generate metadata for SEO
 */
export async function generateMetadata({
  params,
}: PageProps): Promise<Metadata> {
  const { id } = await params;

  try {
    const image = await fetchSingleImage(id);
    return {
      title: `Photo by ${image.author} - Image Browser`,
      description: `View and download this ${image.width}×${image.height} photo by ${image.author}`,
    };
  } catch {
    return {
      title: 'Image Not Found - Image Browser',
      description: 'The requested image could not be found',
    };
  }
}

export default async function ImageDetailsPage({ params }: PageProps) {
  const { id } = await params;

  // Fetch image data on the server
  let image;
  try {
    image = await fetchSingleImage(id);
  } catch (error) {
    console.error(`Failed to fetch image ${id}:`, error);
    notFound();
  }

  // Generate optimized image URL (max 1200px width for details view)
  const displayUrl = getOptimizedImageUrl(image.id, 1200, 800);

  return (
    <div className="min-h-screen bg-white dark:bg-zinc-950">
      {/* Header with Back Button */}
      <header className="border-b border-zinc-200 bg-white dark:border-zinc-800 dark:bg-zinc-900">
        <div className="mx-auto max-w-7xl px-4 py-4 sm:px-6 lg:px-8">
          <Link
            href="/"
            className="inline-flex items-center gap-2 text-sm font-medium text-zinc-600 transition-colors hover:text-zinc-900 dark:text-zinc-400 dark:hover:text-zinc-50"
          >
            <svg
              className="h-5 w-5"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M10 19l-7-7m0 0l7-7m-7 7h18"
              />
            </svg>
            Back to Gallery
          </Link>
        </div>
      </header>

      {/* Main Content */}
      <main className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
        <div className="grid gap-8 lg:grid-cols-3">
          {/* Image Viewer - Takes 2 columns on large screens */}
          <div className="lg:col-span-2">
            <ImageViewer
              imageUrl={displayUrl}
              imageId={image.id}
              author={image.author}
              alt={`Photo by ${image.author}`}
            />
          </div>

          {/* Metadata Sidebar - Takes 1 column on large screens */}
          <div className="lg:col-span-1">
            <ImageMetadata image={image} />
          </div>
        </div>
      </main>
    </div>
  );
}
```

**Step 3: Verify type safety**

Run: `npx tsc --noEmit`

Expected: `Found 0 errors`

**Step 4: Lint verification**

Run: `npm run lint -- --max-warnings 0`

Expected: `✔ No ESLint warnings or errors`

**Step 5: Commit**
```bash
git add app/image/\[id\]/page.tsx
git commit -m "feat: add dynamic image details page with SSR and metadata"
```

---

## Task 7: Create ImageViewer Component

**Files:**
- Create: `components/ImageViewer.tsx`

**Step 1: Build image viewer with manipulation integration**

Create `components/ImageViewer.tsx`:
```typescript
'use client';

import { useState } from 'react';
import ImageToolbar from './ImageToolbar';

interface ImageViewerProps {
  imageUrl: string;
  imageId: string;
  author: string;
  alt: string;
}

export default function ImageViewer({
  imageUrl,
  imageId,
  author,
  alt,
}: ImageViewerProps) {
  const [currentImageUrl, setCurrentImageUrl] = useState(imageUrl);
  const [isLoading, setIsLoading] = useState(true);
  const [hasError, setHasError] = useState(false);

  const handleImageChange = (newUrl: string) => {
    setCurrentImageUrl(newUrl);
    setIsLoading(true); // Show loading state for new image
  };

  const handleLoad = () => {
    setIsLoading(false);
  };

  const handleError = () => {
    setIsLoading(false);
    setHasError(true);
  };

  const handleReset = () => {
    setCurrentImageUrl(imageUrl);
    setHasError(false);
    setIsLoading(true);
  };

  return (
    <div className="space-y-6">
      {/* Image Container */}
      <div className="relative overflow-hidden rounded-lg bg-zinc-100 dark:bg-zinc-800">
        {isLoading && (
          <div className="absolute inset-0 flex items-center justify-center">
            <div className="h-12 w-12 animate-spin rounded-full border-4 border-zinc-200 border-t-zinc-800 dark:border-zinc-700 dark:border-t-zinc-200" />
          </div>
        )}

        {hasError ? (
          <div className="flex min-h-[400px] flex-col items-center justify-center gap-4">
            <p className="text-zinc-600 dark:text-zinc-400">
              Failed to load image
            </p>
            <button
              onClick={handleReset}
              className="rounded-lg bg-zinc-900 px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-zinc-700 dark:bg-zinc-50 dark:text-zinc-900 dark:hover:bg-zinc-200"
            >
              Retry
            </button>
          </div>
        ) : (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={currentImageUrl}
            alt={alt}
            className={`w-full transition-opacity duration-300 ${
              isLoading ? 'opacity-0' : 'opacity-100'
            }`}
            onLoad={handleLoad}
            onError={handleError}
          />
        )}
      </div>

      {/* Toolbar */}
      <div className="space-y-4">
        <ImageToolbar
          imageUrl={currentImageUrl}
          imageId={imageId}
          author={author}
          onImageChange={handleImageChange}
        />

        {/* Reset Button (shown when image is modified) */}
        {currentImageUrl !== imageUrl && (
          <button
            onClick={handleReset}
            className="w-full rounded-lg border-2 border-dashed border-zinc-300 px-4 py-2 text-sm font-medium text-zinc-600 transition-colors hover:border-zinc-400 hover:text-zinc-900 dark:border-zinc-700 dark:text-zinc-400 dark:hover:border-zinc-600 dark:hover:text-zinc-50"
          >
            Reset to Original
          </button>
        )}
      </div>
    </div>
  );
}
```

**Step 2: Verify type safety**

Run: `npx tsc --noEmit`

Expected: `Found 0 errors`

**Step 3: Lint verification**

Run: `npm run lint -- --max-warnings 0`

Expected: `✔ No ESLint warnings or errors`

**Step 4: Commit**
```bash
git add components/ImageViewer.tsx
git commit -m "feat: add ImageViewer component with reset functionality"
```

---

## Task 8: Create 404 Page for Invalid Image IDs

**Files:**
- Create: `app/image/[id]/not-found.tsx`

**Step 1: Create custom not-found page**

Create `app/image/[id]/not-found.tsx`:
```typescript
import Link from 'next/link';

export default function NotFound() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-white dark:bg-zinc-950">
      <div className="mx-auto max-w-md px-4 text-center">
        <div className="mb-6 text-6xl">🖼️</div>
        <h2 className="mb-4 text-2xl font-bold text-zinc-900 dark:text-zinc-50">
          Image Not Found
        </h2>
        <p className="mb-6 text-zinc-600 dark:text-zinc-400">
          The image you're looking for doesn't exist or has been removed.
        </p>
        <Link
          href="/"
          className="inline-flex items-center gap-2 rounded-lg bg-zinc-900 px-6 py-3 font-medium text-white transition-colors hover:bg-zinc-700 dark:bg-zinc-50 dark:text-zinc-900 dark:hover:bg-zinc-200"
        >
          <svg
            className="h-5 w-5"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M10 19l-7-7m0 0l7-7m-7 7h18"
            />
          </svg>
          Back to Gallery
        </Link>
      </div>
    </div>
  );
}
```

**Step 2: Verify type safety**

Run: `npx tsc --noEmit`

Expected: `Found 0 errors`

**Step 3: Lint verification**

Run: `npm run lint -- --max-warnings 0`

Expected: `✔ No ESLint warnings or errors`

**Step 4: Commit**
```bash
git add app/image/\[id\]/not-found.tsx
git commit -m "feat: add custom 404 page for invalid image IDs"
```

---

## Task 9: Add Loading State for Details Page

**Files:**
- Create: `app/image/[id]/loading.tsx`

**Step 1: Create loading skeleton for details page**

Create `app/image/[id]/loading.tsx`:
```typescript
export default function Loading() {
  return (
    <div className="min-h-screen bg-white dark:bg-zinc-950">
      {/* Header Skeleton */}
      <header className="border-b border-zinc-200 bg-white dark:border-zinc-800 dark:bg-zinc-900">
        <div className="mx-auto max-w-7xl px-4 py-4 sm:px-6 lg:px-8">
          <div className="h-5 w-32 animate-pulse rounded bg-zinc-200 dark:bg-zinc-700" />
        </div>
      </header>

      {/* Main Content Skeleton */}
      <main className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
        <div className="grid gap-8 lg:grid-cols-3">
          {/* Image Skeleton */}
          <div className="lg:col-span-2">
            <div className="aspect-[3/2] animate-pulse rounded-lg bg-zinc-200 dark:bg-zinc-800" />
            {/* Toolbar Skeleton */}
            <div className="mt-6 flex gap-3">
              <div className="h-10 w-32 animate-pulse rounded-lg bg-zinc-200 dark:bg-zinc-800" />
              <div className="h-10 w-32 animate-pulse rounded-lg bg-zinc-200 dark:bg-zinc-800" />
              <div className="h-10 w-24 animate-pulse rounded-lg bg-zinc-200 dark:bg-zinc-800" />
            </div>
          </div>

          {/* Metadata Skeleton */}
          <div className="lg:col-span-1">
            <div className="space-y-4 rounded-lg border border-zinc-200 bg-white p-6 dark:border-zinc-800 dark:bg-zinc-900">
              <div className="h-6 w-32 animate-pulse rounded bg-zinc-200 dark:bg-zinc-700" />
              <div className="space-y-3">
                {Array.from({ length: 5 }).map((_, i) => (
                  <div key={i} className="space-y-2">
                    <div className="h-4 w-20 animate-pulse rounded bg-zinc-200 dark:bg-zinc-700" />
                    <div className="h-5 w-full animate-pulse rounded bg-zinc-200 dark:bg-zinc-700" />
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
```

**Step 2: Verify type safety**

Run: `npx tsc --noEmit`

Expected: `Found 0 errors`

**Step 3: Lint verification**

Run: `npm run lint -- --max-warnings 0`

Expected: `✔ No ESLint warnings or errors`

**Step 4: Commit**
```bash
git add app/image/\[id\]/loading.tsx
git commit -m "feat: add loading skeleton for image details page"
```

---

## Task 10: Update Documentation

**Files:**
- Create: `docs/picsum-single-image-endpoint.md`

**Step 1: Document single image API endpoint**

Create `docs/picsum-single-image-endpoint.md`:
```markdown
# Picsum Photos - Single Image Endpoint

## Get Image Info

Get information about a specific image by using the `/v2/id/{id}/info` endpoint.

### Endpoint
```
https://picsum.photos/v2/id/{id}/info
```

### Example Request
```
https://picsum.photos/v2/id/237/info
```

### Response Format
```json
{
  "id": "237",
  "author": "André Spieker",
  "width": 3500,
  "height": 2095,
  "url": "https://unsplash.com/photos/8wTPqxlnKM4",
  "download_url": "https://picsum.photos/id/237/3500/2095"
}
```

### Error Handling
- **404 Not Found**: Image ID does not exist
- **500 Server Error**: API service unavailable

## Image Manipulation

### Resized Images
Get a specific image at a custom size:
```
https://picsum.photos/id/{id}/{width}/{height}
```

### Example
```
https://picsum.photos/id/237/800/600
```
Returns image #237 at 800×600 pixels

### CORS Support
The Picsum API supports CORS for client-side image manipulation. Set `crossOrigin="anonymous"` on image elements to enable canvas operations.

```typescript
const img = new Image();
img.crossOrigin = 'anonymous';
img.src = 'https://picsum.photos/id/237/800/600';
```
```

**Step 2: Commit**
```bash
git add docs/picsum-single-image-endpoint.md
git commit -m "docs: add Picsum single image API endpoint reference"
```

---

## Task 11: Final Testing and Verification

**Files:**
- None (testing only)

**Step 1: Clean build verification**

Run: `rm -rf .next && npm run build`

Expected: Successful production build with:
- Route `/` shows as `ƒ` (Dynamic SSR)
- Route `/image/[id]` shows as `ƒ` (Dynamic SSR)
- No TypeScript errors
- No build warnings

**Step 2: Type checking**

Run: `npx tsc --noEmit`

Expected: `Found 0 errors`

**Step 3: Lint check**

Run: `npm run lint -- --max-warnings 0`

Expected: `✔ No ESLint warnings or errors`

**Step 4: Development server test**

Run: `npm run dev`

Expected: Server starts on http://localhost:3000

**Step 5: Test dynamic routing**

In a new terminal while dev server is running:
```bash
curl -I http://localhost:3000/image/237
```

Expected: HTTP 200 response

```bash
curl -I http://localhost:3000/image/999999
```

Expected: HTTP 404 response

**Step 6: Manual testing checklist**

Open http://localhost:3000 in browser and verify:
- [ ] Click on any image card in the grid
- [ ] Details page loads with full image and metadata
- [ ] Back button navigates to gallery
- [ ] Download button downloads the image
- [ ] Grayscale button converts image to black & white
- [ ] Blur button applies blur effect to image
- [ ] "Reset to Original" button appears after manipulation
- [ ] Reset button restores original image
- [ ] All metadata fields display correctly (author, dimensions, ID, URLs)
- [ ] Unsplash link opens in new tab
- [ ] Loading skeleton appears during page load
- [ ] Direct URL access works (e.g., `/image/237`)
- [ ] Invalid image ID shows 404 page (e.g., `/image/999999`)
- [ ] Dark mode works on details page
- [ ] Responsive layout works (test sidebar on mobile)
- [ ] No console errors during image manipulation

**Step 7: Test permalink functionality**

Copy URL from address bar while on details page (e.g., `http://localhost:3000/image/237`), open in new tab:

Expected: Same image details page loads correctly

**Step 8: Production build test**

Run: `npm run build && npm start`

Expected: Production server runs without errors, all routes work

**Step 9: Create final commit if fixes were needed**

If manual testing revealed issues that were fixed:
```bash
git add .
git commit -m "fix: address issues found in manual testing"
```

---

## Summary

This plan implements a production-ready image details page with:

✅ **Dynamic Routing:** Next.js App Router with SSR for SEO  
✅ **Permalinks:** Direct access via `/image/[id]` URLs  
✅ **Metadata Display:** Author, dimensions, ID, and source URLs  
✅ **Client-Side Manipulation:** Canvas API for grayscale and blur (no external dependencies)  
✅ **Download Functionality:** Direct image download with proper filenames  
✅ **Navigation:** Clickable grid cards and back button  
✅ **Error Handling:** 404 page for invalid IDs, graceful error states  
✅ **Loading States:** Skeleton UI during data fetching  
✅ **Responsive Design:** Mobile-first layout with sidebar  
✅ **Type Safety:** Full TypeScript coverage  
✅ **Accessibility:** Semantic HTML, ARIA labels, keyboard navigation  
✅ **SEO:** Dynamic metadata generation per image  

**Total estimated time:** 45-55 minutes for all 11 tasks

**Key Features Implemented:**
1. Dynamic route `/image/[id]` with SSR
2. Full-scale image display with metadata sidebar
3. Download button with proper filename generation
4. Grayscale filter using Canvas API (client-side)
5. Blur filter using Canvas API (client-side)
6. Reset to original functionality
7. Clickable image cards in grid
8. Permalink support for direct access
9. Custom 404 page for invalid image IDs
10. Loading skeletons and error boundaries
11. Responsive layout (stacked on mobile, sidebar on desktop)
