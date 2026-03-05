import React from 'react';

const behaviorColors = {
  insult: '#e74c3c',       // red
  manipulation: '#f39c12', // orange
  gaslighting: '#9b59b6',  // purple
  discard: '#34495e',      // dark blue-gray
  control: '#27ae60',      // green
};

const capitalize = (s) => s.charAt(0).toUpperCase() + s.slice(1);

export default function FlaggedOutput({ flags }) {
  if (!flags || flags.length === 0) {
    return null;
  }

  return (
    <div
      role="region"
      aria-label="Behavioral flags detected"
      aria-live="polite"
      style={{
        display: 'flex',
        gap: '8px',
        flexWrap: 'wrap',
        marginTop: '12px',
        justifyContent: 'center',
      }}
    >
      {flags.map((flag) => (
        <span
          key={flag}
          style={{
            backgroundColor: behaviorColors[flag] || '#bdc3c7',
            color: 'white',
            fontWeight: '600',
            fontSize: '0.9rem',
            padding: '4px 12px',
            borderRadius: '14px',
            minWidth: '72px',
            textAlign: 'center',
            boxShadow: '0 1px 3px rgba(0,0,0,0.2)',
            userSelect: 'none',
          }}
          aria-label={`${capitalize(flag)} detected`}
          tabIndex={0}
        >
          {capitalize(flag)}
        </span>
      ))}
    </div>
  );
}