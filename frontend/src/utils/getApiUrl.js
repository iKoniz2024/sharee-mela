export function getApiUrl() {
  if (typeof window === "undefined") {
    // Server side: Force 127.0.0.1 to avoid Node.js 18+ IPv6 (::1) DNS connection fallback timeout
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

  // Production browser environment
  let url = process.env.NEXT_PUBLIC_API_URL || process.env.INTERNAL_API_URL;

  if (!url) {
    // Dynamically fallback to relative /api on the current origin instead of external vercel server
    url = `${window.location.origin}/api`;
  }

  url = url.trim().replace(/\/+$/, "");

  if (!url.endsWith("/api")) {
    url += "/api";
  }

  return url;
}