List Images
Get a list of images by using the /v2/list endpoint.

https://picsum.photos/v2/list
The API will return 30 items per page by default.

To request another page, use the ?page parameter.

To change the amount of items per page, use the ?limit parameter.

https://picsum.photos/v2/list?page=2&limit=100
The Link header includes pagination information about the next/previous pages

[
    {
        "id": "0",
        "author": "Alejandro Escamilla",
        "width": 5616,
        "height": 3744,
        "url": "https://unsplash.com/...",
        "download_url": "https://picsum.photos/..."
    }
]