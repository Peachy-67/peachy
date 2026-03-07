import React from 'react';
import './UIEnhancements.css';

const verdictColors = {
  Safe: { text: '#3a6f47', border: '#8fcf81', bg: '#daf2d9' },
  Caution: { text: '#7a5b13', border: '#d9c491', bg: '#fff3cd' },
  Flagged: { text: '#8b2323', border: '#e26a6a', bg: '#f9d6d6' },
};

export function FlaggedResultPolish({ verdict = "Safe", flaggedBehaviors = [] }) {
  const style = verdictColors[verdict] || verdictColors.Safe;

  return (
    <section
      className="ui-container"
      aria-live="polite"
      aria-label={`Conversation verdict: ${verdict}`}
      role="region"
      style={{
        textAlign: 'center',
        padding: '1rem 1rem',
        backgroundColor: style.bg,
        borderRadius: 12,
        border: `2px solid ${style.border}`,
        color: style.text,
      }}
    >
      <h2
        tabIndex={-1}
        style={{
          margin: 0,
          fontWeight: '700',
          fontSize: '1.5rem',
          letterSpacing: '0.1em',
          userSelect: 'none',
          textTransform: 'uppercase',
        }}
      >
        {verdict}
      </h2>
      <div
        aria-label="Detected red flags"
        role="list"
        style={{
          marginTop: flaggedBehaviors.length ? 14 : 0,
          display: 'flex',
          justifyContent: 'center',
          flexWrap: 'wrap',
          gap: '12px',
        }}
      >
        {flaggedBehaviors.map((flag, idx) => (
          <span
            key={idx}
            role="listitem"
            style={{
              backgroundColor: '#eedede',
              color: '#8b2323',
              fontWeight: '600',
              fontSize: '0.85rem',
              padding: '6px 14px',
              borderRadius: 22,
              boxShadow: '0 2px 6px rgba(139, 35, 35, 0.3)',
              minWidth: 86,
              textAlign: 'center',
              userSelect: 'none',
              cursor: 'default',
              transition: 'filter 0.2s ease',
              whiteSpace: 'nowrap',
            }}
            aria-label={`Flagged behavior: ${flag}`}
            tabIndex={0}
            onFocus={e => {
              e.currentTarget.style.filter = 'brightness(1.1)';
            }}
            onBlur={e => {
              e.currentTarget.style.filter = 'brightness(1)';
            }}
          >
            {flag}
          </span>
        ))}
      </div>
    </section>
  );
}