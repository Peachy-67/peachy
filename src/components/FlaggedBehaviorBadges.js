import React from "react";

const BEHAVIOR_FLAGS = {
  insult: { label: "Insult", color: "#e74c3c" },
  manipulation: { label: "Manipulation", color: "#f39c12" },
  gaslighting: { label: "Gaslighting", color: "#8e44ad" },
  discard: { label: "Discard", color: "#34495e" },
  control: { label: "Control", color: "#27ae60" },
};

export default function FlaggedBehaviorBadges({ flags }) {
  if (!flags || flags.length === 0) return null;

  return (
    <div
      role="region"
      aria-label="Behavior flags detected"
      aria-live="polite"
      style={{
        display: "flex",
        gap: "6px",
        flexWrap: "wrap",
        maxWidth: "100%",
      }}
    >
      {flags.map((flag) => {
        const flagInfo = BEHAVIOR_FLAGS[flag];
        if (!flagInfo) return null;

        return (
          <span
            key={flag}
            style={{
              backgroundColor: flagInfo.color,
              color: "#fff",
              padding: "4px 8px",
              borderRadius: "12px",
              fontSize: "0.85rem",
              fontWeight: "600",
              userSelect: "none",
              whiteSpace: "nowrap",
            }}
            aria-label={`Flagged behavior: ${flagInfo.label}`}
          >
            {flagInfo.label}
          </span>
        );
      })}
    </div>
  );
}