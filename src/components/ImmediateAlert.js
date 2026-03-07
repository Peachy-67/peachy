import React, { useEffect, useState } from 'react';
import PropTypes from 'prop-types';
import './ImmediateAlert.css';

const highRiskFlags = new Set([
  'insult',
  'manipulation',
  'gaslighting',
  'discard',
  'control',
]);

const ImmediateAlert = ({ flaggedBehaviors }) => {
  const [visible, setVisible] = useState(false);
  const [alertFlags, setAlertFlags] = useState([]);

  useEffect(() => {
    // Filter to only high-risk flags
    const detectedHighRiskFlags = flaggedBehaviors.filter(flag =>
      highRiskFlags.has(flag.type.toLowerCase())
    );

    if (detectedHighRiskFlags.length > 0) {
      setAlertFlags(detectedHighRiskFlags);
      setVisible(true);
      // Native alert with concise message
      const flagLabels = detectedHighRiskFlags.map(f => f.label).join(', ');
      alert(`⚠️ High-Risk Behavior Detected: ${flagLabels}`);
    } else {
      setVisible(false);
      setAlertFlags([]);
    }
  }, [flaggedBehaviors]);

  if (!visible) {
    return null;
  }

  return (
    <div 
      className="immediate-alert-banner" 
      role="alert" 
      aria-live="assertive"
      aria-atomic="true"
    >
      <strong>⚠️ High-Risk Behavior Detected:</strong>{' '}
      {alertFlags.map((flag, i) => (
        <span key={flag.type} className="alert-flag-label" style={{backgroundColor: flag.confidence > 0.75 ? '#cc2f2f' : '#f0ad4e'}}>
          {flag.label}
          {i < alertFlags.length - 1 ? ', ' : ''}
        </span>
      ))}
      <button
        className="alert-dismiss-button"
        aria-label="Dismiss alert"
        onClick={() => setVisible(false)}
      >
        ×
      </button>
    </div>
  );
};

ImmediateAlert.propTypes = {
  flaggedBehaviors: PropTypes.arrayOf(
    PropTypes.shape({
      type: PropTypes.string.isRequired,
      label: PropTypes.string.isRequired,
      confidence: PropTypes.number.isRequired,
    })
  ).isRequired,
};

export default ImmediateAlert;