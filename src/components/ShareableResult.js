import React, { useState, useRef } from 'react';
import PropTypes from 'prop-types';
import FlaggedResultVisualization from './FlaggedResultVisualization';
import './ShareableResult.css';

const ShareableResult = ({ verdict, flaggedBehaviors, overallConfidence, conversationText }) => {
  const [copySuccess, setCopySuccess] = useState('');
  const containerRef = useRef(null);

  const shareText = () => {
    // Prepare a concise share text summary
    const flagsSummary =
      flaggedBehaviors.length > 0
        ? flaggedBehaviors.map(f => `${f.label} (${Math.round(f.confidence * 100)}%)`).join(', ')
        : 'No red flags detected';
    const shareContent =
      `FLAGGED.RUN Conversation Analysis Result:\n` +
      `Verdict: ${verdict}\n` +
      `Flags: ${flagsSummary}\n` +
      `Confidence: ${(overallConfidence * 100).toFixed(0)}%\n\n` +
      `Conversation excerpt:\n` +
      (conversationText.length > 300 ? conversationText.slice(0, 300) + '...' : conversationText) + '\n\n' +
      'Try FLAGGED.RUN to analyze your conversations for red flags!';

    if (navigator.share) {
      navigator
        .share({
          title: 'FLAGGED Conversation Result',
          text: shareContent,
          url: window.location.href,
        })
        .catch(() => {
          // Silently fail, fallback handled below
        });
    } else if (navigator.clipboard) {
      navigator.clipboard
        .writeText(shareContent)
        .then(() => setCopySuccess('Result copied to clipboard!'))
        .catch(() => setCopySuccess('Failed to copy result.'));
    } else {
      setCopySuccess('Sharing not supported on this browser.');
    }
  };

  const copyToClipboard = () => {
    const flagsSummary =
      flaggedBehaviors.length > 0
        ? flaggedBehaviors.map(f => `${f.label} (${Math.round(f.confidence * 100)}%)`).join(', ')
        : 'No red flags detected';
    const shareContent =
      `FLAGGED.RUN Conversation Analysis Result:\n` +
      `Verdict: ${verdict}\n` +
      `Flags: ${flagsSummary}\n` +
      `Confidence: ${(overallConfidence * 100).toFixed(0)}%\n\n` +
      `Conversation excerpt:\n` +
      (conversationText.length > 300 ? conversationText.slice(0, 300) + '...' : conversationText) + '\n\n' +
      'Try FLAGGED.RUN to analyze your conversations for red flags!';

    if (navigator.clipboard) {
      navigator.clipboard
        .writeText(shareContent)
        .then(() => setCopySuccess('Result copied to clipboard!'))
        .catch(() => setCopySuccess('Failed to copy result.'));
    } else {
      setCopySuccess('Copy to clipboard not supported in this browser.');
    }
  };

  return (
    <div className="shareable-result-container" ref={containerRef}>
      <FlaggedResultVisualization
        verdict={verdict}
        flaggedBehaviors={flaggedBehaviors}
        overallConfidence={overallConfidence}
      />
      <div className="share-buttons-container" aria-label="Share and copy conversation analysis results">
        <button
          type="button"
          className="primary-share-btn"
          onClick={shareText}
          aria-label="Share analysis result via native share options or copy to clipboard"
        >
          Share Result
        </button>
        <button
          type="button"
          className="copy-clipboard-btn"
          onClick={copyToClipboard}
          aria-label="Copy analysis result to clipboard"
        >
          Copy to Clipboard
        </button>
      </div>
      {copySuccess && (
        <div role="alert" className="copy-feedback" aria-live="assertive" aria-atomic="true">
          {copySuccess}
        </div>
      )}
    </div>
  );
};

ShareableResult.propTypes = {
  verdict: PropTypes.oneOf(['Safe', 'Caution', 'Flagged']).isRequired,
  flaggedBehaviors: PropTypes.arrayOf(
    PropTypes.shape({
      type: PropTypes.string.isRequired,
      label: PropTypes.string.isRequired,
      confidence: PropTypes.number.isRequired,
    })
  ).isRequired,
  overallConfidence: PropTypes.number.isRequired,
  conversationText: PropTypes.string.isRequired,
};

export default ShareableResult;