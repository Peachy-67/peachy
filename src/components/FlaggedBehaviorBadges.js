import React from 'react';

const flagStyles = {
  insult: { backgroundColor: '#f44336', color: 'white' },       // red
  manipulation: { backgroundColor: '#ff9800', color: 'white' }, // orange
  gaslighting: { backgroundColor: '#9c27b0', color: 'white' },  // purple
  discard: { backgroundColor: '#607d8b', color: 'white' },      // blue-grey
  control: { backgroundColor: '#3f51b5', color: 'white' },      // indigo
};

const flagLabels = {
  insult: 'Insult',
  manipulation: 'Manipulation',
  gaslighting: 'Gaslighting',
  discard: 'Discard',
  control: 'Control',
};

export default function FlaggedBehaviorBadges({ flags }) {
  if (!flags || flags.length === 0) {
    return null;
  }

  return (
    <section
      role="region"
      aria-live="polite"
      aria-label="Detected behavior flags"
      style={{
        display: 'flex',
        gap: '0.5rem',
        flexWrap: 'wrap',
        marginTop: '0.5rem',
      }}
    >
      {flags.map((flag) => (
        <span
          key={flag}
          style={{
            ...flagStyles[flag],
            padding: '0.25rem 0.5rem',
            borderRadius: '12px',
            fontWeight: '600',
            fontSize: '0.875rem',
            userSelect: 'text',
          }}
        >
          {flagLabels[flag]}
        </span>
      ))}
    </section>
  );
}