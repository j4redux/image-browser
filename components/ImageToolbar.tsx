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
