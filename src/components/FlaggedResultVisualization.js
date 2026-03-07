import React from 'react';
import PropTypes from 'prop-types';
import VerdictDisplay from './VerdictDisplay';
import FlagBadge from './FlagBadge';
import ConfidenceScore from './ConfidenceScore';
import './FlaggedResultVisualization.css';

const FlaggedResultVisualization = ({ verdict, flaggedBehaviors, overallConfidence }) => {
  // flaggedBehaviors: array of {type, label, confidence}

  return (
    <section
      className="flagged-result-container"
      aria-live="polite"
      aria-label="Flagged conversation result"
      role="region"
    >
      <VerdictDisplay verdict={verdict} />
      <div className="flagged-badges" role="list" aria-label="Detected red flags">
        {flaggedBehaviors.length === 0 && <p className="no-flags">No red flags detected.</p>}
        {flaggedBehaviors.map((flag) => (
          <FlagBadge key={flag.type} type={flag.type} label={flag.label} confidence={flag.confidence} />
        ))}
      </div>
      <ConfidenceScore score={overallConfidence} />
    </section>
  );
};

FlaggedResultVisualization.propTypes = {
  verdict: PropTypes.oneOf(['Safe', 'Caution', 'Flagged']).isRequired,
  flaggedBehaviors: PropTypes.arrayOf(
    PropTypes.shape({
      type: PropTypes.string.isRequired,
      label: PropTypes.string.isRequired,
      confidence: PropTypes.number.isRequired,
    })
  ).isRequired,
  overallConfidence: PropTypes.number.isRequired,
};

export default FlaggedResultVisualization;