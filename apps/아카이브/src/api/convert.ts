import { ConvertResult, ConvertStyle, HistoryItem, BookmarkItem, OriginalArticle } from '../types';
import { apiRequest } from './client';

// ── 변환 관련 ─────────────────────────────

interface ConvertResponseDto {
  resultId: number;
  articleId: number;
  title: string;
  originalUrl: string;
  style: ConvertStyle;
  convertedText: string;
  createdAt: string;
}

export async function getOriginal(url: string): Promise<OriginalArticle> {
  return apiRequest<OriginalArticle>(`/api/convert/original?url=${encodeURIComponent(url)}`, {
    method: 'GET',
  });
}

export async function convertArticle(params: { url: string; style: ConvertStyle }): Promise<ConvertResult> {
  return apiRequest<ConvertResponseDto>('/api/convert', {
    method: 'POST',
    body: JSON.stringify(params),
    auth: true,
  });
}

export async function getConvertResult(resultId: number): Promise<ConvertResult> {
  return apiRequest<ConvertResponseDto>(`/api/convert/${resultId}`, {
    method: 'GET',
    auth: true,
  });
}

// ── 히스토리 ─────────────────────────────

export async function getHistory(): Promise<{ items: HistoryItem[] }> {
  return apiRequest<{ items: HistoryItem[] }>('/api/history', {
    method: 'GET',
    auth: true,
  });
}

export async function deleteHistoryItem(resultId: number): Promise<void> {
  await apiRequest<null>(`/api/history/${resultId}`, {
    method: 'DELETE',
    auth: true,
  });
}

// ── 북마크 ─────────────────────────────

export async function getBookmarks(): Promise<{ items: BookmarkItem[] }> {
  return apiRequest<{ items: BookmarkItem[] }>('/api/bookmarks', {
    method: 'GET',
    auth: true,
  });
}

export async function addBookmark(resultId: number): Promise<void> {
  await apiRequest<null>(`/api/bookmarks/${resultId}`, {
    method: 'POST',
    auth: true,
  });
}

export async function deleteBookmark(resultId: number): Promise<void> {
  await apiRequest<null>(`/api/bookmarks/${resultId}`, {
    method: 'DELETE',
    auth: true,
  });
}
