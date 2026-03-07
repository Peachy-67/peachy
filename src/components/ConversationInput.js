import React from "react";
import "./UIEnhancements.css";

export default function ConversationInput({ value, onChange, disabled }) {
  return (
    <div className="ui-container" aria-label="Conversation Input Area">
      <label htmlFor="conversation-textarea" className="input-label">
        Paste Conversation Text
      </label>
      <textarea
        id="conversation-textarea"
        className="ui-textarea"
        placeholder="Paste the conversation here to analyze for red flags..."
        value={value}
        onChange={onChange}
        disabled={disabled}
        aria-multiline="true"
        aria-describedby="conversation-instruction"
      />
      <div
        id="conversation-instruction"
        style={{ fontSize: "0.8rem", color: "#b96f34", marginTop: "0.25rem" }}
      >
        Please paste your conversation text above.
      </div>
    </div>
  );
}