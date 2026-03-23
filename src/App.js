import React, { useState, useEffect } from "react";

import ConversationAnalyzerPolish from "./components/ConversationAnalyzerPolish";
import ImmediateAlert from "./components/ImmediateAlert";
import FlaggedResultVisualization from "./components/FlaggedResultVisualization";
import ShareableResult from "./components/ShareableResult";
import RealTimeDashboard from "./components/RealTimeDashboard";

import "./styles/UiPolishImprovements.css";

const App = () => {
  const [analysisResult, setAnalysisResult] = useState(null);
  const [showDashboard, setShowDashboard] = useState(false);
  const [alertFlags, setAlertFlags] = useState([]);
  const [error, setError] = useState(null);

  // Empty result means no analysis done yet
  // analysisResult here is the full structured analysis object from ConversationAnalyzerPolish

  // On analysis update, update alerts if any high-risk flags found
  useEffect(() => {
    if (!analysisResult) {
      setAlertFlags([]);
      return;
    }

    // Define high-risk flags for immediate alerting
    const highRiskFlags = ["insult", "gaslighting", "discard", "threat", "ultimatum", "control"];
    const foundHighRiskFlags = (analysisResult.signals || []).filter((flag) =>
      highRiskFlags.includes(flag.toLowerCase())
    );

    setAlertFlags(foundHighRiskFlags);
  }, [analysisResult]);

  // Handlers for analysis result update from ConversationAnalyzerPolish or RealTimeDashboard
  const handleAnalysisUpdate = (result) => {
    setAnalysisResult(result);
    setError(null);
  };

  // Error handler
  const handleError = (errMsg) => {
    setError(errMsg);
  };

  return (
    <main className="ui-container" aria-label="Flagged conversation analyzer application">
      <header>
        <h1 style={{ color: "#ff6f61", userSelect: "none", textAlign: "center", marginBottom: "1rem" }}>
          FLAGGED
        </h1>
      </header>

      <ImmediateAlert flaggedFlags={alertFlags} onDismiss={() => setAlertFlags([])} />

      <section aria-label="Toggle between conversation analyzer and real-time dashboard">
        <button
          type="button"
          className="peachy-button"
          onClick={() => setShowDashboard((s) => !s)}
          aria-pressed={showDashboard}
          style={{ marginBottom: "1.25rem" }}
        >
          {showDashboard ? "Switch to Paste Analyzer" : "Switch to Real-Time Dashboard"}
        </button>
      </section>

      {showDashboard ? (
        <RealTimeDashboard
          onAnalysisUpdate={handleAnalysisUpdate}
          onError={handleError}
        />
      ) : (
        <ConversationAnalyzerPolish
          onAnalysisUpdate={handleAnalysisUpdate}
          onError={handleError}
        />
      )}

      {error && (
        <div role="alert" className="alert-banner" style={{ marginTop: "1rem" }}>
          {error}
        </div>
      )}

      <section aria-live="polite" aria-label="Analysis results" tabIndex={-1}>
        {!analysisResult ? (
          <p style={{ fontStyle: "italic", color: "#666", userSelect: "none", marginTop: "1rem" }}>
            Paste a conversation above and click analyze to detect red flags.
          </p>
        ) : (
          <>
            <FlaggedResultVisualization
              verdict={analysisResult.verdict?.label || "Safe"}
              flaggedBehaviors={
                (analysisResult.signals || []).map((flagType) => ({
                  type: flagType,
                  label: flagType.charAt(0).toUpperCase() + flagType.slice(1),
                  confidence: analysisResult.confidence ?? 0,
                }))
              }
              overallConfidence={analysisResult.confidence || 0}
            />
            <ShareableResult result={analysisResult} />
          </>
        )}
      </section>
    </main>
  );
};

export default App;