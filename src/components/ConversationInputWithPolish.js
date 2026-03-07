import React from 'react';
import './UIPolishEnhancements.css';

export default function ConversationInputWithPolish({ value, onChange, onAnalyze, loading, disabled }) {
  return (
    <div className="ui-container" role="region" aria-label="Conversation input and analysis">
      <h2>Paste your conversation below:</h2>
      <textarea
        className="ui-textarea"
        aria-label="Conversation text input"
        placeholder="Paste conversation text here..."
        value={value}
        onChange={onChange}
        rows={8}
        disabled={disabled}
        spellCheck={false}
      />
      <button
        className="ui-button"
        onClick={onAnalyze}
        disabled={loading || disabled || !value.trim()}
        aria-busy={loading}
        aria-live="polite"
        aria-label="Analyze conversation for red flags"
      >
        {loading ? 'Analyzing...' : 'Analyze'}
      </button>
    </div>
  );
}