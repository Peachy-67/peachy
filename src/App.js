import React, { useState, useEffect } from "react";

import ConversationAnalyzerPolish from "./components/ConversationAnalyzerPolish";
import ImmediateAlert from "./components/ImmediateAlert";
import FlaggedResultVisualization from "./components/FlaggedResultVisualization";
import ShareableResult from "./components/ShareableResult";
import RealTimeDashboard from "./components/RealTimeDashboard";

import "./styles/UiPolish.css";

const highRiskFlags = ["insult", "threat", "gaslighting", "ultimatum"];

// App main component integrates conversation analyzer, alert, result visualization, sharing, and real-time dashboard toggle.
const App = () => {
  // store the latest analysis result from conversation analyzer or real-time dashboard
  const [analysis, setAnalysis] = useState(null);

  // show if a high risk alert banner should be visible
  const [alertVisible, setAlertVisible] = useState(false);

  // toggle for showing real-time live dashboard or paste analyzer UI
  const [showDashboard, setShowDashboard] = useState(false);

  // Handler to receive new analysis results from child components
  function handleAnalysisUpdate(newAnalysis) {
    setAnalysis(newAnalysis);

    // check for any high-risk flags detected
    const flaggedTypes = (newAnalysis?.signals || []).map((s) => s.toLowerCase());
    const hasHighRisk = highRiskFlags.some((flag) => flaggedTypes.includes(flag));
    setAlertVisible(hasHighRisk);
  }

  // Dismiss alert banner handler
  function dismissAlert() {
    setAlertVisible(false);
  }

  return (
    <main className="ui-container" role="main" aria-label="FLAGGED conversation red flag detection app">
      <h1 style={{ textAlign: "center", userSelect: "none", marginBottom: "1rem", color: "#ff6f3c" }}>FLAGGED</h1>

      <section aria-label="Toggle conversation monitoring mode" style={{ textAlign: "center", marginBottom: "1rem" }}>
        <button
          type="button"
          onClick={() => setShowDashboard((prev) => !prev)}
          aria-pressed={showDashboard}
          className="peachy-button"
          title={showDashboard ? "Switch to paste conversation analyzer" : "Switch to real-time monitoring dashboard"}
        >
          {showDashboard ? "Use Paste Conversation Analyzer" : "Use Real-Time Monitoring Dashboard"}
        </button>
      </section>

      {alertVisible && (
        <ImmediateAlert flaggedBehaviors={(analysis?.signals || []).filter((s) => highRiskFlags.includes(s.toLowerCase()))} onDismiss={dismissAlert} />
      )}

      {!showDashboard && (
        <>
          <ConversationAnalyzerPolish onAnalysis={handleAnalysisUpdate} />

          {analysis && (
            <section aria-label="Flagged conversation result visualization and sharing">
              <FlaggedResultVisualization
                verdict={analysis.verdict?.label || "Safe"}
                flaggedBehaviors={(analysis.signals || []).map((type) => ({
                  type,
                  label: type.charAt(0).toUpperCase() + type.slice(1),
                  confidence: 1, // No separate per-flag confidence from main analysis, assume 1 for visualization
                }))}
                overallConfidence={typeof analysis.confidence === "number" ? analysis.confidence : 0}
              />
              <ShareableResult analysis={analysis} />
            </section>
          )}
        </>
      )}

      {showDashboard && <RealTimeDashboard onAnalysis={handleAnalysisUpdate} />}

      <footer style={{ marginTop: "3rem", textAlign: "center", fontSize: "0.85rem", color: "#777" }}>
        &copy; 2024 FLAGGED by Peachy
      </footer>
    </main>
  );
};

export default App;