import React from 'react';
import PropTypes from 'prop-types';
import './VerdictDisplay.css';

const verdictStyles = {
  Safe: {
    color: '#2c974b',
    borderColor: '#2c974b',
    label: 'Safe',
    description: 'No red flags detected',
  },
  Caution: {
    color: '#d17e00',
    borderColor: '#d17e00',
    label: 'Caution',
    description: 'Potential concerns found',
  },
  Flagged: {
    color: '#cc2f2f',
    borderColor: '#cc2f2f',
    label: 'Flagged',
    description: 'Red flags detected',
  },
};

const VerdictDisplay = ({ verdict }) => {
  const style = verdictStyles[verdict] || verdictStyles.Safe;

  return (
    <div
      className="verdict-display"
      role="region"
      aria-live="polite"
      aria-label={`Conversation verdict: ${style.label}`}
      style={{ borderColor: style.borderColor, color: style.color }}
    >
      <span className="verdict-label">{style.label}</span>
      <small className="verdict-description">{style.description}</small>
    </div>
  );
};

VerdictDisplay.propTypes = {
  verdict: PropTypes.oneOf(['Safe', 'Caution', 'Flagged']).isRequired,
};

export default VerdictDisplay;