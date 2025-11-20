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
          The image you&apos;re looking for doesn&apos;t exist or has been
          removed.
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
