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
