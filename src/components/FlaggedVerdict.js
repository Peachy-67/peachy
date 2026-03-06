import React from "react";
import PropTypes from "prop-types";
import "./FlaggedVerdict.css";

const verdictColorMap = {
  safe: "#4CAF50",        // green
  caution: "#FFC107",     // amber
  flagged: "#E53935",     // red
  unknown: "#757575"      // gray
};

const FlaggedVerdict = ({ verdict }) => {
  if (!verdict || typeof verdict !== "string") return null;

  // Normalize verdict string to lowercase
  const v = verdict.toLowerCase();

  // Map verdict categories to user-friendly short text and color
  let label = "";
  let color = verdictColorMap.unknown;
  switch (v) {
    case "safe":
      label = "Safe";
      color = verdictColorMap.safe;
      break;
    case "caution":
      label = "Caution";
      color = verdictColorMap.caution;
      break;
    case "flagged":
      label = "Flagged";
      color = verdictColorMap.flagged;
      break;
    default:
      label = "Unknown";
      color = verdictColorMap.unknown;
  }

  return (
    <div
      className="flagged-verdict"
      role="region"
      aria-live="polite"
      aria-label={`Analysis verdict: ${label}`}
      style={{ borderColor: color, color }}
      data-testid="flagged-verdict"
    >
      {label}
    </div>
  );
};

FlaggedVerdict.propTypes = {
  verdict: PropTypes.string.isRequired,
};

export default FlaggedVerdict;