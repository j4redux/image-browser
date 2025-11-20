# Image Browser

A Next.js image browsing application with infinite scroll and client-side image manipulation.

## Features

- 📸 **Infinite Scrolling Gallery** - Browse thousands of photos with automatic loading
- 🎨 **Client-Side Image Effects** - Apply grayscale and blur filters in real-time
- ⬇️ **Download Images** - Save images with proper filenames
- 📱 **Responsive Design** - Mobile-first approach, works on all screen sizes
- 🌙 **Dark Mode** - Automatic dark mode support
- ⚡ **Server-Side Rendering** - Fast initial page loads with SEO optimization
- 🔗 **Shareable Permalinks** - Direct links to individual images
- ♿ **Accessible** - Semantic HTML, ARIA labels, keyboard navigation

## Tech Stack

- **Framework:** [Next.js 16](https://nextjs.org) (App Router)
- **Styling:** [Tailwind CSS 4](https://tailwindcss.com)
- **Language:** [TypeScript](https://www.typescriptlang.org)
- **Image Processing:** Canvas API (no external dependencies)
- **Image Source:** [Picsum Photos API](https://picsum.photos)

## Getting Started

### Prerequisites

- Node.js 18+ and npm

### Installation

```bash
# Install dependencies
npm install

# Run development server
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) to view the application.

### Build for Production

```bash
# Create production build
npm run build

# Start production server
npm start
```

## Project Structure

```
app/
  page.tsx              # Home page with infinite scroll grid
  image/[id]/page.tsx   # Dynamic image details page
  loading.tsx           # Loading skeleton
  error.tsx             # Error boundary
  
components/
  ImageGrid.tsx         # Infinite scroll container
  ImageCard.tsx         # Individual image card with navigation
  ImageViewer.tsx       # Full image display with state management
  ImageToolbar.tsx      # Download/grayscale/blur action buttons
  ImageMetadata.tsx     # Image details sidebar
  
lib/
  picsum-api.ts         # Picsum Photos API client
  image-effects.ts      # Canvas-based image manipulation utilities
  
types/
  picsum.ts             # TypeScript type definitions
```

## How It Works

### Infinite Scroll

Uses the Intersection Observer API to detect when the user scrolls near the bottom of the page, triggering automatic loading of more images.

### Image Manipulation

All image effects (grayscale, blur) are processed client-side using the HTML5 Canvas API:

1. Load the image with CORS enabled
2. Draw it to a canvas element
3. Apply pixel manipulation or CSS filters
4. Export as a data URL for display/download

### Download Functionality

Downloads work by:
- Fetching the image and converting to a Blob
- Creating a temporary object URL
- Triggering a download with the proper filename
- Cleaning up the object URL to prevent memory leaks

## API Integration

This app uses the [Picsum Photos API](https://picsum.photos):

- `/v2/list` - Paginated list of images
- `/id/{id}/info` - Single image metadata (undocumented)
- `/id/{id}/{width}/{height}` - Resized images on-the-fly

## License

MIT
