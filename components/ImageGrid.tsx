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
