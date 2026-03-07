import React from 'react';
import './UIPolishEnhancements.css';

const verdictStyles = {
  safe: 'safe',
  caution: 'caution',
  flagged: 'flagged',
};

const flagColors = {
  insult: 'insult',
  manipulation: 'manipulation',
  gaslighting: 'gaslighting',
  discard: 'discard',
  control: 'control',
};

export default function FlaggedResultPolish({ verdict, flaggedBehaviors }) {
  return (
    <section
      className="ui-container"
      aria-live="polite"
      aria-label={`Analysis result: ${verdict}`}
    >
      <div className={`ui-verdict ${verdictStyles[verdict.toLowerCase()] || 'safe'}`}>
        {verdict}
      </div>
      <div
        className="ui-flagged-badges"
        role="region"
        aria-label="Detected behavior flags"
      >
        {flaggedBehaviors.length === 0 && (
          <span className="ui-flagged-badge safe" tabIndex={0}>
            No red flags detected
          </span>
        )}
        {flaggedBehaviors.map((flag) => {
          // map behavior string to css class
          const normalized = flag.toLowerCase();
          const colorClass = flagColors[normalized] || 'control';
          return (
            <span
              key={flag}
              className={`ui-flagged-badge ${colorClass}`}
              tabIndex={0}
              aria-label={`Flagged behavior detected: ${flag}`}
              role="text"
            >
              {flag.charAt(0).toUpperCase() + flag.slice(1)}
            </span>
          );
        })}
      </div>
    </section>
  );
}