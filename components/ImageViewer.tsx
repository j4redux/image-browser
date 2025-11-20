'use client';

import { useState } from 'react';
import ImageToolbar from './ImageToolbar';

interface ImageViewerProps {
  imageUrl: string;
  imageId: string;
  author: string;
  alt: string;
}

const MIN_ERROR_CONTAINER_HEIGHT = 400;

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
      <div className="relative overflow-hidden rounded-lg bg-zinc-100 dark:bg-zinc-800">
        {isLoading && (
          <div className="absolute inset-0 flex items-center justify-center">
            <div className="h-12 w-12 animate-spin rounded-full border-4 border-zinc-200 border-t-zinc-800 dark:border-zinc-700 dark:border-t-zinc-200" />
          </div>
        )}

        {hasError ? (
          <div
            className="flex flex-col items-center justify-center gap-4"
            style={{ minHeight: `${MIN_ERROR_CONTAINER_HEIGHT}px` }}
          >
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

      <div className="space-y-4">
        <ImageToolbar
          imageUrl={currentImageUrl}
          imageId={imageId}
          author={author}
          onImageChange={handleImageChange}
        />

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
