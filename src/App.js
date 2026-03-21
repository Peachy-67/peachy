import React, { useState, useEffect } from "react";

import ConversationAnalyzerPolish from "./components/ConversationAnalyzerPolish";
import ImmediateAlert from "./components/ImmediateAlert";
import FlaggedResultVisualization from "./components/FlaggedResultVisualization";
import ShareableResult from "./components/ShareableResult";
import RealTimeDashboard from "./components/RealTimeDashboard";

import "./styles/UiPolish.css";

const App = () => {
  const [analysis, setAnalysis] = useState(null);
  const [error, setError] = useState(null);
  const [showDashboard, setShowDashboard] = useState(false);
  const [alertFlags, setAlertFlags] = useState([]);

  // Check for high-risk flags to trigger alerts
  useEffect(() => {
    if (analysis && analysis.signals?.length) {
      // Define high-risk flags that trigger alert
      const highRiskFlags = ["insult", "discard", "threat", "gaslighting", "control"];
      const matched = analysis.signals.filter((flag) => highRiskFlags.includes(flag));
      setAlertFlags(matched);
    } else {
      setAlertFlags([]);
    }
  }, [analysis]);

  // Handler for new analysis results from analyzer or dashboard
  const handleAnalysisUpdate = (result) => {
    setAnalysis(result);
  };

  // Toggle real-time dashboard view vs conversation analyzer
  const toggleDashboard = () => {
    setShowDashboard((prev) => !prev);
    setAnalysis(null);
    setError(null);
  };

  return (
    <main className="ui-container" role="main" aria-label="FLAGGED conversation analyzer application">
      <header>
        <h1 style={{ textAlign: "center", color: "#ff6f61", userSelect: "none" }}>FLAGGED</h1>
        <p style={{ textAlign: "center", fontWeight: "600", color: "#cc4c2e" }}>
          Detect red flags in conversations to spot manipulation and harmful behavior
        </p>
      </header>

      <section aria-label="Conversation input and analyzer" style={{ marginTop: "1.25rem" }}>
        {!showDashboard ? (
          <ConversationAnalyzerPolish
            onAnalysis={handleAnalysisUpdate}
            onError={setError}
            key="analyzer"
          />
        ) : (
          <RealTimeDashboard onAnalysis={handleAnalysisUpdate} key="dashboard" />
        )}
      </section>

      <section aria-live="polite" aria-label="Analysis alerts and results" style={{ marginTop: "1rem" }}>
        <ImmediateAlert flaggedBehaviors={alertFlags} />
        {error && (
          <div
            className="alert-banner"
            role="alert"
            aria-live="assertive"
            style={{ marginTop: "1rem", fontWeight: "700", color: "#b00020" }}
          >
            {error}
          </div>
        )}
        {analysis && !error && (
          <article aria-label="Flagged conversation results" style={{ marginTop: "1rem" }}>
            <FlaggedResultVisualization
              verdict={analysis.verdict ? analysis.verdict.label : "Safe"}
              flaggedBehaviors={analysis.flags || analysis.signals.map((s) => ({
                type: s,
                label: s.charAt(0).toUpperCase() + s.slice(1),
                confidence: 1.0,
              }))}
              overallConfidence={analysis.confidence ?? 0}
            />
            <ShareableResult analysis={analysis} />
          </article>
        )}
      </section>

      <footer style={{ marginTop: "2rem", textAlign: "center" }}>
        <button
          type="button"
          onClick={toggleDashboard}
          className="peachy-button"
          aria-pressed={showDashboard}
          aria-label={showDashboard ? "Switch to conversation paste analyzer" : "Switch to real-time dashboard"}
        >
          {showDashboard ? "Use Paste Analyzer" : "Open Real-time Dashboard"}
        </button>
      </footer>
    </main>
  );
};

export default App;