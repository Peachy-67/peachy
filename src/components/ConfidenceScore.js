import React from 'react';
import PropTypes from 'prop-types';
import './ConfidenceScore.css';

const ConfidenceScore = ({ score }) => {
  // Clamp score to [0, 1]
  const clampedScore = Math.min(1, Math.max(0, score));

  // Determine color gradient from red (low) to green (high)
  const getColor = (val) => {
    // hue from red(0) to green(120)
    const hue = Math.round(val * 120);
    return `hsl(${hue}, 75%, 45%)`;
  };

  const percentage = Math.round(clampedScore * 100);

  return (
    <div className="confidence-score" aria-label={`Confidence score: ${percentage} percent`} role="region">
      <div 
        className="confidence-bar"
        style={{ width: `${percentage}%`, backgroundColor: getColor(clampedScore) }}
        aria-hidden="true"
      />
      <span className="confidence-text">{percentage}% Confidence</span>
    </div>
  );
};

ConfidenceScore.propTypes = {
  score: PropTypes.number.isRequired,
};

export default ConfidenceScore;