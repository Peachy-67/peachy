import React from "react";
import "../styles/UiPolishImprovements.css";

export default function UIInputArea({ value, onChange, placeholder, label }) {
  return (
    <div className="ui-input-area">
      {label && (
        <label
          htmlFor="conversation-textarea"
          className="ui-section-header"
          aria-label={label}
        >
          {label}
        </label>
      )}
      <textarea
        id="conversation-textarea"
        className="peachy-textarea transition-smooth"
        value={value}
        onChange={onChange}
        placeholder={placeholder}
        aria-multiline="true"
        spellCheck={false}
      />
    </div>
  );
}