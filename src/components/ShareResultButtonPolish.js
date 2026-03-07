import React from 'react';
import './uiPolishImprovements.css';

export default function ShareResultButtonPolish({ textToShare, disabled = false }) {
  async function handleShare() {
    if (navigator.share) {
      try {
        await navigator.share({
          title: 'Flagged Conversation Result',
          text: textToShare,
        });
      } catch (err) {
        // User cancelled or failed, no action needed
      }
    } else if (navigator.clipboard) {
      try {
        await navigator.clipboard.writeText(textToShare);
        alert('Result copied to clipboard!');
      } catch (err) {
        alert('Failed to copy result to clipboard.');
      }
    } else {
      alert('Sharing not supported on this browser.');
    }
  }

  return (
    <button
      type="button"
      className="share-result-button"
      onClick={handleShare}
      disabled={disabled || !textToShare}
      aria-label="Share flagged conversation result"
    >
      Share Result
    </button>
  );
}