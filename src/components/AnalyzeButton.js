import React from "react";
import "./UIEnhancements.css";

export default function AnalyzeButton({ onClick, disabled }) {
  return (
    <button
      type="button"
      className="ui-button"
      onClick={onClick}
      disabled={disabled}
      aria-disabled={disabled ? "true" : "false"}
      aria-label="Analyze conversation text for red flags"
    >
      Analyze Conversation
    </button>
  );
}