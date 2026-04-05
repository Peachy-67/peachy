import React, { useState, useEffect } from "react";

import ConversationAnalyzerPolish from "./components/ConversationAnalyzerPolish";
import ImmediateAlert from "./components/ImmediateAlert";
import FlaggedResultVisualization from "./components/FlaggedResultVisualization";
import ShareableResult from "./components/ShareableResult";
import RealTimeDashboard from "./components/RealTimeDashboard";

import "./styles/UiPolish.css";

const HIGH_RISK_FLAGS = [
  "insult",
  "gaslighting",
  "threat",
  "discard",
  "control",
  "guilt",
  "ultimatum",
  "boundary_push",
];

const App = () => {
  // Analysis result state holds the current analysis output object
  const [analysisResult, setAnalysisResult] = useState(null);

  // High-risk flags from current result for alerting
  const [highRiskFlags, setHighRiskFlags] = useState([]);

  // State to toggle real-time dashboard mode
  const [showRealTimeDashboard, setShowRealTimeDashboard] = useState(false);

  // Error and loading states for fallback UI when integrating ConversationAnalyzerPolish
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(false);

  // Handler called when ConversationAnalyzerPolish completes analysis successfully
  // Input: analysis output object with verdict, signals, confidence, etc.
  const onAnalysisComplete = (result) => {
    setAnalysisResult(result);
    setError(null);
  };

  // Handler for errors during analysis
  const onAnalysisError = (errMessage) => {
    setError(errMessage || "Analysis failed. Please try again.");
    setAnalysisResult(null);
  };

  // Effect: watch analysisResult signals for any high-risk flags and trigger alert
  useEffect(() => {
    if (!analysisResult || !Array.isArray(analysisResult.signals)) {
      setHighRiskFlags([]);
      return;
    }
    const detectedHighRisk = analysisResult.signals.filter((flag) =>
      HIGH_RISK_FLAGS.includes(flag.toLowerCase())
    );
    setHighRiskFlags(detectedHighRisk);
  }, [analysisResult]);

  // Toggle UI mode between paste analyzer or real-time dashboard
  const toggleDashboardMode = () => {
    setShowRealTimeDashboard((prev) => !prev);
    // Clear previous results and errors when toggling
    setAnalysisResult(null);
    setError(null);
  };

  return (
    <main className="ui-container" aria-label="FLAGGED conversation analysis app">
      <header>
        <h1 tabIndex={-1} className="app-title">
          FLAGGED
        </h1>
      </header>

      <section aria-label="Mode selection" style={{ marginBottom: "1rem", textAlign: "center" }}>
        <button
          type="button"
          onClick={toggleDashboardMode}
          aria-pressed={showRealTimeDashboard}
          className="peachy-button"
          aria-describedby="modeToggleDescription"
        >
          {showRealTimeDashboard ? "Use Paste Analyzer" : "Use Real-Time Dashboard"}
        </button>
        <div id="modeToggleDescription" className="sr-only">
          Toggle between pasting conversations for one-time analysis or using the real-time monitoring dashboard.
        </div>
      </section>

      {!showRealTimeDashboard && (
        <section aria-label="Paste conversation analyzer" tabIndex={-1}>
          <ConversationAnalyzerPolish
            onAnalyzeComplete={onAnalysisComplete}
            onAnalyzeError={onAnalysisError}
            loading={loading}
            setLoading={setLoading}
            error={error}
          />
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
        </section>
      )}

      {/* Show results and sharing in paste analyzer mode only */}
      {!showRealTimeDashboard && analysisResult && (
        <section
          aria-label="Analysis result visualization and sharing"
          style={{ marginTop: "2rem", textAlign: "center" }}
        >
          <FlaggedResultVisualization
            verdict={analysisResult.verdict.label}
            flaggedBehaviors={analysisResult.signals.map((flag) => ({
              type: flag,
              label: flag.charAt(0).toUpperCase() + flag.slice(1),
              confidence: analysisResult.confidence || 0,
            }))}
            overallConfidence={analysisResult.confidence || 0}
          />
          <ShareableResult
            analysisResult={analysisResult}
            conversation={analysisResult.usage?.originalText || ""}
          />
        </section>
      )}

      {/* Real-time dashboard mode */}
      {showRealTimeDashboard && (
        <RealTimeDashboard
          onUpdateResult={onAnalysisComplete}
          onError={onAnalysisError}
        />
      )}

      {/* Immediate alert banner and native alert */}
      <ImmediateAlert flaggedBehaviors={highRiskFlags} />

      <footer
        style={{
          marginTop: "3rem",
          fontSize: "0.85rem",
          textAlign: "center",
          color: "#666",
          userSelect: "none",
        }}
      >
        &copy; {new Date().getFullYear()} FLAGGED - Behavioral Red Flag Detector
      </footer>
    </main>
  );
};

export default App;