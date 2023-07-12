# Cloudflare Image Proxy

A Cloudflare Worker replicating [Cloudflare Image Resizing API][0]
with support for large images.

## How does it work?

All requests are compatible with Cloudflare Image Resizing [URL format][1].
In case of images bigger than 100 megapixels, request will be [redirected][2] to
original resource to avoid [9413 error][3].

[0]: https://developers.cloudflare.com/images/image-resizing/
[1]: https://developers.cloudflare.com/images/image-resizing/url-format/
[2]: https://developers.cloudflare.com/images/image-resizing/resize-with-workers/#onerrorredirect
[3]: https://developers.cloudflare.com/images/image-resizing/troubleshooting/


## Development

Follow standard Wrangler workflow. For more:

```
npx wrangler --help
```
