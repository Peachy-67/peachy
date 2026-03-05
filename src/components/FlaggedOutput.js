import React from 'react';

// Color coding for flags
const FLAG_COLORS = {
  insult: '#E57373',      // red-ish
  manipulation: '#FFB74D',// orange-ish
  gaslighting: '#64B5F6', // blue-ish
  discard: '#81C784',     // green-ish
  control: '#BA68C8'      // purple-ish
};

const FLAG_LABELS = {
  insult: 'Insult',
  manipulation: 'Manipulation',
  gaslighting: 'Gaslighting',
  discard: 'Discard',
  control: 'Control'
};

function FlagBadge({ type }) {
  const color = FLAG_COLORS[type] || '#CCCCCC';
  return (
    <span
      role="alert"
      aria-label={FLAG_LABELS[type]}
      style={{
        backgroundColor: color,
        color: '#fff',
        padding: '4px 8px',
        borderRadius: '12px',
        fontSize: '0.85rem',
        marginRight: '6px',
        fontWeight: '600',
        userSelect: 'none',
        display: 'inline-block',
        minWidth: '70px',
        textAlign:'center',
        boxShadow: '0 0 4px rgba(0,0,0,0.2)'
      }}
      data-flag-type={type}
    >
      {FLAG_LABELS[type]}
    </span>
  );
}

export default function FlaggedOutput({ detectedFlags = [] }) {
  if (!detectedFlags.length) {
    return <p aria-live="polite" style={{ fontStyle: 'italic', color: '#777' }}>No red flags detected</p>;
  }

  return (
    <div
      role="region"
      aria-live="polite"
      aria-label="Detected behavioral red flags"
      style={{
        display: 'flex',
        flexWrap: 'wrap',
        gap: '6px',
        marginTop: '8px',
        maxWidth: '350px'
      }}
    >
      {detectedFlags.map(flag => (
        <FlagBadge key={flag} type={flag} />
      ))}
    </div>
  );
}