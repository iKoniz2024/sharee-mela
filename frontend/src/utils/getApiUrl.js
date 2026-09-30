// export function getApiUrl() {
//   let url = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000/api";
//   url = url.trim().replace(/\/+$/, "");
//   if (!url.endsWith("/api")) {
//     url += "/api";
//   }
//   return url;
// }


export function getApiUrl() {
  if (typeof window === "undefined") {
    // Server side: Force 127.0.0.1 to avoid Node.js 18+ IPv6 (::1) 3-second DNS connection fallback timeout
    let serverUrl = process.env.NEXT_PUBLIC_API_URL || process.env.INTERNAL_API_URL || "http://127.0.0.1:5000/api";
    serverUrl = serverUrl.replace("localhost", "127.0.0.1").trim().replace(/\/+$/, "");
    if (!serverUrl.endsWith("/api")) {
      serverUrl += "/api";
    }
    return serverUrl;
  }

  // Client side (browser)
  if (window.location.hostname === "localhost" || window.location.hostname === "127.0.0.1") {
    return "http://localhost:5000/api";
  }

  let url = process.env.NEXT_PUBLIC_API_URL || process.env.INTERNAL_API_URL;

  if (!url) {
    url = process.env.NODE_ENV === "production"
      ? "https://sharee-mela-server.vercel.app/api"
      : "http://localhost:5000/api";
  }

  url = url.trim().replace(/\/+$/, "");

  if (!url.endsWith("/api")) {
    url += "/api";
  }

  return url;
}