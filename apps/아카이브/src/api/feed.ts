import { NewsItem } from '../types';
import { apiRequest } from './client';

export interface FeedResponse {
  items: NewsItem[];
  totalCount: number;
}

interface NewsApiResponse {
  totalCount: number;
  page: number;
  size: number;
  items: NewsItem[];
}

export async function getNewsFeed(params?: { page?: number; size?: number }): Promise<FeedResponse> {
  const page = params?.page ?? 1;
  const size = params?.size ?? 20;
  const res = await apiRequest<NewsApiResponse>(`/api/news?page=${page}&size=${size}`, {
    method: 'GET',
  });
  return { items: res.items, totalCount: res.totalCount };
}

export async function getPopularNews(): Promise<NewsItem[]> {
  return apiRequest<NewsItem[]>('/api/news/popular', { method: 'GET' });
}

export async function recordView(articleId: number): Promise<void> {
  await apiRequest<void>(`/api/news/${articleId}/view`, { method: 'POST' }).catch(() => {});
}
