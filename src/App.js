import React, { useState, useEffect, useCallback } from "react";

import ConversationAnalyzerPolish from "./components/ConversationAnalyzerPolish";
import ImmediateAlert from "./components/ImmediateAlert";
import FlaggedResultVisualization from "./components/FlaggedResultVisualization";
import ShareableResult from "./components/ShareableResult";
import RealTimeDashboard from "./components/RealTimeDashboard";

import "./styles/UiPolish.css";

/**
 * Main App component integrating conversation analyzer, alerts,
 * flagged result visualization with sharing, and real-time monitoring dashboard.
 */
const App = () => {
  // Holds the latest analysis result from conversation analyzer or dashboard
  const [analysisResult, setAnalysisResult] = useState(null);
  // Controls visibility of the real-time dashboard mode
  const [dashboardActive, setDashboardActive] = useState(false);
  // Controls the immediate alert banner visibility and dismissed flags
  const [alertDismissedFlags, setAlertDismissedFlags] = useState(new Set());

  // Callback to handle new analysis results from analyzer or dashboard
  const onAnalysisUpdate = useCallback((result) => {
    setAnalysisResult(result);
    // Reset dismissed alerts on new analysis to allow alert banner again
    setAlertDismissedFlags(new Set());
  }, []);

  // Compute the array of detected flagged behaviors from signals if available
  // Map signal keys to labels and use confidence from result if present (default 1)
  const flaggedBehaviors = React.useMemo(() => {
    if (!analysisResult?.signals || !Array.isArray(analysisResult.signals)) return [];

    // Map signals to label and dummy confidence (1) or confidence from overall if none
    return analysisResult.signals.map((signal) => {
      let label = signal.charAt(0).toUpperCase() + signal.slice(1).replace(/_/g, " ");
      // Confidence attempt: if confidence per signal exists, use it; else fallback
      const confidence = 1.0;
      return { type: signal, label, confidence };
    });
  }, [analysisResult]);

  // Determine verdict label string from analysisResult.verdict.band or default Safe
  const verdictLabel = React.useMemo(() => {
    if (!analysisResult?.verdict?.band) return "Safe";
    // Convert band: green -> Safe, yellow -> Caution, red -> Flagged
    switch (analysisResult.verdict.band) {
      case "green":
        return "Safe";
      case "yellow":
        return "Caution";
      case "red":
        return "Flagged";
      default:
        return "Safe";
    }
  }, [analysisResult]);

  // Overall confidence from analysis result, fallback 0
  const overallConfidence = analysisResult?.confidence ?? 0;

  // High-risk flag types that should trigger immediate alert
  const highRiskFlags = React.useMemo(() => {
    if (!flaggedBehaviors.length) return [];
    return flaggedBehaviors.filter(({ type }) =>
      ["insult", "manipulation", "gaslighting", "threat", "discard", "control"].includes(type.toLowerCase())
    );
  }, [flaggedBehaviors]);

  // Handler to dismiss alert banner for current detected flags
  const dismissAlertBanner = () => {
    const dismissSet = new Set(alertDismissedFlags);
    highRiskFlags.forEach(({ type }) => dismissSet.add(type));
    setAlertDismissedFlags(dismissSet);
  };

  // Determine if alert banner should show (flags present and not dismissed)
  const showAlertBanner = highRiskFlags.some(({ type }) => !alertDismissedFlags.has(type));

  // Toggle between paste analyzer mode and real-time dashboard mode
  const toggleDashboard = () => {
    setDashboardActive((active) => !active);
    setAnalysisResult(null);
    setAlertDismissedFlags(new Set());
  };

  return (
    <main className="ui-container" role="main" aria-label="FLAGGED conversation red flag detector">
      <header>
        <h1 style={{ userSelect: "none", color: "#ff6f3c", textAlign: "center" }}>
          FLAGGED
        </h1>
        <p style={{ textAlign: "center", maxWidth: "520px", margin: "auto", marginBottom: "1rem" }}>
          Paste a conversation below to detect red flags, manipulation, and harmful behavior.
        </p>
        <button
          type="button"
          className="peachy-button"
          onClick={toggleDashboard}
          aria-pressed={dashboardActive}
          aria-label={dashboardActive ? "Switch to conversation analyzer mode" : "Switch to real-time dashboard mode"}
          style={{ display: "block", margin: "0 auto 1.5rem auto" }}
        >
          {dashboardActive ? "Use Conversation Analyzer" : "Use Real-Time Dashboard"}
        </button>
      </header>

      {/* Immediate alert banner for high-risk detected flags */}
      {showAlertBanner && (
        <ImmediateAlert
          flaggedBehaviors={highRiskFlags.filter(({ type }) => !alertDismissedFlags.has(type))}
          onDismiss={dismissAlertBanner}
        />
      )}

      {/* Main content conditional on dashboard mode */}
      {!dashboardActive && (
        <>
          <ConversationAnalyzerPolish onAnalysis={onAnalysisUpdate} />
          {analysisResult && (
            <>
              <FlaggedResultVisualization
                verdict={verdictLabel}
                flaggedBehaviors={flaggedBehaviors}
                overallConfidence={overallConfidence}
              />
              <ShareableResult analysisResult={analysisResult} />
            </>
          )}
        </>
      )}

      {dashboardActive && (
        <RealTimeDashboard
          onAnalysisUpdate={onAnalysisUpdate}
          latestAnalysisResult={analysisResult}
        />
      )}
    </main>
  );
};

export default App;