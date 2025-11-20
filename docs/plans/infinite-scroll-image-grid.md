# Infinite Scroll Image Grid Implementation Plan

**Goal:** Build an infinite scrolling image grid that displays photos from Picsum Photos API on the root index page.

**Architecture:** Client-side infinite scroll using React hooks and Intersection Observer API. Images are fetched from Picsum Photos v2/list endpoint with pagination, displayed in a responsive grid using Tailwind CSS, and new pages load automatically as user scrolls to bottom. TypeScript ensures type safety for API responses.

**Tech Stack:** Next.js 16 App Router, React 19, TypeScript, Tailwind CSS 4, Intersection Observer API, Picsum Photos API v2

---

## Task 1: Define TypeScript Types for Picsum API

**Files:**
- Create: `types/picsum.ts`

**Step 1: Create TypeScript interface for API response**

Create `types/picsum.ts`:
```typescript
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
```

**Step 2: Verify type safety**

Run: `npx tsc --noEmit`

Expected: `Found 0 errors`

**Step 3: Commit**
```bash
git add types/picsum.ts
git commit -m "feat: add TypeScript types for Picsum Photos API"
```

---

## Task 2: Create API Service for Picsum Photos

**Files:**
- Create: `lib/picsum-api.ts`

**Step 1: Implement API service with proper error handling**

Create `lib/picsum-api.ts`:
```typescript
import { PicsumImage, PicsumListParams } from '@/types/picsum';

const PICSUM_API_BASE = 'https://picsum.photos/v2';

/**
 * Fetch a paginated list of images from Picsum Photos API
 * @param params - Page number and limit per page
 * @returns Array of image objects
 * @throws Error if API request fails
 */
export async function fetchPicsumImages(
  params: PicsumListParams
): Promise<PicsumImage[]> {
  const { page, limit } = params;
  const url = `${PICSUM_API_BASE}/list?page=${page}&limit=${limit}`;

  try {
    const response = await fetch(url, {
      // Disable caching for fresh data
      cache: 'no-store',
    });

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
git commit -m "feat: add Picsum Photos API service with error handling"
```

---

## Task 3: Create ImageCard Component

**Files:**
- Create: `components/ImageCard.tsx`

**Step 1: Build responsive image card component**

Create `components/ImageCard.tsx`:
```typescript
'use client';

import { PicsumImage } from '@/types/picsum';
import { getOptimizedImageUrl } from '@/lib/picsum-api';
import { useState } from 'react';

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
    <div className="group relative overflow-hidden rounded-lg bg-zinc-100 dark:bg-zinc-800">
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
git add components/ImageCard.tsx
git commit -m "feat: add ImageCard component with loading states and hover effects"
```

---

## Task 4: Create InfiniteScrollTrigger Component

**Files:**
- Create: `components/InfiniteScrollTrigger.tsx`

**Step 1: Build Intersection Observer hook and trigger component**

Create `components/InfiniteScrollTrigger.tsx`:
```typescript
'use client';

import { useEffect, useRef } from 'react';

interface InfiniteScrollTriggerProps {
  onIntersect: () => void;
  isLoading: boolean;
  hasMore: boolean;
}

export default function InfiniteScrollTrigger({
  onIntersect,
  isLoading,
  hasMore,
}: InfiniteScrollTriggerProps) {
  const triggerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const currentTrigger = triggerRef.current;
    if (!currentTrigger || !hasMore || isLoading) return;

    // Create Intersection Observer to detect when trigger is visible
    const observer = new IntersectionObserver(
      (entries) => {
        const [entry] = entries;
        if (entry.isIntersecting) {
          onIntersect();
        }
      },
      {
        // Trigger when 100px before element enters viewport
        rootMargin: '100px',
        threshold: 0,
      }
    );

    observer.observe(currentTrigger);

    return () => {
      if (currentTrigger) {
        observer.unobserve(currentTrigger);
      }
    };
  }, [onIntersect, isLoading, hasMore]);

  if (!hasMore) {
    return (
      <div className="py-12 text-center">
        <p className="text-zinc-500 dark:text-zinc-400">
          No more images to load
        </p>
      </div>
    );
  }

  return (
    <div ref={triggerRef} className="py-12">
      {isLoading && (
        <div className="flex items-center justify-center gap-3">
          <div className="h-8 w-8 animate-spin rounded-full border-4 border-zinc-200 border-t-zinc-800 dark:border-zinc-700 dark:border-t-zinc-200" />
          <p className="text-zinc-600 dark:text-zinc-400">
            Loading more images...
          </p>
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
git add components/InfiniteScrollTrigger.tsx
git commit -m "feat: add InfiniteScrollTrigger with Intersection Observer"
```

---

## Task 5: Create ImageGrid Component with State Management

**Files:**
- Create: `components/ImageGrid.tsx`

**Step 1: Build main grid component with infinite scroll logic**

Create `components/ImageGrid.tsx`:
```typescript
'use client';

import { useState, useCallback } from 'react';
import { PicsumImage } from '@/types/picsum';
import { fetchPicsumImages } from '@/lib/picsum-api';
import ImageCard from './ImageCard';
import InfiniteScrollTrigger from './InfiniteScrollTrigger';

interface ImageGridProps {
  initialImages: PicsumImage[];
  initialPage: number;
  imagesPerPage: number;
}

export default function ImageGrid({
  initialImages,
  initialPage,
  imagesPerPage,
}: ImageGridProps) {
  const [images, setImages] = useState<PicsumImage[]>(initialImages);
  const [page, setPage] = useState(initialPage);
  const [isLoading, setIsLoading] = useState(false);
  const [hasMore, setHasMore] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const loadMore = useCallback(async () => {
    if (isLoading || !hasMore) return;

    setIsLoading(true);
    setError(null);

    try {
      const nextPage = page + 1;
      const newImages = await fetchPicsumImages({
        page: nextPage,
        limit: imagesPerPage,
      });

      // Picsum API returns empty array when no more images
      if (newImages.length === 0) {
        setHasMore(false);
      } else {
        setImages((prev) => [...prev, ...newImages]);
        setPage(nextPage);
      }
    } catch (err) {
      const errorMessage =
        err instanceof Error ? err.message : 'Failed to load more images';
      setError(errorMessage);
      console.error('Error loading more images:', err);
    } finally {
      setIsLoading(false);
    }
  }, [page, isLoading, hasMore, imagesPerPage]);

  return (
    <div className="w-full">
      {/* Image Grid */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5">
        {images.map((image) => (
          <ImageCard key={image.id} image={image} />
        ))}
      </div>

      {/* Error Message */}
      {error && (
        <div className="my-8 rounded-lg bg-red-50 p-4 dark:bg-red-900/20">
          <p className="text-center text-red-600 dark:text-red-400">
            {error}
          </p>
          <button
            onClick={loadMore}
            className="mt-2 w-full rounded-md bg-red-100 px-4 py-2 text-sm font-medium text-red-700 hover:bg-red-200 dark:bg-red-900/40 dark:text-red-300 dark:hover:bg-red-900/60"
          >
            Try Again
          </button>
        </div>
      )}

      {/* Infinite Scroll Trigger */}
      <InfiniteScrollTrigger
        onIntersect={loadMore}
        isLoading={isLoading}
        hasMore={hasMore}
      />
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
git add components/ImageGrid.tsx
git commit -m "feat: add ImageGrid with infinite scroll state management"
```

---

## Task 6: Update Root Page with SSR Initial Load

**Files:**
- Modify: `app/page.tsx` (replace entire file)
- Modify: `app/layout.tsx:14-15`

**Step 1: Replace root page with image grid**

Replace entire `app/page.tsx`:
```typescript
import { fetchPicsumImages } from '@/lib/picsum-api';
import ImageGrid from '@/components/ImageGrid';

const IMAGES_PER_PAGE = 30;
const INITIAL_PAGE = 1;

export default async function Home() {
  // Server-side fetch for initial page load
  const initialImages = await fetchPicsumImages({
    page: INITIAL_PAGE,
    limit: IMAGES_PER_PAGE,
  });

  return (
    <div className="min-h-screen bg-white dark:bg-zinc-950">
      {/* Header */}
      <header className="border-b border-zinc-200 bg-white dark:border-zinc-800 dark:bg-zinc-900">
        <div className="mx-auto max-w-7xl px-4 py-6 sm:px-6 lg:px-8">
          <h1 className="text-3xl font-bold tracking-tight text-zinc-900 dark:text-zinc-50">
            Image Browser
          </h1>
          <p className="mt-2 text-sm text-zinc-600 dark:text-zinc-400">
            Infinite scrolling photo gallery powered by Picsum Photos
          </p>
        </div>
      </header>

      {/* Main Content */}
      <main className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
        <ImageGrid
          initialImages={initialImages}
          initialPage={INITIAL_PAGE}
          imagesPerPage={IMAGES_PER_PAGE}
        />
      </main>
    </div>
  );
}
```

**Step 2: Update metadata in layout**

Modify `app/layout.tsx:14-15`:
```typescript
export const metadata: Metadata = {
  title: "Image Browser - Infinite Scrolling Gallery",
  description: "Browse beautiful photos with infinite scrolling powered by Picsum Photos",
};
```

**Step 3: Verify type safety**

Run: `npx tsc --noEmit`

Expected: `Found 0 errors`

**Step 4: Lint verification**

Run: `npm run lint -- --max-warnings 0`

Expected: `✔ No ESLint warnings or errors`

**Step 5: Build verification**

Run: `npm run build`

Expected: Successful build with route `/` listed in output showing as SSR (Server Side Rendered)

**Step 6: Runtime verification**

Start dev server and test the endpoint:
```bash
npm run dev
```

Wait 5 seconds for server to start, then in a new terminal:
```bash
curl http://localhost:3000 | head -50
```

Expected: HTML with "Image Browser" title and initial image grid markup

**Step 7: Commit**
```bash
git add app/page.tsx app/layout.tsx
git commit -m "feat: implement infinite scroll image grid on root page with SSR"
```

---

## Task 7: Add Loading and Error States

**Files:**
- Create: `app/loading.tsx`
- Create: `app/error.tsx`

**Step 1: Create loading skeleton**

Create `app/loading.tsx`:
```typescript
export default function Loading() {
  return (
    <div className="min-h-screen bg-white dark:bg-zinc-950">
      {/* Header Skeleton */}
      <header className="border-b border-zinc-200 bg-white dark:border-zinc-800 dark:bg-zinc-900">
        <div className="mx-auto max-w-7xl px-4 py-6 sm:px-6 lg:px-8">
          <div className="h-9 w-48 animate-pulse rounded bg-zinc-200 dark:bg-zinc-700" />
          <div className="mt-2 h-5 w-96 animate-pulse rounded bg-zinc-200 dark:bg-zinc-700" />
        </div>
      </header>

      {/* Grid Skeleton */}
      <main className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5">
          {Array.from({ length: 30 }).map((_, i) => (
            <div
              key={i}
              className="aspect-[3/2] animate-pulse rounded-lg bg-zinc-200 dark:bg-zinc-800"
            />
          ))}
        </div>
      </main>
    </div>
  );
}
```

**Step 2: Create error boundary**

Create `app/error.tsx`:
```typescript
'use client';

import { useEffect } from 'react';

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error('Application error:', error);
  }, [error]);

  return (
    <div className="flex min-h-screen items-center justify-center bg-white dark:bg-zinc-950">
      <div className="mx-auto max-w-md px-4 text-center">
        <div className="mb-6 text-6xl">⚠️</div>
        <h2 className="mb-4 text-2xl font-bold text-zinc-900 dark:text-zinc-50">
          Something went wrong!
        </h2>
        <p className="mb-6 text-zinc-600 dark:text-zinc-400">
          {error.message || 'Failed to load images. Please try again.'}
        </p>
        <button
          onClick={reset}
          className="rounded-lg bg-zinc-900 px-6 py-3 font-medium text-white transition-colors hover:bg-zinc-700 dark:bg-zinc-50 dark:text-zinc-900 dark:hover:bg-zinc-200"
        >
          Try Again
        </button>
      </div>
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

**Step 5: Build verification**

Run: `npm run build`

Expected: Successful build

**Step 6: Commit**
```bash
git add app/loading.tsx app/error.tsx
git commit -m "feat: add loading skeleton and error boundary"
```

---

## Task 8: Add Responsive Design Improvements

**Files:**
- Modify: `app/globals.css` (add custom utilities)

**Step 1: Add smooth scrolling and custom utilities**

Append to `app/globals.css`:
```css

/* Smooth scrolling for better UX */
html {
  scroll-behavior: smooth;
}

/* Custom scrollbar for webkit browsers */
@media (min-width: 768px) {
  ::-webkit-scrollbar {
    width: 12px;
  }

  ::-webkit-scrollbar-track {
    @apply bg-zinc-100 dark:bg-zinc-900;
  }

  ::-webkit-scrollbar-thumb {
    @apply rounded-full bg-zinc-300 dark:bg-zinc-700;
  }

  ::-webkit-scrollbar-thumb:hover {
    @apply bg-zinc-400 dark:bg-zinc-600;
  }
}

/* Prevent layout shift during image loading */
img {
  max-width: 100%;
  height: auto;
}

/* Better focus states for accessibility */
*:focus-visible {
  @apply outline-2 outline-offset-2 outline-zinc-900 dark:outline-zinc-50;
}
```

**Step 2: Verify styles compile**

Run: `npm run build`

Expected: Successful build with no CSS errors

**Step 3: Lint verification**

Run: `npm run lint -- --max-warnings 0`

Expected: `✔ No ESLint warnings or errors`

**Step 4: Commit**
```bash
git add app/globals.css
git commit -m "feat: add responsive design improvements and custom scrollbar"
```

---

## Task 9: Final Testing and Verification

**Files:**
- None (testing only)

**Step 1: Clean build verification**

Run: `rm -rf .next && npm run build`

Expected: Successful production build with:
- Route `/` shows as `○` (Static) or `ƒ` (Dynamic)
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

**Step 5: Manual testing checklist**

Open http://localhost:3000 in browser and verify:
- [ ] Initial page loads with 30 images in a responsive grid
- [ ] Images have loading skeletons before displaying
- [ ] Scrolling to bottom automatically loads more images
- [ ] Loading indicator appears while fetching
- [ ] Hover on images shows author information
- [ ] Grid is responsive (1 column on mobile, up to 5 on desktop)
- [ ] Dark mode works correctly
- [ ] No console errors

**Step 6: Production build test**

Run: `npm run build && npm start`

Expected: Production server runs without errors

**Step 7: Create final commit if any fixes were needed**

If manual testing revealed issues that were fixed:
```bash
git add .
git commit -m "fix: address issues found in manual testing"
```

---

## Summary

This plan implements a production-ready infinite scrolling image grid with:

✅ **Type Safety:** Full TypeScript coverage with strict typing  
✅ **Performance:** SSR for initial load, lazy loading for images, optimized API calls  
✅ **UX:** Loading states, error handling, smooth infinite scroll  
✅ **Responsive:** Mobile-first design with adaptive grid (1-5 columns)  
✅ **Accessibility:** Focus states, semantic HTML, alt text  
✅ **Developer Experience:** Clean component architecture, error boundaries, proper state management

**Total estimated time:** 35-45 minutes for all 9 tasks

**Key Features Implemented:**
- Server-side rendering for initial 30 images
- Client-side infinite scroll using Intersection Observer
- Responsive grid layout (1-5 columns based on screen size)
- Image lazy loading with loading skeletons
- Hover effects showing author information
- Error handling with retry functionality
- Dark mode support
- Custom scrollbar styling
- Loading and error boundaries
