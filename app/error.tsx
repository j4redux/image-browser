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
