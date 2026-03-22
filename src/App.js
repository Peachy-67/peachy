import React, { useState, useEffect } from "react";

import ConversationAnalyzerPolish from "./components/ConversationAnalyzerPolish";
import ImmediateAlert from "./components/ImmediateAlert";
import FlaggedResultVisualization from "./components/FlaggedResultVisualization";
import ShareableResult from "./components/ShareableResult";
import RealTimeDashboard from "./components/RealTimeDashboard";

import "./styles/UiPolish.css";

const HIGH_RISK_FLAGS = new Set([
  "insult",
  "threat",
  "discard",
  "gaslighting",
  "ultimatum",
  "control",
  "guilt",
  "boundary_push",
]);

// Main App component integrating all main UI pieces
const App = () => {
  const [analysisResult, setAnalysisResult] = useState(null);
  const [alertFlags, setAlertFlags] = useState([]);
  const [alertDismissed, setAlertDismissed] = useState(false);
  const [dashboardEnabled, setDashboardEnabled] = useState(false);
  const [error, setError] = useState(null);

  // Handler when new analysis completes
  const handleAnalysisUpdate = (result) => {
    setAnalysisResult(result);
    setError(null);
    setAlertDismissed(false);

    if (result && Array.isArray(result.signals)) {
      // Find any high risk flags detected
      const detectedHighRisks = result.signals.filter((flag) =>
        HIGH_RISK_FLAGS.has(flag)
      );
      setAlertFlags(detectedHighRisks);
    } else {
      setAlertFlags([]);
    }
  };

  // Optional handler if error occurs in analysis
  const handleAnalysisError = (errMsg) => {
    setError(errMsg);
    setAnalysisResult(null);
    setAlertFlags([]);
  };

  const dismissAlert = () => {
    setAlertDismissed(true);
  };

  // Toggle dashboard view on or off, resets alert and errors on toggle
  const toggleDashboard = () => {
    setDashboardEnabled((enabled) => !enabled);
    setAlertDismissed(false);
    setError(null);
  };

  return (
    <main className="ui-container" role="main" aria-label="Flagged conversation analysis app">
      <h1 style={{ textAlign: "center", color: "#ff6f61", userSelect: "none" }}>
        FLAGGED
      </h1>

      {/* Toggle button to switch view between paste input and real-time dashboard */}
      <div style={{ marginBottom: 20, textAlign: "center" }}>
        <button
          type="button"
          className="peachy-button"
          onClick={toggleDashboard}
          aria-pressed={dashboardEnabled}
          aria-label={dashboardEnabled ? "Switch to Paste Conversation Analyzer" : "Switch to Real-Time Dashboard"}
        >
          {dashboardEnabled ? "Use Paste Analyzer" : "Use Real-Time Dashboard"}
        </button>
      </div>

      {/* Show real-time dashboard or paste conversation analyzer form */}
      {dashboardEnabled ? (
        <RealTimeDashboard
          onAnalysisUpdate={handleAnalysisUpdate}
          onError={handleAnalysisError}
        />
      ) : (
        <ConversationAnalyzerPolish
          onAnalysisComplete={handleAnalysisUpdate}
          onAnalysisError={handleAnalysisError}
        />
      )}

      {/* Immediate alert shows if high risk flags detected and not dismissed */}
      <ImmediateAlert
        flaggedBehaviors={alertFlags}
        dismissed={alertDismissed}
        onDismiss={dismissAlert}
      />

      {/* Error message display */}
      {error && (
        <div
          className="alert-banner"
          role="alert"
          aria-live="assertive"
          style={{ marginTop: "1rem" }}
        >
          {error}
        </div>
      )}

      {/* Show result visualization and share if analysis result exists */}
      {analysisResult && (
        <section
          aria-label="Analysis results"
          tabIndex={-1}
          style={{ marginTop: "1.5rem" }}
        >
          <FlaggedResultVisualization
            verdict={analysisResult.verdict?.label || "Safe"}
            flaggedBehaviors={analysisResult.signals.map((type) => {
              // Map to label and confidence fallback
              let label = type.charAt(0).toUpperCase() + type.slice(1);
              // Handle some known aliases or more descriptive labels
              if (type === "ultimatum") label = "Ultimatum";
              if (type === "threat") label = "Threat";
              if (type === "boundary_push") label = "Boundary Push";
              if (type === "guilt") label = "Guilt-tripping";
              // confidence unknown here, 0.7 default fallback for visualization
              return { type, label, confidence: 0.7 };
            })}
            overallConfidence={analysisResult.confidence || 0}
          />
          <ShareableResult analysisResult={analysisResult} />
        </section>
      )}
    </main>
  );
};

export default App;