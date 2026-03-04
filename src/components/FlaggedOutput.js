import React from "react";

const flagColors = {
  insult: "#E74C3C", // red
  manipulation: "#F39C12", // orange
  gaslighting: "#9B59B6", // purple
  discard: "#3498DB", // blue
  control: "#27AE60", // green
};

export default function FlaggedOutput({ flags }) {
  if (!flags || flags.length === 0) return null;

  return (
    <div
      style={{
        border: "1px solid #ddd",
        borderRadius: 8,
        padding: 12,
        maxWidth: 400,
        userSelect: "text",
        fontFamily: "Helvetica, Arial, sans-serif",
        fontSize: 14,
        lineHeight: 1.4,
        background: "#fff",
      }}
    >
      {flags.map((flag) => (
        <span
          key={flag}
          style={{
            display: "inline-block",
            margin: "0 6px 6px 0",
            padding: "4px 10px",
            borderRadius: 15,
            color: "#fff",
            backgroundColor: flagColors[flag] || "#999",
            fontWeight: "600",
            userSelect: "text",
          }}
          aria-label={`${flag} behavior flagged`}
          title={`${flag} behavior flagged`}
        >
          {flag.charAt(0).toUpperCase() + flag.slice(1)}
        </span>
      ))}
    </div>
  );
}