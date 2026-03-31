import React, { useState, useEffect } from "react";

import ConversationAnalyzerPolish from "./components/ConversationAnalyzerPolish";
import ImmediateAlert from "./components/ImmediateAlert";
import FlaggedResultVisualization from "./components/FlaggedResultVisualization";
import ShareableResult from "./components/ShareableResult";
import RealTimeDashboard from "./components/RealTimeDashboard";

import "./styles/UiPolish.css";
import "./styles/ImmediateAlert.css";
import "./styles/FlaggedResultVisualization.css";
import "./styles/ShareableResult.css";
import "./styles/RealTimeDashboard.css";

const HIGH_RISK_FLAGS = new Set([
  "insult",
  "gaslighting",
  "threat",
  "ultimatum",
  "control",
]);

const initialAnalysis = {
  verdict: "Safe",
  flaggedBehaviors: [],
  overallConfidence: 0,
  rawOutput: null,
  error: null,
  loading: false,
};

const mapVerdictBandToLabel = (band) => {
  switch (band) {
    case "green":
      return "Safe";
    case "yellow":
      return "Caution";
    case "red":
      return "Flagged";
    default:
      return "Safe";
  }
};

function App() {
  const [analysis, setAnalysis] = useState(initialAnalysis);
  const [showDashboard, setShowDashboard] = useState(false);
  const [alertFlags, setAlertFlags] = useState([]);
  const [dismissAlert, setDismissAlert] = useState(false);

  // Handler for new analysis result from ConversationAnalyzerPolish or RealTimeDashboard
  function handleAnalysisUpdate(result) {
    if (!result) {
      setAnalysis(initialAnalysis);
      setAlertFlags([]);
      setDismissAlert(false);
      return;
    }

    // Determine verdict label from verdict.band
    const verdictLabel = result.verdict?.band
      ? mapVerdictBandToLabel(result.verdict.band)
      : "Safe";

    // Prepare flagged behaviors array with label and confidence
    const flaggedBehaviors = Array.isArray(result.signals)
      ? result.signals.map((signal) => {
          // derive label with capitalization
          const label = signal.charAt(0).toUpperCase() + signal.slice(1);
          // fallback confidence: use result.confidence if available, else 0.5
          const confidence = typeof result.confidence === "number" ? result.confidence : 0.5;
          return { type: signal, label, confidence };
        })
      : [];

    const overallConfidence =
      typeof result.confidence === "number" ? result.confidence : 0;

    setAnalysis({
      verdict: verdictLabel,
      flaggedBehaviors,
      overallConfidence,
      rawOutput: result,
      error: null,
      loading: false,
    });

    // Check for high-risk flags in flaggedBehaviors not dismissed
    const detectedHighRiskFlags = flaggedBehaviors
      .filter((f) => HIGH_RISK_FLAGS.has(f.type))
      .map((f) => f.label);

    if (detectedHighRiskFlags.length > 0 && !dismissAlert) {
      // Show alert unless dismissed
      setAlertFlags(detectedHighRiskFlags);
    } else {
      setAlertFlags([]);
    }
  }

  // Handler to clear alert dismissal when new analysis happens
  useEffect(() => {
    setDismissAlert(false);
  }, [analysis.rawOutput]);

  // Toggle between ConversationAnalyzer and RealTimeDashboard
  const toggleDashboard = () => {
    setShowDashboard((prev) => !prev);
    // reset analysis on toggle
    setAnalysis(initialAnalysis);
    setAlertFlags([]);
    setDismissAlert(false);
  };

  return (
    <main className="ui-container" role="main" aria-label="FLAGGED conversation analyzer app">
      <header>
        <h1 style={{ textAlign: "center", color: "#ff6f61", userSelect: "none" }}>
          FLAGGED
        </h1>
      </header>

      {/* Immediate alert banner */}
      <ImmediateAlert
        flaggedBehaviors={alertFlags}
        onDismiss={() => setDismissAlert(true)}
      />

      {/* Dashboard toggle button */}
      <div style={{ margin: "1rem 0", textAlign: "center" }}>
        <button
          type="button"
          className="peachy-button"
          aria-pressed={showDashboard}
          onClick={toggleDashboard}
          aria-label={showDashboard ? "Switch to conversation analyzer mode" : "Switch to real-time dashboard mode"}
        >
          {showDashboard ? "Use Conversation Analyzer" : "Open Real-Time Dashboard"}
        </button>
      </div>

      {/* Content area */}
      <section aria-live="polite" aria-atomic="true">
        {showDashboard ? (
          <RealTimeDashboard onAnalysisUpdate={handleAnalysisUpdate} />
        ) : (
          <>
            <ConversationAnalyzerPolish
              onAnalysisUpdate={handleAnalysisUpdate}
            />

            {analysis.error && (
              <div
                role="alert"
                aria-live="assertive"
                style={{
                  marginTop: "1rem",
                  padding: "0.8rem 1.2rem",
                  backgroundColor: "#ffebe9",
                  color: "#b00020",
                  borderRadius: "8px",
                  fontWeight: "700",
                  maxWidth: "600px",
                  marginLeft: "auto",
                  marginRight: "auto",
                }}
              >
                {analysis.error}
              </div>
            )}

            {!analysis.loading && analysis.rawOutput && (
              <>
                <FlaggedResultVisualization
                  verdict={analysis.verdict}
                  flaggedBehaviors={analysis.flaggedBehaviors}
                  overallConfidence={analysis.overallConfidence}
                />

                <ShareableResult
                  verdict={analysis.verdict}
                  flaggedBehaviors={analysis.flaggedBehaviors}
                  overallConfidence={analysis.overallConfidence}
                />
              </>
            )}
          </>
        )}
      </section>
    </main>
  );
}

export default App;