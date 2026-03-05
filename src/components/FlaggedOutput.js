import React from 'react';

const FLAG_COLORS = {
  insult: '#e74c3c',
  manipulation: '#f39c12',
  gaslighting: '#8e44ad',
  discard: '#3498db',
  control: '#2ecc71',
};

const FLAG_LABELS = {
  insult: 'Insult',
  manipulation: 'Manipulation',
  gaslighting: 'Gaslighting',
  discard: 'Discard',
  control: 'Control',
};

const FlaggedOutput = ({ flags = [] }) => {
  if (flags.length === 0) return null;

  return (
    <section
      role="region"
      aria-live="polite"
      aria-label={`Detected behavioral flags: ${flags.map(f => FLAG_LABELS[f]).join(', ')}`}
      style={{
        display: 'flex',
        gap: 8,
        flexWrap: 'wrap',
        justifyContent: 'center',
        margin: '12px 0',
      }}
    >
      {flags.map((flag) => (
        <span
          key={flag}
          role="status"
          aria-label={FLAG_LABELS[flag]}
          style={{
            backgroundColor: FLAG_COLORS[flag],
            color: 'white',
            padding: '6px 10px',
            borderRadius: 12,
            fontWeight: '600',
            fontSize: 14,
            minWidth: 80,
            textAlign: 'center',
            boxShadow: '0 1px 3px rgba(0,0,0,0.2)',
            userSelect: 'none',
            lineHeight: 1,
            whiteSpace: 'nowrap',
          }}
        >
          {FLAG_LABELS[flag]}
        </span>
      ))}
    </section>
  );
};

export default FlaggedOutput;