import DOMPurify from 'dompurify';

/**
 * Sanitizes admin/merchant-authored HTML (product descriptions, news
 * content, announcements) before rendering via dangerouslySetInnerHTML.
 * Allowlist matches the basic formatting the admin forms actually support
 * (see AdminProductForm.tsx / AdminNewsForm.tsx's "basic tags only" note) —
 * no scripts, iframes, forms, or event handlers.
 */
export function sanitizeHtml(html: string): string {
  return DOMPurify.sanitize(html, {
    ALLOWED_TAGS: [
      'p', 'br', 'strong', 'em', 'b', 'i', 'u',
      'ul', 'ol', 'li',
      'h1', 'h2', 'h3', 'h4',
      'a', 'blockquote', 'span',
    ],
    ALLOWED_ATTR: ['href', 'target', 'rel'],
  });
}
