import { apiFetch, ApiPaged, ApiResponse, toFormData } from './client';
import { NewsArticle } from '../data/mockData';

/** Backend TNews (backend/src/utils/interfaces/common.ts) — the raw API shape. */
interface ApiNews {
  id: string;
  title: string;
  slug: string;
  excerpt: string;
  content: string;
  featuredImage: string;
  category: 'PI_NETWORK' | 'GCV_MOVEMENT' | 'EVENTS' | 'COMMUNITY';
  author: string;
  publishedAt: string;
  readTime: string;
  viewCount: number;
  country?: string | null;
}

const CATEGORY_LABEL: Record<ApiNews['category'], NewsArticle['category']> = {
  PI_NETWORK: 'Pi Network',
  GCV_MOVEMENT: 'GCV Movement',
  EVENTS: 'Events',
  COMMUNITY: 'Community',
};

/**
 * Maps the backend's wire format to the frontend's existing `NewsArticle`
 * shape. `publishedAt` is trimmed to YYYY-MM-DD to match the mock data
 * convention the current UI already renders as plain text (News.tsx /
 * NewsDetail.tsx don't reformat it) — not fixing that display rough edge
 * here since it's a pre-existing UI choice, not something this pass changed.
 */
function toNewsArticle(n: ApiNews): NewsArticle {
  return {
    id: n.id,
    title: n.title,
    slug: n.slug,
    excerpt: n.excerpt,
    content: n.content,
    featuredImage: n.featuredImage,
    category: CATEGORY_LABEL[n.category],
    author: n.author,
    publishedAt: n.publishedAt.slice(0, 10),
    readTime: n.readTime,
    viewCount: n.viewCount,
    country: n.country ?? undefined,
  };
}

export async function getAllNews(params?: {
  searchq?: string;
  country?: string;
  category?: string;
  limit?: number;
  page?: number;
}): Promise<NewsArticle[]> {
  const query = new URLSearchParams();
  if (params?.searchq) query.set('searchq', params.searchq);
  if (params?.country) query.set('country', params.country);
  if (params?.category) query.set('category', params.category);
  if (params?.limit) query.set('limit', String(params.limit));
  if (params?.page) query.set('page', String(params.page));
  const qs = query.toString();

  const res = await apiFetch<ApiPaged<ApiNews[]>>(`/news${qs ? `?${qs}` : ''}`);
  return (res.data ?? []).map(toNewsArticle);
}

export async function getNewsCount(): Promise<number> {
  const res = await apiFetch<ApiPaged<ApiNews[]>>('/news?limit=1');
  return res.totalItems;
}

export async function getNewsBySlug(slug: string): Promise<NewsArticle | null> {
  try {
    const res = await apiFetch<ApiResponse<ApiNews>>(`/news/slug/${encodeURIComponent(slug)}`);
    return res.data ? toNewsArticle(res.data) : null;
  } catch {
    return null;
  }
}

// --- Admin CRUD ---

export type AdminNewsCategory = ApiNews['category'];

export type AdminNews = ApiNews;

export const NEWS_CATEGORIES: { value: AdminNewsCategory; label: string }[] = [
  { value: 'PI_NETWORK', label: 'Pi Network' },
  { value: 'GCV_MOVEMENT', label: 'GCV Movement' },
  { value: 'EVENTS', label: 'Events' },
  { value: 'COMMUNITY', label: 'Community' },
];

export async function getAdminNews(id: string): Promise<AdminNews> {
  const res = await apiFetch<ApiResponse<AdminNews>>(`/news/${id}`);
  return res.data!;
}

export interface NewsInput {
  title: string;
  slug: string;
  excerpt: string;
  content: string;
  featuredImage: string;
  category: AdminNewsCategory;
  author: string;
  readTime: string;
  country?: string;
}

export async function createNews(
  input: NewsInput,
  token: string,
  featuredImageFile?: File,
): Promise<AdminNews> {
  const body = featuredImageFile ? toFormData(input, { featuredImage: featuredImageFile }) : input;
  const res = await apiFetch<ApiResponse<AdminNews>>('/news', {
    method: 'POST',
    body,
    token,
  });
  return res.data!;
}

export async function updateNews(
  id: string,
  input: Partial<NewsInput>,
  token: string,
  featuredImageFile?: File,
): Promise<AdminNews> {
  const body = featuredImageFile ? toFormData(input, { featuredImage: featuredImageFile }) : input;
  const res = await apiFetch<ApiResponse<AdminNews>>(`/news/${id}`, {
    method: 'PUT',
    body,
    token,
  });
  return res.data!;
}

export async function deleteNews(id: string, token: string): Promise<void> {
  await apiFetch(`/news/${id}`, { method: 'DELETE', token });
}
