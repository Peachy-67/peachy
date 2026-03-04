import React from 'react';
import './FlaggedBehaviorOutput.css';

const flagStyles = {
  insult: { backgroundColor: '#f44336', color: 'white' },
  manipulation: { backgroundColor: '#ff9800', color: 'black' },
  gaslighting: { backgroundColor: '#9c27b0', color: 'white' },
  discard: { backgroundColor: '#03a9f4', color: 'white' },
  control: { backgroundColor: '#4caf50', color: 'white' },
};

const FlaggedBehaviorOutput = ({ flags }) => {
  if (!flags || flags.length === 0) return null;

  return (
    <div className="flagged-output-container" aria-live="polite" aria-atomic="true">
      {flags.map((flag) => (
        <span
          key={flag}
          className="flag-badge"
          style={flagStyles[flag]}
          title={flag.charAt(0).toUpperCase() + flag.slice(1)}
          aria-label={flag}
        >
          {flag}
        </span>
      ))}
    </div>
  );
};

export default FlaggedBehaviorOutput;