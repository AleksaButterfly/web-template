/**
 * Helpers for sharing a URL (e.g. a listing or profile) to external channels.
 *
 * The functions here are intentionally framework-agnostic and side-effect-light so they can be
 * unit tested in isolation. UI concerns (icons, translated labels, modal markup) live in the
 * ShareButton component; this module only knows how to build share URLs, talk to the native
 * Web Share API, and copy text to the clipboard.
 */

const canUseDOM = typeof window !== 'undefined' && typeof navigator !== 'undefined';

/**
 * The set of external share channels supported in the fallback UI, in display order.
 *
 * Each target builds its share URL from already-prepared (and, where relevant, already-translated)
 * strings — the component passes `url`, `text`, `subject` and `media` in; this module does not
 * format copy. Instagram/TikTok/YouTube are intentionally omitted: they don't support sharing an
 * arbitrary URL via an intent link.
 *
 * @type {Array<{id: string, isMailto?: boolean, buildUrl: (params: ShareParams) => string}>}
 */
export const SHARE_TARGETS = [
  {
    id: 'whatsapp',
    buildUrl: ({ url, text }) =>
      `https://wa.me/?text=${encodeURIComponent(text ? `${text} ${url}` : url)}`,
  },
  {
    id: 'x',
    buildUrl: ({ url, text }) =>
      `https://twitter.com/intent/tweet?url=${encodeURIComponent(url)}` +
      (text ? `&text=${encodeURIComponent(text)}` : ''),
  },
  {
    id: 'facebook',
    buildUrl: ({ url }) =>
      `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(url)}`,
  },
  {
    id: 'pinterest',
    buildUrl: ({ url, text, media }) =>
      `https://pinterest.com/pin/create/button/?url=${encodeURIComponent(url)}` +
      (text ? `&description=${encodeURIComponent(text)}` : '') +
      (media ? `&media=${encodeURIComponent(media)}` : ''),
  },
  {
    id: 'email',
    isMailto: true,
    buildUrl: ({ url, subject, text }) =>
      `mailto:?subject=${encodeURIComponent(subject || '')}` +
      `&body=${encodeURIComponent(text ? `${text}\n\n${url}` : url)}`,
  },
];

/**
 * @typedef {Object} ShareParams
 * @property {string} url - The (preferably canonical, absolute) URL to share
 * @property {string} [title] - A short title for the shared resource
 * @property {string} [text] - Free-form text used as the share message / description
 * @property {string} [subject] - Email subject line (email target only)
 * @property {string} [media] - Absolute image URL (Pinterest target only)
 */

/**
 * Whether the native Web Share API is available for the given payload. When `navigator.canShare`
 * exists we let the browser validate the payload; otherwise the presence of `navigator.share` is
 * enough. Always false during server-side rendering.
 *
 * @param {ShareParams} [data] - Payload that would be passed to `navigator.share`
 * @returns {boolean}
 */
export const canNativeShare = data => {
  if (!canUseDOM || typeof navigator.share !== 'function') {
    return false;
  }
  if (typeof navigator.canShare === 'function' && data) {
    return navigator.canShare(data);
  }
  return true;
};

/**
 * Opens the native OS share sheet. The returned promise rejects with an `AbortError` if the user
 * dismisses the sheet — callers should treat that as a no-op rather than a failure.
 *
 * @param {ShareParams} data - Payload forwarded to `navigator.share`
 * @returns {Promise<void>}
 */
export const nativeShare = data => navigator.share(data);

/**
 * Copies the given text to the clipboard, preferring the async Clipboard API and falling back to a
 * hidden textarea + `document.execCommand('copy')` for insecure contexts and older browsers.
 *
 * @param {string} text - The text to copy
 * @returns {Promise<boolean>} Resolves true on success, false if copying is not possible
 */
export const copyToClipboard = async text => {
  if (!canUseDOM) {
    return false;
  }

  if (navigator.clipboard?.writeText) {
    try {
      await navigator.clipboard.writeText(text);
      return true;
    } catch (e) {
      // Fall through to the legacy approach (e.g. permission denied or insecure context).
    }
  }

  try {
    const textarea = document.createElement('textarea');
    textarea.value = text;
    // Keep it out of view and out of the layout / scroll.
    textarea.setAttribute('readonly', '');
    textarea.style.position = 'absolute';
    textarea.style.left = '-9999px';
    document.body.appendChild(textarea);
    textarea.select();
    const succeeded = document.execCommand('copy');
    document.body.removeChild(textarea);
    return succeeded;
  } catch (e) {
    return false;
  }
};

/**
 * Opens a share target in the appropriate way: `mailto:` targets navigate the current window so the
 * user's mail client opens, everything else opens in a new, isolated tab.
 *
 * @param {{isMailto?: boolean, buildUrl: (params: ShareParams) => string}} target - A SHARE_TARGETS entry
 * @param {ShareParams} params - Share payload forwarded to `target.buildUrl`
 * @returns {void}
 */
export const openShareTarget = (target, params) => {
  if (!canUseDOM) {
    return;
  }
  const href = target.buildUrl(params);
  if (target.isMailto) {
    window.location.href = href;
  } else {
    window.open(href, '_blank', 'noopener,noreferrer');
  }
};
