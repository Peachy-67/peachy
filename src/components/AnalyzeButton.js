import React from "react";

const AnalyzeButton = ({ onClick, disabled }) => {
  return (
    <button
      onClick={onClick}
      disabled={disabled}
      aria-label="Analyze conversation for red flags"
      style={{
        backgroundColor: "#ff6f61",
        border: "none",
        borderRadius: "6px",
        padding: "0.6em 1.2em",
        color: "white",
        fontWeight: "600",
        fontSize: "1rem",
        cursor: disabled ? "not-allowed" : "pointer",
        userSelect: "none",
        transition: "background-color 0.25s ease",
      }}
      onMouseEnter={e => {
        if (!disabled) e.currentTarget.style.backgroundColor = "#ff4f3f";
      }}
      onMouseLeave={e => {
        if (!disabled) e.currentTarget.style.backgroundColor = "#ff6f61";
      }}
      type="button"
    >
      Analyze
    </button>
  );
};

export default AnalyzeButton;