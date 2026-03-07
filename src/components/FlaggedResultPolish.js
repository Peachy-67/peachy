import React from 'react';
import './uiPolishImprovements.css';

const verdictClasses = {
  safe: 'verdict-safe',
  caution: 'verdict-caution',
  flagged: 'verdict-flagged',
};

const badgeClassMap = {
  insult: 'badge-insult',
  manipulation: 'badge-manipulation',
  gaslighting: 'badge-gaslighting',
  discard: 'badge-discard',
  control: 'badge-control',
};

export default function FlaggedResultPolish({ verdict = 'safe', flaggedBehaviors = [], confidenceScores = {} }) {
  const verdictKey = verdict.toLowerCase();

  return (
    <section
      className="flagged-result-container"
      role="region"
      aria-live="polite"
      aria-label="Conversation analysis results"
    >
      <div className={`flagged-verdict ${verdictClasses[verdictKey] || verdictClasses.safe}`} aria-atomic="true" aria-live="polite">
        {verdict.charAt(0).toUpperCase() + verdict.slice(1)}
      </div>
      {flaggedBehaviors.length > 0 && (
        <div className="flagged-badges-wrapper">
          {flaggedBehaviors.map((flag) => {
            const type = flag.type || flag; // support string or object with type
            const label = flag.label || type.charAt(0).toUpperCase() + type.slice(1);
            const className = badgeClassMap[type.toLowerCase()] || '';
            const confidence = confidenceScores[type.toLowerCase()];
            return (
              <div
                key={type}
                className={`flagged-badge ${className}`}
                role="listitem"
                aria-label={`${label} behavior flagged ${confidence ? `with confidence ${Math.round(confidence * 100)} percent` : ''}`}
                tabIndex={0}
              >
                {label}
                {confidence !== undefined && <div className="badge-confidence">({(confidence * 100).toFixed(0)}%)</div>}
              </div>
            );
          })}
        </div>
      )}
    </section>
  );
}