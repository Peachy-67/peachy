import React, { useState, useEffect } from "react";

import ConversationAnalyzerPolish from "./components/ConversationAnalyzerPolish";
import ImmediateAlert from "./components/ImmediateAlert";
import FlaggedResultVisualization from "./components/FlaggedResultVisualization";
import ShareableResult from "./components/ShareableResult";
import RealTimeDashboard from "./components/RealTimeDashboard";

import "./styles/UiPolish.css";
import "./styles/FlaggedResultVisualization.css";
import "./styles/ImmediateAlert.css";
import "./styles/ShareableResult.css";
import "./styles/RealTimeDashboard.css";

/**
 * Main App component integrating:
 * - ConversationAnalyzerPolish for paste & analyze interface
 * - ImmediateAlert for high-risk alerting
 * - FlaggedResultVisualization to show verdict and flags
 * - ShareableResult wrapping visualization with sharing features
 * - RealTimeDashboard for real-time conversation monitoring
 *
 * Allows toggling between analyzing pasted conversations & dashboard live mode.
 */
const App = () => {
  // Current analysis result: { verdict, signals, confidence, watch_next, why } or null
  const [analysisResult, setAnalysisResult] = useState(null);
  // Error from analysis
  const [error, setError] = useState(null);
  // Loading state for analysis request
  const [loading, setLoading] = useState(false);
  // Raw input conversation text
  const [conversationText, setConversationText] = useState("");
  // Dashboard mode toggle
  const [dashboardActive, setDashboardActive] = useState(false);
  // Immediate alert flags detected
  const [alertFlags, setAlertFlags] = useState([]);

  // Derived flagged behaviors for visualization - map signals to labels & confidence placeholder
  // Confidence per signal not provided separately, so use overall confidence as baseline
  const flaggedBehaviors = React.useMemo(() => {
    if (!analysisResult || !Array.isArray(analysisResult.signals)) return [];
    return analysisResult.signals.map((signal) => ({
      type: signal,
      label: signal.charAt(0).toUpperCase() + signal.slice(1),
      confidence: analysisResult.confidence || 0,
    }));
  }, [analysisResult]);

  // Overall verdict string for visualization component
  const verdict =
    analysisResult && analysisResult.verdict && analysisResult.verdict.label
      ? analysisResult.verdict.label
      : "Safe";

  // Overall confidence number between 0 and 1
  const overallConfidence = analysisResult ? analysisResult.confidence || 0 : 0;

  // Whenever analysisResult signals change, update alert flags and trigger ImmediateAlert
  useEffect(() => {
    if (!analysisResult || !analysisResult.signals) {
      setAlertFlags([]);
      return;
    }

    // Define high-risk flags that trigger immediate alert
    const highRiskFlags = new Set([
      "insult",
      "gaslighting",
      "threat",
      "discard",
      "ultimatum",
      "control",
    ]);

    const detectedHighRisk = analysisResult.signals.filter((flag) =>
      highRiskFlags.has(flag)
    );

    setAlertFlags(detectedHighRisk);
  }, [analysisResult]);

  // Handle analysis response coming from ConversationAnalyzerPolish component
  // This is a callback when user submits text for analysis
  const handleAnalysisUpdate = (result) => {
    setAnalysisResult(result);
    setError(null);
  };

  // Handle error for analysis
  const handleAnalysisError = (err) => {
    setError(err);
    setAnalysisResult(null);
  };

  // Handle loading state toggled by ConversationAnalyzerPolish
  const handleLoadingChange = (isLoading) => {
    setLoading(isLoading);
  };

  // User toggles dashboard live monitoring mode
  const toggleDashboard = () => {
    setDashboardActive((active) => !active);
    // Clear previous analysis and errors when toggling modes
    setAnalysisResult(null);
    setError(null);
    setConversationText("");
  };

  return (
    <main className="ui-container" aria-label="Flagged conversation analyzer app">
      <header>
        <h1 style={{ textAlign: "center", userSelect: "none", color: "#cc2f2f" }}>
          FLAGGED
        </h1>
        <p style={{ textAlign: "center", marginBottom: "1rem", userSelect: "none" }}>
          Detect red flags in conversations with AI-powered analysis
        </p>
        <div style={{ textAlign: "center", marginBottom: "1.5rem" }}>
          <button
            type="button"
            onClick={toggleDashboard}
            className="peachy-button"
            aria-pressed={dashboardActive}
            aria-label={
              dashboardActive
                ? "Switch to paste conversation analyzer mode"
                : "Switch to real-time dashboard monitoring mode"
            }
          >
            {dashboardActive ? "Paste Conversation Analyzer" : "Real-Time Dashboard"}
          </button>
        </div>
      </header>

      {/* Show real-time dashboard mode or analyzer based on toggle */}
      {dashboardActive ? (
        <>
          <RealTimeDashboard
            onAnalysisUpdate={handleAnalysisUpdate}
            onError={handleAnalysisError}
            loading={loading}
            setLoading={handleLoadingChange}
          />
          {/* Immediate alert triggers from real-time analysis */}
          <ImmediateAlert flaggedBehaviors={alertFlags} />
        </>
      ) : (
        <>
          <ConversationAnalyzerPolish
            value={conversationText}
            onChange={setConversationText}
            onAnalyze={handleAnalysisUpdate}
            onError={handleAnalysisError}
            loading={loading}
            setLoading={handleLoadingChange}
          />
          {error && (
            <div role="alert" aria-live="assertive" className="alert-banner" tabIndex={-1}>
              {error}
            </div>
          )}
          {analysisResult && (
            <>
              <ImmediateAlert flaggedBehaviors={alertFlags} />
              <FlaggedResultVisualization
                verdict={verdict}
                flaggedBehaviors={flaggedBehaviors}
                overallConfidence={overallConfidence}
              />
              <ShareableResult
                verdict={verdict}
                flaggedBehaviors={flaggedBehaviors}
                overallConfidence={overallConfidence}
                conversationText={conversationText}
              />
            </>
          )}
        </>
      )}
    </main>
  );
};

export default App;