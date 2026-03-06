import React, { useEffect, useState, useRef } from "react";

const HIGH_RISK_FLAGS = new Set([
  "manipulation",
  "gaslighting",
  "discard behavior",
  "control patterns",
]);

/**
 * AlertingSystem component
 *
 * Props:
 * - flaggedBehaviors: array of strings, detected behaviors for current conversation
 * - onAlert: optional callback when a high-risk behavior alert is triggered
 *
 * Functionality:
 * - Monitors flagged behaviors array for high-risk behaviors.
 * - Immediately triggers a browser alert and optionally calls onAlert callback.
 * - Shows a temporary visible alert banner with the detected high-risk flags.
 * 
 * This component is designed to integrate in the real-time analyzing dashboard or any UI showing detected flags.
 */
export default function AlertingSystem({ flaggedBehaviors, onAlert }) {
  const [alertFlags, setAlertFlags] = useState([]);
  const alertedFlagsRef = useRef(new Set());

  useEffect(() => {
    if (!flaggedBehaviors || !flaggedBehaviors.length) return;

    // Filter to high-risk flags newly detected this update
    const newHighRiskDetected = flaggedBehaviors.filter(
      (flag) => HIGH_RISK_FLAGS.has(flag) && !alertedFlagsRef.current.has(flag)
    );
    if (newHighRiskDetected.length) {
      // Update alerted flags cache to prevent repeated alerts for the same flags in this session
      newHighRiskDetected.forEach((flag) => alertedFlagsRef.current.add(flag));
      setAlertFlags(newHighRiskDetected);
      // Fire native alert with concise message
      alert(
        `🚨 High-risk behavior detected: ${newHighRiskDetected
          .map((f) => `"${f}"`)
          .join(", ")}.\nPlease review immediately.`
      );
      // Optional callback for external handling (e.g. push notifications)
      if (typeof onAlert === "function") {
        onAlert(newHighRiskDetected);
      }
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [flaggedBehaviors]);

  // Auto-hide alert banner after 5 seconds
  useEffect(() => {
    if (alertFlags.length === 0) return;
    const timeout = setTimeout(() => setAlertFlags([]), 5000);
    return () => clearTimeout(timeout);
  }, [alertFlags]);

  if (alertFlags.length === 0) return null;

  return (
    <div
      role="alert"
      aria-live="assertive"
      aria-atomic="true"
      style={{
        position: "fixed",
        top: 10,
        right: 10,
        backgroundColor: "#ff5555",
        color: "white",
        padding: "12px 20px",
        borderRadius: 8,
        boxShadow:
          "0 2px 6px rgba(255, 85, 85, 0.8), 0 0 8px rgba(255, 85, 85, 0.6)",
        fontWeight: "bold",
        fontSize: 14,
        zIndex: 1000,
        maxWidth: "300px",
        cursor: "pointer",
        userSelect: "none",
      }}
      onClick={() => setAlertFlags([])}
      title="Click to dismiss alert"
    >
      🚨 High-risk behavior detected:{" "}
      {alertFlags.map((f, i) => (
        <span
          key={f}
          style={{
            textTransform: "capitalize",
            marginRight: i < alertFlags.length - 1 ? 6 : 0,
          }}
        >
          {f}
          {i < alertFlags.length - 1 ? "," : ""}
        </span>
      ))}
    </div>
  );
}