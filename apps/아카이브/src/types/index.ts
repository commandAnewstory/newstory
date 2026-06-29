export type ConvertStyle = 'fairy_tale' | 'novel' | 'card';

export interface User {
  nickname: string;
  email: string;
}

export interface NewsItem {
  id: number;
  title: string;
  description: string;
  source: string;
  publishedAt: string | null;
  createdAt: string;
  url: string;
}

export interface ConvertResult {
  resultId: number;
  articleId: number;
  title: string;
  originalUrl: string;
  style: ConvertStyle;
  convertedText: string;
  createdAt: string;
}

export interface HistoryItem {
  resultId: number;
  title: string;
  style: ConvertStyle;
  originalUrl: string;
  createdAt: string;
}

export interface BookmarkItem {
  bookmarkId: number;
  resultId: number;
  title: string;
  style: ConvertStyle;
  originalUrl: string;
  savedAt: string;
}

export interface OriginalArticle {
  title: string;
  content: string;
  contentHtml?: string;
  originalUrl: string;
  imageUrls?: string[];
}
