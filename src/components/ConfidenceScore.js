import React from 'react';
import PropTypes from 'prop-types';
import './ConfidenceScore.css';

const ConfidenceScore = ({ score }) => {
  const clampedScore = Math.min(Math.max(score, 0), 1);
  const percent = Math.round(clampedScore * 100);

  // Color coding for confidence bar: green >75%, orange 40-75%, red <40%
  let barColor = '#5cb85c'; // green
  if (percent < 40) barColor = '#cc2f2f'; // red
  else if (percent < 75) barColor = '#f0ad4e'; // orange

  return (
    <div
      className="confidence-score"
      role="progressbar"
      aria-valuenow={percent}
      aria-valuemin={0}
      aria-valuemax={100}
      aria-label={`Overall confidence score: ${percent} percent`}
    >
      <div
        className="confidence-bar"
        style={{ width: `${percent}%`, backgroundColor: barColor }}
      />
      <div className="confidence-text">{percent}% Confidence</div>
    </div>
  );
};

ConfidenceScore.propTypes = {
  score: PropTypes.number.isRequired,
};

export default ConfidenceScore;