import { notFound } from 'next/navigation';
import Link from 'next/link';
import { fetchSingleImage, getOptimizedImageUrl } from '@/lib/picsum-api';
import ImageMetadata from '@/components/ImageMetadata';
import ImageViewer from '@/components/ImageViewer';
import type { Metadata } from 'next';

interface PageProps {
  params: Promise<{ id: string }>;
}

const DETAIL_IMAGE_WIDTH = 1200;
const DETAIL_IMAGE_HEIGHT = 800;

/**
 * Generate metadata for SEO
 */
export async function generateMetadata({
  params,
}: PageProps): Promise<Metadata> {
  const { id } = await params;

  try {
    const image = await fetchSingleImage(id);
    return {
      title: `Photo by ${image.author} - Image Browser`,
      description: `View and download this ${image.width}×${image.height} photo by ${image.author}`,
    };
  } catch {
    return {
      title: 'Image Not Found - Image Browser',
      description: 'The requested image could not be found',
    };
  }
}

export default async function ImageDetailsPage({ params }: PageProps) {
  const { id } = await params;

  // Fetch image data on the server
  let image;
  try {
    image = await fetchSingleImage(id);
  } catch (error) {
    console.error(`Failed to fetch image ${id}:`, error);
    notFound();
  }

  const displayUrl = getOptimizedImageUrl(
    image.id,
    DETAIL_IMAGE_WIDTH,
    DETAIL_IMAGE_HEIGHT
  );

  return (
    <div className="min-h-screen bg-white dark:bg-zinc-950">
      {/* Header with Back Button */}
      <header className="border-b border-zinc-200 bg-white dark:border-zinc-800 dark:bg-zinc-900">
        <div className="mx-auto max-w-7xl px-4 py-4 sm:px-6 lg:px-8">
          <Link
            href="/"
            className="inline-flex items-center gap-2 text-sm font-medium text-zinc-600 transition-colors hover:text-zinc-900 dark:text-zinc-400 dark:hover:text-zinc-50"
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
      </header>

      {/* Main Content */}
      <main className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
        <div className="grid gap-8 lg:grid-cols-3">
          {/* Image Viewer - Takes 2 columns on large screens */}
          <div className="lg:col-span-2">
            <ImageViewer
              imageUrl={displayUrl}
              imageId={image.id}
              author={image.author}
              alt={`Photo by ${image.author}`}
            />
          </div>

          {/* Metadata Sidebar - Takes 1 column on large screens */}
          <div className="lg:col-span-1">
            <ImageMetadata image={image} />
          </div>
        </div>
      </main>
    </div>
  );
}
