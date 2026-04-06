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
  "gaslighting",
  "discard",
  "ultimatum",
  "control",
  "guilt",
  "boundary_push",
]);

function App() {
  const [analysisResult, setAnalysisResult] = useState(null);
  const [showDashboard, setShowDashboard] = useState(false);
  const [alertFlags, setAlertFlags] = useState([]);
  const [error, setError] = useState(null);

  // Update alerts when analysisResult changes
  useEffect(() => {
    if (analysisResult && Array.isArray(analysisResult.signals)) {
      const highRiskDetected = analysisResult.signals.filter((flag) =>
        HIGH_RISK_FLAGS.has(flag)
      );
      setAlertFlags(highRiskDetected);
    } else {
      setAlertFlags([]);
    }
  }, [analysisResult]);

  // Handle paste analyzer result update
  const handleAnalysisUpdate = (result) => {
    setError(null);
    setAnalysisResult(result);
  };

  // Handle error in analysis
  const handleAnalysisError = (err) => {
    setAnalysisResult(null);
    setError(err?.message || "Analysis failed. Please try again.");
  };

  return (
    <main className="ui-container" role="main" aria-label="Flagged Conversation Analyzer">
      <header>
        <h1 style={{ userSelect: "none", textAlign: "center", color: "#ff6f61" }}>
          FLAGGED
        </h1>
      </header>

      <section aria-label="Conversation input and analysis" style={{ marginBottom: "2rem" }}>
        {!showDashboard && (
          <ConversationAnalyzerPolish
            onResult={handleAnalysisUpdate}
            onError={handleAnalysisError}
          />
        )}

        {error && (
          <div
            role="alert"
            aria-live="assertive"
            className="alert-banner"
            style={{ marginTop: "1rem" }}
          >
            {error}
          </div>
        )}

        {analysisResult && !showDashboard && (
          <>
            <FlaggedResultVisualization
              verdict={analysisResult.verdict?.label || "Safe"}
              flaggedBehaviors={analysisResult.signals.map((flag) => ({
                type: flag,
                label: flag.charAt(0).toUpperCase() + flag.slice(1),
                confidence: analysisResult.confidence || 0,
              }))}
              overallConfidence={analysisResult.confidence || 0}
            />
            <ShareableResult analysis={analysisResult} />
          </>
        )}

        <ImmediateAlert flaggedBehaviors={alertFlags} />
      </section>

      <section aria-label="Dashboard toggle" style={{ textAlign: "center", marginTop: "2rem" }}>
        <button
          type="button"
          className="peachy-button"
          onClick={() => setShowDashboard((v) => !v)}
          aria-pressed={showDashboard}
          aria-label={showDashboard ? "Hide real-time dashboard" : "Show real-time dashboard"}
        >
          {showDashboard ? "Hide Real-Time Dashboard" : "Show Real-Time Dashboard"}
        </button>
      </section>

      {showDashboard && (
        <section aria-label="Real-time monitoring dashboard" style={{ marginTop: "2rem" }}>
          <RealTimeDashboard
            onAnalysisUpdate={setAnalysisResult}
            currentAnalysis={analysisResult}
          />
        </section>
      )}
    </main>
  );
}

export default App;