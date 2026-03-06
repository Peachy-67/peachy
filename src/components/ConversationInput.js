import React, { useState } from "react";

const ConversationInput = ({ value, onChange }) => {
  return (
    <div style={styles.container}>
      <label htmlFor="conversation-input" style={styles.label}>
        Paste conversation text here:
      </label>
      <textarea
        id="conversation-input"
        aria-label="Conversation input"
        placeholder="Paste text conversation..."
        rows={8}
        style={styles.textarea}
        value={value}
        onChange={(e) => onChange(e.target.value)}
      />
    </div>
  );
};

const styles = {
  container: {
    margin: "1rem 0",
    fontFamily: "'Helvetica', sans-serif",
    display: "flex",
    flexDirection: "column",
  },
  label: {
    marginBottom: "0.5rem",
    fontWeight: "600",
    fontSize: "1rem",
  },
  textarea: {
    fontSize: "1rem",
    padding: "0.75rem",
    borderRadius: "6px",
    border: "1px solid #ccc",
    resize: "vertical",
    minHeight: "150px",
    boxShadow: "0 1px 3px rgba(0,0,0,0.1)",
    outline: "none",
    transition: "border-color 0.2s ease-in-out",
  },
};

export default ConversationInput;