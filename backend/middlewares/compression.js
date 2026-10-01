const zlib = require("zlib");

/**
 * Native Node.js zlib compression middleware for Express.
 * Compresses HTTP GET/POST JSON & text responses > 1KB when client supports gzip.
 */
function compressionMiddleware(req, res, next) {
  const acceptEncoding = req.headers["accept-encoding"] || "";

  if (!acceptEncoding.includes("gzip") || req.method === "HEAD") {
    return next();
  }

  const rawSend = res.send;

  res.send = function (body) {
    if (!body || res.headersSent) {
      return rawSend.call(this, body);
    }

    const contentType = res.getHeader("Content-Type") || "";
    const isCompressible =
      typeof body === "string" ||
      Buffer.isBuffer(body) ||
      contentType.includes("json") ||
      contentType.includes("text") ||
      contentType.includes("javascript");

    if (!isCompressible) {
      return rawSend.call(this, body);
    }

    const buffer = Buffer.isBuffer(body)
      ? body
      : typeof body === "string"
      ? Buffer.from(body)
      : Buffer.from(JSON.stringify(body));

    // Only compress responses larger than 1KB
    if (buffer.length < 1024) {
      return rawSend.call(this, body);
    }

    res.setHeader("Content-Encoding", "gzip");
    res.removeHeader("Content-Length");

    zlib.gzip(buffer, (err, compressed) => {
      if (err) {
        return rawSend.call(this, body);
      }
      res.setHeader("Content-Length", compressed.length);
      rawSend.call(this, compressed);
    });
  };

  next();
}

module.exports = compressionMiddleware;
