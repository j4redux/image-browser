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
