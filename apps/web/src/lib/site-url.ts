export const siteUrl = (
  process.env.NEXT_PUBLIC_SITE_URL ??
  process.env.APP_WEB_URL ??
  "http://localhost:3000"
).replace(/\/$/, "");

export function absoluteUrl(path = "/") {
  const normalizedPath = path.startsWith("/") ? path : `/${path}`;

  return `${siteUrl}${normalizedPath}`;
}
