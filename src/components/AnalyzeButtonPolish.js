import React from 'react';
import './UIEnhancements.css';

export function AnalyzeButtonPolish({ onClick, disabled, label = "Analyze Conversation" }) {
  return (
    <button
      className="ui-button"
      onClick={onClick}
      disabled={disabled}
      aria-disabled={disabled}
      aria-label={label}
      type="button"
    >
      {label}
    </button>
  );
}