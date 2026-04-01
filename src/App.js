import React, { useState, useEffect } from "react";
import ConversationAnalyzerPolish from "./components/ConversationAnalyzerPolish";
import ImmediateAlert from "./components/ImmediateAlert";
import FlaggedResultVisualization from "./components/FlaggedResultVisualization";
import ShareableResult from "./components/ShareableResult";
import RealTimeDashboard from "./components/RealTimeDashboard";

import "./styles/UiPolish.css";

const App = () => {
  const [analysisResult, setAnalysisResult] = useState(null);
  const [alertFlags, setAlertFlags] = useState([]);
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(false);
  const [showDashboard, setShowDashboard] = useState(false);

  // Watch high risk flags to trigger immediate alerts
  useEffect(() => {
    if (analysisResult && analysisResult.signals) {
      // Define high-risk flags for immediate alert triggering
      const highRiskFlags = ["insult", "gaslighting", "discard", "threat", "ultimatum", "control", "guilt", "boundary_push"];
      const foundHighRiskFlags = analysisResult.signals.filter((flag) =>
        highRiskFlags.includes(flag.toLowerCase())
      );
      setAlertFlags(foundHighRiskFlags);
      if (foundHighRiskFlags.length > 0) {
        // Immediate browser alert as fallback for critical flags
        // Using setTimeout to avoid blocking React render
        setTimeout(() => {
          alert(
            `Warning: High-risk behavior detected: ${foundHighRiskFlags
              .map((f) => f.charAt(0).toUpperCase() + f.slice(1))
              .join(", ")}`
          );
        }, 0);
      }
    } else {
      setAlertFlags([]);
    }
  }, [analysisResult]);

  const handleAnalysisUpdate = (result) => {
    setAnalysisResult(result);
    setError(null);
  };

  const handleError = (errMsg) => {
    setError(errMsg);
    setAnalysisResult(null);
  };

  const handleLoading = (isLoading) => {
    setLoading(isLoading);
  };

  const toggleDashboard = () => {
    setShowDashboard((v) => !v);
  };

  return (
    <main className="ui-container" role="main" aria-label="Flagged conversation analyzer application">
      <header style={{ textAlign: "center", marginBottom: "1rem", userSelect: "none" }}>
        <h1 style={{ color: "#ff6f61" }}>FLAGGED Conversation Analyzer</h1>
        <button
          type="button"
          aria-pressed={showDashboard}
          onClick={toggleDashboard}
          style={{
            margin: "0.5rem auto 1.5rem",
            display: "block",
            backgroundColor: "#ff6f61",
            color: "white",
            border: "none",
            borderRadius: "6px",
            padding: "0.5rem 1.25rem",
            fontWeight: "600",
            cursor: "pointer",
            boxShadow: "0 3px 7px rgba(255, 111, 97, 0.5)",
            userSelect: "none"
          }}
        >
          {showDashboard ? "Switch to Paste Analyzer" : "Switch to Real-Time Dashboard"}
        </button>
      </header>

      {showDashboard ? (
        <RealTimeDashboard
          onAnalysisUpdate={handleAnalysisUpdate}
          onError={handleError}
          onLoading={handleLoading}
          analysisResult={analysisResult}
        />
      ) : (
        <>
          <ConversationAnalyzerPolish
            onAnalysisUpdate={handleAnalysisUpdate}
            onError={handleError}
            onLoading={handleLoading}
          />
          {loading && (
            <p role="status" aria-live="polite" style={{ textAlign: "center", color: "#ff6f61" }}>
              Analyzing conversation…
            </p>
          )}
          {error && (
            <p role="alert" style={{ textAlign: "center", color: "#cc2f2f", fontWeight: "700" }}>
              {error}
            </p>
          )}
        </>
      )}

      {analysisResult && (
        <>
          <ImmediateAlert flaggedBehaviors={alertFlags} />
          <FlaggedResultVisualization
            verdict={analysisResult.verdict.label}
            flaggedBehaviors={analysisResult.signals.map((sig) => ({
              type: sig,
              label: sig.charAt(0).toUpperCase() + sig.slice(1),
              confidence: analysisResult.confidence || 0,
            }))}
            overallConfidence={analysisResult.confidence || 0}
          />
          <ShareableResult analysisResult={analysisResult} />
        </>
      )}
    </main>
  );
};

export default App;