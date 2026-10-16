// Абсолютный адрес сайта — для metadataBase (Open Graph, canonical, hreflang).
// Vercel подставляет VERCEL_PROJECT_PRODUCTION_URL сам; для GitHub Pages и своего домена — NEXT_PUBLIC_SITE_URL.
const vercelUrl = process.env.VERCEL_PROJECT_PRODUCTION_URL;

export const siteUrl =
  process.env.NEXT_PUBLIC_SITE_URL ??
  (vercelUrl ? `https://${vercelUrl}` : 'http://localhost:3000');

export const basePath = process.env.NEXT_PUBLIC_BASE_PATH ?? '';

// Путь внутри сайта → путь с basePath (metadata сам basePath не добавляет).
export function withBasePath(path: string) {
  return `${basePath}${path}`;
}
