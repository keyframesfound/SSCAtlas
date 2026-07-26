import { Readable } from "node:stream";

const FORWARDED_HEADERS = [
  "content-type",
  "content-length",
  "accept-ranges",
  "content-range",
  "etag",
  "last-modified",
  "cache-control",
];

export default async function handler(req, res) {
  const upstreamUrl = process.env.CAMPUS_MODEL_UPSTREAM_URL;

  if (!upstreamUrl) {
    res.statusCode = 500;
    res.setHeader("content-type", "application/json");
    res.end(JSON.stringify({ error: "Missing CAMPUS_MODEL_UPSTREAM_URL" }));
    return;
  }

  try {
    const upstreamHeaders = {};
    if (req.headers.range) {
      upstreamHeaders.Range = req.headers.range;
    }

    const upstream = await fetch(upstreamUrl, {
      method: "GET",
      headers: upstreamHeaders,
    });

    if (!upstream.ok && upstream.status !== 206) {
      res.statusCode = upstream.status;
      res.setHeader("content-type", "application/json");
      res.end(
        JSON.stringify({
          error: `Upstream fetch failed with status ${upstream.status}`,
        }),
      );
      return;
    }

    res.statusCode = upstream.status;

    for (const headerName of FORWARDED_HEADERS) {
      const headerValue = upstream.headers.get(headerName);
      if (headerValue) {
        res.setHeader(headerName, headerValue);
      }
    }

    if (!res.getHeader("cache-control")) {
      res.setHeader("cache-control", "public, max-age=3600");
    }

    if (!upstream.body) {
      const bodyBuffer = Buffer.from(await upstream.arrayBuffer());
      res.end(bodyBuffer);
      return;
    }

    Readable.fromWeb(upstream.body).pipe(res);
  } catch (error) {
    res.statusCode = 502;
    res.setHeader("content-type", "application/json");
    res.end(
      JSON.stringify({
        error:
          error instanceof Error
            ? `Proxy request failed: ${error.message}`
            : "Proxy request failed.",
      }),
    );
  }
}
