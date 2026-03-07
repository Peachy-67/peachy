import React from 'react';
import './UIEnhancements.css';

export function ConversationInputPolish({ value, onChange, placeholder = "Paste your conversation here..." }) {
  return (
    <div className="ui-container" role="region" aria-label="Conversation input">
      <label htmlFor="conversation-input" className="ui-header">
        Conversation
      </label>
      <textarea
        id="conversation-input"
        className="ui-textarea"
        value={value}
        onChange={e => onChange(e.target.value)}
        placeholder={placeholder}
        aria-describedby="conversationHelp"
        spellCheck={false}
        rows={8}
      />
      <small
        id="conversationHelp"
        style={{ display: 'block', textAlign: 'center', marginTop: '0.4rem', color: '#a56e6e', fontWeight: 400 }}
      >
        Paste the conversation text you want analyzed for red flags
      </small>
    </div>
  );
}