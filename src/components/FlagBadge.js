import React from 'react';
import PropTypes from 'prop-types';
import './FlagBadge.css';

const flagColors = {
  insult: '#d9534f',
  manipulation: '#f0ad4e',
  gaslighting: '#d9534f',
  discard: '#5bc0de',
  control: '#5cb85c',
};

const FlagBadge = ({ type, label, confidence }) => {
  const color = flagColors[type.toLowerCase()] || '#777';

  const confidencePercent = Math.round(Math.min(Math.max(confidence, 0), 1) * 100);

  return (
    <div
      className="flag-badge"
      style={{ backgroundColor: color }}
      aria-label={`${label} flag with confidence ${confidencePercent} percent`}
      role="listitem"
      tabIndex={0}
    >
      <span className="flag-label">{label}</span>
      <span className="confidence-score">({confidencePercent}%)</span>
    </div>
  );
};

FlagBadge.propTypes = {
  type: PropTypes.string.isRequired,
  label: PropTypes.string.isRequired,
  confidence: PropTypes.number.isRequired,
};

export default FlagBadge;