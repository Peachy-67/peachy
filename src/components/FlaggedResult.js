import React from "react";

const flagMessages = {
  insult: "Insult detected ⚠️",
  manipulation: "Manipulation pattern detected ⚠️",
  gaslighting: "Gaslighting behavior detected ⚠️",
  discard: "Discard behavior detected ⚠️",
  control: "Control pattern detected ⚠️",
};

export default function FlaggedResult({ flags }) {
  if (!flags || flags.length === 0) return null;

  return (
    <div
      style={{
        padding: "12px",
        borderRadius: "8px",
        backgroundColor: "#fff3f0",
        color: "#a33",
        fontWeight: "600",
        fontSize: "1.1rem",
        marginTop: "16px",
        boxShadow: "0 0 8px rgba(163, 51, 51, 0.3)",
        userSelect: "text",
      }}
    >
      {flags.map((flag) => (
        <div key={flag} style={{ marginBottom: "6px" }}>
          {flagMessages[flag]}
        </div>
      ))}
    </div>
  );
}