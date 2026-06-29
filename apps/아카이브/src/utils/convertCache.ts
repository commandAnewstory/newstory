import { ConvertResult } from '../types';

const TTL_MS = 24 * 60 * 60 * 1000; // 24시간

interface CacheEntry {
  result: ConvertResult;
  cachedAt: number;
}

function cacheKey(newsId: number, style: string): string {
  return `convert_cache_${newsId}_${style}`;
}

export function getCachedResult(newsId: number, style: string): ConvertResult | null {
  try {
    const raw = localStorage.getItem(cacheKey(newsId, style));
    if (!raw) return null;
    const entry: CacheEntry = JSON.parse(raw);
    if (Date.now() - entry.cachedAt > TTL_MS) {
      localStorage.removeItem(cacheKey(newsId, style));
      return null;
    }
    return entry.result;
  } catch {
    return null;
  }
}

export function setCachedResult(newsId: number, result: ConvertResult): void {
  try {
    const entry: CacheEntry = { result, cachedAt: Date.now() };
    localStorage.setItem(cacheKey(newsId, result.style), JSON.stringify(entry));
  } catch {
    // localStorage 용량 초과 등 무시
  }
}

export function clearExpiredCache(): void {
  try {
    const keys = Object.keys(localStorage).filter(k => k.startsWith('convert_cache_'));
    for (const key of keys) {
      const raw = localStorage.getItem(key);
      if (!raw) continue;
      const entry: CacheEntry = JSON.parse(raw);
      if (Date.now() - entry.cachedAt > TTL_MS) {
        localStorage.removeItem(key);
      }
    }
  } catch {
    // 무시
  }
}
