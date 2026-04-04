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
  "ultimatum",
  "discard",
]);

const verdictToLabel = {
  green: "Safe",
  yellow: "Caution",
  red: "Flagged",
};

function App() {
  // Holds analysis result from conversation analyzer or real-time dashboard
  const [analysisResult, setAnalysisResult] = useState(null);

  // Controls showing immediate alert banner for high-risk flags
  const [showAlert, setShowAlert] = useState(false);

  // Holds list of detected high-risk flags (to show in alert)
  const [alertFlags, setAlertFlags] = useState([]);

  // Toggle between paste input analyzer and real-time monitoring dashboard
  const [dashboardVisible, setDashboardVisible] = useState(false);

  // Error state to show any analysis errors
  const [error, setError] = useState(null);

  // Loading state during analysis
  const [loading, setLoading] = useState(false);

  // On new analysis result update, check for alerts and reset UI errors
  useEffect(() => {
    setError(null);
    if (analysisResult && analysisResult.signals && analysisResult.signals.length) {
      const highRiskFound = analysisResult.signals.filter((sig) =>
        HIGH_RISK_FLAGS.has(sig)
      );
      if (highRiskFound.length > 0) {
        setAlertFlags(highRiskFound);
        setShowAlert(true);
      } else {
        setAlertFlags([]);
        setShowAlert(false);
      }
    } else {
      setAlertFlags([]);
      setShowAlert(false);
    }
  }, [analysisResult]);

  // Handle new analysis from ConversationAnalyzerPolish or RealTimeDashboard
  const handleAnalysisUpdate = (result) => {
    setAnalysisResult(result);
    setError(null);
    setLoading(false);
  };

  // Handle errors from analysis components
  const handleAnalysisError = (err) => {
    setError(err?.message || "Analysis failed");
    setLoading(false);
  };

  // Handle loading state during analysis
  const handleLoading = (isLoading) => {
    setLoading(isLoading);
  };

  // Dismiss alert banner (only hides banner, alert still shown via native)
  const dismissAlert = () => {
    setShowAlert(false);
  };

  // Derive verdict label from analysisResult
  const verdictLabel =
    analysisResult && analysisResult.verdict && analysisResult.verdict.band
      ? verdictToLabel[analysisResult.verdict.band] || "Safe"
      : "Safe";

  return (
    <main className="ui-container" role="main" aria-label="Flagged conversation analyzer">
      <header>
        <h1 style={{ userSelect: "none", textAlign: "center", color: "#ff6f61" }}>
          FLAGGED Conversation Analyzer
        </h1>
      </header>

      <section aria-label="Mode toggle for conversation analyzer or real-time dashboard" style={{ marginBottom: "1rem", textAlign: "center" }}>
        <button
          type="button"
          onClick={() => setDashboardVisible((v) => !v)}
          className="peachy-button"
          aria-pressed={dashboardVisible}
          aria-label={
            dashboardVisible ? "Switch to conversation paste analyzer" : "Switch to real-time dashboard monitor"
          }
        >
          {dashboardVisible ? "Use Paste Analyzer" : "Use Real-Time Dashboard"}
        </button>
      </section>

      {showAlert && alertFlags.length > 0 && (
        <ImmediateAlert flags={alertFlags} onDismiss={dismissAlert} />
      )}

      {!dashboardVisible && (
        <section aria-label="Conversation input and analysis area">
          <ConversationAnalyzerPolish
            onAnalysisUpdate={handleAnalysisUpdate}
            onError={handleAnalysisError}
            onLoading={handleLoading}
          />
          {loading && (
            <p
              role="status"
              aria-live="polite"
              style={{ textAlign: "center", marginTop: "0.5rem", color: "#d17e00" }}
            >
              Analyzing conversation...
            </p>
          )}
          {error && (
            <p
              role="alert"
              aria-live="assertive"
              style={{ textAlign: "center", marginTop: "0.5rem", color: "#cc2f2f" }}
            >
              {error}
            </p>
          )}
        </section>
      )}

      {analysisResult && !dashboardVisible && (
        <section aria-label="Flagged conversation results and sharing" style={{ marginTop: "1.5rem" }}>
          <FlaggedResultVisualization
            verdict={verdictToLabel[analysisResult.verdict.band] || "Safe"}
            flaggedBehaviors={analysisResult.signals.map((sig) => ({
              type: sig,
              label: sig.charAt(0).toUpperCase() + sig.slice(1),
              confidence: analysisResult.confidence || 0,
            }))}
            overallConfidence={analysisResult.confidence || 0}
          />
          <ShareableResult analysis={analysisResult} />
        </section>
      )}

      {dashboardVisible && (
        <RealTimeDashboard
          onAnalysisUpdate={handleAnalysisUpdate}
          onError={handleAnalysisError}
          onLoading={handleLoading}
        />
      )}
      
      <footer style={{ textAlign: "center", marginTop: "2rem", fontSize: "0.85rem", color: "#666" }}>
        <small>FLAGGED &copy; 2024 - Detect red flags in conversations</small>
      </footer>
    </main>
  );
}

export default App;