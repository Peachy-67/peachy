import React from 'react';

const ShareButton = ({ textToShare }) => {
  const handleShare = async () => {
    if (navigator.share) {
      try {
        await navigator.share({
          text: textToShare,
          title: 'Flagged Conversation',
          url: window.location.href,
        });
      } catch (error) {
        alert('Sharing failed. Please try copying manually.');
      }
    } else {
      try {
        await navigator.clipboard.writeText(textToShare);
        alert('Text copied to clipboard!');
      } catch (err) {
        alert('Clipboard copying failed.');
      }
    }
  };

  return (
    <button
      onClick={handleShare}
      style={{
        backgroundColor: '#ff6f61',
        color: 'white',
        border: 'none',
        borderRadius: '4px',
        padding: '10px 16px',
        fontWeight: 'bold',
        cursor: 'pointer',
        userSelect: 'none',
      }}
      aria-label="Share flagged text"
      title="Share flagged text"
    >
      Share
    </button>
  );
};

export default ShareButton;