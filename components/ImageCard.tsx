'use client';

import { PicsumImage } from '@/types/picsum';
import { getOptimizedImageUrl } from '@/lib/picsum-api';
import { useState } from 'react';
import Link from 'next/link';

interface ImageCardProps {
  image: PicsumImage;
}

const CARD_OPTIMIZED_WIDTH = 600;
const CARD_OPTIMIZED_HEIGHT = 400;

export default function ImageCard({ image }: ImageCardProps) {
  const [isLoading, setIsLoading] = useState(true);
  const [hasError, setHasError] = useState(false);

  // Use fixed aspect ratio matching optimized image dimensions
  const aspectRatio = CARD_OPTIMIZED_WIDTH / CARD_OPTIMIZED_HEIGHT;
  const optimizedUrl = getOptimizedImageUrl(
    image.id,
    CARD_OPTIMIZED_WIDTH,
    CARD_OPTIMIZED_HEIGHT
  );

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
