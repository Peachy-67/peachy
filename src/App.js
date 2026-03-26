import React, { useState, useEffect } from "react";

import ConversationAnalyzerPolish from "./components/ConversationAnalyzerPolish";
import ImmediateAlert from "./components/ImmediateAlert";
import FlaggedResultVisualization from "./components/FlaggedResultVisualization";
import ShareableResult from "./components/ShareableResult";
import RealTimeDashboard from "./components/RealTimeDashboard";

import "./styles/uiPolish.css";

const HIGH_RISK_FLAGS = ["insult", "threat", "gaslighting", "ultimatum"];

function hasHighRiskFlags(flags) {
  if (!flags || !Array.isArray(flags)) return false;
  return flags.some((flag) => HIGH_RISK_FLAGS.includes(flag.toLowerCase()));
}

/**
 * Main App Component
 * Integrates:
 * - ConversationAnalyzerPolish for input and analysis
 * - ImmediateAlert for notifying user on detection of high-risk flags
 * - FlaggedResultVisualization for polished results display
 * - ShareableResult with share and copy support
 * - RealTimeDashboard supporting toggling view and real-time monitoring
 */
const App = () => {
  const [analysis, setAnalysis] = useState(null);
  const [alertFlags, setAlertFlags] = useState([]);
  const [showDashboard, setShowDashboard] = useState(false);

  // Update alert flags on new analysis
  useEffect(() => {
    if (analysis && analysis.signals) {
      const detectedHighRisk = analysis.signals.filter((signal) =>
        HIGH_RISK_FLAGS.includes(signal.toLowerCase())
      );
      setAlertFlags(detectedHighRisk);
    } else {
      setAlertFlags([]);
    }
  }, [analysis]);

  // Handler for new analysis result from analyzer components
  const onAnalysisUpdate = (result) => {
    setAnalysis(result);
  };

  // Toggle between dashboard real-time monitoring and paste analyzer
  const toggleDashboard = () => {
    setShowDashboard((prev) => !prev);
    setAnalysis(null);
    setAlertFlags([]);
  };

  return (
    <main className="ui-container" aria-label="FLAGGED conversation analyzer app">
      <header aria-label="Application title and mode toggle" style={{ textAlign: "center", marginBottom: "1rem" }}>
        <h1 style={{ userSelect: "none", color: "#ff6f61" }}>FLAGGED</h1>
        <button
          type="button"
          onClick={toggleDashboard}
          className="share-button"
          aria-pressed={showDashboard}
          aria-label={showDashboard ? "Switch to Conversation Analyzer" : "Switch to Real-Time Dashboard"}
          style={{ marginTop: 0 }}
        >
          {showDashboard ? "Use Conversation Analyzer" : "Use Real-Time Dashboard"}
        </button>
      </header>

      {/* Immediate alerts on high-risk detections */}
      <ImmediateAlert flaggedBehaviors={alertFlags} />

      <section aria-live="polite" aria-atomic="true" style={{ minHeight: "320px" }}>
        {!showDashboard ? (
          <>
            {/* Paste input analyzer */}
            <ConversationAnalyzerPolish onAnalysis={onAnalysisUpdate} />

            {/* Show results if available */}
            {analysis && (
              <>
                <FlaggedResultVisualization
                  verdict={analysis.verdict.label}
                  flaggedBehaviors={analysis.signals.map((signal) => ({
                    type: signal,
                    label: signal.charAt(0).toUpperCase() + signal.slice(1),
                    confidence: 1.0, // Backend confidence per signal not detailed here, so using 1.0
                  }))}
                  overallConfidence={analysis.confidence}
                />
                <ShareableResult analysis={analysis} />
              </>
            )}
          </>
        ) : (
          /* Real-time monitoring dashboard */
          <RealTimeDashboard onAnalysis={onAnalysisUpdate} />
        )}
      </section>
    </main>
  );
};

export default App;