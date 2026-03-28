import React, { useState, useEffect } from "react";

import ConversationAnalyzerPolish from "./components/ConversationAnalyzerPolish";
import ImmediateAlert from "./components/ImmediateAlert";
import FlaggedResultVisualization from "./components/FlaggedResultVisualization";
import ShareableResult from "./components/ShareableResult";
import RealTimeDashboard from "./components/RealTimeDashboard";

import "./styles/UiPolish.css";
import "./styles/UiPolishImprovements.css";

const HIGH_RISK_FLAGS = new Set([
  "insult",
  "threat",
  "ultimatum",
  "gaslighting",
  "discard",
]);

const App = () => {
  const [analysisResult, setAnalysisResult] = useState(null);
  const [showAlert, setShowAlert] = useState(false);
  const [alertFlags, setAlertFlags] = useState([]);
  const [showDashboard, setShowDashboard] = useState(false);
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(false);

  // Handler for analysis updates from ConversationAnalyzerPolish or RealTimeDashboard
  const handleAnalysisUpdate = (result) => {
    setAnalysisResult(result);

    if (result && result.signals) {
      const highRiskDetected = result.signals.filter((s) => HIGH_RISK_FLAGS.has(s));
      if (highRiskDetected.length > 0) {
        setAlertFlags(highRiskDetected);
        setShowAlert(true);
      } else {
        setShowAlert(false);
        setAlertFlags([]);
      }
    } else {
      setShowAlert(false);
      setAlertFlags([]);
    }
  };

  const handleDismissAlert = () => {
    setShowAlert(false);
  };

  // Toggle between paste analyzer and real-time dashboard views
  const toggleDashboard = () => {
    setShowDashboard((prev) => !prev);
    setAnalysisResult(null);
    setShowAlert(false);
    setAlertFlags([]);
    setError(null);
    setLoading(false);
  };

  return (
    <main className="ui-container" role="main" aria-label="Flagged conversation analysis app">
      <header>
        <h1 style={{ textAlign: "center", color: "#cc2f2f", userSelect: "none" }}>
          FLAGGED Conversation Analyzer
        </h1>
        <div style={{ textAlign: "center", marginBottom: 20 }}>
          <button
            type="button"
            onClick={toggleDashboard}
            aria-pressed={showDashboard}
            className="peachy-button"
          >
            {showDashboard ? "Switch to Paste Analyzer" : "Switch to Real-Time Dashboard"}
          </button>
        </div>
      </header>

      {showAlert && alertFlags.length > 0 && (
        <ImmediateAlert flags={alertFlags} onDismiss={handleDismissAlert} />
      )}

      {showDashboard ? (
        <RealTimeDashboard onAnalysis={handleAnalysisUpdate} />
      ) : (
        <>
          <ConversationAnalyzerPolish
            onAnalysis={handleAnalysisUpdate}
            loading={loading}
            setLoading={setLoading}
            error={error}
            setError={setError}
          />

          {error && (
            <div role="alert" aria-live="assertive" style={{ color: "#cc2f2f", marginTop: 12 }}>
              {error}
            </div>
          )}

          {analysisResult && (
            <>
              <FlaggedResultVisualization
                verdict={analysisResult.verdict.label || "Safe"}
                flaggedBehaviors={analysisResult.signals.map((type) => ({
                  type,
                  label: type.charAt(0).toUpperCase() + type.slice(1),
                  confidence: analysisResult.confidence || 0,
                }))}
                overallConfidence={analysisResult.confidence || 0}
              />
              <ShareableResult
                analysis={analysisResult}
                conversationText={analysisResult.meta?.lastInput || ""}
              />
            </>
          )}
        </>
      )}
    </main>
  );
};

export default App;