import { PicsumImage } from '@/types/picsum';

interface ImageMetadataProps {
  image: PicsumImage;
}

export default function ImageMetadata({ image }: ImageMetadataProps) {
  return (
    <div className="space-y-4 rounded-lg border border-zinc-200 bg-white p-6 dark:border-zinc-800 dark:bg-zinc-900">
      <h2 className="text-lg font-semibold text-zinc-900 dark:text-zinc-50">
        Image Details
      </h2>

      <dl className="space-y-3">
        {/* Author */}
        <div>
          <dt className="text-sm font-medium text-zinc-500 dark:text-zinc-400">
            Author
          </dt>
          <dd className="mt-1 text-sm text-zinc-900 dark:text-zinc-50">
            {image.author}
          </dd>
        </div>

        {/* Dimensions */}
        <div>
          <dt className="text-sm font-medium text-zinc-500 dark:text-zinc-400">
            Dimensions
          </dt>
          <dd className="mt-1 text-sm text-zinc-900 dark:text-zinc-50">
            {image.width} × {image.height} pixels
          </dd>
        </div>

        {/* Image ID */}
        <div>
          <dt className="text-sm font-medium text-zinc-500 dark:text-zinc-400">
            Image ID
          </dt>
          <dd className="mt-1 font-mono text-sm text-zinc-900 dark:text-zinc-50">
            {image.id}
          </dd>
        </div>

        {/* Original URL */}
        <div>
          <dt className="text-sm font-medium text-zinc-500 dark:text-zinc-400">
            Original Source
          </dt>
          <dd className="mt-1">
            <a
              href={image.url}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-1 text-sm text-blue-600 hover:text-blue-800 dark:text-blue-400 dark:hover:text-blue-300"
            >
              View on Unsplash
              <svg
                className="h-4 w-4"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14"
                />
              </svg>
            </a>
          </dd>
        </div>

        {/* Download URL */}
        <div>
          <dt className="text-sm font-medium text-zinc-500 dark:text-zinc-400">
            Download URL
          </dt>
          <dd className="mt-1">
            <code className="block break-all rounded bg-zinc-100 p-2 text-xs text-zinc-800 dark:bg-zinc-800 dark:text-zinc-200">
              {image.download_url}
            </code>
          </dd>
        </div>
      </dl>
    </div>
  );
}
