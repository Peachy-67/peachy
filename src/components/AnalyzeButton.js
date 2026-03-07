import React from 'react';
import '../styles/UiPolish.css';

export default function AnalyzeButton({ onClick, disabled, loading }) {
  return (
    <button
      type="button"
      aria-label="Analyze conversation"
      disabled={disabled || loading}
      onClick={onClick}
      className="analyze-button"
      style={{
        backgroundColor: disabled || loading ? '#ffa3a8' : '#ff707f',
        fontWeight: '700',
        fontSize: '1.1rem',
        padding: '0.7rem 1.6rem',
        borderRadius: '10px',
        boxShadow: disabled || loading ? 'none' : '0 4px 14px rgba(255, 112, 128, 0.42)',
        transition: 'background-color 0.3s ease, transform 0.15s ease',
        userSelect: 'none',
        cursor: disabled || loading ? 'not-allowed' : 'pointer',
        color: '#fff',
        border: 'none',
        letterSpacing: '0.04em',
        display: 'inline-block',
        maxWidth: 'fit-content',
        minWidth: '130px',
        textAlign: 'center'
      }}
      onMouseDown={e => {
        // subtle active scale effect
        e.currentTarget.style.transform = 'scale(0.97)';
      }}
      onMouseUp={e => { e.currentTarget.style.transform = 'scale(1)'; }}
      onMouseLeave={e => { e.currentTarget.style.transform = 'scale(1)'; }}
    >
      {loading ? 'Analyzing...' : 'Analyze'}
    </button>
  );
}