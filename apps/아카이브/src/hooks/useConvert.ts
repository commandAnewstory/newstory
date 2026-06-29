import { useState } from 'react';
import { convertArticle } from '../api/convert';
import { ConvertResult, ConvertStyle } from '../types';

export function useConvert() {
  const [result, setResult] = useState<ConvertResult | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const convert = async (params: { url: string; style: ConvertStyle }) => {
    setLoading(true);
    setResult(null);
    setError('');
    try {
      const data = await convertArticle(params);
      setResult(data);
      return data;
    } catch (err: any) {
      setError(err.message || '변환 중 오류가 발생했습니다.');
      throw err;
    } finally {
      setLoading(false);
    }
  };

  const reset = () => {
    setResult(null);
    setError('');
  };

  return { convert, result, loading, error, reset };
}
