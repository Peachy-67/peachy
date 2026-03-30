import React, { useState, useEffect } from "react";

import ConversationAnalyzerPolish from "./components/ConversationAnalyzerPolish";
import ImmediateAlert from "./components/ImmediateAlert";
import FlaggedResultVisualization from "./components/FlaggedResultVisualization";
import ShareableResult from "./components/ShareableResult";
import RealTimeDashboard from "./components/RealTimeDashboard";

import "./styles/UiPolish.css";
import "./styles/FlaggedResultVisualization.css";
import "./styles/ImmediateAlert.css";

const HIGH_RISK_FLAGS = new Set(["insult", "gaslighting", "threat", "discard"]);

const App = () => {
  const [analysisResult, setAnalysisResult] = useState(null);
  const [alertFlags, setAlertFlags] = useState([]);
  const [showDashboard, setShowDashboard] = useState(false);
  const [error, setError] = useState(null);

  // When analysis result changes, detect high risk flags and trigger alert if any
  useEffect(() => {
    if (!analysisResult) {
      setAlertFlags([]);
      return;
    }
    const detectedFlags = analysisResult.signals || [];
    const highRiskFound = detectedFlags.filter((flag) => HIGH_RISK_FLAGS.has(flag));
    if (highRiskFound.length > 0) {
      setAlertFlags(highRiskFound);
      // Native alert for immediate attention
      alert(
        `High-risk behavior detected: ${highRiskFound
          .map((f) => f.charAt(0).toUpperCase() + f.slice(1))
          .join(", ")}. Please review carefully.`
      );
    } else {
      setAlertFlags([]);
    }
  }, [analysisResult]);

  // Handler to receive analysis data from conversation analyzer
  const onAnalysis = (result, error) => {
    if (error) {
      setError(error);
      setAnalysisResult(null);
      setAlertFlags([]);
    } else {
      setError(null);
      setAnalysisResult(result);
    }
  };

  // Toggle between RealTimeDashboard and ConversationAnalyzerPolish
  const toggleDashboard = () => {
    setShowDashboard((show) => !show);
    // Clear past analysis and alerts when switching views
    setAnalysisResult(null);
    setAlertFlags([]);
    setError(null);
  };

  return (
    <main className="ui-container" role="main" aria-label="FLAGGED conversation analyzer app">
      <header style={{ textAlign: "center", marginBottom: "1rem", userSelect: "none" }}>
        <h1 style={{ color: "#ff6f61", fontWeight: "800" }}>FLAGGED</h1>
        <p style={{ fontSize: "1rem", fontWeight: "600", color: "#555" }}>
          Detect manipulation, gaslighting, insults, and red flags in conversations.
        </p>
        <button
          type="button"
          onClick={toggleDashboard}
          aria-pressed={showDashboard}
          aria-label={showDashboard ? "Switch to Paste Analyzer Mode" : "Switch to Real-Time Dashboard Mode"}
          className="peachy-button"
          style={{ marginTop: "0.5rem", userSelect: "none" }}
        >
          {showDashboard ? "Use Paste Analyzer" : "Open Real-Time Dashboard"}
        </button>
      </header>

      {alertFlags.length > 0 && <ImmediateAlert flaggedBehaviors={alertFlags} />}

      {showDashboard ? (
        <RealTimeDashboard
          onAnalysisUpdate={(result) => {
            setAnalysisResult(result);
            // Immediate alerts for dashboard mode
            const highRiskDetected = (result?.signals || []).filter((flag) => HIGH_RISK_FLAGS.has(flag));
            if (highRiskDetected.length !== alertFlags.length || !alertFlags.every((f) => highRiskDetected.includes(f))) {
              setAlertFlags(highRiskDetected);
              if (highRiskDetected.length > 0) {
                alert(
                  `High-risk behavior detected: ${highRiskDetected
                    .map((f) => f.charAt(0).toUpperCase() + f.slice(1))
                    .join(", ")}. Please review carefully.`
                );
              }
            }
          }}
        />
      ) : (
        <>
          <ConversationAnalyzerPolish onAnalysis={onAnalysis} />

          {error && (
            <div role="alert" aria-live="assertive" className="alert-banner" style={{ marginTop: "1rem" }}>
              {error}
            </div>
          )}

          {analysisResult && !error && (
            <>
              <FlaggedResultVisualization
                verdict={analysisResult.verdict.label === "Safe" ? "Safe" : analysisResult.verdict.label === "Caution" ? "Caution" : "Flagged"}
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
        </>
      )}
    </main>
  );
};

export default App;