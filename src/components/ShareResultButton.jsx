import React from "react";

const styles = {
  button: {
    backgroundColor: "#ff6f61",
    color: "white",
    border: "none",
    borderRadius: "6px",
    padding: "8px 14px",
    fontSize: "14px",
    cursor: "pointer",
    userSelect: "none",
    transition: "background-color 0.2s ease",
    marginTop: "12px",
  },
  buttonHover: {
    backgroundColor: "#ff4a37",
  },
};

export default function ShareResultButton({ textToShare }) {
  const [isSharing, setIsSharing] = React.useState(false);
  const [hover, setHover] = React.useState(false);

  const handleShareClick = async () => {
    if (!textToShare) return;
    setIsSharing(true);

    try {
      if (navigator.share) {
        // Use native share API
        await navigator.share({
          title: "FLAGGED Conversation Result",
          text: textToShare,
        });
      } else {
        // Fallback: copy to clipboard
        await navigator.clipboard.writeText(textToShare);
        alert("Result copied to clipboard! You can now share it anywhere.");
      }
    } catch (error) {
      // Fallback alert in case of error
      alert("Sharing failed. Try copying the text manually.");
    } finally {
      setIsSharing(false);
    }
  };

  return (
    <button
      type="button"
      aria-label="Share flagged conversation result"
      style={{
        ...styles.button,
        ...(hover ? styles.buttonHover : {}),
      }}
      onClick={handleShareClick}
      onMouseEnter={() => setHover(true)}
      onMouseLeave={() => setHover(false)}
      disabled={isSharing || !textToShare}
    >
      {isSharing ? "Sharing..." : "Share Result"}
    </button>
  );
}