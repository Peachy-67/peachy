import React from 'react';
import './PolishedTextArea.css';

export default function PolishedTextArea({
  label,
  value,
  onChange,
  placeholder,
  id,
  rows = 8,
  disabled = false,
}) {
  return (
    <div className="polished-textarea-wrapper">
      {label && (
        <label htmlFor={id} className="polished-label">
          {label}
        </label>
      )}
      <textarea
        id={id}
        className="polished-textarea"
        value={value}
        onChange={onChange}
        placeholder={placeholder}
        rows={rows}
        disabled={disabled}
        aria-label={label || 'Conversation input'}
      />
    </div>
  );
}