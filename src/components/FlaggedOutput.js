import React from 'react';
import '../styles/UiPolish.css';

const colorMap = {
  insult: '#ff6b81',
  manipulation: '#ff476f',
  gaslighting: '#d32f3f',
  discard: '#b72c3b',
  control: '#ff3640',
  default: '#ff7080'
};

export default function FlaggedOutput({ flaggedBehaviors = [] }) {
  if (!flaggedBehaviors.length) {
    return (
      <div
        className="verdict-container"
        style={{
          backgroundColor: '#f4fcf9',
          color: '#34a853',
          border: '2px solid #34a853'
        }}
        role="region"
        aria-live="polite"
      >
        No red flags detected.
      </div>
    );
  }

  return (
    <section
      className="flags-container"
      role="region"
      aria-label="Detected red flags"
      aria-live="polite"
    >
      {flaggedBehaviors.map((flag) => {
        const bgColor = colorMap[flag.type] || colorMap.default;
        return (
          <span
            key={flag.type}
            className="flag-badge"
            style={{
              backgroundColor: bgColor,
              color: '#fff',
              border: `1.5px solid ${bgColor}cc`
            }}
            aria-label={`${flag.type} behavior detected with confidence ${Math.round(flag.confidence * 100)} percent`}
            tabIndex={0}
          >
            {flag.type.charAt(0).toUpperCase() + flag.type.slice(1)}
          </span>
        );
      })}
    </section>
  );
}