import React from "react";
import "../styles/UiPolishImprovements.css";

export default function FlaggedResultContainer({ children, label }) {
  return (
    <section
      className="flagged-result-container"
      aria-live="polite"
      aria-label={label || "Flagged detection result container"}
      role="region"
    >
      {label && <h2 className="ui-section-header">{label}</h2>}
      {children}
    </section>
  );
}