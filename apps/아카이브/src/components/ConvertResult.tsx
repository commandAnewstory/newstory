import React from 'react';
import { ConvertResult } from '../types';
import { STYLE_LIST } from '../data/mockData';
import { useToast } from '../hooks/useToast';
import { addBookmark } from '../api/convert';

interface Props {
  result: ConvertResult;
  onReset: () => void;
}

export default function ConvertResultView({ result, onReset }: Props) {
  const toast = useToast();
  const styleMeta = STYLE_LIST.find((s) => s.type === result.style);

  const handleCopy = () => {
    navigator.clipboard?.writeText(result.convertedText);
    toast('복사됐습니다');
  };

  const handleBookmark = async () => {
    try {
      await addBookmark(result.resultId);
      toast('보관함에 저장됐습니다');
    } catch (err: any) {
      toast(err.message || '저장에 실패했습니다');
    }
  };

  const handleShare = () => {
    navigator.clipboard?.writeText(window.location.href);
    toast('링크 복사됨');
  };

  return (
    <div className="convert-result">
      <div className="convert-result-header">
        <div>
          <div className="convert-result-title">{result.title}</div>
          <div style={{ display: 'flex', alignItems: 'center', marginTop: '8px' }}>
            <span className="convert-style-badge">
              <span className="ms">{styleMeta?.icon}</span>{styleMeta?.label}
            </span>
          </div>
        </div>
        <div className="convert-result-actions">
          <button className="icon-btn" onClick={handleCopy}><span className="ms">content_copy</span></button>
          <button className="icon-btn" onClick={handleBookmark}><span className="ms">bookmark</span></button>
          <button className="icon-btn" onClick={handleShare}><span className="ms">share</span></button>
        </div>
      </div>
      <div className="convert-result-body">{result.convertedText}</div>
      <button className="retry-btn" onClick={onReset}>
        <span className="ms">refresh</span> 다시 변환하기
      </button>
    </div>
  );
}
