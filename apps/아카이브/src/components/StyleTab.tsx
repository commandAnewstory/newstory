import React from 'react';
import { ConvertStyle } from '../types';
import { STYLE_LIST, CATEGORIES } from '../data/mockData';

interface Props {
  activeCategory: string;
  onCategoryChange: (cat: string) => void;
  activeStyle: ConvertStyle | null;
  onStyleChange: (style: ConvertStyle | null) => void;
  showStyleTabs: boolean;
}

export default function StyleTab({ activeCategory, onCategoryChange, activeStyle, onStyleChange, showStyleTabs }: Props) {
  return (
    <div className="cat-tabs-home">
      {CATEGORIES.map((cat) => (
        <button
          key={cat}
          className={`cat-tab-home${activeCategory === cat ? ' active' : ''}`}
          onClick={() => onCategoryChange(cat)}
        >
          {cat}
        </button>
      ))}
      {showStyleTabs && (
        <div className="style-tab-group">
          {STYLE_LIST.map((s) => (
            <button
              key={s.type}
              className={`style-tab-pill${activeStyle === s.type ? ' active' : ''}`}
              onClick={() => onStyleChange(activeStyle === s.type ? null : s.type)}
            >
              <span className="ms">{s.icon}</span>{s.label}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
