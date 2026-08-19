const API_BASE_URL = import.meta.env.VITE_API_BASE_URL as string | undefined;

if (!API_BASE_URL) {
  // Fails loudly at import time rather than producing confusing relative-URL
  // fetch errors later — every page that reads from the API depends on this.
  throw new Error(
    'VITE_API_BASE_URL is not set. Copy front-end/.env.example to front-end/.env and point it at the backend (e.g. http://localhost:3000/api).',
  );
}

export class ApiError extends Error {
  status: number;
  constructor(status: number, message: string) {
    super(message);
    this.status = status;
  }
}

/** Matches backend IResponse<T> (utils/interfaces/common.ts). */
export interface ApiResponse<T> {
  statusCode: number;
  message: string;
  data?: T;
}

/** Matches backend IPaged<T> (utils/interfaces/common.ts). */
export interface ApiPaged<T> extends ApiResponse<T> {
  totalItems: number;
  currentPage: number;
  itemsPerPage: number;
}

interface ApiFetchOptions {
  method?: 'GET' | 'POST' | 'PUT' | 'DELETE';
  body?: unknown;
  /**
   * Raw JWT, sent as-is in the Authorization header — the backend's
   * expressAuthentication reads the header directly via jwt.verify with no
   * "Bearer " prefix stripping (see backend/src/utils/authentication.ts),
   * so callers must not prepend one either.
   */
  token?: string | null;
}

/**
 * Builds a multipart FormData body for endpoints wired to the backend's
 * Cloudinary upload middleware (multer — see backend/src/utils/cloudinary.ts
 * and company.middlewares.ts's appendPhotoAttachments/appendFeaturedImage).
 * Any field name present in `files` is uploaded as a real file and excluded
 * from the text fields, since the backend overwrites it with the uploaded
 * asset's URL anyway.
 */
export function toFormData(fields: Record<string, unknown>, files: Record<string, File>): FormData {
  const fd = new FormData();
  for (const [key, value] of Object.entries(fields)) {
    if (value === undefined || value === null || key in files) continue;
    fd.append(key, String(value));
  }
  for (const [key, file] of Object.entries(files)) {
    fd.append(key, file);
  }
  return fd;
}

export async function apiFetch<T>(path: string, options: ApiFetchOptions = {}): Promise<T> {
  const { method = 'GET', body, token } = options;
  const headers: Record<string, string> = {};
  if (token) headers['Authorization'] = token;

  let requestBody: BodyInit | undefined;
  if (body instanceof FormData) {
    requestBody = body;
  } else if (body !== undefined) {
    headers['Content-Type'] = 'application/json';
    requestBody = JSON.stringify(body);
  }

  let response: Response;
  try {
    response = await fetch(`${API_BASE_URL}${path}`, { method, headers, body: requestBody });
  } catch {
    throw new ApiError(0, 'Could not reach the server. Check your connection and try again.');
  }

  const payload = await response.json().catch(() => null);
  if (!response.ok) {
    throw new ApiError(response.status, payload?.message || `Request failed (${response.status})`);
  }
  return payload as T;
}
