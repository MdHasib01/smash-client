/** Save a generated file to disk. */

const safeName = (value: string) =>
  value
    .replace(/[^a-z0-9_-]+/gi, '_')
    .replace(/^_+|_+$/g, '')
    .slice(0, 60) || 'smash';

/** A readable file name from a title plus the URL's own extension. */
export function fileNameFor(title: string, url?: string) {
  const ext = url?.match(/\.(png|jpe?g|webp|gif|svg|mp4|webm|mp3|wav)(?:$|\?)/i)?.[1] ?? 'png';
  return `${safeName(title)}.${ext}`;
}

function triggerLink(href: string, download?: string) {
  const a = document.createElement('a');
  a.href = href;
  if (download) a.download = download;
  a.rel = 'noopener';
  document.body.appendChild(a);
  a.click();
  a.remove();
}

export async function downloadUrl(url: string, filename: string) {
  // Cloudinary can serve the file as an attachment itself - no CORS round trip.
  if (/res\.cloudinary\.com\/[^/]+\/(image|video|raw)\/upload\//.test(url)) {
    const base = safeName(filename.replace(/\.[^.]+$/, ''));
    triggerLink(url.replace('/upload/', `/upload/fl_attachment:${base}/`));
    return;
  }

  try {
    const response = await fetch(url);
    if (!response.ok) throw new Error(String(response.status));
    const objectUrl = URL.createObjectURL(await response.blob());
    triggerLink(objectUrl, filename);
    setTimeout(() => URL.revokeObjectURL(objectUrl), 10_000);
  } catch {
    // Cross-origin without CORS: let the browser open it instead.
    window.open(url, '_blank', 'noopener');
  }
}

export async function copyText(value: string) {
  try {
    await navigator.clipboard.writeText(value);
    return true;
  } catch {
    return false;
  }
}
