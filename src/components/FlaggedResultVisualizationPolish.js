import React from 'react';
import PropTypes from 'prop-types';
import VerdictDisplay from './VerdictDisplay';
import FlagBadge from './FlagBadge';
import ConfidenceScore from './ConfidenceScore';
import './FlaggedResultVisualizationPolish.css';

const FlaggedResultVisualizationPolish = ({ verdict, flaggedBehaviors, overallConfidence }) => {
  return (
    <section
      className="flagged-result-polish-container"
      aria-live="polite"
      aria-label="Flagged conversation result"
      role="region"
    >
      <VerdictDisplay verdict={verdict} />
      <div className="flagged-badges-polish" role="list" aria-label="Detected red flags">
        {flaggedBehaviors.length === 0 && <p className="no-flags-polish">No red flags detected.</p>}
        {flaggedBehaviors.map((flag) => (
          <FlagBadge
            key={flag.type}
            type={flag.type}
            label={flag.label}
            confidence={flag.confidence}
          />
        ))}
      </div>
      <ConfidenceScore score={overallConfidence} />
    </section>
  );
};

FlaggedResultVisualizationPolish.propTypes = {
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

export default FlaggedResultVisualizationPolish;