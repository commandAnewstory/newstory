import React, { useState, forwardRef, useImperativeHandle } from 'react';
import { ConvertStyle } from '../types';
import { STYLE_LIST } from '../data/mockData';
import { useToast } from '../hooks/useToast';

interface Props {
  onConvert: (params: { url: string; style: ConvertStyle }) => void;
  loading: boolean;
}

export interface ConvertFormHandle {
  reset: () => void;
}

const ConvertForm = forwardRef<ConvertFormHandle, Props>(({ onConvert, loading }, ref) => {
  const toast = useToast();
  const [url, setUrl] = useState('');
  const [selectedStyle, setSelectedStyle] = useState<ConvertStyle | null>(null);

  useImperativeHandle(ref, () => ({
    reset: () => { setUrl(''); setSelectedStyle(null); },
  }));

  const handleSubmit = () => {
    if (!url) { toast('URL을 입력해주세요'); return; }
    if (!url.startsWith('http')) { toast('올바른 URL 형식을 입력해주세요'); return; }
    if (!selectedStyle) { toast('변환 스타일을 선택해주세요'); return; }
    onConvert({ url, style: selectedStyle });
  };

  return (
    <div className="convert-input-section">
      <div className="convert-input-label">
        <span className="ms">link</span> 변환할 기사 URL
      </div>
      <div className="convert-url-wrap">
        <input
          type="url"
          className="convert-url-input"
          placeholder="https://news.example.com/article/..."
          value={url}
          onChange={(e) => setUrl(e.target.value)}
          onKeyDown={(e) => e.key === 'Enter' && handleSubmit()}
          disabled={loading}
        />
        <button className="btn-primary" onClick={handleSubmit} disabled={loading}>
          <span className="ms">auto_awesome</span>{loading ? '변환 중...' : '변환'}
        </button>
      </div>
      <div className="convert-input-label" style={{ marginBottom: '12px' }}>
        <span className="ms">style</span> 변환 스타일 선택
      </div>
      <div className="style-radio-group">
        {STYLE_LIST.map((s) => (
          <div
            key={s.type}
            className={`style-radio${selectedStyle === s.type ? ' selected' : ''}`}
            onClick={() => !loading && setSelectedStyle(selectedStyle === s.type ? null : s.type)}
          >
            <span className="ms style-radio-icon">{s.icon}</span>
            <div className="style-radio-text">
              <div className="style-radio-name">{s.label}</div>
              <div className="style-radio-sub">{s.sub}</div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
});

ConvertForm.displayName = 'ConvertForm';
export default ConvertForm;
