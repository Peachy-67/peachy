import React, { useState, useEffect } from "react";

import ConversationAnalyzerPolish from "./components/ConversationAnalyzerPolish";
import ImmediateAlert from "./components/ImmediateAlert";
import FlaggedResultVisualization from "./components/FlaggedResultVisualization";
import ShareableResult from "./components/ShareableResult";
import RealTimeDashboard from "./components/RealTimeDashboard";

import "./styles/UiPolish.css";

const HIGH_RISK_FLAGS = ["insult", "gaslighting", "threat", "ultimatum"];

const App = () => {
  const [analysisResult, setAnalysisResult] = useState(null);
  const [showRealTimeDashboard, setShowRealTimeDashboard] = useState(false);
  const [error, setError] = useState(null);

  // Track dismissed alert flags to allow dismissing alert but keep functionality
  const [alertDismissed, setAlertDismissed] = useState(false);

  const flaggedBehaviors = analysisResult?.signals?.map((signal) => {
    // Map signals to label and confidence from analysis result WHY array or default
    // Since we lack exact label/confidence mapping in signals, we use label = signal with capitalization
    return {
      type: signal,
      label: signal.charAt(0).toUpperCase() + signal.slice(1),
      confidence: analysisResult?.confidence || 0,
    };
  }) || [];

  // Detect if any high-risk flags are found in the current analysis
  const hasHighRiskFlag = flaggedBehaviors.some((fb) =>
    HIGH_RISK_FLAGS.includes(fb.type.toLowerCase())
  );

  // Reset alert dismissed if analysis changes
  useEffect(() => {
    setAlertDismissed(false);
  }, [analysisResult]);

  // Handler called when new analysis is ready from ConversationAnalyzerPolish or RealTimeDashboard
  const handleAnalysisUpdate = (result) => {
    setAnalysisResult(result);
    setError(null);
  };

  // Handler for errors from analyzer components
  const handleError = (errMsg) => {
    setError(errMsg);
    setAnalysisResult(null);
  };

  return (
    <div className="ui-container" role="main" aria-label="FLAGGED conversation red flags detector app">
      <header>
        <h1 style={{textAlign: "center", color: "#ff6f3c", userSelect: "none"}}>
          FLAGGED
        </h1>
        <p style={{textAlign: "center", fontWeight: "600", color: "#cc2f2f"}}>
          Detect red flags in conversations to identify manipulation and harmful behavior.
        </p>
      </header>

      <section aria-label="Toggle between conversation analyzer and real-time dashboard" style={{textAlign: "center", marginTop: 16}}>
        <button
          type="button"
          className="peachy-button"
          onClick={() => setShowRealTimeDashboard(!showRealTimeDashboard)}
          aria-pressed={showRealTimeDashboard}
        >
          {showRealTimeDashboard ? "Switch to Paste Analyzer" : "Switch to Real-Time Dashboard"}
        </button>
      </section>

      <main style={{marginTop: 24}}>
        {showRealTimeDashboard ? (
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
      </main>

      <aside aria-live="polite" aria-atomic="true" style={{marginTop: 16}}>
        {error && (
          <div
            role="alert"
            aria-label="Analysis error"
            className="alert-banner"
            tabIndex={-1}
          >
            {error}
          </div>
        )}
      </aside>

      {analysisResult && (
        <>
          {/* Immediate alert on high-risk flags */}
          <ImmediateAlert
            flaggedBehaviors={flaggedBehaviors}
            onDismiss={() => setAlertDismissed(true)}
            hidden={alertDismissed}
          />

          {/* Polished flagged results with verdict and badges */}
          <FlaggedResultVisualization
            verdict={analysisResult.verdict?.label || "Safe"}
            flaggedBehaviors={flaggedBehaviors}
            overallConfidence={analysisResult.confidence || 0}
          />

          {/* Share results with share buttons */}
          <ShareableResult
            analysis={analysisResult}
            flaggedBehaviors={flaggedBehaviors}
          />
        </>
      )}
    </div>
  );
};

export default App;