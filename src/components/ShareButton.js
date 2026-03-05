import React, { useState } from "react";

const ShareButton = ({ textToShare }) => {
  const [error, setError] = useState(null);
  const [copied, setCopied] = useState(false);

  const handleShare = async () => {
    setError(null);
    setCopied(false);
    if (navigator.share) {
      try {
        await navigator.share({
          title: "Flagged Conversation",
          text: textToShare,
        });
      } catch (err) {
        setError("Sharing failed");
      }
    } else if (navigator.clipboard) {
      try {
        await navigator.clipboard.writeText(textToShare);
        setCopied(true);
      } catch {
        setError("Copy to clipboard failed");
      }
    } else {
      setError("Sharing not supported");
    }
  };

  return (
    <div>
      <button
        onClick={handleShare}
        aria-label="Share flagged conversation"
        style={{
          padding: "8px 16px",
          backgroundColor: "#ff69b4",
          color: "#fff",
          border: "none",
          borderRadius: 4,
          cursor: "pointer",
          fontWeight: "bold",
          boxShadow: "0 2px 5px rgba(255,105,180,0.6)",
          userSelect: "none",
        }}
      >
        Share
      </button>
      {copied && (
        <span
          role="status"
          aria-live="polite"
          style={{ marginLeft: 12, color: "#4BB543", fontWeight: "bold" }}
        >
          Copied!
        </span>
      )}
      {error && (
        <span
          role="alert"
          style={{ marginLeft: 12, color: "#ee4b2b", fontWeight: "bold" }}
        >
          {error}
        </span>
      )}
    </div>
  );
};

export default ShareButton;