import React from 'react';

const flagStyles = {
  insult: { backgroundColor: '#FFCDD2', color: '#B71C1C' },
  manipulation: { backgroundColor: '#FFE0B2', color: '#E65100' },
  gaslighting: { backgroundColor: '#BBDEFB', color: '#0D47A1' },
  discard: { backgroundColor: '#E1BEE7', color: '#4A148C' },
  control: { backgroundColor: '#C8E6C9', color: '#1B5E20' },
};

function FlaggedOutput({ flags }) {
  if (!flags || flags.length === 0) {
    return null;
  }

  return (
    <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
      {flags.map((flag) => (
        <span
          key={flag}
          style={{
            ...flagStyles[flag],
            padding: '4px 8px',
            borderRadius: '12px',
            fontWeight: '600',
            fontSize: '0.9rem',
            userSelect: 'all',
          }}
          aria-label={`Behavioral red flag detected: ${flag}`}
        >
          {flag.charAt(0).toUpperCase() + flag.slice(1)}
        </span>
      ))}
    </div>
  );
}

export default FlaggedOutput;