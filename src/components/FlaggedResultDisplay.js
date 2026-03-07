import React from "react";
import "./UIEnhancements.css";

const verdictClassMap = {
  safe: "verdict-safe",
  caution: "verdict-caution",
  flagged: "verdict-flagged",
};

export default function FlaggedResultDisplay({ verdict, flags, confidence }) {
  const verdictLower = verdict ? verdict.toLowerCase() : "safe";

  return (
    <section
      className="result-container"
      aria-live="polite"
      aria-atomic="true"
      role="region"
      aria-label="Analysis result"
    >
      <div
        className={`verdict-label ${verdictClassMap[verdictLower] || verdictClassMap.safe}`}
        tabIndex={0}
      >
        {verdict}
      </div>
      <div
        aria-label="Detected Flags"
        style={{ marginTop: 10, display: "flex", flexWrap: "wrap", gap: 8 }}
      >
        {flags && flags.length > 0 ? (
          flags.map((flag, index) => (
            <span
              key={index}
              style={{
                minWidth: 70,
                backgroundColor: "#ffc8a2",
                color: "#5c3a20",
                padding: "3px 8px",
                fontWeight: 600,
                borderRadius: 6,
                boxShadow: "0 1px 3px rgba(255, 165, 110, 0.5)",
                textAlign: "center",
                userSelect: "none",
                fontSize: "0.9rem",
              }}
              role="alert"
              aria-live="assertive"
            >
              {flag}
            </span>
          ))
        ) : (
          <em style={{ color: "#a5774f", fontSize: "0.9rem" }}>No red flags detected</em>
        )}
      </div>
      {typeof confidence === "number" && (
        <div
          style={{
            marginTop: 10,
            fontSize: "0.85rem",
            color: "#a55f33",
            fontStyle: "italic",
          }}
        >
          Confidence score: {(confidence * 100).toFixed(1)}%
        </div>
      )}
    </section>
  );
}