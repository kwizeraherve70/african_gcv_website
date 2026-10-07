import { apiFetch, ApiResponse } from './client';
import type { Announcement } from '../types/news';

export async function getAnnouncements(): Promise<Announcement[]> {
  const response = await apiFetch<ApiResponse<unknown>>('/announcements');
  if (!Array.isArray(response.data)) throw new Error('Invalid announcements response');
  return response.data.map((value: unknown): Announcement => {
    if (!value || typeof value !== 'object') throw new Error('Invalid announcement');
    const item = value as Record<string, unknown>;
    if (typeof item.id !== 'string' || typeof item.title !== 'string' ||
        typeof item.excerpt !== 'string' || typeof item.content !== 'string' ||
        typeof item.publishedAt !== 'string' || Number.isNaN(Date.parse(item.publishedAt)) ||
        (item.priority !== 'HIGH' && item.priority !== 'NORMAL')) throw new Error('Invalid announcement');
    return { id: item.id, title: item.title, excerpt: item.excerpt, content: item.content,
      publishedAt: item.publishedAt.slice(0, 10), priority: item.priority === 'HIGH' ? 'high' : 'normal' };
  });
}
