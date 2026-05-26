/**
 * Resolves the absolute API URL using the VITE_API_URL environment variable.
 * Intelligently prevents duplicate API path segments (like /api/v1) and
 * falls back to relative paths for local development proxy if VITE_API_URL is not set.
 */
export function getApiUrl(path: string): string {
  const envUrl = import.meta.env.VITE_API_URL || "";

  // Ensure the path starts with a slash
  const cleanPath = path.startsWith("/") ? path : `/${path}`;

  if (!envUrl) {
    return cleanPath;
  }

  // Remove trailing slash from the base URL
  const base = envUrl.endsWith("/") ? envUrl.slice(0, -1) : envUrl;

  // Prevent duplicating '/api/v1' if both the base URL and the path contain it
  if (base.endsWith("/api/v1") && cleanPath.startsWith("/api/v1")) {
    return `${base}${cleanPath.substring(7)}`;
  }

  // Prevent duplicating '/api' if both the base URL and the path contain it
  if (base.endsWith("/api") && cleanPath.startsWith("/api")) {
    return `${base}${cleanPath.substring(4)}`;
  }

  return `${base}${cleanPath}`;
}
