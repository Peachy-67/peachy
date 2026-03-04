import React from 'react';

const ShareButton = ({ text }) => {
  const shareData = {
    title: 'Flagged Conversation',
    text: text,
    url: window.location.href
  };

  const handleShare = async () => {
    if (navigator.share) {
      try {
        await navigator.share(shareData);
      } catch (err) {
        alert('Sharing failed: ' + err.message);
      }
    } else {
      // fallback for unsupported browsers
      navigator.clipboard.writeText(`${text}\n${window.location.href}`)
        .then(() => alert('Copied conversation text & link to clipboard!'))
        .catch(() => alert('Unable to copy'));
    }
  };

  return (
    <button onClick={handleShare} style={buttonStyle}>
      Share
    </button>
  );
};

const buttonStyle = {
  backgroundColor: '#ff5a5f',
  color: '#fff',
  border: 'none',
  borderRadius: '4px',
  padding: '8px 16px',
  cursor: 'pointer',
  fontWeight: 'bold',
  fontSize: '14px',
};

export default ShareButton;