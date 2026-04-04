import React from 'react';
import './SearchBar.css';

const CATEGORIES = [
  { value: 'all', label: 'All Events' },
  { value: 'hackathon', label: '⚡ Hackathon' },
  { value: 'coding', label: '💻 Coding' },
  { value: 'paper_presentation', label: '📄 Paper' },
  { value: 'workshop', label: '🔧 Workshop' },
  { value: 'quiz', label: '🧠 Quiz' },
  { value: 'other', label: '🎯 Other' },
];

export default function SearchBar({ search, onSearch, category, onCategory }) {
  return (
    <div className="search-bar">
      <div className="search-input-wrap">
        <span className="search-icon">🔍</span>
        <input
          type="text"
          className="form-input search-input"
          placeholder="Search events..."
          value={search}
          onChange={e => onSearch(e.target.value)}
        />
        {search && (
          <button className="search-clear" onClick={() => onSearch('')}>×</button>
        )}
      </div>
      <div className="category-filters">
        {CATEGORIES.map(cat => (
          <button
            key={cat.value}
            className={`cat-btn ${category === cat.value ? 'active' : ''}`}
            onClick={() => onCategory(cat.value)}
          >
            {cat.label}
          </button>
        ))}
      </div>
    </div>
  );
}
