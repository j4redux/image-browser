import { fetchPicsumImages } from '@/lib/picsum-api';
import ImageGrid from '@/components/ImageGrid';

const IMAGES_PER_PAGE = 30;
const INITIAL_PAGE = 1;

export default async function Home() {
  // Server-side fetch for initial page load with revalidation
  const initialImages = await fetchPicsumImages(
    {
      page: INITIAL_PAGE,
      limit: IMAGES_PER_PAGE,
    },
    'force-cache'
  );

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
