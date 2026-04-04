import React, { useState, useEffect } from "react";

import ConversationAnalyzerPolish from "./components/ConversationAnalyzerPolish";
import ImmediateAlert from "./components/ImmediateAlert";
import FlaggedResultVisualization from "./components/FlaggedResultVisualization";
import ShareableResult from "./components/ShareableResult";
import RealTimeDashboard from "./components/RealTimeDashboard";

import "./styles/UiPolish.css";

const HIGH_RISK_FLAGS = new Set([
  "insult",
  "gaslighting",
  "threat",
  "ultimatum",
  "discard",
  "control",
  "guilt",
  "boundary_push",
]);

function App() {
  const [analysisResult, setAnalysisResult] = useState(null);
  const [alertVisible, setAlertVisible] = useState(false);
  const [alertFlags, setAlertFlags] = useState([]);
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(false);
  const [viewDashboard, setViewDashboard] = useState(false);

  // Show alert for high-risk flags immediately on analysis update
  useEffect(() => {
    if (analysisResult?.flags) {
      const highRiskDetected = analysisResult.flags.filter((flag) =>
        HIGH_RISK_FLAGS.has(flag.type)
      );
      if (highRiskDetected.length > 0) {
        // Show alert banner and native alert
        setAlertFlags(highRiskDetected);
        setAlertVisible(true);
        // Use native alert but only once per detection to avoid spamming
        if (typeof window !== "undefined") {
          const alertMessage = `⚠️ High risk flag detected: ${highRiskDetected
            .map((f) => f.label)
            .join(", ")}`;
          // Use setTimeout to avoid blocking render
          setTimeout(() => window.alert(alertMessage), 100);
        }
      } else {
        setAlertVisible(false);
        setAlertFlags([]);
      }
    } else {
      setAlertVisible(false);
      setAlertFlags([]);
    }
  }, [analysisResult]);

  // Handler for analysis updates from ConversationAnalyzerPolish or RealTimeDashboard
  function handleAnalysisUpdate(result) {
    setAnalysisResult(result);
  }

  function dismissAlert() {
    setAlertVisible(false);
  }

  // Toggle view between Conversation Analyzer and RealTime Dashboard
  function toggleDashboard() {
    setViewDashboard((v) => !v);
    setAnalysisResult(null);
    setError(null);
  }

  return (
    <main className="ui-container" role="main" aria-label="Flagged conversation analysis app">
      <header>
        <h1 style={{ textAlign: "center", userSelect: "none", color: "#ff6f61" }}>
          FLAGGED &mdash; Conversation Red Flag Detector
        </h1>
        <div style={{ textAlign: "center", marginBottom: "1rem" }}>
          <button
            type="button"
            onClick={toggleDashboard}
            className="peachy-button"
            aria-pressed={viewDashboard}
            aria-label={`Switch to ${viewDashboard ? "Paste Analyzer" : "Real-Time Dashboard"}`}
          >
            {viewDashboard ? "Switch to Paste Analyzer" : "Switch to Real-Time Dashboard"}
          </button>
        </div>
      </header>

      <ImmediateAlert
        visible={alertVisible}
        flags={alertFlags}
        onDismiss={dismissAlert}
      />

      {viewDashboard ? (
        <RealTimeDashboard
          onAnalysisUpdate={handleAnalysisUpdate}
          analysisResult={analysisResult}
          error={error}
          loading={loading}
          setError={setError}
          setLoading={setLoading}
        />
      ) : (
        <>
          <ConversationAnalyzerPolish
            onAnalysis={handleAnalysisUpdate}
            setError={setError}
            setLoading={setLoading}
            loading={loading}
            error={error}
          />

          {analysisResult && (
            <>
              <FlaggedResultVisualization
                verdict={analysisResult.verdict}
                flaggedBehaviors={analysisResult.flags}
                overallConfidence={analysisResult.confidence}
              />
              <ShareableResult result={analysisResult} />
            </>
          )}
        </>
      )}
    </main>
  );
}

export default App;