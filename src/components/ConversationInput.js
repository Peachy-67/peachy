import React from 'react';
import '../styles/UiPolish.css';

export default function ConversationInput({ value, onChange, disabled }) {
  return (
    <div className="ui-container" style={{ marginBottom: '1.5rem' }}>
      <label htmlFor="conversation-textarea" style={{ fontWeight: '600', marginBottom: '0.4rem', display: 'block', fontSize: '1.1rem', color: '#ff4d6d' }}>
        Paste conversation text:
      </label>
      <textarea
        id="conversation-textarea"
        rows="9"
        value={value}
        onChange={onChange}
        disabled={disabled}
        placeholder="Paste text conversation here to analyze for red flags..."
        spellCheck={false}
        aria-label="Conversation input textarea"
        className="conversation-textarea"
        style={{
          fontFamily: "'Courier New', Courier, monospace",
          fontSize: '1rem',
          lineHeight: 1.5,
          backgroundColor: disabled ? '#f7e8ec' : '#fff0f4',
          borderColor: disabled ? '#ffb6bf' : '#ff9bb3',
          transition: 'background-color 0.25s ease, border-color 0.25s ease',
          padding: '1rem',
          borderRadius: '8px',
          width: '100%',
          boxSizing: 'border-box',
          resize: 'vertical',
          boxShadow: 'inset 0 1px 3px rgba(0,0,0,0.1)'
        }}
      />
    </div>
  );
}