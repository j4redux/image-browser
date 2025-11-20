# Picsum Photos - Single Image Endpoint

## Get Image Info

Get information about a specific image by using the `/id/{id}/info` endpoint.

**Note:** This endpoint does NOT use the `/v2` prefix.

### Endpoint
```
https://picsum.photos/id/{id}/info
```

### Example Request
```
https://picsum.photos/id/237/info
```

### Response Format
```json
{
  "id": "237",
  "author": "André Spieker",
  "width": 3500,
  "height": 2095,
  "url": "https://unsplash.com/photos/8wTPqxlnKM4",
  "download_url": "https://picsum.photos/id/237/3500/2095"
}
```

### Error Handling
- **404 Not Found**: Image ID does not exist
- **500 Server Error**: API service unavailable

## Image Manipulation

### Resized Images
Get a specific image at a custom size:
```
https://picsum.photos/id/{id}/{width}/{height}
```

### Example
```
https://picsum.photos/id/237/800/600
```
Returns image #237 at 800×600 pixels

### CORS Support
The Picsum API supports CORS for client-side image manipulation. Set `crossOrigin="anonymous"` on image elements to enable canvas operations.

```typescript
const img = new Image();
img.crossOrigin = 'anonymous';
img.src = 'https://picsum.photos/id/237/800/600';
```
