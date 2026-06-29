import { useState, useEffect } from 'react';
import { getNewsFeed } from '../api/feed';
import { NewsItem } from '../types';

const PAGE_SIZE = 15;

export function useFeed() {
  const [items, setItems] = useState<NewsItem[]>([]);
  const [page, setPage] = useState(1);
  const [totalCount, setTotalCount] = useState(0);
  const [loading, setLoading] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    setLoading(true);
    getNewsFeed({ page: 1, size: PAGE_SIZE })
      .then((data) => {
        setItems(data.items);
        setTotalCount(data.totalCount);
        setPage(1);
      })
      .catch((err: Error) => setError(err.message || '뉴스를 불러오지 못했습니다.'))
      .finally(() => setLoading(false));
  }, []);

  const loadMore = () => {
    if (loadingMore) return;
    const nextPage = page + 1;
    setLoadingMore(true);
    getNewsFeed({ page: nextPage, size: PAGE_SIZE })
      .then((data) => {
        setItems((prev) => [...prev, ...data.items]);
        setPage(nextPage);
        setTotalCount(data.totalCount);
      })
      .catch((err: Error) => setError(err.message || '뉴스를 불러오지 못했습니다.'))
      .finally(() => setLoadingMore(false));
  };

  const hasMore = items.length < totalCount;

  return { items, loading, loadingMore, error, loadMore, hasMore, totalCount };
}
