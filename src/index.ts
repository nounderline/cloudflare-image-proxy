interface Env {}

const HeaderWhitelist = new Set([
    "connection",
    "content-disposition",
    "content-type",
    "content-length",
    "cf-polished",
    "date",
    "status",
    "transfer-encoding",
])

function applyResponseHeadersWhitelisting(res: Response) {
    const headers = Object.fromEntries(res.headers.entries())
    const keys = Object.keys(headers)

    for (const key of keys) {
        if (!HeaderWhitelist.has(key)) {
            res.headers.delete(key)
        }
    }
}

export default {
    async fetch(
        request: Request,
        env: Env,
        ctx: ExecutionContext
    ): Promise<Response> {
        const requestUrl = new URL(request.url)

        if (request.method !== "GET") {
            // return method not allowed
            return new Response(null, {
                status: 405,
            })
        }

        if (requestUrl.pathname === "/favicon.ico") {
            return new Response(null, {
                status: 404,
            })
        }

        const pathWithParams = requestUrl.pathname + requestUrl.search
        const [, optionsString, targetUrl] = pathWithParams.match(
            /^\/([^/]*)\/(.*)/
        ) || ["", ""]

        console.log({ optionsString, targetUrl })

        const accept = request.headers.get("Accept") || ""

        let format = "auto"

        if (/image\/avif/.test(accept)) {
            format = "avif"
        } else if (/image\/webp/.test(accept)) {
            format = "webp"
        }

        const options = Object.fromEntries(
            optionsString.split(",").map((v) => v.split("="))
        )
        let response = await fetch(targetUrl, {
            cf: {
                cacheEverything: true,
                image: {
                    ...options,
                    format,
                },
            },
        })

        if (!response.ok) {
            console.debug("Resizing failed. Proceeding without resizing.")

            response = await fetch(targetUrl)
        }

        const clonedResponse = new Response(response.body, response)

        applyResponseHeadersWhitelisting(clonedResponse)

        clonedResponse.headers.set(
            "cache-control",
            "public, immutable, s-maxage=31536000, max-age=31536000, stale-while-revalidate=60"
        )

        return clonedResponse
    },
}
