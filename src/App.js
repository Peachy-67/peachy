import React, { useState, useEffect, useCallback } from "react";

import ConversationAnalyzerPolish from "./components/ConversationAnalyzerPolish";
import ImmediateAlert from "./components/ImmediateAlert";
import FlaggedResultVisualization from "./components/FlaggedResultVisualization";
import ShareableResult from "./components/ShareableResult";
import RealTimeDashboard from "./components/RealTimeDashboard";

import "./styles/UiPolish.css";

const HIGH_RISK_FLAGS = new Set(["insult", "gaslighting", "threat", "ultimatum", "discard"]);

const App = () => {
  // Analysis result state after user input or real-time updates
  const [analysis, setAnalysis] = useState(null);
  const [alertFlags, setAlertFlags] = useState([]);
  const [showDashboard, setShowDashboard] = useState(false);

  // Handler for new analysis result from ConversationAnalyzer or realtime dashboard
  const onAnalysisUpdate = useCallback((result) => {
    setAnalysis(result);

    // Identify high-risk detected flags for immediate alert
    if (result && Array.isArray(result.signals)) {
      const highRiskDetected = result.signals.filter((flag) => HIGH_RISK_FLAGS.has(flag));
      setAlertFlags(highRiskDetected);
    } else {
      setAlertFlags([]);
    }
  }, []);

  // Handler to dismiss the alert banner
  const dismissAlert = () => {
    setAlertFlags([]);
  };

  // Toggles between paste analyzer interface and realtime dashboard
  const toggleDashboard = () => {
    setShowDashboard((v) => !v);
    // Reset analysis and alerts on toggle for clarity
    setAnalysis(null);
    setAlertFlags([]);
  };

  return (
    <main className="ui-container" role="main" aria-label="Flagged Conversation Analyzer App">
      <header>
        <h1 style={{ textAlign: "center", userSelect: "none", color: "#ff6f61" }}>FLAGGED</h1>
        <p style={{ textAlign: "center", fontWeight: "600", marginTop: "-8px", marginBottom: "1rem", color: "#bb4c45" }}>
          Detect red flags in conversations and protect yourself
        </p>
        <div style={{ textAlign: "center", marginBottom: "1rem" }}>
          <button onClick={toggleDashboard} className="peachy-button" aria-pressed={showDashboard} type="button">
            {showDashboard ? "Use Paste Analyzer" : "Use Real-Time Dashboard"}
          </button>
        </div>
      </header>

      {alertFlags.length > 0 && (
        <ImmediateAlert flaggedBehaviors={alertFlags} onDismiss={dismissAlert} />
      )}

      {showDashboard ? (
        <section aria-label="Real-time monitoring dashboard">
          <RealTimeDashboard onAnalysisUpdate={onAnalysisUpdate} />
        </section>
      ) : (
        <section aria-label="Conversation paste analyzer">
          <ConversationAnalyzerPolish onAnalysisUpdate={onAnalysisUpdate} />
          {analysis && (
            <>
              <FlaggedResultVisualization
                verdict={analysis.verdict?.label || "Safe"}
                flaggedBehaviors={
                  (analysis.signals || []).map((signal) => ({
                    type: signal,
                    label: signal.charAt(0).toUpperCase() + signal.slice(1),
                    confidence: analysis.confidence || 0,
                  })) || []
                }
                overallConfidence={analysis.confidence || 0}
              />
              <ShareableResult analysis={analysis} />
            </>
          )}
        </section>
      )}

      <footer style={{ marginTop: "3rem", textAlign: "center", fontSize: "0.85rem", color: "#aaa", userSelect: "none" }}>
        &copy; {new Date().getFullYear()} FLAGGED. All rights reserved.
      </footer>
    </main>
  );
};

export default App;