import React, { useState } from 'react';
import '../styles/UiPolish.css';

export default function ShareButton({ textToShare, disabled }) {
  const [errorMsg, setErrorMsg] = useState(null);
  const [copied, setCopied] = useState(false);

  async function handleShare() {
    setErrorMsg(null);
    setCopied(false);
    if (!textToShare) {
      setErrorMsg('Nothing to share.');
      return;
    }
    if (navigator.share) {
      try {
        await navigator.share({ text: textToShare });
      } catch (err) {
        setErrorMsg('Sharing failed or cancelled.');
      }
    } else if (navigator.clipboard) {
      try {
        await navigator.clipboard.writeText(textToShare);
        setCopied(true);
      } catch {
        setErrorMsg('Copy to clipboard failed.');
      }
    } else {
      setErrorMsg('Sharing not supported on this device.');
    }
  }

  return (
    <div style={{ textAlign: 'center', marginTop: '1.4rem' }}>
      <button
        onClick={handleShare}
        disabled={disabled}
        aria-label="Share flagged conversation results"
        className="share-button"
      >
        {copied ? 'Copied!' : 'Share Result'}
      </button>
      {errorMsg && <div style={{ color: '#b00020', marginTop: '0.5rem', fontWeight: '600' }}>{errorMsg}</div>}
    </div>
  );
}